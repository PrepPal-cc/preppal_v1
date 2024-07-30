import { SSTConfig } from "sst";
import { Web } from "./stacks/Web";

export default {
  config(_input) {
    const stage = _input.stage || 'dev';  // Default to 'dev' if no stage is specified
    return {
      name: "preppal-v1-web",
      region: "us-east-1",
      stage,
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      environment: {
        STAGE: app.stage,
      },
    });
    app.stack(Web, {
      stackName: `preppal-v1-web-${app.stage}`,
    });
  }
} satisfies SSTConfig;