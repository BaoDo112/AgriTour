# AWS Console Checklist

## Purpose

This checklist is the click-by-click AWS Console guide for deploying the final project on learner lab infrastructure.

This is the primary operator document for AWS work.

This is a hybrid deployment flow, not a CLI-only flow:

- use CLI for repeatable local steps such as credential checks, image push, frontend build, and optional task-definition registration
- use the AWS Console for the resource-wiring steps that are easier to verify visually in learner lab, especially ECS services, target groups, ALB rules, and CodeDeploy setup

This file is intended to be self-contained for the main deploy path. Other AWS notes in the repo are optional reference, not required reading.

If this file conflicts with another AWS note in the repository, follow this file first and treat the others as reference-only context.

Download AWS CLI: https://awscli.amazonaws.com/AWSCLIV2-2.0.30.msi

## Current Session: Use One Path Only

For the current learner-lab session, use only this path:

1. Work from your personal machine.
2. Run `aws configure` with the temporary learner-lab credentials.
3. Run `aws sts get-caller-identity`.
4. Run `docker --version`.
5. Run `scripts/push-ecr-images.ps1` to create missing ECR repositories and push all 3 backend images.
6. Paste the printed ECR image URIs into ECS task definitions.
7. Create RDS, ECS services, target groups, and ALB routing.
8. Build the frontend and upload `frontend/dist/` to S3.
9. Use CodeDeploy only after `tour-catalog` is already healthy on ECS.

Ignore these paths in this session:

- do not use `aws login`
- do not spend more time on Cloud9
- do not reintroduce CodePipeline, CodeBuild, or CodeCommit

## Values To Fill Before You Start

- `<path-to-your-local-AgriTour>`
- `<aws-region>` default `us-east-1`
- `<rds-endpoint>`
- `<rds-password>`
- `<shared-jwt-secret>`
- `<frontend-bucket-name>`
- `<deployment-bucket-name>`
- `<task-role-arn>` and `<execution-role-arn>` if you use the JSON import path for ECS task definitions

## Quick Start

Run these from Windows PowerShell on your machine after AWS CLI and Docker are ready:

```powershell
Set-Location "<path-to-your-local-AgriTour>"
$AWS_REGION = "us-east-1"
$PROJECT_ROOT = (Get-Location).Path
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
```

If you switch to `us-west-2`, update `$AWS_REGION` before running the remaining commands.

In the remaining examples, `<your-ecr-registry>` means `<account-id>.dkr.ecr.<region>.amazonaws.com` for the AWS account and region you are using right now.

## Personal Machine Bootstrap

If `aws` or `docker` is not installed yet, do this first.

### Step A: Install AWS CLI

```powershell
winget install Amazon.AWSCLI
```

Then verify:

```powershell
aws --version
```

### Step B: Install Docker Desktop

```powershell
winget install Docker.DockerDesktop
```

Then verify:

```powershell
docker --version
```

### Step C: Configure the learner-lab credentials locally

Use `aws configure` and paste the temporary learner-lab credentials from the lab page.

Do not use `aws login` for learner lab.

```powershell
aws configure
```

When prompted, enter:

- AWS Access Key ID
- AWS Secret Access Key
- AWS Session Token if your CLI asks for it
- default region: `us-east-1`
- output format: leave blank or use `json`

If your AWS CLI does not prompt for session token, run this once after `aws configure`:

```powershell
aws configure set aws_session_token "<SESSION_TOKEN>"
```

Then verify the credentials:

```powershell
aws sts get-caller-identity
```

If this returns the learner-lab account ID, continue to the ECR step below.

Security note:

- these credentials expire with the learner-lab session
- never commit them into the repository

## 1. Push Backend Images To ECR

Run the script from your personal machine:

```powershell
Set-Location $PROJECT_ROOT
.\scripts\push-ecr-images.ps1 -AwsRegion $AWS_REGION
```

The script will:

- verify AWS credentials
- verify Docker
- detect the AWS account ID automatically
- create any missing ECR repositories
- build and push all 3 backend images
- print the exact image URIs to paste into ECS

