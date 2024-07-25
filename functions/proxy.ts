import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from "aws-lambda";
import https from "https";
import { URL } from "url";

export const handler: APIGatewayProxyHandlerV2 = async (event): Promise<APIGatewayProxyResultV2> => {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "API_URL environment variable is not set" }),
    };
  }

  const path = event.rawPath.replace('/proxy', '');
  const targetUrl = new URL(`${apiUrl}${path}${event.rawQueryString ? `?${event.rawQueryString}` : ''}`);

  const options: https.RequestOptions = {
    hostname: targetUrl.hostname,
    port: 443,
    path: targetUrl.pathname + targetUrl.search,
    method: event.requestContext.http.method,
    headers: {
      ...event.headers,
      host: targetUrl.hostname,
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk.toString());
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...res.headers as { [key: string]: string | number | boolean },
          },
          body: body,
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ message: e.message }),
      });
    });

    if (event.body) {
      req.write(event.body);
    }
    req.end();
  });
};