---
phase: 3
name: AWS Infrastructure and ECS Deployment
wave: 2
depends_on: [2]
requirements: [REQ-ECR-01, REQ-ECS-01, REQ-ALB-01, REQ-RDS-01, REQ-IAM-01, REQ-S3-01]
files_modified:
  - infra/task-definitions/*.json
  - infra/iam-policies/*.json
  - infra/alb-rules.md
autonomous: false
---

# Phase 3: AWS Infrastructure and ECS Deployment

## Objective

Deploy all 3 microservices on AWS using Amazon ECR, ECS Fargate, Application Load Balancer, and RDS MySQL. Configure IAM least-privilege roles. Optionally deploy frontend to S3.

## Must-Haves (Goal-Backward Verification)

- 3 ECR repositories with successfully pushed images
- 1 ECS cluster created
- 3 ECS Fargate task definitions registered
- 3 ECS services running and healthy
- 1 ALB with path-based routing to all 3 services
- 1 RDS MySQL instance with 3 logical databases accessible from ECS tasks
- IAM roles with least-privilege for ECS task execution and RDS access
- S3 bucket with frontend deployed (if applicable)
- All services reachable through ALB URL

## Tasks

### Task 3.1: Create RDS MySQL Instance

**Read first:**
- shared/db-schemas/agritour_catalog.sql
- shared/db-schemas/agritour_booking.sql
- shared/db-schemas/agritour_identity.sql
- .planning/GROUP_TASK_PLAN_145337.md (Section 6, item 5)

**Action:**
1. In AWS Learner Lab console, create RDS MySQL instance:
   - Engine: MySQL 8.0
   - Instance class: db.t3.micro (free tier eligible)
   - Identifier: agritour-db
   - Master username: admin
   - Master password: (secure, stored in team secrets doc)
   - VPC: default VPC
   - Public access: Yes (for initial setup, restrict later)
   - Security group: allow MySQL port 3306 from ECS security group
2. Connect to RDS and create 3 logical databases:
   ```sql
   CREATE DATABASE agritour_catalog;
   CREATE DATABASE agritour_booking;
   CREATE DATABASE agritour_identity;
   ```
3. Run each schema file to create tables
4. Record RDS endpoint in team secrets document

**Acceptance criteria:**
- RDS instance agritour-db is in Available state
- MySQL client can connect to RDS endpoint
- Query `SHOW DATABASES` returns agritour_catalog, agritour_booking, agritour_identity
- Each database contains its expected tables (tours, bookings, users, etc.)

### Task 3.2: Create ECR Repositories and Push Images

**Read first:**
- services/tour-catalog/Dockerfile
- services/booking-billing/Dockerfile
- services/identity-partner/Dockerfile

**Action:**
1. Create 3 ECR repositories via AWS Console or CLI:
   ```bash
   aws ecr create-repository --repository-name agritour-tour-catalog
   aws ecr create-repository --repository-name agritour-booking-billing
   aws ecr create-repository --repository-name agritour-identity-partner
   ```
2. Authenticate Docker to ECR:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
   ```
3. Build and push each image:
   ```bash
   cd services/tour-catalog
   docker build -t agritour-tour-catalog .
   docker tag agritour-tour-catalog:latest {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/agritour-tour-catalog:latest
   docker push {ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/agritour-tour-catalog:latest
   ```
   Repeat for booking-billing and identity-partner.

**Acceptance criteria:**
- `aws ecr describe-repositories` lists agritour-tour-catalog, agritour-booking-billing, agritour-identity-partner
- Each repository contains at least 1 image tagged latest
- `docker pull {repo-uri}:latest` succeeds for all 3

### Task 3.3: Create IAM Roles for ECS

**Read first:**
- .planning/GROUP_TASK_PLAN_145337.md (Section 6, item 9)

**Action:**
1. Create ECS Task Execution Role (ecsTaskExecutionRole):
   - Trust policy: ecs-tasks.amazonaws.com
   - Managed policy: AmazonECSTaskExecutionRolePolicy
   - Additional: CloudWatch Logs permissions, ECR pull permissions
2. Create ECS Task Role (agritour-task-role):
   - Trust policy: ecs-tasks.amazonaws.com
   - Permissions: RDS access, S3 access (if media bucket used), CloudWatch Logs
3. Document in infra/iam-policies/:
   - infra/iam-policies/ecs-task-execution-role.json
   - infra/iam-policies/ecs-task-role.json

**Acceptance criteria:**
- IAM role ecsTaskExecutionRole exists in AWS console
- IAM role agritour-task-role exists
- infra/iam-policies/ecs-task-execution-role.json contains `ecs-tasks.amazonaws.com`
- infra/iam-policies/ecs-task-role.json contains `rds` or `s3` permissions

### Task 3.4: Create ECS Cluster and Task Definitions

**Read first:**
- infra/task-definitions/ (create if not exist)

**Action:**
1. Create ECS cluster: agritour-cluster (Fargate only, no EC2 instances)
2. Create 3 task definitions. Example for tour-catalog:

infra/task-definitions/tour-catalog-task.json:
```json
{
  "family": "agritour-tour-catalog",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::{ACCOUNT}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::{ACCOUNT}:role/agritour-task-role",
  "containerDefinitions": [
    {
      "name": "tour-catalog",
      "image": "{ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/agritour-tour-catalog:latest",
      "portMappings": [{"containerPort": 3001, "protocol": "tcp"}],
      "environment": [
        {"name": "PORT", "value": "3001"},
        {"name": "DB_HOST", "value": "{RDS_ENDPOINT}"},
        {"name": "DB_PORT", "value": "3306"},
        {"name": "DB_USER", "value": "admin"},
        {"name": "DB_PASSWORD", "value": "{RDS_PASSWORD}"},
        {"name": "DB_NAME", "value": "agritour_catalog"},
        {"name": "JWT_SECRET", "value": "{JWT_SECRET}"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/agritour-tour-catalog",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 10
      }
    }
  ]
}
```

Create similar for booking-billing (port 3002, DB agritour_booking, add TOUR_CATALOG_URL) and identity-partner (port 3003, DB agritour_identity).

3. Register task definitions:
   ```bash
   aws ecs register-task-definition --cli-input-json file://infra/task-definitions/tour-catalog-task.json
   ```

**Acceptance criteria:**
- ECS cluster agritour-cluster exists
- `aws ecs list-task-definitions` shows agritour-tour-catalog, agritour-booking-billing, agritour-identity-partner
- Each task definition has FARGATE compatibility
- Each task definition has CloudWatch log configuration

### Task 3.5: Create ALB with Path-Based Routing

**Read first:**
- .planning/GROUP_TASK_PLAN_145337.md (Section 6, item 4)

**Action:**
1. Create Application Load Balancer: agritour-alb
   - Scheme: internet-facing
   - VPC: default VPC, all availability zones
   - Security group: allow HTTP 80 (optionally HTTPS 443)
2. Create 3 Target Groups:
   - agritour-tour-catalog-tg: port 3001, target type ip, health check /health
   - agritour-booking-billing-tg: port 3002, target type ip, health check /health
   - agritour-identity-partner-tg: port 3003, target type ip, health check /health
3. Create Listener rules on port 80:
   - Path /api/tours/* OR /api/categories/* OR /api/regions/* -> agritour-tour-catalog-tg
   - Path /api/bookings/* OR /api/payments/* OR /api/invoices/* -> agritour-booking-billing-tg
   - Path /api/auth/* OR /api/users/* OR /api/partners/* -> agritour-identity-partner-tg
   - Default action: return 404 or forward to a default service
4. Document ALB DNS name and routing rules in infra/alb-rules.md

**Acceptance criteria:**
- ALB agritour-alb exists and is active
- 3 target groups exist with health check path /health
- curl http://{ALB_DNS}/api/tours returns response from tour-catalog service
- curl http://{ALB_DNS}/api/auth/login returns response from identity-partner service
- curl http://{ALB_DNS}/api/bookings returns response from booking-billing service
- infra/alb-rules.md documents all routing rules

### Task 3.6: Create ECS Services

**Action:**
1. Create 3 ECS services in agritour-cluster:
   - agritour-tour-catalog-svc: task agritour-tour-catalog, desired count 1, Fargate, attach to agritour-tour-catalog-tg
   - agritour-booking-billing-svc: task agritour-booking-billing, desired count 1, Fargate, attach to agritour-booking-billing-tg
   - agritour-identity-partner-svc: task agritour-identity-partner, desired count 1, Fargate, attach to agritour-identity-partner-tg
2. Configure service networking: use default VPC subnets, assign public IP, security group allowing ALB access
3. Verify all tasks reach RUNNING state
4. IMPORTANT: After verification, set desired count to 0 to preserve Learner Lab budget

**Acceptance criteria:**
- `aws ecs list-services --cluster agritour-cluster` shows 3 services
- All 3 services have at least 1 task in RUNNING state during verification
- ALB health checks show all 3 target groups as healthy
- Services can be scaled to 0 and back to 1 without issues

### Task 3.7: Deploy Frontend to S3 (Optional)

**Action:**
1. Create S3 bucket: agritour-frontend-{unique-suffix}
2. Enable static website hosting
3. Build frontend: `cd frontend && npm run build`
4. Upload dist/ to S3 bucket
5. Configure CORS to allow ALB domain
6. Update frontend API base URL to point to ALB DNS

**Acceptance criteria:**
- S3 bucket exists with static website hosting enabled
- Frontend is accessible via S3 website URL
- Frontend can make API calls to ALB URL

## Verification

- [ ] All 3 ECR repositories contain pushed images
- [ ] ECS cluster has 3 services all reaching RUNNING state
- [ ] ALB routes /api/tours to tour-catalog, /api/bookings to booking-billing, /api/auth to identity-partner
- [ ] RDS has 3 databases with tables
- [ ] IAM roles are documented in infra/iam-policies/
- [ ] Budget check: verify remaining Learner Lab credits