Expected repositories:

- `agritour-tour-catalog`
- `agritour-booking-billing`
- `agritour-identity-partner`

Critical rule:

- always paste the full ECR image URI into ECS task definitions
- if ECS tries `docker.io/library/<name>:latest`, the image field is wrong and must be replaced with the full ECR URI

## 2. RDS Instance

Open: `RDS` -> `Databases` -> `Create database`

Use `Full configuration` so you can force the cheap single-instance setup instead of AWS production defaults.

Choose these values on the create screen:

- Engine type: `MySQL`
- Template: `Sandbox` if available, otherwise `Dev/Test`
- Availability and durability: `Single-AZ DB instance deployment (1 instance)`
- Edition: `MySQL Community`
- Engine version: keep the default supported MySQL 8.x version
- DB instance identifier: `agritour-db`
- Master username: `admin`
- Credentials management: `Self managed`
- Database authentication: `Password authentication`
- DB instance class: choose the smallest burstable class available, preferably `db.t3.micro`; if not offered, use `db.t4g.micro`
- Storage type: `General Purpose SSD (gp3)`
- Allocated storage: `20 GiB`
- Storage autoscaling: off
- Compute resource: `Don't connect to an EC2 compute resource`
- VPC: `Default VPC`
- DB subnet group: `default`
- Public access: `Yes` for the initial schema import from your machine
- VPC security group: create or choose one that allows `3306`; start with your current public IP, then add the ECS service security group later
- Availability Zone: `No preference`
- RDS Proxy: off
- Enhanced Monitoring: off
- Initial database name: leave blank
- Backup retention: `1 day`
- Auto minor version upgrade: leave default
- Deletion protection: off

Avoid these choices in learner lab unless you intentionally need them:

- `Multi-AZ`
- `Managed in AWS Secrets Manager`
- large DB instance classes
- `RDS Proxy`
- extra monitoring features

After creation:

- wait for the instance status to become `Available`
- note the endpoint and port `3306`
- download the AWS RDS CA bundle once:

