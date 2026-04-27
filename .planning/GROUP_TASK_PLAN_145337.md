# AgriTour SOA Group Delivery Plan (Project Brief Aligned)

## 0) Purpose and Audience

This document is written for the full project team as a shared execution contract.
The plan is milestone-based. All AWS service decisions are derived directly from the project brief requirements (SOA - Group Project.md Section 5).

## 1) Scope Alignment From Project Brief

Source: SOA - Group Project.md

Required AWS Features (Section 5 — ALL mandatory):
- Docker: containerize each microservice
- Amazon ECR: store container images
- Amazon ECS or ECS Fargate: deploy services (team decision: Fargate)
- Application Load Balancer: route traffic to services via path-based rules
- Amazon RDS: database service (MySQL, 1 instance with 3 logical databases)
- CodeDeploy for at least one service, with durable source and artifact storage
- CloudWatch: logs and monitoring evidence

Additional requirements from brief:
- Architecture diagram showing client, microservices, databases, AWS services, traffic flow
- 2-3 microservices with clear responsibility, own API, running independently
- One main workflow using Saga pattern in technical report
- One failure scenario with handling (optional)
- One update or redeployment demonstrated through the chosen deployment process
- Technical report 20-30 pages
- Presentation 15 minutes plus 10 minutes Q and A

Team decisions:
- ECS launch type: Fargate (serverless, no EC2 management, pay for actual usage)
- Database strategy: 1 RDS MySQL instance, 3 logical databases (agritour_catalog, agritour_booking, agritour_identity)
- Frontend: S3 static hosting (decoupled from backend microservices)
- Daily development: GitHub as the source of truth for the full codebase
- Deployment artifacts: versioned S3 bucket for frontend builds and CodeDeploy bundles
- Cost management: Set ECS Desired tasks to 0 when not working to preserve $50 budget

## 2) Target Microservice Split (3 Services)

Service A: Tour Catalog Service
- Scope: tours, categories, regions, media upload
- API prefixes: /api/tours, /api/categories, /api/regions
- Database: agritour_catalog
- Container port: 3001
- Main code baseline: backend/controllers/tourController.js, categoryController.js, regionController.js

Service B: Booking and Billing Service
- Scope: bookings, payments, invoices
- API prefixes: /api/bookings, /api/payments, /api/invoices
- Database: agritour_booking
- Container port: 3002
- Main code baseline: backend/controllers/bookingController.js, paymentController.js, invoiceController.js

Service C: Identity and Partner Service
- Scope: auth, users, partners
- API prefixes: /api/auth, /api/users, /api/partners
- Database: agritour_identity
- Container port: 3003
- Main code baseline: backend/controllers/authController.js, userController.js, partnerController.js

## 3) Team Delivery Model (Each Group Owns One Service End-to-End)

Group A
- Owns Service A from extraction to ECS deployment.
- Reason: highest core business complexity and highest frontend coupling.
- End-to-end ownership:
  - Service extraction and API contract
  - Dockerfile and local docker-compose integration
  - ECR image push for Service A
  - ECS Fargate task and service for Service A
  - CloudWatch log verification
  - Service-level demo and evidence package

Group B
- Owns Service C from extraction to ECS deployment.
- Reason: manageable functional scope but high security responsibility.
- End-to-end ownership:
  - Auth and role model hardening (JWT issuance)
  - Dockerfile and local integration
  - ECR image push for Service C
  - ECS Fargate task and service for Service C
  - IAM and protected-route validation evidence
- Support model:
  - Team Lead provides architecture and security review checkpoints.

Group C
- Owns Service B from extraction to ECS deployment.
- Reason: moderate-high flow complexity and data consistency risk.
- End-to-end ownership:
  - Booking payment invoice extraction
  - Dockerfile and local integration checks
  - ECR image push for Service B
  - ECS Fargate task and service for Service B
  - Saga workflow implementation (Booking to Payment flow)

## 4) Service Complexity and Difficulty Analysis (From Current Code)

Service A: Tour Catalog Service
- Controller scope:
  - tourController.js: 224 LOC, 11 db.query calls
  - categoryController.js: 24 LOC, 3 db.query calls
  - regionController.js: 41 LOC, 4 db.query calls
