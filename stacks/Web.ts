import { StackContext, NextjsSite } from "sst/constructs";

export function Web({ stack }: StackContext) {
  const site = new NextjsSite(stack, "Site", {
    path: "."
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