```powershell
Set-Location $PROJECT_ROOT
curl.exe -o .\global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

- import the schemas using one of these paths:

Path A, recommended, no local `mysql` install needed:

```powershell
Set-Location $PROJECT_ROOT
.\scripts\import-rds-schemas.ps1 -DbHost "<rds-endpoint>" -DbUser "admin" -CaFilePath ".\global-bundle.pem"
```

This path uses Docker to run the MySQL client and will prompt you for the RDS password.

If the script reports that it cannot reach `<rds-endpoint>:3306`, fix these AWS settings first:

- RDS instance status must be `Available`
- `Public access` must be `Yes`
- the attached RDS security group must allow inbound `TCP 3306`
- for the first import from your laptop, allow your current public IP as the source
- after ECS is created, add the ECS service security group as another allowed source

Important import note:

- the SQL files already contain `CREATE DATABASE IF NOT EXISTS ...` and `USE ...`
- leave `Initial database name` blank in the RDS form and let the schema files create the 3 logical databases for you

After the import, confirm that these 3 databases exist:

- `agritour_catalog`
- `agritour_booking`
- `agritour_identity`

## 3. ECS Cluster, Task Definitions, ALB, And Services

Minimal learner-lab rule before you continue:

- use the lab `default` VPC
- use the existing default subnets from that VPC
- you do not need one security group per service for the first pass
- you only need `2` security groups total for the shared setup:
	- `agritour-alb-sg` for the ALB
	- `agritour-ecs-sg` reused by all 3 ECS services
- target groups are not security groups; they are required ALB routing targets
- you still need `3` target groups because you have `3` backend services behind one ALB

Open: `ECS` -> `Clusters` -> `Create cluster`

Choose:

- launch type or infrastructure: Fargate-capable option
- cluster name: for example `agritour-cluster`

Open: `ECS` -> `Task definitions` -> `Create new task definition`

Create one task definition per service.

Important:

- do not paste the ECR image URI into `Task definition family`
- `Task definition family` must be a short service name such as `agritour-tour-catalog`
- the ECR image URI belongs in the `Image URI` field inside the container section
- do not leave the default container port `80`; use `3001`, `3002`, or `3003` depending on the service

For the current ECS form, use these common values for all 3 task definitions:

- Launch type: `AWS Fargate`
- Operating system / Architecture: `Linux/X86_64`
- Network mode: `awsvpc`
- Task size CPU: `0.25 vCPU`
- Task size Memory: `0.5 GB`
- Task role: leave blank on the first pass unless the console forces you to choose one
- Task execution role: `Create default role` if ECS offers it; otherwise choose a working execution role from your account
- Fault injection: off
- Essential container: `Yes`
- Port protocol: `TCP`
- App protocol: `HTTP`
- Read only root file system: off
- Log collection: `Use log collection`
- Log destination: `Amazon CloudWatch`
- `awslogs-region`: your current AWS region
- `awslogs-stream-prefix`: `ecs`
- `awslogs-create-group`: `true`
- Restart policy: off
- Ephemeral storage: default `20 GiB`
- Trace collection: off
- Metric collection: off

Use these service-specific values:

### Task Definition 1: tour-catalog

- Task definition family: `agritour-tour-catalog`
- Container name: `tour-catalog`
- Image URI: `<your-ecr-registry>/agritour-tour-catalog:latest`
- Container port: `3001`
- CloudWatch log group: `/ecs/agritour-tour-catalog`

Environment variables:

- `PORT=3001`
- `DB_HOST=<rds-endpoint>`
- `DB_PORT=3306`
- `DB_USER=admin`
- `DB_PASSWORD=<rds-password>`
- `DB_NAME=agritour_catalog`
- `JWT_SECRET=<shared-jwt-secret>`

HealthCheck:

- Command: `CMD-SHELL,wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1`
- Interval: `30`
- Timeout: `5`
- Start period: `10`
- Retries: `3`

### Task Definition 2: booking-billing

- Task definition family: `agritour-booking-billing`
- Container name: `booking-billing`
- Image URI: `<your-ecr-registry>/agritour-booking-billing:latest`
- Container port: `3002`
- CloudWatch log group: `/ecs/agritour-booking-billing`

Environment variables:

- `PORT=3002`
- `DB_HOST=<rds-endpoint>`
- `DB_PORT=3306`
- `DB_USER=admin`
- `DB_PASSWORD=<rds-password>`
- `DB_NAME=agritour_booking`
- `JWT_SECRET=<shared-jwt-secret>`
- `TOUR_FETCH_TIMEOUT_MS=1500`
- `TOUR_FETCH_RETRIES=1`
- `TOUR_CATALOG_PROVIDER_ORDER=service,request,mock`
- `TOUR_CATALOG_FALLBACK=mock`

Optional after the ALB exists:

- `TOUR_CATALOG_URL=http://<alb-dns>`

If you are creating the task definition before the ALB exists, skip `TOUR_CATALOG_URL` for the first revision and add it later.

HealthCheck:

- Command: `CMD-SHELL,wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1`
- Interval: `30`
- Timeout: `5`
- Start period: `10`
- Retries: `3`

### Task Definition 3: identity-partner

- Task definition family: `agritour-identity-partner`
- Container name: `identity-partner`
- Image URI: `<your-ecr-registry>/agritour-identity-partner:latest`
- Container port: `3003`
- CloudWatch log group: `/ecs/agritour-identity-partner`

Environment variables:

- `PORT=3003`
- `DB_HOST=<rds-endpoint>`
- `DB_PORT=3306`
- `DB_USER=admin`
- `DB_PASSWORD=<rds-password>`
- `DB_NAME=agritour_identity`
- `JWT_SECRET=<shared-jwt-secret>`

HealthCheck:

- Command: `CMD-SHELL,wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1`
- Interval: `30`
- Timeout: `5`
- Start period: `10`
- Retries: `3`

