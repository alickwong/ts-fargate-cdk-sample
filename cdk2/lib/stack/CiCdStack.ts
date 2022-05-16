import {Construct} from 'constructs'
import {ResourceAwareStack} from "../shared/ResourceAwareStack";
import {IParameterAwareProps} from "../shared/IParameterAwareProps";
import {ResourcesList} from "../shared/ResourcesList";
import {ApplicationLoadBalancedFargateService} from "aws-cdk-lib/aws-ecs-patterns/lib/fargate/application-load-balanced-fargate-service";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import {BuildEnvironmentVariableType} from "aws-cdk-lib/aws-codebuild";
import * as codepipline from "aws-cdk-lib/aws-codepipeline";
import * as codepiplineAction from "aws-cdk-lib/aws-codepipeline-actions";
import * as iam from "aws-cdk-lib/aws-iam";
import {Effect} from "aws-cdk-lib/aws-iam";
import {ECSFargateStack} from "./ECSFargateStack";
import * as process from "process";

export class CiCdStack extends ResourceAwareStack {
  private ecsFargateStack: ECSFargateStack;

  constructor(parent: Construct, name: string, ecsFargateStack: ECSFargateStack, props: IParameterAwareProps) {
    super(parent, name, props);
    this.ecsFargateStack = ecsFargateStack;
    this.buildCodePipeline();
  }

  buildCodePipeline() {
    let ecsfargateService: ApplicationLoadBalancedFargateService = this.ecsFargateStack.getResource(ResourcesList.EcsFargateService);

    // Prepare Code Commit Repo
    const ecr_repo = codecommit.Repository.fromRepositoryName(this, "ts-fargate-cdk", "ts-fargate-cdk");

    // Prepare Code Build Project
    let codeBuildProject = new codebuild.Project(this, ResourcesList.EcsFargateBuildProject, {
      environment: {
        privileged: true
      },
      cache: codebuild.Cache.local(
        codebuild.LocalCacheMode.DOCKER_LAYER,
      ),
      buildSpec: codebuild.BuildSpec.fromObject({
        "version": 0.2,
        "env": {
          "variables": {
            "IMAGE_REPO_NAME": "cdk-fargate-deploy",
            "IMAGE_TAG": "",
          },
          "exported-variables": [
            "IMAGE_REPO_NAME",
            "IMAGE_TAG"
          ]
        },
        "phases": {
          "pre_build": {
            "commands": [
              "echo Logging in to Amazon ECR...",
              "aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"
            ]
          },
          "build": {
            "commands": [
              "echo Build started on `date`",
              "echo Building the Docker image...",
              "export IMAGE_TAG=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:backend.v$CODEBUILD_BUILD_NUMBER",
              "echo $IMAGE_TAG",
              "docker build -f ./backend/Dockerfiles/Dockerfile.production -t $IMAGE_TAG .",
            ]
          },
          "post_build": {
            "commands": [
              "echo Build completed on `date`",
              "echo Pushing the Docker image...",
              "docker push $IMAGE_TAG",
              "printf \'[{\"name\":\"ecs-fargate-container\",\"imageUri\":\"%s\"}]\' \"$IMAGE_TAG\"",
              "printf \'[{\"name\":\"ecs-fargate-container\",\"imageUri\":\"%s\"}]\' \"$IMAGE_TAG\" > imagedefinitions.json",
            ]
          }
        },
        "artifacts": {
          "files": [
            "**/*"
          ],
          "base-directory": "./",
          "name": "cdk-fargate-build-artifacts",
          "discard-paths": "no"
        }
      }),
      environmentVariables: {
        "AWS_ACCOUNT_ID": {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: process.env.AWS_ACCOUNT_ID
        },
        "AWS_DEFAULT_REGION": {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: 'ap-southeast-1'
        }
      }
    });

    // Grant push pull permissions on ecr repo to code build project needed for `docker push`
    ecr_repo.grantPullPush(codeBuildProject);

    // Build Action 1: Clone Repo
    let sourceOutput = new codepipline.Artifact();
    let sourceAction = new codepiplineAction.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository: ecr_repo,
      output: sourceOutput,
      codeBuildCloneOutput: true
    });

    // Build Action 2: Build
    let buildAction = new codepiplineAction.CodeBuildAction({
      actionName: 'CodeBuild',
      project: codeBuildProject,
      input: sourceOutput,
      outputs: [
        new codepipline.Artifact('imagedefinition')
      ],
      executeBatchBuild: false,
    });

    if (codeBuildProject.role) {
      codeBuildProject.role.attachInlinePolicy(new iam.Policy(this, 'ecr-access', {
        statements: [
          new iam.PolicyStatement({
            actions: [
              "ecr:BatchCheckLayerAvailability",
              "ecr:CompleteLayerUpload",
              "ecr:GetAuthorizationToken",
              "ecr:InitiateLayerUpload",
              "ecr:PutImage",
              "ecr:UploadLayerPart"
            ],
            resources: ['*'],
            effect: Effect.ALLOW
          }),
        ],
      }));
    }

    // Build Action 3: Deploy
    let deployAction = new codepiplineAction.EcsDeployAction({
      actionName: 'ECSDeploy',
      service: ecsfargateService.service,
      input: new codepipline.Artifact('imagedefinition')
    });

    const pipeline = new codepipline.Pipeline(this, ResourcesList.EcsFargatePipeline, {
      pipelineName: ResourcesList.EcsFargatePipeline,
      stages: [
        {
          "stageName": "Source",
          "actions": [sourceAction]
        },
        {
          "stageName": "Build",
          "actions": [buildAction]
        },
        {
          "stageName": "Deploy",
          "actions": [deployAction]
        },
      ],
    });

    this.addResource(ResourcesList.EcsFargatePipeline, pipeline);
  }

}