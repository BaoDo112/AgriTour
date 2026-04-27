# 15 Minute Demo Script

## Goal

Use this script for the 15 minute presentation block before Q and A.

The flow is optimized to show system understanding, AWS deployment, and one working redeployment without wasting time.

## Pre-Open Tabs

Open these exact links before the presentation starts:

- Frontend: `http://agritour-frontend-721792963856-20260427.s3-website-us-east-1.amazonaws.com`
- ALB base: `http://agritour-alb-748152609.us-east-1.elb.amazonaws.com`
- Demo endpoint: `http://agritour-alb-748152609.us-east-1.elb.amazonaws.com/api/tours/featured`
- CodeDeploy application: `agritour`
- CodeDeploy deployment group: `agritour-tour-catalog-dg`
- Successful reference deployment: `d-440L6Z25J`

## Minute 0 to 1: Opening

Say:

- the project problem and user-facing purpose
- that the system was split into 3 microservices
- that the deployment target is AWS using ECR, ECS Fargate, ALB, RDS, S3, CloudWatch, and CodeDeploy

Show:

- title slide
- team member names and contributions

## Minute 1 to 3: Architecture

Say:

- browser hits the frontend on S3
- frontend calls backend routes through the ALB
- ALB routes traffic to 3 ECS services
- services use one RDS instance with separated logical databases

Show:

- architecture diagram
- ALB route split

## Minute 3 to 5: Service Boundaries

Say:

- `tour-catalog` owns tours, categories, and regions
- `booking-billing` owns bookings, payments, and invoices
- `identity-partner` owns auth, users, and partners

Show:

- one slide with service responsibilities and key APIs

## Minute 5 to 6.5: Main Workflow Or Saga

Say:

- walk through one main booking flow across services
- explain how identity, catalog, and booking concerns are separated
- mention any validation or handoff between services

Show:

- saga or request flow diagram

## Minute 6.5 to 8.5: AWS Deployment Proof

Say:

- images are stored in ECR
- services run on ECS Fargate
- ALB provides routing
- RDS stores data
- CloudWatch provides logs and monitoring

Show:

- ECR repositories
- ECS services
- ALB listener rules or healthy target groups
- CloudWatch logs

## Minute 8.5 to 11.5: Redeployment Demo

Say:

- the project brief requires one update or redeployment through an AWS deployment process
- the team uses CodeDeploy for `tour-catalog`
- the visible change is the selected route or functional improvement

Demo:

1. open `http://agritour-alb-748152609.us-east-1.elb.amazonaws.com/api/tours/featured`
2. show that the response includes `release = tour-catalog-codedeploy-v1`
3. open CodeDeploy application `agritour`
4. open deployment group `agritour-tour-catalog-dg`
5. show deployment `d-440L6Z25J` in `Succeeded`
6. connect that deployment to the visible endpoint change through the ALB

If you are re-running a fresh redeploy live instead of replaying the completed one:

1. show the current endpoint behavior first
2. show the new ECR image tag and uploaded AppSpec revision
3. trigger the new CodeDeploy deployment
4. show deployment progress and then `Succeeded`
5. refresh the same ALB endpoint and show the updated behavior

## Minute 11.5 to 13: Failure Handling Or Risk Control

Say:

- one realistic failure scenario such as database outage, unhealthy target, or failed deployment
- the fallback or rollback approach

Show:

- rollback note or previous bundle strategy

## Minute 13 to 14: Challenges And Learning

Say:

- what was difficult in splitting the monolith or wiring services
- what the team learned about AWS deployment and microservice boundaries

## Minute 14 to 15: Close

Say:

- restate that the system satisfies the required AWS stack
- restate that one redeployment was shown through CodeDeploy
- hand over cleanly to Q and A

## Hard Rules During The Demo

- do not improvise new console paths live
- keep all tabs pre-opened
- keep all IDs and ARNs in a shared note
- have one operator drive and one person narrate
- keep rollback artifact ready before the live redeployment step
- keep the frontend tab and the featured endpoint tab open side by side so you can pivot quickly between user-facing proof and AWS console proof