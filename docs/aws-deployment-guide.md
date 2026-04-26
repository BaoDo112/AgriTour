# AWS Deployment Guide

## Purpose

This guide is the end-to-end deployment checklist for the final project state where all 3 microservices and the frontend are complete.

It is aligned to the project brief requirements:

- Docker
- Amazon ECR
- Amazon ECS or ECS Fargate
- Application Load Balancer
- one database service such as Amazon RDS
- one CI/CD mechanism using CodePipeline and or CodeDeploy
- CloudWatch logs or monitoring evidence
- technical report and presentation/demo evidence

## Final Target Architecture

### Frontend

- React frontend built by Vite
- deployed to S3 static hosting
- optional CloudFront in front of S3 if time allows

### Backend services

- Service A: `tour-catalog`
- Service B: `booking-billing`
- Service C: `identity-partner`

### Shared AWS infrastructure

- Amazon ECR repositories for all 3 services
- one ECS cluster using Fargate launch type
- one ALB with path-based routing
- one RDS MySQL instance with 3 logical databases
- CloudWatch logs for each service
- one CodePipeline-based CI/CD pipeline for at least one service

## Required Route Split For ALB

- `/api/tours/*`, `/api/categories/*`, `/api/regions/*` -> `tour-catalog`
- `/api/bookings/*`, `/api/payments/*`, `/api/invoices/*` -> `booking-billing`
- `/api/auth/*`, `/api/users/*`, `/api/partners/*` -> `identity-partner`

## Before You Touch AWS

1. All 3 services must run locally with Docker.
2. Each service must expose a working `/health` endpoint.
3. Each service must have its own Dockerfile.
4. Service responsibilities must be frozen.
5. The frontend must no longer depend on `backend/` for final flows.

## Step 1: Prepare Production Environment Variables

Each service needs its own runtime variables.

### Tour Catalog

- `PORT=3001`
- `DB_HOST=<rds-endpoint>`
- `DB_PORT=3306`
- `DB_USER=<rds-user>`
- `DB_PASSWORD=<rds-password>`
- `DB_NAME=agritour_catalog`
- `JWT_SECRET=<shared-jwt-secret>`

### Booking Billing

- `PORT=3002`
- `DB_HOST=<rds-endpoint>`
- `DB_PORT=3306`
- `DB_USER=<rds-user>`
- `DB_PASSWORD=<rds-password>`
- `DB_NAME=agritour_booking`
- `TOUR_CATALOG_URL=http://<alb-dns>` or internal service discovery URL
- `JWT_SECRET=<shared-jwt-secret>`

### Identity Partner

- `PORT=3003`
- `DB_HOST=<rds-endpoint>`
- `DB_PORT=3306`
- `DB_USER=<rds-user>`
- `DB_PASSWORD=<rds-password>`
- `DB_NAME=agritour_identity`
- `JWT_SECRET=<shared-jwt-secret>`

### Frontend

- `VITE_TOUR_API_URL=http://<alb-dns>/api`
- `VITE_TOUR_API_BASE=http://<alb-dns>`
- `VITE_BOOKING_API_URL=http://<alb-dns>/api`
- `VITE_BOOKING_API_BASE=http://<alb-dns>`
- `VITE_IDENTITY_API_URL=http://<alb-dns>/api`
- `VITE_IDENTITY_API_BASE=http://<alb-dns>`
- rebuild the frontend after setting the final ALB value

## Step 2: Create The RDS Database Layer

1. Create one RDS MySQL instance.
2. Create 3 logical databases:
   - `agritour_catalog`
   - `agritour_booking`
   - `agritour_identity`
3. Run the schema for each service database:
   - `shared/db-schemas/agritour_catalog.sql`
   - `shared/db-schemas/agritour_booking.sql`
   - `shared/db-schemas/agritour_identity.sql`
4. Restrict security groups so ECS tasks can reach RDS.

## Step 3: Create ECR Repositories

