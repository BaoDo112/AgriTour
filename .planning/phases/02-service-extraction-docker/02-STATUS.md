---
phase: 2
status: in-progress
updated: 2026-04-22
priority_rule: local-docker-first-aws-ready
---

# Phase 2 Status

## Current State

- `services/tour-catalog` exists with `server.js`, `Dockerfile`, `package.json`, controllers, routes, middleware, and DB config.
- `services/booking-billing` exists with `server.js`, `Dockerfile`, `package.json`, controllers, routes, DB config, and service-to-service adapter.
- Local compose file has been repaired and now validates with `docker compose -f infra/docker-compose.yml config`.
- Booking service already tries to fetch tour data from Tour Catalog and can fall back to request or mock snapshots.

## Gap Versus Plan

- `identity-partner` service is still missing.
- No smoke test scripts exist yet.
- `shared/api-contracts/booking-billing-api.yaml` is missing.
- Tour Catalog still uses local uploads, which is only acceptable for local development and not for ECS/Fargate media handling.
- Legacy backend is still present as `backend/`, not yet archived as `backend-legacy/`.

## What Is Good Enough Right Now

- For current progress, local validation of 2 services is the correct priority.
- Dockerfiles and env names must stay compatible with later ECR/ECS deployment.
- Missing auth is not a blocker for basic Phase 2 local integration, but it is a blocker for protected-flow testing.

## Exit Criteria For Phase 2

- Local multi-container flow starts successfully with Docker.
- Health endpoints pass for both services.
- Booking can read tour data from Tour Catalog in local runtime.
- Smoke tests exist for the current service set.
- Either add `identity-partner` or formally reduce the final scope to 2 services.
