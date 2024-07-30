import { Config, NextjsSite, StackContext } from "sst/constructs";

export function Web({ stack }: StackContext) {
  const OPENAI_API_KEY = new Config.Secret(stack, "OPENAI_API_KEY");

  const site = new NextjsSite(stack, "Site", {
    path: ".",
    bind: [OPENAI_API_KEY],
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}