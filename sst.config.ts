import { SSTConfig } from "sst";
import { API } from "./stacks/API";
import { Web } from "./stacks/Web";
import { Auth } from "./stacks/Auth";
import { Storage } from "./stacks/Storage";

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
      .stack(Storage)
      .stack(Auth)
      .stack(API)
      .stack(Web);
  },
} satisfies SSTConfig;
