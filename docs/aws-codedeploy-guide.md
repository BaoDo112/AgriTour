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

## Current Live Demo Values

These are the validated live values for the current learner-lab session on 2026-04-27:

- Frontend URL: `http://agritour-frontend-721792963856-20260427.s3-website-us-east-1.amazonaws.com`
- Shared ALB URL: `http://agritour-alb-748152609.us-east-1.elb.amazonaws.com`
- Demo endpoint: `http://agritour-alb-748152609.us-east-1.elb.amazonaws.com/api/tours/featured`
- CodeDeploy application: `agritour`
- CodeDeploy deployment group: `agritour-tour-catalog-dg`
- Last successful deployment: `d-440L6Z25J`
- Live redeploy proof: `/api/tours/featured` returns `release = tour-catalog-codedeploy-v1`

If you only need to test the deployed system first, open the frontend URL and confirm it can load data through the shared ALB URL above.

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

For the verified ECS path in this learner-lab setup, use a direct `appspec.yaml` or `appspec.json` object in S3 as the CodeDeploy revision.

Do not assume a `.zip` revision will work for ECS here. The verified failure mode for the wrong artifact type is:

- `INVALID_REVISION: The deployment specifies that the revision is a null file, but the revision provided is a zip file.`

Keep the supporting task-definition JSON next to the AppSpec in your repo or evidence folder, but create the deployment from the versioned AppSpec object itself.

The supporting files for your ECS CodeDeploy flow can include:

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
7. Upload the AppSpec YAML or JSON revision to a versioned S3 bucket.
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
4. Upload the updated AppSpec revision to S3.
5. Trigger CodeDeploy.
6. Show deployment progress.
7. Re-open the endpoint through ALB and verify the new behavior.

## Fast Demo Path For This Session

If you need a clean presentation flow right now, use this sequence:

1. Open the frontend at `http://agritour-frontend-721792963856-20260427.s3-website-us-east-1.amazonaws.com`.
2. Open the ALB demo endpoint at `http://agritour-alb-748152609.us-east-1.elb.amazonaws.com/api/tours/featured`.
3. In AWS CodeDeploy, open application `agritour` and deployment group `agritour-tour-catalog-dg`.
4. Show deployment `d-440L6Z25J` as the completed reference deployment.
5. Refresh the featured endpoint and point out `release = tour-catalog-codedeploy-v1` as the visible post-redeploy change.

If you want to rerun the same style of demo with a new release:

1. make a visible `tour-catalog` change
2. build and push a new `agritour-tour-catalog` image tag to ECR
3. upload the updated `appspec.yaml` revision to S3
4. create a new deployment in CodeDeploy application `agritour`
5. watch the deployment reach `Succeeded`
6. refresh `/api/tours/featured` through the ALB

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