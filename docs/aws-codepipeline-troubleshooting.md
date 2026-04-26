# AWS CodePipeline Troubleshooting

## Current Repository State

The main repository-side blocker was that AWS pipeline artifacts were missing:

- no `infra/buildspec.yml`
- no generated `imagedefinitions.json`
- no repo-level instructions tying CodeBuild environment variables to the service folders

This repository now includes `infra/buildspec.yml` so CodeBuild can build one selected service, push the image to ECR, and emit `imagedefinitions.json` for the ECS deploy stage.

## Recommended First Pipeline

Start with `tour-catalog` first.

Why:

- it is the smallest service
- it already passed local Docker smoke tests
- it has a simple public `/health` endpoint
- it is the safest service to demonstrate one redeployment for the assignment

## CodeBuild Configuration

Use `infra/buildspec.yml` and set these environment variables in the CodeBuild project:

- `AWS_ACCOUNT_ID=<your-account-id>`
- `AWS_DEFAULT_REGION=<your-region>`
- `IMAGE_REPO_NAME=agritour-tour-catalog`
- `CONTAINER_NAME=tour-catalog`
- `SERVICE_PATH=services/tour-catalog`

For other services, only change `IMAGE_REPO_NAME`, `CONTAINER_NAME`, and `SERVICE_PATH`.

## Required AWS Console Settings

CodeBuild:

- enable `Privileged` mode so Docker build works
- use the repository root as the build context
- ensure the service role can push to ECR

CodePipeline:

- source stage can be CodeCommit or versioned S3 source
- build stage must point to the CodeBuild project above
- deploy stage should use Amazon ECS and read `imagedefinitions.json`

ECS deploy stage values for the first pipeline:

- cluster: your ECS cluster name
- service: `agritour-tour-catalog-svc`
- image definitions file: `imagedefinitions.json`

## Most Common Failure Modes

### Build fails before Docker starts

Cause:

- CodeBuild privileged mode is off

Fix:

- open the CodeBuild project
- enable `Privileged`
- rerun the pipeline

### Build fails with ECR login or push errors

Cause:

- CodeBuild role lacks ECR permissions

Fix:

- add permissions for `ecr:GetAuthorizationToken`
- add permissions for `ecr:BatchCheckLayerAvailability`, `ecr:CompleteLayerUpload`, `ecr:InitiateLayerUpload`, `ecr:PutImage`, `ecr:UploadLayerPart`

### Deploy stage fails because `imagedefinitions.json` is missing

Cause:

- buildspec did not generate it
- wrong artifact path in CodeBuild or CodePipeline

Fix:

- keep the artifact file name exactly `imagedefinitions.json`
- keep `artifacts.files` in `infra/buildspec.yml`
- confirm the ECS deploy stage expects that exact file name

### Deploy stage succeeds but ECS tasks keep failing health checks

Cause:

- task environment variables are wrong
- ECS task cannot reach RDS
- container port or ALB target group health check path is wrong

Fix:

- verify task definition env vars match the service `.env.example`
- verify security groups allow ECS to reach RDS:3306
- verify health path is `/health`

## Practical Recovery Path

1. Make `tour-catalog` the first and only pipeline target.
2. Confirm manual ECS deployment works before introducing CodePipeline.
3. Create CodeBuild with `infra/buildspec.yml`.
4. Run one manual build and confirm ECR receives the image.
5. Add CodePipeline build stage.
6. Add ECS deploy stage using `imagedefinitions.json`.
7. Demonstrate one small redeploy through the pipeline.

## What Is Still Not In The Repository

These still need to be created in AWS or added later if you want full infra-as-code:

- ECS cluster and services
- ECS task definitions
- ECR repositories
- IAM roles and policies
- CodeBuild project
- CodePipeline pipeline resource

That is expected. The repository now contains the missing build artifact contract, not the AWS resources themselves.