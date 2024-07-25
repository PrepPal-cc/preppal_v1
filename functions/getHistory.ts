import { ApiHandler } from "sst/node/api";
import { Table } from "sst/node/table";
import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const dynamoDB = new DynamoDB.DocumentClient();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

export const handler = ApiHandler(async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers.origin;
  const isAllowedOrigin = allowedOrigins.includes(origin || "");

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin || "" : allowedOrigins[0] || "",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // Handle preflight request
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  const userId = event.queryStringParameters?.userId;

  if (!userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'UserId is required' }),
    };
  }

  const params = {
    TableName: Table.UserHistoryTable.tableName,
    KeyConditionExpression: 'UserId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Error fetching history:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Error fetching history' }),
    };
  }
});