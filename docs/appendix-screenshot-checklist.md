# Appendix Screenshot Checklist

## Purpose

Use this checklist when capturing evidence for the report appendix and presentation backup slides.

## Architecture And Design

- [ ] Architecture diagram with browser, services, databases, AWS services, and traffic flow
- [ ] Service responsibility table or API ownership slide
- [ ] Main workflow or saga diagram

## Containerization

- [ ] Dockerfiles for all 3 services visible in the repo
- [ ] Local container run or local integration evidence if you want backup proof

## AWS Deployment

- [ ] ECR repositories list with 3 backend repositories
- [ ] One ECR image tag visible for each service
- [ ] ECS cluster overview
- [ ] ECS service details for `tour-catalog`
- [ ] ECS service details for `booking-billing`
- [ ] ECS service details for `identity-partner`
- [ ] ALB listener rules with path-based routing
- [ ] Target groups showing healthy status
- [ ] RDS instance overview
- [ ] S3 frontend bucket or website hosting view

## Monitoring

- [ ] CloudWatch log group for `tour-catalog`
- [ ] CloudWatch log group for `booking-billing`
- [ ] CloudWatch log group for `identity-partner`
- [ ] One alarm or monitoring screen if available

## Redeployment Evidence

- [ ] CodeDeploy application overview
- [ ] CodeDeploy deployment group overview
- [ ] Deployment in progress
- [ ] Deployment succeeded
- [ ] New task definition revision or ECS task set after deployment
- [ ] ALB endpoint showing the visible change after redeploy
- [ ] S3 object or version id for the deployment bundle

## Frontend Evidence

- [ ] Frontend home page live on S3 hosting
- [ ] Frontend calling backend through ALB

## Q And A Backup Material

- [ ] One failure scenario note
- [ ] One rollback note
- [ ] One member contribution mapping slide or table

## File Naming Suggestion

Use a stable naming pattern under `docs/deployment-evidence/`:

- `01-architecture-diagram.png`
- `02-ecr-repositories.png`
- `03-ecs-services.png`
- `04-alb-rules.png`
- `05-rds-instance.png`
- `06-cloudwatch-tour-catalog.png`
- `07-codedeploy-progress.png`
- `08-codedeploy-success.png`
- `09-frontend-live.png`
- `10-featured-endpoint-live.png`