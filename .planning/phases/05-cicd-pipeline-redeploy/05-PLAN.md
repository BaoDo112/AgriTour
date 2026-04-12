---
phase: 5
name: CI/CD Pipeline and Redeployment Demo
wave: 4
depends_on: [3]
requirements: [REQ-CICD-01, REQ-REDEPLOY-01, REQ-IAM-01]
files_modified:
  - infra/buildspec.yml
  - infra/pipeline-setup.md
autonomous: false
---

# Phase 5: CI/CD Pipeline and Redeployment Demo

## Objective

Build at least one working CI/CD pipeline using AWS CodePipeline that automatically builds a Docker image, pushes to ECR, and updates the ECS service. Demonstrate one code change deployed through this pipeline.

## Must-Haves (Goal-Backward Verification)

- CodePipeline created for at least 1 service
- Source stage connected (CodeCommit or S3)
- Build stage using CodeBuild to build Docker image and push to ECR
- Deploy stage updating ECS service with new image
- One code change pushed through pipeline end-to-end
- Evidence screenshots of pipeline execution
- Pipeline IAM roles with least-privilege

## Tasks

### Task 5.1: Setup Source Repository (CodeCommit or S3)

**Read first:**
- .planning/GROUP_TASK_PLAN_145337.md (Section 1 — CI/CD decisions)

**Action:**
Primary approach (CodeCommit):
1. Create CodeCommit repository: agritour-tour-catalog (or whichever service is chosen for pipeline)
2. Push service code to CodeCommit:
   ```bash
   # Configure CodeCommit credential helper
   git config --global credential.helper '!aws codecommit credential-helper $@'
   git config --global credential.UseHttpPath true
   
   # Clone and push
   cd services/tour-catalog
   git init
   git remote add codecommit https://git-codecommit.us-east-1.amazonaws.com/v1/repos/agritour-tour-catalog
   git add .
   git commit -m "initial service code"
   git push codecommit main
   ```

Fallback approach (if CodeCommit is unavailable in Learner Lab):
1. Create S3 bucket: agritour-pipeline-source
2. Zip service code and upload:
   ```bash
   cd services/tour-catalog
   zip -r tour-catalog-source.zip . -x "node_modules/*"
   aws s3 cp tour-catalog-source.zip s3://agritour-pipeline-source/tour-catalog-source.zip
   ```
3. Enable S3 versioning (required for CodePipeline S3 source)

**Acceptance criteria:**
- Either: CodeCommit repo agritour-tour-catalog contains service code
- Or: S3 bucket agritour-pipeline-source contains tour-catalog-source.zip with versioning enabled
- Document which approach was used in infra/pipeline-setup.md

### Task 5.2: Create CodeBuild Project

**Read first:**
- services/tour-catalog/Dockerfile

**Action:**
1. Create buildspec.yml at infra/buildspec.yml:
```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
  build:
    commands:
      - echo Building the Docker image...
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  post_build:
    commands:
      - echo Pushing the Docker image...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"%s","imageUri":"%s"}]' $CONTAINER_NAME $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

2. Create CodeBuild project in AWS Console:
   - Project name: agritour-tour-catalog-build
   - Environment: Managed image, Amazon Linux 2, Standard runtime
   - Privileged mode: enabled (required for Docker builds)
   - Service role: create new or use existing with ECR push permissions
   - Buildspec: use buildspec.yml from source
   - Environment variables:
     - AWS_DEFAULT_REGION: us-east-1
     - AWS_ACCOUNT_ID: {account_id}
     - IMAGE_REPO_NAME: agritour-tour-catalog
     - CONTAINER_NAME: tour-catalog

**Acceptance criteria:**
- infra/buildspec.yml exists and contains `docker build`
- infra/buildspec.yml contains `imagedefinitions.json`
- CodeBuild project agritour-tour-catalog-build exists in AWS Console
- Manual build succeeds and pushes image to ECR

### Task 5.3: Create CodePipeline

**Action:**
1. Create CodePipeline: agritour-tour-catalog-pipeline
2. Configure stages:
   - Source stage:
     - If CodeCommit: provider=CodeCommit, repo=agritour-tour-catalog, branch=main
     - If S3: provider=S3, bucket=agritour-pipeline-source, object key=tour-catalog-source.zip
   - Build stage:
     - Provider: CodeBuild
     - Project: agritour-tour-catalog-build
   - Deploy stage:
     - Provider: Amazon ECS
     - Cluster: agritour-cluster
     - Service: agritour-tour-catalog-svc
     - Image definitions file: imagedefinitions.json

3. Trigger pipeline manually first to verify all stages pass

**Acceptance criteria:**
- CodePipeline agritour-tour-catalog-pipeline exists
- Pipeline has 3 stages: Source, Build, Deploy
- All 3 stages show Succeeded status after manual trigger
- ECS service is updated with new task definition revision

### Task 5.4: Demonstrate Redeployment

**Read first:**
- SOA - Group Project.md (Section 4.F)

**Action:**
Pick one visible change from the project brief options:
- Option A: UI change — modify a response message in tourController.js
- Option B: Route change — add a new endpoint like GET /api/tours/featured
- Option C: Functional improvement — add pagination to GET /api/tours

Recommended: Option B (add GET /api/tours/featured that returns top 5 approved tours)

1. Make the code change in services/tour-catalog/
2. Push to CodeCommit (or upload new ZIP to S3)
3. Pipeline triggers automatically (or trigger manually)
4. Pipeline executes: Source -> Build (new Docker image) -> Deploy (ECS rolling update)
5. Verify change is live via ALB URL
6. Take screenshots of:
   - Pipeline execution in progress
   - All stages Succeeded
   - New endpoint returning data via ALB

**Acceptance criteria:**
- Code change is committed (new endpoint or modified response)
- Pipeline re-executed after change
- All pipeline stages show Succeeded
- curl http://{ALB_DNS}/api/tours/featured returns new response (or whatever change was made)
- Screenshots saved in docs/deployment-evidence/

### Task 5.5: Document Pipeline Setup

**Action:**
Create infra/pipeline-setup.md documenting:
- Source approach chosen (CodeCommit or S3) and why
- CodeBuild configuration
- CodePipeline stages
- IAM roles used
- How to trigger pipeline
- How to rollback (previous task definition revision)
- Cost considerations

**Acceptance criteria:**
- infra/pipeline-setup.md exists
- File contains `CodePipeline`
- File contains `CodeBuild`
- File contains `rollback`

## Verification

- [ ] Pipeline exists and all stages succeed
- [ ] One code change was deployed through the pipeline
- [ ] ECS service shows new task definition revision after deployment
- [ ] New change is accessible via ALB URL
- [ ] Evidence screenshots captured in docs/deployment-evidence/
- [ ] Pipeline documentation complete
