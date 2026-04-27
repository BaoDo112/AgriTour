# Requirements (AgriTour SOA Migration — Project Brief Aligned)

Source: SOA - Group Project.md (Section 4, 5, 6)

Coverage summary:
- Total requirements: 16
- Pending: 16
- Completed: 0

## Requirement Checklist

- [ ] REQ-ARCH-01 (must): Split current monolith into 3 independently deployable microservices, each with clear responsibility, own API, running independently.
- [ ] REQ-DOCKER-01 (must): Provide one Dockerfile per service and validate local container run with docker-compose.
- [ ] REQ-ECR-01 (must): Push all service container images to Amazon ECR.
- [ ] REQ-ECS-01 (must): Deploy all services on Amazon ECS or ECS Fargate.
- [ ] REQ-ALB-01 (must): Configure Application Load Balancer with path-based routing to all services.
- [ ] REQ-RDS-01 (must): Connect all services to Amazon RDS with database-per-service ownership (3 logical databases on 1 RDS instance).
- [ ] REQ-CW-01 (must): Enable CloudWatch logs and monitoring evidence for all services.
- [ ] REQ-CICD-01 (must): Implement at least one working AWS redeployment mechanism for one microservice using CodeDeploy with versioned source or artifact storage.
- [ ] REQ-SEC-01 (must): Enforce backend JWT and RBAC on protected routes.
- [ ] REQ-IAM-01 (must): Apply least-privilege IAM roles and permissions for all AWS resources.
- [ ] REQ-SAGA-01 (must): Document and implement one main workflow using Saga pattern in technical report.
- [ ] REQ-REDEPLOY-01 (must): Demonstrate one update or redeployment through the chosen deployment process.
- [ ] REQ-REPORT-01 (must): Submit technical report 20-30 pages with architecture diagram, service descriptions, Saga workflow, failure scenario, AWS deployment evidence, and reflection.
- [ ] REQ-S3-01 (should): Deploy frontend static hosting on S3.
- [ ] REQ-TEST-01 (should): Add smoke and contract checks for critical service flows.
- [ ] REQ-ASYNC-01 (nice): Add optional SQS or SNS asynchronous notification flow.

## Traceability Table

| Requirement ID | Priority | Assigned Phase | Status | Notes |
|---|---|---|---|---|
| REQ-ARCH-01 | must | Phase 1, Phase 2 | Pending | Architecture diagram in Phase 1, extraction in Phase 2 |
| REQ-DOCKER-01 | must | Phase 2 | Pending | Dockerfile per service, docker-compose local |
| REQ-ECR-01 | must | Phase 3 | Pending | Push images to ECR |
| REQ-ECS-01 | must | Phase 3 | Pending | ECS Fargate tasks and services |
| REQ-ALB-01 | must | Phase 3 | Pending | Path-based routing rules |
| REQ-RDS-01 | must | Phase 3 | Pending | 1 RDS instance, 3 logical databases |
| REQ-CW-01 | must | Phase 6 | Pending | Log groups and monitoring per service |
| REQ-CICD-01 | must | Phase 5 | Pending | CodeDeploy with GitHub source of truth and S3 deployment artifact |
| REQ-SEC-01 | must | Phase 4 | Pending | JWT issuance and verification, RBAC |
| REQ-IAM-01 | must | Phase 3, Phase 5 | Pending | Least-privilege for ECS, RDS, ECR, S3, and CodeDeploy |
| REQ-SAGA-01 | must | Phase 4 | Pending | Booking to Payment to Notification saga |
| REQ-REDEPLOY-01 | must | Phase 5 | Pending | One change redeployed through CodeDeploy |
| REQ-REPORT-01 | must | Phase 6 | Pending | 20-30 page report and presentation slides |
| REQ-S3-01 | should | Phase 3 | Pending | Frontend static hosting |
| REQ-TEST-01 | should | Phase 2, Phase 4 | Pending | Smoke tests and contract checks |
| REQ-ASYNC-01 | nice | Phase 4 | Pending | Optional SQS or SNS for booking events |
