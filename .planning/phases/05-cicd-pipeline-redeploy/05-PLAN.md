---
phase: 5
name: Deployment and Redeployment Demo
wave: 4
depends_on: [3]
requirements: [REQ-CICD-01, REQ-REDEPLOY-01, REQ-IAM-01]
files_modified:
   - infra/deployment-setup.md
   - docs/aws-codedeploy-guide.md
   - docs/aws-console-checklist.md
   - infra/codedeploy/tour-catalog/taskdef.template.json
   - infra/codedeploy/tour-catalog/appspec.template.yaml
   - infra/codedeploy/tour-catalog/README.md
   - docs/demo-script-15min.md
   - docs/appendix-screenshot-checklist.md
autonomous: false
---

# Phase 5: Deployment and Redeployment Demo

## Objective

Build at least one working AWS redeployment path for one microservice within the learner lab restrictions. Keep GitHub as the source of truth, use S3 for deployable artifacts, and use CodeDeploy as the only redeployment mechanism in the active plan. Demonstrate one code change redeployed through that path.

Brief alignment:
- Section 4.E requires one basic AWS CI/CD mechanism for at least one microservice.
- Section 5 allows `CodePipeline` and or `CodeDeploy`, so a working `CodeDeploy` path still satisfies the requirement.
- To maximize score potential, the team must pair that redeploy path with strong evidence for architecture, containerization, ECS or ALB routing, CloudWatch, and the final report or demo package.

## Must-Haves (Goal-Backward Verification)

- One supported AWS redeployment mechanism exists for at least 1 service
- Source is preserved outside the learner lab in GitHub and deployable artifacts are versioned in S3
- Docker image is built from an allowed development environment and pushed to ECR
- Deploy stage updates the ECS service with the new image
- One visible code change is redeployed end-to-end
- Evidence screenshots of the deployment execution exist
- IAM and region choices respect learner-lab restrictions

## Tasks

### Task 5.1: Confirm Learner Lab Constraints

**Action:**
1. Keep all work in `us-east-1` or `us-west-2`.
2. Use the pre-created learner-lab roles where required:
   - `LabRole`
   - `LabInstanceProfile`
3. Satisfy the CI/CD requirement with `CodeDeploy` for one service and do not depend on unsupported build-pipeline services.
4. Keep the demo scope to one service, ideally `tour-catalog`.

**Acceptance criteria:**
- The team has one chosen region.
- The team can explain why `CodeDeploy` is the selected CI/CD mechanism under the project brief.
- The team can explain why the Phase 5 design avoids unsupported learner-lab services.

### Task 5.2: Choose The Delivery Path

**Decision rule:**
- Default to `CodeDeploy` for one ECS service.
- Use GitHub as the source of truth for all code.
- Use S3 to keep deployable artifacts that you want to re-run later during demo day.
- Build and push the Docker image from local Docker or AWS Cloud9.

**Acceptance criteria:**
- The team records which path will be demonstrated.
- The chosen path is feasible in the actual AWS account and region.

### Task 5.3: Setup Durable Source And Artifact Storage

**Read first:**
- .planning/GROUP_TASK_PLAN_145337.md (Section 1 — CI/CD decisions)

**Action:**
Primary approach:
1. Keep the full codebase in GitHub as the source of truth.
2. Create one versioned S3 bucket for deployable artifacts.
3. Store these S3 artifacts there:
   - frontend `dist/`
   - CodeDeploy bundle for the redeploy-demo service

Fallback approach:
1. If GitHub is unavailable during a working session, package the needed service or frontend artifact from the local machine.
2. Upload the artifact to the same S3 bucket and deploy from there.

**Acceptance criteria:**
- GitHub contains the current project source.
- S3 contains the versioned deployment artifacts needed for the demo.
- The team documents which S3 objects correspond to which deployment.

### Task 5.4: Build And Push The Image

**Read first:**
- services/tour-catalog/Dockerfile

