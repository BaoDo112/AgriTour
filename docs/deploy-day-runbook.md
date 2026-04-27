# Deploy Day Runbook

## Purpose

This runbook is the step-by-step operating checklist for the final AWS deployment rehearsal and the presentation-day demo.

It is designed to maximize grading coverage from the project brief, not just to prove that one redeploy works.

## Target Outcome

By the end of the session, the team should be able to show:

- 3 microservices deployed on AWS
- frontend reachable from S3 hosting
- ALB path routing working
- RDS-backed data access working
- CloudWatch evidence available
- one successful CodeDeploy redeployment for `tour-catalog`
- one main workflow or saga ready to explain
- one failure scenario or operational fallback ready to explain

## Roles For The Session

Assign these roles before starting:

- Operator 1: backend image build and ECR push
- Operator 2: ECS, ALB, and CodeDeploy console actions
- Operator 3: frontend build, S3 upload, and smoke checks
- Operator 4: screenshot capture, report appendix evidence, and timing

If the group has more members, split database setup, CloudWatch review, and presentation narration.

## T Minus 1 Day Checklist

Complete these before demo day:

1. Confirm all 3 services pass local smoke tests.
2. Confirm final environment variables are documented.
3. Confirm RDS schemas are already imported.
4. Confirm ECR repositories already exist.
5. Confirm ECS cluster, task definitions, services, and ALB listener rules already exist.
6. Confirm the frontend builds with the final ALB URL.
7. Confirm the CodeDeploy application and deployment group are already created for `tour-catalog`.
8. Prepare one visible code change for redeploy, ideally `GET /api/tours/featured`.
9. Prepare a fallback image tag and previous deployment bundle for rollback.
10. Prepare the architecture diagram, saga slide, and failure-handling note.

## Demo Day Inputs

Have these values ready in one shared note:

- AWS region
- ECS cluster name
- ECR repository names
- ECS service names
- ALB DNS name
- RDS endpoint
- S3 frontend bucket name
- S3 deployment-artifact bucket name
- CodeDeploy application name
- CodeDeploy deployment group name
- image tags for the current release and demo release

## Phase A: Environment And Health Check

1. Log in to the learner lab and confirm the correct region.
2. Open ECR, ECS, ALB, RDS, S3, CloudWatch, and CodeDeploy in separate tabs.
3. Verify the 3 ECS services are healthy.
4. Verify all ALB target groups are healthy.
5. Verify the frontend is reachable from S3.
6. Verify the main user flow works through the frontend and ALB.

Evidence to capture:

- ECS services healthy
- ALB target groups healthy
- frontend home page live

## Phase B: Backend Release Preparation

1. Pull the latest code from GitHub.
2. Apply the prepared visible change for `tour-catalog` if it is not already committed.
3. Build the `tour-catalog` image.
4. Push the new image tag to ECR.
5. Update the deployment bundle metadata so it points to the new image or task definition revision.
6. Upload the new deployment bundle to the versioned S3 bucket.

Evidence to capture:

- GitHub commit or diff showing the change
- ECR image tag present
- S3 object version for the deployment bundle

## Phase C: Redeploy Demo

1. Trigger the CodeDeploy deployment for `tour-catalog`.
2. Watch the deployment until it reaches `Succeeded`.
3. Re-open the ALB endpoint for the changed route.
4. Verify the new result is visible.

Recommended live verification:

- `GET /api/tours/featured`

Evidence to capture:

- deployment in progress
- deployment succeeded
- changed endpoint response live through ALB

## Phase D: Full-System Proof

After the redeploy succeeds, prove the system is more than one service.

1. Show `tour-catalog` route success.
2. Show one `booking-billing` route success.
3. Show one `identity-partner` route success.
4. Show the frontend calling the backend through ALB.
5. Show one CloudWatch log group with recent requests.

Recommended proof points:

- `GET /api/regions`
- one booking list or booking status endpoint
- one auth or partner endpoint

## Phase E: Presentation Sequence

Use this order during the live presentation:

1. System overview and business problem
2. Architecture diagram with traffic flow
3. 3 service responsibilities and APIs
4. Main workflow or saga
5. AWS deployment topology: ECR, ECS, ALB, RDS, S3, CloudWatch
6. CodeDeploy redeployment demo for `tour-catalog`
7. Failure scenario or operational fallback
8. Reflection: what was difficult and what was learned

This order maps closely to the submission and viva expectations in the project brief.

## Q And A Readiness

Each member should be ready to answer one area clearly:

- service boundaries
- Docker and containerization
- ECS or ALB deployment choices
- database setup and schema separation
- CodeDeploy flow
- CloudWatch monitoring
- frontend integration
- testing and validation

## Rollback Plan

If the redeploy fails:

1. Stop the live demo narration and state that rollback is prepared.
2. Re-run the previous known-good deployment bundle.
3. Point ECS back to the previous task definition or image tag if needed.
4. Re-test the ALB endpoint.
5. Continue the presentation using the recovered version.

## What Counts As A Strong Evidence Folder

Store these screenshots under `docs/deployment-evidence/`:

- architecture diagram export
- ECR repositories and image tags
- ECS cluster and services
- ALB listener rules and healthy target groups
- RDS instance
- CloudWatch logs or alarms
- CodeDeploy deployment progress and success
- frontend live page
- changed route response after redeploy

## Final Success Criteria

The run is successful if all of these are true:

- the 3 services are live on AWS
- the frontend is live
- ALB routing works
- at least one service is redeployed through CodeDeploy
- the team has screenshots for report appendix use
- the team can explain one saga and one failure scenario without improvising