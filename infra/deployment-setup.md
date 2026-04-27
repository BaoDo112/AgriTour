# Deployment Path Decision

## Recommendation

Keep the deployment story simple:

- GitHub is the source of truth for the full codebase
- Amazon ECR stores the 3 backend images
- Amazon S3 stores the frontend build output and the CodeDeploy bundle for the redeploy-demo service
- AWS CodeDeploy is the only AWS-side redeployment mechanism kept in the active plan

This is simpler than maintaining a second AWS git repository or a build pipeline inside the learner lab.

## Why This Fits The Learner Lab

- Learner lab accounts can be disabled if the budget is exceeded
- GitHub keeps source history outside that risk boundary
- S3 is already needed for frontend hosting
- ECR is already needed for backend deployment
- CodeDeploy is explicitly supported in the learner lab service matrix

## Recommended Deployment Flow For All 3 Services And The Frontend

1. Keep the project source in GitHub.
2. Build each backend image from your local machine or AWS Cloud9.
3. Push the 3 backend images to these ECR repositories:
   - `agritour-tour-catalog`
   - `agritour-booking-billing`
   - `agritour-identity-partner`
4. Update ECS task definitions and services to use the selected image tags.
5. Build the frontend with the final ALB API URLs.
6. Upload `frontend/dist/` to the S3 hosting bucket.
7. For the required redeploy demo, package one CodeDeploy bundle and upload it to a versioned S3 bucket.
8. Trigger CodeDeploy for the selected service.

## GitHub vs S3 vs CodeCommit

### GitHub

Use GitHub for source code.

Why:

- best place for long-term source history
- outside the learner-lab budget risk
- easiest for team collaboration

### Amazon S3

Use S3 for deployable artifacts.

What belongs there:

- frontend `dist/`
- CodeDeploy bundle for the one redeploy-demo service
- optional release notes or demo assets

Why:

- versioning is simple
- easy to reopen later for a live demo
- already needed for frontend hosting

### CodeCommit

Do not use CodeCommit in the active plan unless your team specifically wants an AWS-side mirror.

Reason:

- it duplicates GitHub without helping the demo enough
- it adds one more place to keep synchronized

## Build Environment

Use one of these:

- local Docker on your machine
- AWS Cloud9 on a supported EC2 size

Do not rely on CloudShell for the multi-service Docker build workflow.

Current learner-lab guidance:

- if Cloud9 environment creation is healthy, it is a valid build environment
- if Cloud9 reports `Missing credentials in config` or `No subnets found`, do not block the whole deployment plan on fixing Cloud9
- in that case, install AWS CLI and Docker on the personal machine, load the temporary learner-lab credentials there, and continue with ECR build and push from the machine

## IAM Roles Are Still Required

Yes, IAM roles are still required even if the learner lab opens the AWS Console for you automatically.

Why:

- your learner-lab login gives you human access to the console
- ECS tasks still need an execution role to pull images from ECR and push logs to CloudWatch
- CodeDeploy still needs a service role to update the ECS service during redeployment
- some AWS services also rely on service-linked roles behind the scenes

Minimum role expectations for this project:

- `LabRole` or the learner-lab equivalent for supported console-side setup work
- one ECS task execution role for image pull and log delivery
- one ECS task role if the application itself calls AWS APIs
- one CodeDeploy service role for the redeploy-demo service

Practical rule for this learner lab:

- if `LabRole` is trusted by the account or by the lab login flow, use it only for human setup actions in the console
- if a runtime role is needed by ECS or CodeDeploy, the trust relationship must name the AWS service principal that will assume it
- a broad permission policy on `LabRole` does not make it a valid ECS execution role or CodeDeploy service role by itself
- if learner lab denies `iam:GetPolicy`, do not spend time reverse-engineering the hidden `VocLabPolicy*` policies
- prefer the AWS console's `Create new role` flow for ECS and CodeDeploy when available, because it usually creates the correct trust relationship automatically
- if role creation is blocked and `LabRole` is the only available runtime option, accept it only after a live validation that proves ECR pull and CloudWatch logging work
- if learner lab denies both `iam:CreateRole` and `access-analyzer:ValidatePolicy`, stop attempting custom role or policy authoring and switch to the smallest viable runtime validation path

If your services do not call AWS APIs directly, the task role can stay minimal. The execution role and CodeDeploy role are still important.

Use the pre-created learner-lab roles where possible instead of inventing unnecessary custom roles.

## Redeploy Demo Scope

Use `tour-catalog` as the demo redeploy service.

Why:

- smallest public service surface
- easy to verify through ALB
- lower demo risk than auth or booking flow

Recommended visible change:

- add or modify `GET /api/tours/featured`

## Concrete Repo Assets

Use these files during setup and rehearsal:

- `docs/aws-console-checklist.md` for click-by-click AWS Console steps
- `infra/codedeploy/tour-catalog/README.md` for the `tour-catalog` CodeDeploy bundle workflow
- `infra/codedeploy/tour-catalog/taskdef.template.json` for the ECS task definition template
- `infra/codedeploy/tour-catalog/appspec.template.yaml` for the CodeDeploy ECS AppSpec template
- `docs/demo-script-15min.md` for the timed live presentation script
- `docs/appendix-screenshot-checklist.md` for report appendix screenshots

## Rollback

- For backend services: keep the previous ECR image tag and previous ECS task definition revision.
- For CodeDeploy: keep the previous S3 deployment bundle and last known-good ECS configuration.
- For frontend: keep the previous `dist/` build or previous versioned S3 objects.

## Cost Notes

- Keep ECS desired count low while preparing.
- Stop or scale down RDS and ECS resources when not actively rehearsing.
- Keep only the newest needed artifacts in active use, but do not delete the last known-good demo version.