Role rule:

- prefer a role created or offered by ECS
- use `LabRole` only if role creation is blocked and it is the only option available in your account
- if the task fails with `CannotPullContainerError`, debug the ECR image URI first

If the console supports JSON import, use these templates:

Before importing, replace the placeholders in those JSON files with values from your own environment:

- `REPLACE_WITH_TASK_ROLE_ARN`
- `REPLACE_WITH_EXECUTION_ROLE_ARN`
- `REPLACE_WITH_ECR_IMAGE_URI`
- `REPLACE_WITH_AWS_REGION`
- `REPLACE_WITH_DB_HOST`
- `REPLACE_WITH_DB_USER`
- `REPLACE_WITH_DB_PASSWORD`
- `REPLACE_WITH_JWT_SECRET`

- `infra/task-definitions/tour-catalog-task.template.json`
- `infra/task-definitions/booking-billing-task.template.json`
- `infra/task-definitions/identity-partner-task.template.json`

Keep `infra/codedeploy/tour-catalog/taskdef.template.json` for the later CodeDeploy redeploy demo, not for the first manual ECS pass.

Important for learner lab JSON import:

- Fargate with `awslogs` requires an execution role ARN
- replace every role and environment placeholder before importing JSON
- if ECS can create a default execution role, prefer that path
- if `iam:PassRole` appears, the ARN is wrong for the current account or region

JWT rule:

- use one shared `JWT_SECRET` value across the services that issue or verify the same login token
- for this project, `identity-partner` signs the token and `tour-catalog` verifies it, so those two must use the same secret
- `booking-billing` can also use the same shared value for consistency even if it is not currently enforcing JWT on every route
- the database does not need `JWT_SECRET`; RDS only needs `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`

### 3A. Create Security Groups First

For the first working deployment, create only these `2` security groups total and reuse them:

1. `agritour-alb-sg`
2. `agritour-ecs-sg`

Attach them like this:

- attach `agritour-alb-sg` to the ALB
- attach `agritour-ecs-sg` to all `3` ECS services
- do not attach `agritour-alb-sg` to an ECS service
- do not point `agritour-ecs-sg` to one specific service; it is a shared ECS service security group

Create or reuse these security groups:

- `agritour-alb-sg`
	- inbound `HTTP 80` from `0.0.0.0/0`
	- outbound all
- `agritour-ecs-sg`
	- inbound `TCP 3001` from `agritour-alb-sg`
	- inbound `TCP 3002` from `agritour-alb-sg`
	- inbound `TCP 3003` from `agritour-alb-sg`
	- outbound all

Then update the RDS security group:

- keep your laptop IP on `3306` while importing or debugging
- add inbound `MySQL/Aurora 3306` from `agritour-ecs-sg`

Fast path in learner lab:

- create `agritour-alb-sg` while creating the ALB if that is more convenient
- create `agritour-ecs-sg` while creating the first ECS service if the form allows it
- for the second and third ECS services, choose `Use an existing security group` and reuse `agritour-ecs-sg`

Concrete example:

- if you are currently creating `tour-catalog`, you may create `agritour-ecs-sg` there
- later, when creating `booking-billing` and `identity-partner`, reuse that same `agritour-ecs-sg`
- separately, when creating the ALB, attach `agritour-alb-sg` to the ALB itself

### 3B. Create Target Groups

Open: `EC2` -> `Target Groups` -> `Create target group`

Create these 3 target groups:

1. `agritour-tour-catalog-tg`
2. `agritour-booking-billing-tg`
3. `agritour-identity-partner-tg`

Use these values for all 3:

- Target type: `IP`
- Protocol: `HTTP`
- VPC: use the lab `default` VPC unless you already created a separate project VPC on purpose
- Health check path: `/health`

Ports:

- `agritour-tour-catalog-tg` -> `3001`
- `agritour-booking-billing-tg` -> `3002`
- `agritour-identity-partner-tg` -> `3003`

