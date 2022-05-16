```
npm install -g aws-cdk
cdk --version

aws ecr get-login-password --region YOUR_REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com

cd cdk
./script/deploy.sh 0.0x

```

// CloudFormation Status
https://seed.run/docs/serverless-errors/stack-is-in-state-and-can-not-be-updated.html
https://docs.aws.amazon.com/cli/latest/reference/cloudformation/delete-stack.html


// The Basics
https://docs.aws.amazon.com/cdk/latest/guide/ecs_example.html

https://docs.aws.amazon.com/cdk/api/latest/docs/aws-ecs-patterns-readme.html
https://docs.aws.amazon.com/cdk/latest/guide/environments.html
https://docs.aws.amazon.com/cli/latest/reference/ecr/create-repository.html

// With Waf
https://www.gravitywell.co.uk/insights/deploying-applications-to-ecs-fargate-with-aws-cdk/

// WIth IAM
https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-iam.IRole.html
https://www.coder.work/article/7752682
https://stackoverflow.com/questions/62094746/aws-cdk-role-and-policy-creation