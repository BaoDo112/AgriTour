# Tour Catalog CodeDeploy Bundle

## Purpose

This folder contains the repository-side templates for the `tour-catalog` ECS redeployment demo.

It is designed for a manual learner-lab flow:

1. build and push a new `tour-catalog` image to ECR
2. register a new ECS task definition revision
3. update the AppSpec file to point to that new task definition revision
4. upload the AppSpec file itself to S3 as the deployment revision
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

### Step 3: Prepare the deployment revision

For the verified ECS CodeDeploy path in this repository, upload the filled `appspec.yaml` directly to S3 and use that versioned object as the deployment revision.

Keep the filled task definition JSON alongside it for traceability, but do not assume a zip revision will be accepted for ECS in this learner-lab setup.

Verified failure mode when using the wrong artifact type:

- `INVALID_REVISION: The deployment specifies that the revision is a null file, but the revision provided is a zip file.`

Recommended tracked files:

- `appspec.yaml`
- `taskdef.json`
- optional release note text file with image tag and commit id

### Step 4: Upload and deploy

1. upload `appspec.yaml` to the versioned S3 deployment bucket
2. note the object key and version id
3. create the CodeDeploy deployment from that S3 revision using bundle type `YAML`

## Suggested Naming Convention

- AppSpec object key: `tour-catalog/appspec-YYYYMMDD-HHMM.yaml`
- task definition family: `agritour-tour-catalog`
- container name: `tour-catalog`

## Validation

After the deployment finishes:

1. verify CodeDeploy shows `Succeeded`
2. verify ECS service is using the new task definition revision
3. verify `GET /api/tours/featured` or the selected demo change works through ALB