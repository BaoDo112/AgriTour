---
phase: 5
status: completed
updated: 2026-04-27
priority_rule: local-docker-first-aws-ready
---

# Phase 5 Status

## Current State

- `infra/deployment-setup.md` remains the decision note for the learner-lab deployment path.
- `docs/aws-console-checklist.md` is the primary operator guide for the validated AWS path.
- The shared ALB, target groups, ECS services, S3 frontend hosting, and CloudWatch log groups are all live in `us-east-1`.
- The currently validated live revisions are `agritour-tour-catalog:3`, `agritour-booking-billing:4`, and `agritour-identity-partner:3`.
- CodeDeploy deployment `d-440L6Z25J` succeeded for `tour-catalog`, and `/api/tours/featured` returns `release = tour-catalog-codedeploy-v1` through the ALB.
- The final ALB smoke flow passed for auth, tours, booking creation, payment, and booking read-back.

## Gap Versus Plan

- No functional gap remains against the Phase 5 exit criteria.
- The remaining work has moved to Phase 6: evidence curation, report writing, and presentation packaging.
- Cloud9 remains unnecessary for the chosen deployment path; local Docker plus AWS CLI and Console are the working baseline.

## Recommended Direction

- Freeze the validated live architecture unless a presentation-critical issue appears.
- Keep GitHub as the source of truth, S3 for static/frontend and deployment artifacts, ECR for images, ECS for runtime, and CodeDeploy only for the single redeploy demo.
- Use the documented live revisions as the rollback baseline while Phase 6 assets are assembled.

## Exit Criteria For Phase 5

- Completed: at least one service has a working AWS redeployment path.
- Completed: one visible change was redeployed through that path.
- Completed: deployment steps, rollback notes, and evidence locations are documented.
