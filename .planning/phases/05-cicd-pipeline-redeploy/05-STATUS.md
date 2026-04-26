---
phase: 5
status: not-started
updated: 2026-04-22
priority_rule: local-docker-first-aws-ready
---

# Phase 5 Status

## Current State

- `infra/buildspec.yml` exists and is aligned to a single-service Docker build that pushes to ECR and emits `imagedefinitions.json`.
- `docs/aws-codepipeline-troubleshooting.md` exists and already documents the current repository-side pipeline contract.
- `infra/pipeline-setup.md` is now the working decision note for choosing CodePipeline or CodeDeploy in the actual learner account.

## Gap Versus Plan

- The AWS account has not yet been checked to confirm whether CodePipeline is available in the target region.
- No live AWS pipeline or deployment group evidence exists yet.
- No redeployment screenshots or console evidence exist yet.

## Recommended Direction

- Prefer `CodePipeline + CodeBuild + ECS deploy` if the service is available.
- If CodePipeline is blocked in the learner account, use `CodeDeploy` only for one microservice rather than combining both.
- Keep the demo scope to one service, ideally `tour-catalog`, to minimize setup and risk.

## Exit Criteria For Phase 5

- At least one service has a working pipeline.
- One visible change is redeployed through that pipeline.
- Pipeline steps, rollback, and evidence are documented.
