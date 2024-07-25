import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { CognitoJwtVerifier } from "aws-jwt-verify";

const dynamoDB = new DynamoDB.DocumentClient();
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export const handler: APIGatewayProxyHandler = async (event) => {
  if (!event.headers.Authorization) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'No authorization header' }),
    };
  }

  try {
    const token = event.headers.Authorization.split(' ')[1];
    const payload = await verifier.verify(token);
    const userId = payload.sub;

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      KeyConditionExpression: 'UserId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
      Limit: 10,
    };

    const result = await dynamoDB.query(params).promise();

    const historyItems = result.Items?.map((item: Record<string, any>) => ({
      id: item.Timestamp.toString(),
      timestamp: item.Timestamp,
      companyUrl: item.CompanyUrl,
      generatedResponse: item.GeneratedResponse,
      resumeS3Key: item.ResumeS3Key,
    })) || [];

    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': true,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(historyItems),
    };
  } catch (error) {
    console.error('Error fetching history:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching history' }),
    };
  }
};