import { StackContext, NextjsSite, use } from "sst/constructs";
import { API } from "./API";
import { Auth } from "./Auth";

export function Web({ stack }: StackContext) {
  const { api } = use(API);
  const { auth } = use(Auth);

  const site = new NextjsSite(stack, "Site", {
    path: ".",
    environment: {
      NEXT_PUBLIC_API_URL: api.url,
      NEXT_PUBLIC_USER_POOL_ID: auth.userPoolId,
      NEXT_PUBLIC_USER_POOL_CLIENT_ID: auth.userPoolClientId,
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