Create one repository per service:

- `agritour-tour-catalog`
- `agritour-booking-billing`
- `agritour-identity-partner`

Then build and push images for each service.

## Step 4: Create IAM Roles

At minimum you need:

- ECS task execution role for pulling images and writing logs
- ECS task role for runtime permissions
- CodeBuild role for Docker build and ECR push
- CodePipeline role for orchestration

Apply least privilege. This is a stated project requirement.

## Step 5: Create ECS Cluster And Task Definitions

Use ECS Fargate.

Each task definition should include:

- one container definition
- container port mapping
- environment variables
- CloudWatch log group config
- health check against `/health`

## Step 6: Create The ALB And Target Groups

1. Create one internet-facing ALB.
2. Create 3 target groups.
3. Point each ECS service to its target group.
4. Add listener rules for the route prefixes listed above.

## Step 7: Create ECS Services

Create 3 ECS services:

- `agritour-tour-catalog-svc`
- `agritour-booking-billing-svc`
- `agritour-identity-partner-svc`

Validation:

- all tasks reach running state
- all target groups become healthy
- ALB path routing works for all 3 service groups

## Step 8: Enable CloudWatch Logging And Monitoring

Required evidence:

- one log group per service
- visible request logs
- at least one useful alarm or monitoring screenshot

Recommended alarm choices:

- ECS CPU utilization high
- target health unhealthy count
- ALB 5xx count

## Step 9: Implement CI/CD For At Least One Service

The brief only requires one working pipeline.

Minimum accepted path:

1. Source: CodeCommit or S3 source artifact
2. Build: CodeBuild builds Docker image and pushes to ECR
3. Deploy: CodePipeline updates ECS service

The safest candidate is usually `tour-catalog` because it is public, small, and easy to demo.

## Step 10: Demonstrate One Redeployment

You must show one update or redeployment.

Good examples:

- a new route
- a changed response message
- a small UI improvement in the frontend
- a scaling or config update

What to capture:

- change committed or uploaded
- pipeline execution running
- pipeline execution succeeded
- updated behavior visible through ALB or frontend

## Step 11: Deploy The Frontend

Recommended path:

1. Build the Vite frontend.
2. Upload `dist/` to S3.
3. Enable static hosting.
4. Rebuild the frontend with the final ALB API URL before upload.

If time is short, frontend hosting is still worth doing because it makes the demo cleaner, but the main grading focus remains the microservices and AWS deployment.

## Project Requirement Cross-Check

### Architecture and service separation

- 3 service boundaries must be clear
- architecture diagram must show browser, microservices, databases, AWS services, and traffic flow

### Dockerization

- all 3 services must run in containers

### AWS deployment

- ECR used
- ECS or ECS Fargate used
- ALB used
- RDS or another database service used
- CloudWatch evidence shown

### CI/CD and redeploy

- one working pipeline is enough
- one redeployment demo is mandatory

### Report and presentation

- report must describe architecture, services, one main saga workflow, AWS deployment evidence, deployment/update process, and reflection
- slides and demo must be ready in advance

## Evidence Checklist For Submission And Demo

- architecture diagram
- 3 ECR repositories with images
- ECS cluster and 3 running services
- ALB listener rules and healthy target groups
- RDS instance and database evidence
- CloudWatch log groups and one alarm or monitoring view
- CodePipeline and CodeBuild success screenshots
- frontend hosted result if deployed
- one redeployment example

## Strong Recommendation For Demo Day

Keep the ALB URL as the only public backend endpoint shown in the presentation.

That makes the story simple:

- frontend calls one public API base
- ALB routes traffic
- ECS runs each service independently
- RDS stores service-owned data
- CloudWatch shows runtime evidence

## Final Warning

Testing 2 services now is fine.

Submitting only 2 completed services is not fine if your final team decision says the system has 3 services. Before AWS deployment starts, the codebase, architecture diagram, frontend calls, and report must all agree on the same final service count.