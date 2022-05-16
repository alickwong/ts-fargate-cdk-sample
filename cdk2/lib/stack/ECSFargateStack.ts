import {App, CfnOutput, Duration} from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns'
import {Construct} from "constructs";
import {IParameterAwareProps} from "../shared/IParameterAwareProps";
import {ResourceAwareStack} from "../shared/ResourceAwareStack";
import {ResourcesList} from "../shared/ResourcesList";
import {NetworkStack} from "./NetworkStack";
import {Vpc} from "aws-cdk-lib/aws-ec2";

export class ECSFargateStack extends ResourceAwareStack {
  protected resources: Map<string, any>;
  protected scope: Construct | undefined;
  protected properties: IParameterAwareProps;
  private networkStack: NetworkStack;

  constructor(scope: App, id: string, networkStack: NetworkStack, props?: IParameterAwareProps) {
    super(scope, id, props);
    this.networkStack = networkStack;
    this.buildECSCluster();
  }

  buildECSCluster() {
    const containerUrl = process.env.CDK_CONTAINER_URL ?? "invalid-url";

    let vpc: Vpc = this.networkStack.getResource(ResourcesList.VpcEcsCdk);
    const cluster = new ecs.Cluster(this, "demo-ecs-cluster", {
      vpc: vpc,
    });

    // Create a load-balanced Fargate service and make it public
    let loadBalancedFargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "DemoFargateService", {
      cluster: cluster,
      cpu: 512,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(containerUrl),
        // This will be use in buildspec
        containerName: "ecs-fargate-container"
      },
      memoryLimitMiB: 2048,
      publicLoadBalancer: true,
      assignPublicIp: true,
      taskSubnets: {
        subnets: vpc.privateSubnets
      }
    });

    // Prepare Task
    const taskExecPolicy = new iam.Policy(this, "ecs-task-exec-policy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ecr:*"],
          resources: ["*"],
        }),
      ],
    })
    const taskPolicy = new iam.Policy(this, "ecs-task-policy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ecr:*",
          ],
          resources: ["*"],
        }),
      ],
    })

    let taskDefinition = loadBalancedFargateService.taskDefinition;
    if (taskDefinition.executionRole) {
      taskDefinition.executionRole.attachInlinePolicy(taskExecPolicy);
      taskDefinition.taskRole.attachInlinePolicy(taskPolicy);
    }

    // Update target group drain timeout
    loadBalancedFargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10')

    // Auto Scaling
    let fargateService = loadBalancedFargateService.service;
    let scaling = fargateService.autoScaleTaskCount({
      maxCapacity: 10,
      minCapacity: 2,
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60)
    });

    new CfnOutput(this, 'LoadBalancerDNS', {value: loadBalancedFargateService.loadBalancer.loadBalancerDnsName});

    this.addResource(ResourcesList.EcsFargateService, loadBalancedFargateService);
  }
}