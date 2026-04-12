---
created: 2026-04-12T07:21:51.821Z
title: Define Docker Priority Across Phases
area: planning
files:
  - .planning/GROUP_TASK_PLAN_145337.md
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
  - SOA - Group Project.md
---

## Problem

There is an unresolved planning conflict about deployment priority across all phases:
- Whether the team should first prioritize three Dockerized services running and interacting correctly in local integration.
- Or prioritize immediate AWS-ready deployment flow per service from the start.

This uncertainty can create inconsistent execution across groups, unstable milestones, and mismatched evidence during final grading.

## Solution

Adopt one explicit rule for all phases and document it in planning artifacts:
- Primary sequence: first guarantee three service Dockerfiles run locally and interact end-to-end.
- Then deploy each owned service to agreed AWS runtime with evidence.
- Keep a conditional extension track for ECR plus ECS or Fargate only if instructor confirms strict enforcement.

Add a checklist line in Milestone M0 that records instructor scope confirmation and the final deployment-priority decision for the whole team.
