---
version: v3
audit_date: 2026-04-12
milestone: AgriTour SOA Migration
status: fail
source: SOA - Group Project.md (Section 5 Required AWS Features)
gaps:
  requirements:
    - id: REQ-ARCH-01
      priority: must
      description: Services are not yet physically split into independent deployables.
      evidence:
        - backend/server.js still mounts all domains in one process.
    - id: REQ-DOCKER-01
      priority: must
      description: No service-level Dockerfiles currently exist.
      evidence:
        - Repository has no Dockerfile files.
    - id: REQ-ECR-01
      priority: must
      description: No container images have been pushed to Amazon ECR.
      evidence:
        - No ECR repository or image push workflow exists.
    - id: REQ-ECS-01
      priority: must
      description: No services are deployed on Amazon ECS or Fargate.
      evidence:
        - No ECS task definitions or service configurations exist.
    - id: REQ-ALB-01
      priority: must
      description: No Application Load Balancer is configured for service routing.
      evidence:
        - No ALB or target group configurations exist.
    - id: REQ-RDS-01
      priority: must
      description: RDS ownership and schema strategy per service are not formalized.
      evidence:
        - backend/db.js is a shared connection without service-bound ownership.
    - id: REQ-CW-01
      priority: must
      description: CloudWatch logs and monitoring baseline are missing.
      evidence:
        - Current logging is console-only.
    - id: REQ-CICD-01
      priority: must
      description: No CI/CD pipeline has been implemented.
      evidence:
        - No CodePipeline or CodeDeploy artifacts in repository.
    - id: REQ-SEC-01
      priority: must
      description: Backend authorization enforcement is incomplete.
      evidence:
        - No auth middleware in backend/server.js route stack.
        - No JWT issuance in login endpoint.
    - id: REQ-IAM-01
      priority: must
      description: IAM least-privilege role matrix is missing.
      evidence:
        - No IAM policy documents in planning artifacts.
    - id: REQ-SAGA-01
      priority: must
      description: No Saga workflow has been documented or implemented.
      evidence:
        - No saga pattern in current codebase.
    - id: REQ-REDEPLOY-01
      priority: must
      description: No redeployment through pipeline has been demonstrated.
      evidence:
        - No pipeline exists to demonstrate redeployment.
    - id: REQ-REPORT-01
      priority: must
      description: Technical report and presentation slides are not started.
      evidence:
        - No report or slides in repository.
    - id: REQ-S3-01
      priority: should
      description: Frontend static hosting or media strategy on S3 is not defined.
      evidence:
        - Frontend is not mapped to S3-based hosting.
    - id: REQ-TEST-01
      priority: should
      description: No service smoke or contract test baseline exists.
      evidence:
        - backend/package.json test script is placeholder.
    - id: REQ-ASYNC-01
      priority: nice
      description: Optional async notification flow is not designed.
      evidence:
        - No SQS or SNS event flow in codebase.
  integration:
    - id: INT-01
      priority: must
      description: ALB path-based routing contract is not documented across service prefixes.
      affected_requirements: [REQ-ALB-01, REQ-ECS-01]
    - id: INT-02
      priority: must
      description: Booking to tour dependency contract is not externalized for cross-service communication.
      affected_requirements: [REQ-ARCH-01, REQ-RDS-01, REQ-SAGA-01]
    - id: INT-03
      priority: should
      description: Unified response and error schema is not standardized across services.
      affected_requirements: [REQ-TEST-01]
  flows:
    - id: FLOW-01
      priority: must
      name: Login to role-restricted action
      broken_at: Missing JWT issuance and backend authorization enforcement
      affected_requirements: [REQ-SEC-01]
    - id: FLOW-02
      priority: must
      name: Tour booking to payment confirmation (Saga)
      broken_at: Non-transactional status update and service coupling without saga pattern
      affected_requirements: [REQ-ARCH-01, REQ-SAGA-01, REQ-TEST-01]
    - id: FLOW-03
      priority: should
      name: Create tour with image to publish lifecycle
      broken_at: Local filesystem media design incompatible with ECS Fargate ephemeral storage
      affected_requirements: [REQ-S3-01]
---

# Milestone Audit v3

This audit was rebuilt to align with the project brief (SOA - Group Project.md Section 5 Required AWS Features). All previous audits (v1, v2) incorrectly treated ECR, ECS, Fargate, and ALB as conditional extensions. They are mandatory per the project brief.

Summary:
- requirement gaps: 16
- integration gaps: 3
- flow gaps: 3
- must: 13
- should: 3
- nice: 1

Key changes from v2:
- Removed all EC2-based deployment references
- ECR, ECS Fargate, and ALB are now mandatory requirements (not conditional)
- Added REQ-SAGA-01 (Saga workflow required in report)
- Added REQ-REDEPLOY-01 (pipeline redeployment demo required)
- Added REQ-REPORT-01 (technical report required)
- Elevated REQ-CW-01 from should to must (project brief lists it as required)

Recommended next action:
- Execute Roadmap phases 1 through 6 using ECR, ECS Fargate, ALB as the deployment baseline.