### 3C. Create The ALB

Open: `EC2` -> `Load Balancers` -> `Create load balancer`

Choose `Application Load Balancer`.

On the create screen, fill the form like this:

Basic configuration:

- Load balancer name: `agritour-alb`
- Scheme: `Internet-facing`
- Load balancer IP address type: `IPv4`

Network mapping:

- VPC: use the lab `default` VPC unless you already created a separate project VPC on purpose
- IPAM pool: leave off
- Availability Zones and subnets: choose any `2` default subnets in different Availability Zones; you do not need to select all `6`
- if the exact subnets shown in your lab are `subnet-0cafec278e6e218d9` in `us-east-1e` and `subnet-04f574a24ab16bce7` in `us-east-1f`, using those is acceptable

Security groups:

- choose `agritour-alb-sg` if it already exists
- otherwise create it here with inbound `HTTP 80` from `Anywhere`
- do not attach `agritour-ecs-sg` to the ALB

Listeners and routing:

- Listener protocol: `HTTP`
- Listener port: `80`
- Routing action: `Forward to target groups`
- Forward to target group: choose `agritour-tour-catalog-tg` as the temporary default action for the first pass
- Weight: leave `1`
- Target group stickiness: off

Tags:

- optional for learner lab; you can skip them on the first pass

Optimize with service integrations:

- leave `Amazon CloudFront + AWS WAF` off
- leave `AWS WAF` off
- leave `AWS Global Accelerator` off

Then click `Create load balancer`.

After the ALB status becomes `Active`:

1. open the ALB details page
2. copy the ALB `DNS name`; you will need it later for the frontend and optional `TOUR_CATALOG_URL`
3. open the `Listeners and rules` tab
4. edit the rules for listener `HTTP:80`

Keep one default rule at the bottom. If AWS requires a default forward target instead of a fixed response, leaving `agritour-tour-catalog-tg` as the default rule is acceptable for the first pass.

Add these listener rules above the default rule:

- Priority `10`: `/api/tours/*`, `/api/categories/*`, `/api/regions/*` -> `agritour-tour-catalog-tg`
- Priority `20`: `/api/bookings/*`, `/api/payments/*`, `/api/invoices/*` -> `agritour-booking-billing-tg`
- Priority `30`: `/api/auth/*`, `/api/users/*`, `/api/partners/*` -> `agritour-identity-partner-tg`

If the console allows a fixed default action and you prefer that path, use `404` for unmatched routes.

### 3D. Create ECS Services From The Form

Open: `ECS` -> your cluster -> `Services` -> `Create`

For the form you showed, use these common values for all 3 services:

- Environment: `AWS Fargate`
- Existing cluster: use the cluster you created; if you only have `default`, using `default` is acceptable for this session
- Capacity provider strategy: `Launch type`
- Launch type: `Fargate`
- Platform version: `LATEST`
- Turn on ECS Exec: off
- Scheduling strategy: `Replica`
- Desired tasks: `1`
- Availability Zone rebalancing: leave off for the first pass
- Health check grace period: `60` seconds
- Deployment controller type: `ECS`
- Deployment strategy: `Rolling update`
- Min running tasks %: `100`
- Max running tasks %: `200`
- Use the Amazon ECS deployment circuit breaker: on
- Rollback on failures: on
- Use CloudWatch alarms: off for the first pass
- VPC: use the lab `default` VPC unless you already created a separate project VPC on purpose
- Subnets: choose any `2` default subnets in different Availability Zones; using all `6` is optional, not required
- Security group: `agritour-ecs-sg`
- Public IP: `Turned on`
- Service Connect: off
- Service discovery: off
- Use load balancing: on
- VPC Lattice: off
- Service auto scaling: off
- ECS managed tags: off is fine for the first pass

Do not keep the random autogenerated service name. Replace it with a stable name.

#### Service 1: tour-catalog

