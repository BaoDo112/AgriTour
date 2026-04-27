# AWS Deployment Guide

## Purpose

Use [aws-console-checklist.md](aws-console-checklist.md) as the only step-by-step operator file.

This file is the short reference for:

- target architecture
- required runtime values
- route ownership
- grading evidence
- demo-day framing

## Final Target

Frontend:

- React + Vite
- build output hosted on S3
- frontend calls the backend only through the ALB base URL

Backend:

- `tour-catalog`
- `booking-billing`
- `identity-partner`

AWS services:

- ECR for all backend images
- ECS Fargate for runtime
- one shared ALB with path-based routing
- one RDS MySQL instance with 3 logical databases
- CloudWatch logs for runtime evidence
- one CodeDeploy redeployment path for one selected service

## Route Split

- `/api/tours/*`, `/api/categories/*`, `/api/regions/*` -> `tour-catalog`
- `/api/bookings/*`, `/api/payments/*`, `/api/invoices/*` -> `booking-billing`
- `/api/auth/*`, `/api/users/*`, `/api/partners/*` -> `identity-partner`

## Runtime Values

Shared values:

- `DB_HOST=<rds-endpoint>`
- `DB_PORT=3306`
- `DB_USER=<rds-user>`
- `DB_PASSWORD=<rds-password>`
- `JWT_SECRET=<shared-jwt-secret>`

Service databases:

- `tour-catalog` -> `agritour_catalog`
- `booking-billing` -> `agritour_booking`
- `identity-partner` -> `agritour_identity`

Ports:

- `tour-catalog` -> `3001`
- `booking-billing` -> `3002`
- `identity-partner` -> `3003`

Frontend values:

- `VITE_TOUR_API_URL=http://<alb-dns>/api`
- `VITE_TOUR_API_BASE=http://<alb-dns>`
- `VITE_BOOKING_API_URL=http://<alb-dns>/api`
- `VITE_BOOKING_API_BASE=http://<alb-dns>`
- `VITE_IDENTITY_API_URL=http://<alb-dns>/api`
- `VITE_IDENTITY_API_BASE=http://<alb-dns>`

## Deployment Order

1. Confirm all 3 services run locally and expose `/health`.
2. Push backend images to ECR.
3. Create RDS and import the 3 schemas.
4. Create ECS task definitions.
5. Create target groups and ALB rules.
6. Create ECS services.
7. Build the frontend and upload `dist/` to S3.
8. After the base system is healthy, prepare one CodeDeploy redeployment demo.

## What Must Be Visible In Submission

- 3 ECR repositories with images
- ECS cluster and 3 running services
- ALB listener rules proving the route split
- RDS instance plus imported schemas
- CloudWatch logs or monitoring evidence
- one successful CodeDeploy redeployment
- one architecture diagram
- one main workflow or saga explanation
- one failure scenario or rollback explanation

## Demo-Day Framing

Keep the live story simple:

- frontend uses one public ALB base URL
- ALB routes traffic to 3 separate ECS services
- each service owns its own database schema
- CloudWatch proves runtime behavior
- CodeDeploy demonstrates one controlled update

## Final Warning

The final system, the frontend calls, the AWS deployment, the architecture diagram, and the report must all agree on the same final service count: 3 services.