# Microservices Directory Structure

**Created:** 2026-04-12
**Purpose:** Define the target directory structure after migrating from monolith to microservices.

## Current Structure (Monolith)

```text
AgriTour/
├── backend/                     # Single Express app — ALL domains
│   ├── controllers/             # 9 controllers in one process
│   ├── routes/                  # 9 route files in one process
│   ├── uploads/                 # Local filesystem media
│   ├── db.js                    # Shared MySQL connection
│   ├── server.js                # Single entry point
│   └── package.json
├── frontend/                    # React SPA
└── package.json
```

## Target Structure (Microservices)

```text
AgriTour/
├── services/                              # Microservices root
│   ├── tour-catalog/                      # Service A (Group A) — Port 3001
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── tourController.js
│   │   │   │   ├── categoryController.js
│   │   │   │   └── regionController.js
│   │   │   ├── routes/
│   │   │   │   ├── tourRoutes.js
│   │   │   │   ├── categoryRoutes.js
│   │   │   │   └── regionRoutes.js
│   │   │   ├── middleware/
│   │   │   │   └── authMiddleware.js       # JWT verification (shared pattern)
│   │   │   └── config/
│   │   │       └── db.js                   # Connection to agritour_catalog DB
│   │   ├── server.js                       # Independent Express entry point
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── booking-billing/                   # Service B (Group C) — Port 3002
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── bookingController.js
│   │   │   │   ├── paymentController.js
│   │   │   │   └── invoiceController.js
│   │   │   ├── routes/
│   │   │   │   ├── bookingRoutes.js
│   │   │   │   ├── paymentRoutes.js
│   │   │   │   └── invoiceRoutes.js
│   │   │   ├── middleware/
│   │   │   │   └── authMiddleware.js
│   │   │   └── config/
│   │   │       └── db.js                   # Connection to agritour_booking DB
│   │   ├── server.js
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── identity-partner/                  # Service C (Group B) — Port 3003
│       ├── src/
│       │   ├── controllers/
│       │   │   ├── authController.js
│       │   │   ├── userController.js
│       │   │   └── partnerController.js
│       │   ├── routes/
│       │   │   ├── authRoutes.js
│       │   │   ├── userRoutes.js
│       │   │   └── partnerRoutes.js
│       │   ├── middleware/
│       │   │   ├── authMiddleware.js        # JWT verification
│       │   │   └── jwtService.js            # JWT issuance (only in this service)
│       │   └── config/
│       │       └── db.js                    # Connection to agritour_identity DB
│       ├── server.js
│       ├── Dockerfile
│       ├── package.json
│       └── .env.example
│
├── frontend/                              # React SPA (deploy to S3)
│   ├── src/
│   ├── Dockerfile                          # Optional: build step only
│   └── package.json
│
├── shared/                                # Shared contracts and schemas
│   ├── api-contracts/                     # OpenAPI specs per service
│   │   ├── tour-catalog-api.yaml
│   │   ├── booking-billing-api.yaml
│   │   └── identity-partner-api.yaml
│   └── db-schemas/                        # SQL migration scripts
│       ├── agritour_catalog.sql
│       ├── agritour_booking.sql
│       └── agritour_identity.sql
│
├── infra/                                 # AWS infrastructure configs
│   ├── docker-compose.yml                 # Local dev: 3 services + MySQL
│   ├── docker-compose.prod.yml            # Reference for AWS env vars
│   ├── task-definitions/                  # ECS task definition JSONs
│   │   ├── tour-catalog-task.json
│   │   ├── booking-billing-task.json
│   │   └── identity-partner-task.json
│   ├── iam-policies/                      # IAM policy documents
│   │   ├── ecs-task-execution-role.json
│   │   └── ecs-task-role.json
│   ├── alb-rules.md                       # ALB routing documentation
│   └── buildspec.yml                      # CodeBuild buildspec for CI/CD
│
├── docs/                                  # Report and presentation
│   ├── architecture-diagram.png
│   ├── saga-workflow.md
│   ├── deployment-evidence/               # AWS screenshots
│   └── technical-report.md
│
├── backend-legacy/                        # ARCHIVED monolith (dev reference only)
│   └── (original backend/ renamed)        # Remove from submission branch
│
├── .planning/                             # GSD planning artifacts
└── README.md
```