- Task definition family: `agritour-tour-catalog`
- Task definition revision: `2` or `Latest` if `Latest` already points to revision `2`
- Service name: `agritour-tour-catalog-svc`
- Load balancing mode: `Use existing load balancer`
- Load balancer: your shared ALB
- Listener: `HTTP:80`
- Load balancer target group: `agritour-tour-catalog-tg`
- Container to load balance: `tour-catalog:3001`

#### Service 2: booking-billing

- Task definition family: `agritour-booking-billing`
- Task definition revision: `1` or `Latest` if `Latest` already points to revision `1`
- Service name: `agritour-booking-billing-svc`
- Load balancing mode: `Use existing load balancer`
- Load balancer: your shared ALB
- Listener: `HTTP:80`
- Load balancer target group: `agritour-booking-billing-tg`
- Container to load balance: `booking-billing:3002`

#### Service 3: identity-partner

- Task definition family: `agritour-identity-partner`
- Task definition revision: `1` or `Latest` if `Latest` already points to revision `1`
- Service name: `agritour-identity-partner-svc`
- Load balancing mode: `Use existing load balancer`
- Load balancer: your shared ALB
- Listener: `HTTP:80`
- Load balancer target group: `agritour-identity-partner-tg`
- Container to load balance: `identity-partner:3003`

After all 3 services are created, wait until:

- each ECS service reaches steady state
- each target group shows healthy targets
- the ALB routes work for all 3 route groups

## 4. S3 Frontend Hosting

Open: `S3` -> `Create bucket`

Create one bucket for the frontend.

Build and upload from your personal machine:

```powershell
Set-Location "$PROJECT_ROOT\frontend"

$env:VITE_TOUR_API_URL = "http://<alb-dns>/api"
$env:VITE_TOUR_API_BASE = "http://<alb-dns>"
$env:VITE_BOOKING_API_URL = "http://<alb-dns>/api"
$env:VITE_BOOKING_API_BASE = "http://<alb-dns>"
$env:VITE_IDENTITY_API_URL = "http://<alb-dns>/api"
$env:VITE_IDENTITY_API_BASE = "http://<alb-dns>"

npm install
npm run build

aws s3 sync .\dist s3://<frontend-bucket-name> --delete --region $AWS_REGION
```

Replace `<alb-dns>` and `<frontend-bucket-name>` before running the commands.

## 5. CodeDeploy Demo Only

Do this only after `agritour-tour-catalog-svc` is healthy on ECS.

Open: `S3` -> `Create bucket`

Create one versioned bucket for deployment bundles.

Then:

1. enable bucket versioning
2. upload the `tour-catalog` CodeDeploy bundle zip
3. note the object key and version id

Upload the CodeDeploy bundle from your personal machine:

```powershell
Set-Location "$PROJECT_ROOT\infra\codedeploy\tour-catalog"

Compress-Archive -Path .\appspec.yaml, .\taskdef.json -DestinationPath .\tour-catalog-deploy.zip -Force

aws s3 cp .\tour-catalog-deploy.zip s3://<deployment-bucket-name>/tour-catalog-deploy.zip --region $AWS_REGION
```

If your filled files use different names, update the command before running it.

In `CodeDeploy`, create:

- one ECS application, for example `agritour-tour-catalog-cd`
- one deployment group, for example `agritour-tour-catalog-dg`

Use:

- cluster name: your ECS cluster
- service name: `agritour-tour-catalog-svc`
- listener and target groups requested by the console

Role rule:

- prefer a role created or offered by CodeDeploy
- use `LabRole` only if it is the only selectable fallback and the console allows it
- if the console requires a second target group for blue/green traffic, create it before the deployment group

## 6. CloudWatch Verification

Open: `CloudWatch` -> `Log groups`

Verify:

- one log group per service exists
- recent log streams show container startup and requests

This is the CloudWatch evidence you will later use for the report and demo.

## 7. Final Smoke Pass

Before presenting, verify:

1. ALB routes work for all 3 services
2. frontend works against the ALB URL
3. CodeDeploy can see the `tour-catalog` deployment bundle
4. rollback artifact is still available
