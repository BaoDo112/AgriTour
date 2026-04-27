---
phase: 5
status: in-progress
updated: 2026-04-27
priority_rule: local-docker-first-aws-ready
---

# Phase 5 Status

## Current State

- `infra/deployment-setup.md` is the working decision note for the learner-lab deployment path.
- `docs/aws-codedeploy-guide.md` is the runbook for the AWS-side redeploy demo.
- `docs/aws-console-checklist.md` is now the primary operator guide and includes `aws configure`, ECR push, and concrete RDS-create-screen guidance.
- One learner-lab ECS console pass has already created an Express service and related resources.
- One Cloud9 provisioning attempt failed with `Missing credentials in config` and `No subnets found`.
- Local AWS CLI credentials were verified with `aws sts get-caller-identity` on the personal machine.
- Docker was verified locally and all 3 backend images were built and pushed to ECR with `latest` tags.
- The RDS MySQL instance is now available, local laptop access on `3306` was opened through the attached security group, and the 3 service schemas were imported successfully.
- ECS task definitions now exist for all 3 services: `agritour-tour-catalog:2`, `agritour-booking-billing:1`, and `agritour-identity-partner:1`, all using `LabRole` for both task and execution roles.

## Gap Versus Plan

- The previous wrong-image-source blocker has been resolved by pushing the real images to ECR and recording the full ECR URIs for ECS.
- Cloud9 is not currently a reliable build path in this learner-lab session.
- The team still needs one real AWS console pass to create ECS services from the registered task definitions and verify the standard ECS service path with the correct target groups and ALB wiring.
- The durable source and artifact split must be frozen: GitHub for source, S3 for deployable artifacts.
- No live AWS deployment-group evidence exists yet.
- No redeployment screenshots or console evidence exist yet.

## Recommended Direction

- Prefer `CodeDeploy` for one microservice because it is explicitly supported in the learner lab.
- Keep GitHub as the source of truth outside the learner-lab budget boundary.
- Use S3 for frontend hosting and versioned deployment artifacts.
- Build and push backend images from local Docker before creating or updating ECS services unless Cloud9 becomes healthy again.
- Use the pushed ECR image URIs exactly as printed by `scripts/push-ecr-images.ps1`; do not type image names by hand in ECS.
- Keep the RDS security group rule for the laptop only while importing or debugging locally; later add the ECS service security group as the application path.
- Prefer standard ECS task definitions and ECS services for the final architecture instead of relying on Express Mode.
- Keep the demo scope to one service, ideally `tour-catalog`, to minimize setup and risk.

## Exit Criteria For Phase 5

- At least one service has a working AWS redeployment path.
- One visible change is redeployed through that path.
- Deployment steps, rollback, and evidence are documented.
