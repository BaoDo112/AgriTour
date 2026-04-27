---
phase: 6
name: Observability, Report, and Demo Preparation
wave: 5
depends_on: [3, 4, 5]
requirements: [REQ-CW-01, REQ-REPORT-01]
files_modified:
  - docs/technical-report.md
  - docs/deployment-evidence/**
autonomous: false
---

# Phase 6: Observability, Report, and Demo Preparation

## Objective

Enable CloudWatch monitoring for all services, write the 20-30 page technical report, prepare presentation slides, and ensure the demo is ready to run during the presentation.

## Must-Haves (Goal-Backward Verification)

- CloudWatch log groups for all 3 services with visible log streams
- At least 1 CloudWatch alarm configured
- Technical report 20-30 pages covering all required sections
- Presentation slides covering all required topics
- Demo script prepared and tested
- All deployment evidence screenshots organized

## Tasks

### Task 6.1: Verify CloudWatch Log Groups

**Read first:**
- infra/task-definitions/tour-catalog-task.json (logConfiguration section)

**Action:**
1. Verify log groups exist in CloudWatch:
   - /ecs/agritour-tour-catalog
   - /ecs/agritour-booking-billing
   - /ecs/agritour-identity-partner
2. If missing, create them manually or by running the ECS tasks
3. Verify log streams are present and contain service output
4. Take screenshots of CloudWatch logs showing real request logs

**Acceptance criteria:**
- CloudWatch log group /ecs/agritour-tour-catalog exists
- CloudWatch log group /ecs/agritour-booking-billing exists
- CloudWatch log group /ecs/agritour-identity-partner exists
- Each log group has at least 1 log stream with entries

### Task 6.2: Create CloudWatch Alarm

**Action:**
Create at least 1 meaningful alarm:
- Recommended: ECS service CPU utilization alarm
  - Metric: CPUUtilization for agritour-cluster
  - Threshold: > 80% for 2 consecutive periods
  - Period: 5 minutes
  - Action: Log to CloudWatch (SNS notification optional)

Alternative alarms:
- ECS task count alarm (running tasks < desired tasks)
- ALB 5xx error rate alarm
- RDS connection count alarm

Take screenshot of alarm configuration and alarm history.

**Acceptance criteria:**
- At least 1 CloudWatch alarm exists
- Alarm has a defined threshold and period
- Screenshot saved in docs/deployment-evidence/

### Task 6.3: Collect All Deployment Evidence Screenshots

**Action:**
Organize screenshots in docs/deployment-evidence/ directory:

Required screenshots:
1. ECR repositories showing pushed images
2. ECS cluster with 3 services
3. ECS task running in RUNNING state
4. ALB with listener rules showing path-based routing
5. ALB target groups with healthy targets
6. RDS instance details
7. CloudWatch log groups with log entries
8. CloudWatch alarm configuration
9. CodeDeploy deployment with `Succeeded` status
10. Local Docker or Cloud9 build output showing the pushed image tag
11. S3 bucket with frontend (if deployed)
12. IAM role configurations

Before-and-after screenshots:
13. Original monolithic backend/ directory structure
14. New microservices services/ directory structure

Label each screenshot with descriptive filename: ecr-repositories.png, ecs-services-running.png, alb-routing-rules.png, etc.

**Acceptance criteria:**
- docs/deployment-evidence/ directory contains at least 12 screenshots
- Screenshots cover ECR, ECS, ALB, RDS, CloudWatch, CodeDeploy, and S3
- Before/after directory structure screenshots included

### Task 6.4: Write Technical Report

**Read first:**
- SOA - Group Project.md (Section 6.A)
- docs/saga-workflow.md
- docs/architecture-diagram.png
- docs/team-conventions.md
- infra/deployment-setup.md

**Action:**
Create docs/technical-report.md (or .docx) with these sections (20-30 pages total):

1. System Overview (2-3 pages)
   - Project description (AgriTour travel booking platform)
   - Motivation for microservices migration
   - Team composition and service ownership

2. Microservices Architecture (3-4 pages)
   - Architecture diagram (from Phase 1)
   - Description of each service:
     - Tour Catalog: responsibility, APIs, database
     - Booking Billing: responsibility, APIs, database
     - Identity Partner: responsibility, APIs, database
   - Service boundaries and communication patterns
   - Database-per-service strategy explanation:
     - "To comply with database-per-service while optimizing Lab budget, the team established 3 independent logical databases on a single RDS instance."

3. AWS Deployment (4-5 pages)
   - ECR: image storage and tagging
   - ECS Fargate: why Fargate over EC2 launch type
     - "Minimizes operational overhead, enables auto-scaling, pay-per-use pricing"
   - ALB: path-based routing configuration
   - RDS: database connectivity and ownership
   - IAM: least-privilege role descriptions
   - S3: frontend static hosting
   - Include deployment evidence screenshots in appendix

4. Main Workflow — Saga Pattern (3-4 pages)
   - Saga description: Booking to Payment flow
   - Sequence diagram
   - Step-by-step flow
   - Compensating transactions on failure
   - Cross-service communication (Booking calls Tour Catalog API)

5. Failure Scenario (1-2 pages, optional but recommended)
   - Scenario: Tour Catalog service is down when booking is attempted
   - How it is handled: Booking service returns error, booking not created
   - Recovery: Service health check, ECS auto-restart

6. Redeployment Flow (2-3 pages)
   - GitHub as the source of truth
   - S3 deployment artifact strategy
   - CodeDeploy redeployment demonstration
   - Evidence of redeployment execution

7. Deployment and Update Process (1-2 pages)
   - Step-by-step deployment process
   - How updates are deployed (manual image push plus CodeDeploy for the demo service)
   - Rollback strategy

8. Challenges and Learning (2-3 pages)
   - Technical challenges faced during migration
   - AWS-specific challenges (Learner Lab limitations, budget)
   - Lessons learned about microservices
   - What would be done differently

9. Appendix (remaining pages)
   - All deployment evidence screenshots
   - API contract summaries
   - Database schemas
   - Team contribution log

**Acceptance criteria:**
- docs/technical-report.md exists
- File contains section headers: `System Overview`, `Architecture`, `Saga`, `CI/CD`, `Challenges`
- File contains string `database-per-service`
- File contains string `Compensating`
- File references architecture diagram
- Total content is equivalent to 20-30 pages

### Task 6.5: Prepare Presentation Slides

**Action:**
Create presentation slides (PowerPoint, Google Slides, or Markdown) covering:
- Slide 1: Title — AgriTour SOA Migration
- Slides 2-3: System overview and team
- Slides 4-6: Architecture diagram and service descriptions
- Slides 7-8: Saga workflow with sequence diagram
- Slide 9: Failure scenario (optional)
- Slides 10-12: AWS deployment (ECR, ECS, ALB, RDS screenshots)
- Slide 13: CodeDeploy redeployment demonstration
- Slide 14: Demo plan (what will be shown live)
- Slide 15: Challenges and learnings

Total: approximately 15 slides for 15-minute presentation.

**Acceptance criteria:**
- Presentation file exists (docs/presentation.pptx or docs/presentation.md)
- Contains at least 12 slides
- Contains architecture diagram
- Contains demo plan slide

### Task 6.6: Prepare Demo Script

**Action:**
Create docs/demo-script.md with step-by-step demo plan:

1. Show architecture diagram (1 min)
2. Show ALB URL routing to different services (2 min):
   - curl {ALB}/api/tours — Tour Catalog responds
   - curl {ALB}/api/auth/login — Identity responds
   - curl {ALB}/api/bookings — Booking responds
3. Show end-to-end booking flow (3 min):
   - Register user
   - Login (get JWT token)
   - Browse tours
   - Create booking (Saga: Booking calls Tour Catalog)
   - Make payment (status update)
4. Show redeployment execution (2 min):
   - Make one code change
   - Upload or select the prepared deployment artifact
   - New image pushed to ECR
   - CodeDeploy updates the ECS service
5. Show CloudWatch logs (1 min)
6. Show ECS console — services running on Fargate (1 min)

Pre-demo checklist:
- [ ] Set ECS desired count to 1 for all services (before demo)
- [ ] Verify ALB health checks passing
- [ ] Verify RDS is accessible
- [ ] Test all demo steps locally first
- [ ] Have backup screenshots ready in case of AWS issues

Post-demo:
- [ ] Set ECS desired count back to 0

**Acceptance criteria:**
- docs/demo-script.md exists
- File contains `Pre-demo checklist`
- File contains `desired count` (cost management reminder)
- File contains at least 5 demo steps

## Verification

- [ ] CloudWatch log groups exist for all 3 services
- [ ] At least 1 CloudWatch alarm configured
- [ ] Technical report covers all required sections (20-30 pages equivalent)
- [ ] Presentation slides contain 12+ slides
- [ ] Demo script is complete and tested
- [ ] All evidence screenshots organized in docs/deployment-evidence/
- [ ] Team members have reviewed their service sections in the report