- Route scope:
  - tourRoutes.js: 10 endpoints
  - categoryRoutes.js: 3 endpoints
  - regionRoutes.js: 4 endpoints
- Total backend surface:
  - 17 endpoints
  - 18 db.query calls
- Frontend coupling:
  - 9 API call sites under /tours
- Complexity: High
- Main difficulty drivers:
  - Stateful media upload with local filesystem (must migrate to S3)
  - Moderation workflow and status transitions
  - Multiple joins and strongest core-product impact

Service B: Booking and Billing Service
- Controller scope:
  - bookingController.js: 176 LOC, 6 db.query calls
  - paymentController.js: 22 LOC, 3 db.query calls
  - invoiceController.js: 20 LOC, 2 db.query calls
- Route scope:
  - bookingRoutes.js: 4 endpoints
  - paymentRoutes.js: 2 endpoints
  - invoiceRoutes.js: 2 endpoints
- Total backend surface:
  - 8 endpoints
  - 11 db.query calls
- Frontend coupling:
  - Active /bookings usage, low direct /payments and /invoices usage
- Complexity: Medium-High
- Main difficulty drivers:
  - Multi-field booking payload and validation
  - Non-transactional payment confirmation path
  - Cross-domain dependency to tours data (Saga pattern)

Service C: Identity and Partner Service
- Controller scope:
  - authController.js: 35 LOC, 2 db.query calls
  - userController.js: 87 LOC, 5 db.query calls
  - partnerController.js: 69 LOC, 5 db.query calls
- Route scope:
  - authRoutes.js: 2 endpoints
  - userRoutes.js: 5 endpoints
  - partnerRoutes.js: 5 endpoints
- Total backend surface:
  - 12 endpoints
  - 12 db.query calls
- Frontend coupling:
  - /auth is active, /users and /partners currently lighter in UI
- Complexity: Medium functionally, High in security
- Main difficulty drivers:
  - JWT contract not implemented end-to-end
  - No backend RBAC enforcement currently

Complexity ranking for assignment:
1. Service A
2. Service B
3. Service C

## 5) Milestone Plan (Project Brief Aligned)

Milestone M1: Service Design and Contract Freeze
- Goal: produce architecture diagram, finalize boundaries, contracts, conventions
- Exit criteria:
  - Architecture diagram complete (Client, ALB, ECS, RDS, CloudWatch, ECR, CodeDeploy, S3)
  - Service A, B, C API contract docs complete (OpenAPI)
  - Data ownership contract complete (3 logical databases)
  - Team conventions approved
  - Learner Lab access validated for all members

Milestone M2: Service Extraction and Dockerization
- Goal: extract monolith into 3 runnable services with Docker support
- Exit criteria:
  - Service A, B, C extracted and independently runnable
  - 3 Dockerfiles validated locally
  - docker-compose.yml runs all 3 services plus MySQL locally
  - Health check endpoints responding on /health
  - Basic smoke tests passing

Milestone M3: AWS Infrastructure and ECS Deployment
- Goal: deploy all services on AWS ECS Fargate with ALB and RDS
- Exit criteria:
  - ECR repositories created, images pushed
  - ECS cluster with 3 Fargate tasks running
  - ALB path-based routing working (/api/tours to Service A, /api/bookings to Service B, /api/auth to Service C)
  - RDS MySQL accessible from all services (3 databases)
  - S3 frontend hosted and accessible
  - IAM roles with least-privilege applied

Milestone M4: Security, Integration, and Saga
- Goal: implement auth, cross-service contracts, and Saga workflow
- Exit criteria:
  - JWT issuance in Service C login endpoint
  - JWT verification middleware in all services
  - RBAC enforcement on protected routes
  - Saga workflow documented (Booking to Payment to Notification)
  - Integration smoke tests passing across services
  - Optional SQS/SNS async path documented or implemented

Milestone M5: Deployment and Redeployment
- Goal: build the redeployment path and demo one redeployment
- Exit criteria:
  - CodeDeploy application and deployment group created for at least 1 service
  - GitHub stores the current source code
  - S3 stores the frontend build and the redeploy artifact bundle
  - Updated Docker image pushed to ECR
  - One code change redeployed successfully
  - Evidence screenshots captured

