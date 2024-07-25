#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsInfraStack } from '../lib/aws-infra-stack';

const app = new cdk.App();

// Get the environment from a context variable, command line argument, or environment variable
const environment = app.node.tryGetContext('environment') 
                    || process.env.DEPLOYMENT_ENV 
                    || 'dev'; // Default to 'dev' if not specified

new AwsInfraStack(app, 'AwsInfraStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  environment: process.env.DEPLOYMENT_ENV ?? 'dev',
  apiGatewayLoggingRoleName: process.env.API_GATEWAY_LOGGING_ROLE_NAME || 'APIGatewayCloudWatchLogsRole',
});