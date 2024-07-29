import { StackContext, NextjsSite, Config } from "sst/constructs";

export function Web({ stack }: StackContext) {
  const OPENAI_API_KEY = new Config.Secret(stack, "OPENAI_API_KEY");

  const site = new NextjsSite(stack, "Site", {
    path: ".",
    environment: {
      OPENAI_API_KEY: OPENAI_API_KEY.name,
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}