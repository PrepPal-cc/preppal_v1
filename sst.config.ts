import { SSTConfig } from "sst";
import { Web } from "./stacks/Web";

export default {
  config(_input) {
    return {
      name: "preppal",
      region: "us-east-1",
      profile: process.env.AWS_PROFILE
    };
  },
  stacks(app) {
    app
      .stack(Web);
  },
} satisfies SSTConfig;
