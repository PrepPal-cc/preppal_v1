import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

interface AwsInfraStackProps extends cdk.StackProps {
  environment: string;
  apiGatewayLoggingRoleName: string;
}

export class AwsInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsInfraStackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const historyTable = new dynamodb.Table(this, 'UserHistoryTable', {
      partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Timestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // S3 Bucket
    const resumeBucket = new s3.Bucket(this, 'UserResumesBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // IAM Role for Lambda
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    lambdaRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
    historyTable.grantReadWriteData(lambdaRole);
    resumeBucket.grantReadWrite(lambdaRole);

    // Lambda Functions
    const saveHistoryFunction = new lambdaNodejs.NodejsFunction(this, 'SaveUserHistory', {
      entry: 'lambda/save-history/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        HISTORY_TABLE_NAME: historyTable.tableName,
      },
      bundling: {
        externalModules: ['aws-sdk'],
        forceDockerBundling: false,
      },
    });

    const getHistoryFunction = new lambdaNodejs.NodejsFunction(this, 'GetUserHistory', {
      entry: 'lambda/get-history/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: historyTable.tableName,
        BUCKET_NAME: resumeBucket.bucketName,
      },
      bundling: {
        externalModules: ['aws-sdk'],
        forceDockerBundling: false,
      },
    });

    // Reference the existing API Gateway CloudWatch Logs role
    const apiGatewayLoggingRole = iam.Role.fromRoleName(
      this,
      'ApiGatewayLoggingRole',
      props.apiGatewayLoggingRoleName
    );

    // Create a log group for API Gateway
    const apiLogGroup = new logs.LogGroup(this, 'ApiGatewayLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK // Adjust retention as needed
    });

    // API Gateway
    const stageName = props.environment;
    const isDev = process.env.DEPLOYMENT_ENV === 'development';

    const api = new apigateway.RestApi(this, 'PrepPalApi', {
      defaultCorsPreflightOptions: isDev
        ? {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS,
            allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
            allowCredentials: true,
          }
        : undefined, // No CORS settings for production
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(apiLogGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        stageName: stageName,
      },
    });

    // Assuming you have already created a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'PrepPalUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: {
        givenName: { required: true, mutable: true },
      },
    });

    // Create a Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'PrepPalApiAuthorizer', {
      cognitoUserPools: [userPool]
    });

    const historyResource = api.root.addResource('history');

    // For each Lambda function integration, ensure CORS is enabled
    const saveHistoryIntegration = new apigateway.LambdaIntegration(saveHistoryFunction, {
      proxy: true,
      integrationResponses: isDev
        ? [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': "'*'",
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,POST'",
              },
            },
          ]
        : undefined,
    });

    historyResource.addMethod('POST', saveHistoryIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: authorizer,
      methodResponses: isDev
        ? [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Headers': true,
                'method.response.header.Access-Control-Allow-Methods': true,
              },
            },
          ]
        : undefined,
    });

    historyResource.addMethod('GET', new apigateway.LambdaIntegration(getHistoryFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: authorizer,
    });

    // If in dev mode, add an OPTIONS method to handle preflight requests
    if (isDev) {
      historyResource.addMethod('OPTIONS', new apigateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
              'method.response.header.Access-Control-Allow-Origin': "'*'",
              'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
            },
          },
        ],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": "{\"statusCode\": 200}"
        },
      }), {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          },
        ],
      });
    }

    // Output the API Gateway logging role ARN
    new cdk.CfnOutput(this, 'ApiGatewayLoggingRoleArn', {
      value: apiGatewayLoggingRole.roleArn,
      description: 'API Gateway CloudWatch Logging Role ARN',
    });

    // S3 bucket for frontend hosting
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      publicReadAccess: true,
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../out')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Update Cognito User Pool client settings
    const userPoolClient = userPool.addClient('PrepPalUserPoolClient', {
      oAuth: {
        callbackUrls: [distribution.distributionDomainName],
        logoutUrls: [distribution.distributionDomainName],
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'CloudFrontURL', { value: distribution.distributionDomainName });

    // Update environment variables
    const envFilePath = path.join(__dirname, '../../.env.production');
    const envFileContent = fs.readFileSync(envFilePath, 'utf8');
    const updatedEnvContent = envFileContent
      .replace('${API_URL}', api.url)
      .replace('${USER_POOL_ID}', userPool.userPoolId)
      .replace('${USER_POOL_CLIENT_ID}', userPoolClient.userPoolClientId)
      .replace('${AWS_REGION}', this.region);

    fs.writeFileSync(envFilePath, updatedEnvContent);
  }
}