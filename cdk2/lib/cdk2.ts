#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import {ECSFargateStack} from './stack/ECSFargateStack';
import 'dotenv/config'
import {ParameterAwareProps} from "./shared/ParameterAwareProps";
import {NetworkStack} from "./stack/networkStack";
import {CiCdStack} from "./stack/CiCdStack";
import * as process from "process";

const app = new cdk.App();

let error = false;
if (!process.env.CDK_CONTAINER_URL) {
  console.log("Error: CDK_CONTAINER_URL not found");
  error = true;
}

if (error) {
  process.exit(1);
}

let sharedProps = new ParameterAwareProps();
sharedProps.env = {
  account: process.env.AWS_ACCOUNT_ID,
  region: 'ap-southeast-1'
};

let networkStack = new NetworkStack(app, 'NetworkStack', sharedProps);
let ecsFargateStack = new ECSFargateStack(app, 'ECSFargateStack', networkStack, sharedProps);
new CiCdStack(app, 'CiCdStack', ecsFargateStack, sharedProps);
