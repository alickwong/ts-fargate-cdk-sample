import {Construct} from 'constructs'
import {
  Duration,
  aws_lambda as Lambda,
  aws_iam as IAM,
  aws_logs as Logs

} from "aws-cdk-lib";
import {ResourceAwareStack} from "../shared/ResourceAwareStack";
import {IParameterAwareProps} from "../shared/IParameterAwareProps";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {ResourcesList} from "../shared/ResourcesList";
import {IVpc} from "aws-cdk-lib/aws-ec2";


const path = require('path');
const lambdasLocation = path.join?.(__dirname, '..', '..', '..', 'lambdas') ?? "";

export class NetworkStack extends ResourceAwareStack {
  private vpc: IVpc;

  constructor(parent: Construct, name: string, props: IParameterAwareProps) {
    super(parent, name, props);
    this.createNewVpc();
  }

  private createNewVpc() {
    this.vpc = new ec2.Vpc(this, 'cdk-ecs-vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    this.addResource(ResourcesList.VpcEcsCdk, this.vpc);
  }
}