**Action:**
1. Build the image from an allowed environment:
   - local Docker on the developer machine, or
   - AWS Cloud9 using a supported EC2 size
2. Log in to ECR and push the new image tag.
3. Record the exact image URI that will be deployed.
4. Record the exact image tag for each of the 3 services so later ECS updates are deterministic.

**Acceptance criteria:**
- A new image tag exists in ECR for the chosen service.
- The team can repeat the build and push from the chosen environment.

### Task 5.5: Create CodeDeploy Path

**Action:**
1. Create a CodeDeploy application for the chosen ECS service.
2. Create the deployment group tied to:
   - the ECS cluster
   - the ECS service
   - the ALB listener and target groups used by that service
3. Prepare the deployment artifact required by CodeDeploy ECS mode, including the deployment specification and task definition reference.
4. Trigger one deployment using the new ECR image.

**Acceptance criteria:**
- CodeDeploy application and deployment group exist for one service.
- One deployment reaches `Succeeded`.
- ECS service updates to the new task definition or task set.

### Task 5.7: Demonstrate Redeployment

**Read first:**
- SOA - Group Project.md (Section 4.F)

**Action:**
Pick one visible change from the project brief options:
- Option A: UI change
- Option B: Route change
- Option C: Small functional improvement

Recommended: add `GET /api/tours/featured` returning top approved tours.

1. Make the code change in `services/tour-catalog/`
2. Push the code to GitHub and package the deployable artifact to S3
3. Build and push the new image tag from local Docker or Cloud9
4. Trigger CodeDeploy for ECS
5. Verify the change is live via ALB URL
6. Capture screenshots of:
   - deployment execution in progress
   - deployment `Succeeded`
   - new endpoint returning data through ALB

**Acceptance criteria:**
- The code change is committed.
- The deployment is re-executed after the change.
- The deployment shows `Succeeded`.
- `curl http://{ALB_DNS}/api/tours/featured` returns the new result.
- Screenshots are saved in `docs/deployment-evidence/`.

### Task 5.8: Document Deployment Setup

**Action:**
Create `infra/deployment-setup.md` documenting:
- source of truth in GitHub and why
- S3 artifact storage layout
- build environment choice (`local Docker` or `Cloud9`)
- CodeDeploy steps
- IAM roles used
- rollback process
- cost considerations

**Acceptance criteria:**
- `infra/deployment-setup.md` exists
- file contains `CodeDeploy`
- file contains `GitHub`
- file contains `S3`
- file contains `LabRole`
- file contains `rollback`

### Task 5.9: Prepare Score-Maximizing Evidence Pack

**Read first:**
- SOA - Group Project.md (Sections 4, 5, 6)

**Action:**
1. Create one checklist that maps each scoring-sensitive brief requirement to concrete evidence.
2. Confirm the demo covers these items:
   - architecture diagram with browser, services, databases, AWS services, and traffic flow
   - 3 containerized services running on ECS or Fargate
   - ALB routing for all 3 service groups
   - RDS database usage
   - CloudWatch logs or monitoring evidence
   - one CodeDeploy redeployment demo
   - one main workflow or saga ready for explanation
   - one failure scenario or graceful fallback ready for explanation
3. Store the checklist where the team can use it during deployment rehearsal.

**Acceptance criteria:**
- The team has one evidence checklist covering Sections 4, 5, and 6 of the project brief.
- The redeployment demo is no longer the only proof point for Phase 5.
- The team can explain how the deployed system targets strong marks beyond the minimum CI/CD requirement.

## Verification

- [ ] One supported AWS redeployment path exists and succeeds
- [ ] One visible code change is redeployed through that path
- [ ] ECS service shows the new task definition revision or task set after deployment
- [ ] The new change is accessible through ALB
- [ ] Evidence screenshots are captured in `docs/deployment-evidence/`
- [ ] Deployment documentation is complete
