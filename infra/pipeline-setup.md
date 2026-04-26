# CI/CD Path Decision

## Recommendation

Use exactly one CI/CD mechanism for the assignment.

- Preferred path: `CodePipeline + CodeBuild + ECS deploy action`
- Fallback path: `CodeDeploy` for one ECS service if CodePipeline is unavailable in the learner account

Do not use both unless AWS access has already been verified and the team specifically wants to demonstrate a blue/green deployment. The project brief only requires one working mechanism.

## Why This Decision Fits The Course Brief

The brief asks for:

- one basic CI/CD pipeline for at least one microservice
- one update or redeployment demonstration
- one CI/CD mechanism using `CodePipeline` and/or `CodeDeploy`

This means a single working path is enough. For a constrained learner account, reducing moving parts is safer than building both services at once.

## Preferred Path: CodePipeline

Choose this path if CodePipeline is available in the AWS account and region.

### Flow

1. Source: CodeCommit or S3 versioned zip
2. Build: CodeBuild using `infra/buildspec.yml`
3. Deploy: ECS deploy action with `imagedefinitions.json`

### Why Prefer It

- Easiest story to explain in presentation: source -> build -> deploy
- Matches the current repository artifacts
- Simpler than ECS blue/green through CodeDeploy
- Clear screenshots for the report appendix

### Target Demo Service

Use `tour-catalog` first.

Reasons:

- smallest service surface
- already validated locally
- easy to demonstrate a visible route change

## Fallback Path: CodeDeploy Only

Choose this path only when CodePipeline cannot be used in the real AWS account.

### Flow

1. Build Docker image and push to ECR
2. Prepare the deployment artifact required by CodeDeploy for ECS
3. Trigger CodeDeploy for the selected ECS service
4. Verify the new version through ALB

### Why Not Use Both

- more IAM roles and console setup
- higher chance of learner-lab permission issues
- harder to debug live during the demo
- no extra grading value if one mechanism already works

## Decision Checklist

Before building the final demo path, verify these in AWS Console:

1. Is `CodePipeline` available in the region and account?
2. Can the account create a CodeBuild project with privileged Docker mode?
3. Can the account create or use the needed ECR repository?
4. Can the account update the ECS service from the chosen mechanism?

If all four are yes, use CodePipeline.

If `CodePipeline` is unavailable but CodeDeploy works, use CodeDeploy only.

## Minimal Redeployment Demo

Use one small visible change on `tour-catalog`:

1. Add `GET /api/tours/featured` or modify one clearly visible response field.
2. Trigger the chosen delivery path.
3. Show the updated result via ALB.
4. Capture screenshots of the execution and final live result.

## Rollback

- For ECS rolling update through CodePipeline: redeploy the previous task definition or previous ECR image tag.
- For CodeDeploy: redeploy the last known-good revision or switch back to the previous task set, depending on the deployment mode.

## Evidence To Capture

- Source artifact or repository view
- CodeBuild execution
- CodePipeline or CodeDeploy execution
- ECR image tag created by the deployment
- ECS service update or task set transition
- ALB response showing the new version live