## Migration Mapping (Old to New)

| Old Location | New Location | Service |
|---|---|---|
| backend/controllers/tourController.js | services/tour-catalog/src/controllers/tourController.js | A |
| backend/controllers/categoryController.js | services/tour-catalog/src/controllers/categoryController.js | A |
| backend/controllers/regionController.js | services/tour-catalog/src/controllers/regionController.js | A |
| backend/routes/tourRoutes.js | services/tour-catalog/src/routes/tourRoutes.js | A |
| backend/routes/categoryRoutes.js | services/tour-catalog/src/routes/categoryRoutes.js | A |
| backend/routes/regionRoutes.js | services/tour-catalog/src/routes/regionRoutes.js | A |
| backend/controllers/bookingController.js | services/booking-billing/src/controllers/bookingController.js | B |
| backend/controllers/paymentController.js | services/booking-billing/src/controllers/paymentController.js | B |
| backend/controllers/invoiceController.js | services/booking-billing/src/controllers/invoiceController.js | B |
| backend/routes/bookingRoutes.js | services/booking-billing/src/routes/bookingRoutes.js | B |
| backend/routes/paymentRoutes.js | services/booking-billing/src/routes/paymentRoutes.js | B |
| backend/routes/invoiceRoutes.js | services/booking-billing/src/routes/invoiceRoutes.js | B |
| backend/controllers/authController.js | services/identity-partner/src/controllers/authController.js | C |
| backend/controllers/userController.js | services/identity-partner/src/controllers/userController.js | C |
| backend/controllers/partnerController.js | services/identity-partner/src/controllers/partnerController.js | C |
| backend/routes/authRoutes.js | services/identity-partner/src/routes/authRoutes.js | C |
| backend/routes/userRoutes.js | services/identity-partner/src/routes/userRoutes.js | C |
| backend/routes/partnerRoutes.js | services/identity-partner/src/routes/partnerRoutes.js | C |
| backend/db.js | services/{each}/src/config/db.js | Each |
| backend/server.js | services/{each}/server.js | Each |
| backend/uploads/ | S3 bucket (agritour-media) | Cloud |
| backend/swagger.js | services/{each} (optional per service) | Each |

## Dockerfile Template (Standard for all services)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE {PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:{PORT}/health || exit 1

CMD ["node", "server.js"]
```

## docker-compose.yml Template (Local Development)

```yaml
version: '3.8'

services:
  tour-catalog:
    build: ./services/tour-catalog
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=devpassword
      - DB_NAME=agritour_catalog
      - JWT_SECRET=dev-jwt-secret
    depends_on:
      mysql:
        condition: service_healthy

  booking-billing:
    build: ./services/booking-billing
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=devpassword
      - DB_NAME=agritour_booking
      - JWT_SECRET=dev-jwt-secret
      - TOUR_CATALOG_URL=http://tour-catalog:3001
    depends_on:
      mysql:
        condition: service_healthy

  identity-partner:
    build: ./services/identity-partner
    ports:
      - "3003:3003"
    environment:
      - PORT=3003
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=devpassword
      - DB_NAME=agritour_identity
      - JWT_SECRET=dev-jwt-secret
    depends_on:
      mysql:
        condition: service_healthy

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=devpassword
    volumes:
      - mysql-data:/var/lib/mysql
      - ./shared/db-schemas:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql-data:
```

## Naming Conventions

| Resource | Pattern | Example |
|---|---|---|
| Service directory | kebab-case | services/tour-catalog |
| ECR repository | agritour-{service} | agritour-tour-catalog |
| ECS task definition | agritour-{service}-task | agritour-tour-catalog-task |
| ECS service | agritour-{service}-svc | agritour-tour-catalog-svc |
| ALB target group | agritour-{service}-tg | agritour-tour-catalog-tg |
| RDS database | agritour_{service} | agritour_catalog |
| CloudWatch log group | /ecs/agritour-{service} | /ecs/agritour-tour-catalog |
| S3 bucket (frontend) | agritour-frontend-{id} | agritour-frontend-2026 |

## Health Check Endpoint (Standard for all services)

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: '{service-name}',
    timestamp: new Date().toISOString()
  });
});
```

---

*Structure defined: 2026-04-12*
