# Tour Catalog CodeDeploy Bundle

## Purpose

This folder contains the repository-side templates for the `tour-catalog` ECS redeployment demo.

It is designed for a manual learner-lab flow:

1. build and push a new `tour-catalog` image to ECR
2. register a new ECS task definition revision
3. update the AppSpec file to point to that new task definition revision
4. zip the deployment bundle and upload it to S3
5. trigger CodeDeploy

## Files

- `taskdef.template.json` -> starting point for the new ECS task definition revision
- `appspec.template.yaml` -> starting point for the ECS CodeDeploy AppSpec revision

## How To Use

### Step 1: Prepare the task definition

Open `taskdef.template.json` and replace these placeholders:

- `REPLACE_WITH_TASK_EXECUTION_ROLE_ARN`
- `REPLACE_WITH_TASK_ROLE_ARN`
- `REPLACE_WITH_ECR_IMAGE_URI`
- `REPLACE_WITH_AWS_REGION`
- `REPLACE_WITH_DB_HOST`
- `REPLACE_WITH_DB_USER`
- `REPLACE_WITH_DB_PASSWORD`
- `REPLACE_WITH_JWT_SECRET`

If the application does not call AWS APIs directly, keep the task role minimal and learner-lab-safe.

Then create a new ECS task definition revision from that JSON.

Copy the full task definition ARN after the revision is created.

### Step 2: Prepare the AppSpec file

Open `appspec.template.yaml` and replace these placeholders:

- `REPLACE_WITH_TASK_DEFINITION_ARN`
- `REPLACE_WITH_PLATFORM_VERSION`

If your CodeDeploy deployment group uses a different container name or port, update them too.

### Step 3: Build the deployment bundle

Create a deployment bundle zip containing the filled AppSpec file.

If your team wants to keep both files together for traceability, include the filled task definition JSON in the same zip as supporting evidence.

Recommended zip content:

- `appspec.yaml`
- `taskdef.json`
- optional release note text file with image tag and commit id

### Step 4: Upload and deploy

1. upload the zip to the versioned S3 deployment bucket
2. note the object key and version id
3. create the CodeDeploy deployment from that S3 revision

## Suggested Naming Convention

- zip name: `tour-catalog-deploy-YYYYMMDD-HHMM.zip`
- task definition family: `agritour-tour-catalog`
- container name: `tour-catalog`

## Validation

After the deployment finishes:

1. verify CodeDeploy shows `Succeeded`
2. verify ECS service is using the new task definition revision
3. verify `GET /api/tours/featured` or the selected demo change works through ALB