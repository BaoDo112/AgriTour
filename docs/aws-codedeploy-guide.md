# AWS CodeDeploy Guide

## Purpose

This guide is the active AWS redeployment runbook for the learner lab.

Use `docs/aws-console-checklist.md` as the primary operator guide for day-to-day AWS setup.

Use this file only when the base ECS deployment is already healthy and you are preparing the one-service CodeDeploy redeployment demo.

It assumes:

- GitHub holds the full source code
- ECR holds backend images
- S3 holds frontend output and the CodeDeploy bundle
- CodeDeploy is used for the required redeploy demo on one selected service

## Recommended Scope

Deploy all 3 backend services and the frontend.

Use CodeDeploy only for one service to satisfy the redeployment-demo requirement.

Recommended demo service:

- `tour-catalog`

## Artifacts To Prepare

### Backend images

Build and push these images to ECR:

- `agritour-tour-catalog`
- `agritour-booking-billing`
- `agritour-identity-partner`

### Frontend artifact

Build the Vite frontend and upload `dist/` to the S3 hosting bucket.

### CodeDeploy bundle

Prepare one versioned S3 object containing the deployment bundle for the demo service.

The bundle should contain the files required by your ECS CodeDeploy flow, such as:

- deployment specification
- task definition reference
- any metadata your team uses to map the target image tag

Ready-to-fill templates now exist in:

- `infra/codedeploy/tour-catalog/taskdef.template.json`
- `infra/codedeploy/tour-catalog/appspec.template.yaml`
- `infra/codedeploy/tour-catalog/README.md`

## AWS Setup Checklist

1. Work only in `us-east-1` or `us-west-2`.
2. Confirm the ECR repositories exist.
3. Confirm the ECS cluster and ALB are already working.
4. Confirm the target ECS service is healthy before testing CodeDeploy.
5. Create the CodeDeploy application for the chosen service.
6. Create the deployment group linked to the correct ECS service and ALB target groups.
7. Upload the deployment bundle to a versioned S3 bucket.
8. Start the deployment and observe it until it reaches `Succeeded`.

Learner-lab blocker rule:

- if the account denies `iam:CreateRole`, do not assume CodeDeploy role creation will work later just because the console shows the option
- first get one ECS service healthy with the available runtime role path
- then test whether CodeDeploy can reuse an existing compatible role; if not, capture that IAM limitation as an environment blocker instead of treating it as an AppSpec bug

For screen-by-screen console steps, use `docs/aws-console-checklist.md`.

## Demo Flow

1. Show the current live endpoint through ALB.
2. Make one visible code change in the selected service.
3. Build and push a new image tag to ECR.
4. Upload the updated deployment bundle to S3.
5. Trigger CodeDeploy.
6. Show deployment progress.
7. Re-open the endpoint through ALB and verify the new behavior.

## Evidence To Capture

- ECR image tag for the new release
- ECS service before and after deployment
- S3 object version for the deployment bundle
- CodeDeploy deployment execution with `Succeeded`
- ALB response showing the change live

Store the screenshots under `docs/deployment-evidence/` and track the required set in `docs/appendix-screenshot-checklist.md`.

## Why This Path Is Better For Demo Day

- fewer AWS services to explain
- cleaner recovery if the learner lab is restarted
- GitHub remains the permanent source of truth
- S3 and ECR keep the deployable assets easy to reopen later