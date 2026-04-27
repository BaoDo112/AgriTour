# Roadmap (AgriTour SOA Migration — Project Brief Aligned)

Milestone: AgriTour SOA Migration v3
Source: SOA - Group Project.md (Required AWS Features)
Audit: .planning/v2-MILESTONE-AUDIT.md

### Phase 1: Service Design and Contract Freeze
**Goal:** Produce architecture diagram, finalize service boundaries, API contracts, data ownership, and team conventions.
**Requirements:** REQ-ARCH-01
**Deliverables:** Architecture diagram, 3 API contract specs (OpenAPI), data ownership matrix, team conventions document
**Owner Model:** Team Lead + all group owners

### Phase 2: Service Extraction and Dockerization
**Goal:** Extract monolith into 3 independent services, create Dockerfiles, validate local docker-compose integration.
**Requirements:** REQ-ARCH-01, REQ-DOCKER-01, REQ-TEST-01
**Deliverables:** 3 service directories, 3 Dockerfiles, docker-compose.yml, health check endpoints, local integration passing
**Owner Model:** Group A (Service A), Group C (Service B), Group B (Service C) — parallel extraction

### Phase 3: AWS Infrastructure and ECS Deployment
**Goal:** Deploy all services on AWS using ECR, ECS Fargate, ALB, and RDS.
**Requirements:** REQ-ECR-01, REQ-ECS-01, REQ-ALB-01, REQ-RDS-01, REQ-IAM-01, REQ-S3-01
**Deliverables:** ECR repositories with pushed images, ECS cluster with Fargate tasks, ALB with path-based routing, RDS MySQL with 3 logical databases, S3 frontend hosting, IAM roles
**Owner Model:** Team Lead leads infra setup, each group validates owned service on ECS

### Phase 4: Security, Integration, and Saga Workflow
**Goal:** Implement JWT auth, RBAC, cross-service communication, and document Saga workflow.
**Requirements:** REQ-SEC-01, REQ-SAGA-01, REQ-TEST-01, REQ-ASYNC-01
**Deliverables:** JWT middleware, RBAC enforcement, Saga workflow document and implementation (Booking to Payment), optional SQS/SNS async, integration smoke tests
**Owner Model:** Group B leads security (Service C), all groups implement JWT verification, Team Lead documents Saga

### Phase 5: Deployment and Redeployment Demo
**Goal:** Build at least one working AWS redeployment path and demonstrate one update through it.
**Requirements:** REQ-CICD-01, REQ-REDEPLOY-01, REQ-IAM-01
**Deliverables:** GitHub source workflow, versioned S3 deployment bundle, one CodeDeploy application and deployment group for the selected service, evidence of one redeployment
**Owner Model:** Team Lead + one group (redeploy-demo owner for their service)

### Phase 6: Observability, Report, and Demo Preparation
**Goal:** Enable CloudWatch monitoring, write technical report, prepare presentation and demo.
**Requirements:** REQ-CW-01, REQ-REPORT-01
**Deliverables:** CloudWatch log groups per service, baseline alarms, 20-30 page technical report, presentation slides, demo evidence screenshots
**Owner Model:** Shared — each group contributes service-level content, Team Lead compiles
