import { SSTConfig } from "sst";
import { Web } from "./stacks/Web";

const stage = process.env.STAGE || 'dev';

export default {
  config(_input) {
    return {
      name: `preppal-v1-web`,
      region: "us-east-1",
      profile: `preppal-v1-web-${stage}`,
      stage: `${stage}`
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      environment: { STAGE: stage },
      logRetention: "one_week",
    });
    app.stack(Web, {
      stackName: `preppal-v1-web-${stage}`,
    });
  },
} satisfies SSTConfig;