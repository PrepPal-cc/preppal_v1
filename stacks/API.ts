import { StackContext, Api, use } from "sst/constructs";
import { Storage } from "./Storage";
import { Auth } from "./Auth";

export function API({ stack }: StackContext) {
  const { historyTable, resumeBucket } = use(Storage);
  const { auth } = use(Auth);

  const api = new Api(stack, "api", {
    routes: {
      "GET /proxy/{proxy+}": "functions/proxy.handler",
      "POST /proxy/{proxy+}": "functions/proxy.handler",
      "POST /history": "functions/saveHistory.handler",
      "GET /history": "functions/getHistory.handler",
    },
    defaults: {
      authorizer: "iam",
      function: {
        environment: {
          ALLOWED_ORIGINS: "http://localhost:3000,https://localhost:3000",
          API_URL: process.env.API_URL || "",
        },
      },
    },
    cors: {
      allowOrigins: ["http://localhost:3000", "https://localhost:3000"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      allowCredentials: true,
    },
  });

  api.attachPermissions([historyTable, resumeBucket]);

  auth.attachPermissionsForAuthUsers(stack, [api]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return {
    api,
  };
}