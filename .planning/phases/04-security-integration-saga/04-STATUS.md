---
phase: 4
status: blocked-partial
updated: 2026-04-22
priority_rule: local-docker-first-aws-ready
---

# Phase 4 Status

## Current State

- Tour Catalog has a JWT middleware file, but protected routes are not wired through it.
- Booking Billing has service-to-service integration logic to resolve tour data.
- Payment creation updates booking status transactionally.

## Gap Versus Plan

- No `identity-partner` service exists to issue JWTs.
- No login endpoint currently issues tokens in the extracted services.
- Booking Billing has no auth middleware yet.
- RBAC is not enforced on extracted service routes.
- Saga workflow documentation is missing.
- Integration smoke tests are missing.

## Practical Impact

- Missing auth does not stop current local testing of public flows.
- Missing auth does stop completion of `REQ-SEC-01` and any final role-restricted demo.
- If the team keeps the 3-service roadmap, `identity-partner` must be completed before this phase can be closed.

## Exit Criteria For Phase 4

- JWT issuance available.
- JWT verification and RBAC applied to protected routes.
- Booking-to-payment saga documented.
- Smoke tests cover protected and public flows.