Milestone M6: Observability, Report, and Demo
- Goal: complete monitoring, report, and demo preparation
- Exit criteria:
  - CloudWatch log groups per service visible
  - At least one CloudWatch alarm configured
  - Technical report 20-30 pages complete
  - Presentation slides complete
  - Demo ready to run during presentation
  - All evidence screenshots organized

## 6) AWS Services and Expected Outputs

1. Docker
- Output: 3 Dockerfiles (one per service), docker-compose.yml for local development

2. Amazon ECR
- Output: 3 ECR repositories (agritour-tour-catalog, agritour-booking-billing, agritour-identity-partner), tagged images pushed

3. Amazon ECS Fargate
- Output: 1 ECS cluster, 3 task definitions, 3 services running on Fargate, desired count set to 0 when idle

4. Application Load Balancer
- Output: 1 ALB with path-based routing rules forwarding to 3 target groups

5. Amazon RDS MySQL
- Output: 1 RDS instance with 3 logical databases (agritour_catalog, agritour_booking, agritour_identity)

6. CloudWatch
- Output: log groups per service, at least 1 alarm, monitoring evidence screenshots

7. CodeDeploy
- Output: at least 1 redeployment path using GitHub source, S3 artifact storage, ECR image update, and ECS redeploy through CodeDeploy

8. Amazon S3
- Output: frontend static hosting bucket, optionally media storage for tour images

9. IAM
- Output: least-privilege roles for ECS task execution, RDS access, ECR pull, S3 access, and CodeDeploy execution

10. SQS or SNS (optional)
- Output: async notification path for booking events if implemented

## 7) Project-Wide Conventions Contract

1. Branch and review policy
- Branch naming: feature/service-name/description
- PR approver rule and merge checks

2. Commit traceability
- Every PR references task ID and milestone ID

3. API contract standard
- Unified success and error response shape across all services
- Health endpoint at GET /health returning JSON with status and service name

4. Security baseline
- JWT token format, role matrix, protected route list
- Secrets in environment variables only (never committed)

5. Environment naming
- Local: .env files with docker-compose
- AWS: ECS task definition environment variables pointing to RDS, S3

6. Deployment naming
- ECR repos: agritour-{service-slug}
- ECS cluster: agritour-cluster
- ECS services: agritour-{service-slug}-service
- ALB: agritour-alb
- Target groups: agritour-{service-slug}-tg
- RDS: agritour-db
- Log groups: /ecs/agritour-{service-slug}

7. Observability baseline
- Required log fields: timestamp, service name, request ID
- Health endpoint naming: GET /health

8. Cost management
- Set ECS desired count to 0 when not actively working
- Monitor Learner Lab credit balance regularly
- Use Fargate spot if available for non-critical testing

9. Definition of done
- A service is accepted only when all items are complete:
  - API contract documented and implemented
  - Dockerfile builds successfully
  - Service is independently runnable in local docker-compose
  - ECR image pushed
  - ECS Fargate task and service running
  - ALB routing verified
  - RDS connectivity validated
  - CloudWatch logs visible
  - Evidence pack ready for report and demo

## 8) Report and Presentation Requirements

Technical Report (20-30 pages):
- System overview
- Microservices architecture and AWS deployment diagram
- Description of each service and its APIs
- One main workflow using Saga pattern
- One failure scenario with handling (optional but recommended)
- Evidence of AWS deployment (screenshots in appendix)
- Deployment or update process
- Reflection on challenges and learning

Presentation (25 minutes total):
- 15 minutes presentation covering system overview, architecture, services, workflow, failure case, AWS deployment, demo plan
- 10 minutes Q and A
- All members must participate and answer individually

Demo tips for scoring:
- Screenshot monolithic directory structure before split
- Screenshot microservices directory structure after split
- Include in report with caption about decomposition process
- Remove backend-legacy folder from submission branch for clean appearance

## 9) Contribution Log Template (All Members)

For each member:
- Date
- Milestone
- Service ownership
- Task completed
- Evidence link or screenshot
- Result
- Blocker and next action

This is required for fair contribution proof and viva readiness.
