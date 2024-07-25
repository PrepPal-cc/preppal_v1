import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  const isDev = process.env.DEPLOYMENT_ENV === 'dev';
  
  const headers: { [header: string]: string | number | boolean } = isDev
    ? {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      }
    : {};

  if (!event.body) {
    console.log('Missing request body');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Missing request body' }),
    };
  }

  const { companyUrl, generatedResponse, resumeS3Key } = JSON.parse(event.body);
  console.log('Parsed body:', { companyUrl, generatedResponse, resumeS3Key });

  const userId = event.requestContext.authorizer?.claims.sub;
  console.log('User ID:', userId);

  if (!userId) {
    console.log('Unauthorized: No user ID found');
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  const item = {
    id: uuidv4(),
    userId,
    companyUrl,
    generatedResponse,
    resumeS3Key,
    timestamp: Date.now(),
  };
  console.log('Item to be saved:', item);

  const params = {
    TableName: process.env.HISTORY_TABLE_NAME!,
    Item: item,
  };

  try {
    console.log('Attempting to save item to DynamoDB');
    await dynamoDB.put(params).promise();
    console.log('Item saved successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'History item saved successfully' }),
    };
  } catch (error) {
    console.error('Error saving history item:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error saving history item', error: (error as Error).message }),
    };
  }
};