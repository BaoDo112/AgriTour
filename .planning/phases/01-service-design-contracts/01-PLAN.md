---
phase: 1
name: Service Design and Contract Freeze
wave: 1
depends_on: []
requirements: [REQ-ARCH-01]
files_modified:
  - shared/api-contracts/tour-catalog-api.yaml
  - shared/api-contracts/booking-billing-api.yaml
  - shared/api-contracts/identity-partner-api.yaml
  - shared/db-schemas/agritour_catalog.sql
  - shared/db-schemas/agritour_booking.sql
  - shared/db-schemas/agritour_identity.sql
  - docs/architecture-diagram.png
autonomous: false
---

# Phase 1: Service Design and Contract Freeze

## Objective

Produce the complete architecture diagram, finalize 3 service boundaries with OpenAPI contracts, define data ownership across 3 logical databases, and freeze team conventions before any code extraction begins.

## Must-Haves (Goal-Backward Verification)

- Architecture diagram showing: Client, ALB, 3 ECS Fargate tasks, RDS, ECR, CloudWatch, CodeDeploy, and S3 frontend hosting
- OpenAPI contract spec for each of the 3 services
- SQL schema files for 3 logical databases (agritour_catalog, agritour_booking, agritour_identity)
- Data ownership matrix documenting which service owns which tables
- Cross-service dependency map (booking needs tour data, media needs S3)
- Team conventions document approved by all groups

## Tasks

### Task 1.1: Architecture Diagram

**Read first:**
- .planning/codebase/ARCHITECTURE.md
- .planning/codebase/MICROSERVICES-STRUCTURE.md
- SOA - Group Project.md (Section 4.A)

**Action:**
Create an architecture diagram (draw.io, Lucidchart, or similar) showing:
- Client/Browser at the top
- S3 bucket serving frontend static files
- Application Load Balancer receiving API requests
- ALB path-based routing rules:
  - /api/tours/*, /api/categories/*, /api/regions/* to Tour Catalog Service (port 3001)
  - /api/bookings/*, /api/payments/*, /api/invoices/* to Booking Billing Service (port 3002)
  - /api/auth/*, /api/users/*, /api/partners/* to Identity Partner Service (port 3003)
- 3 ECS Fargate tasks (one per service)
- Amazon ECR (3 repositories feeding images to ECS)
- Amazon RDS MySQL (1 instance, 3 logical databases)
- CloudWatch (log groups per service)
- CodeDeploy redeployment path for one selected service
- IAM roles connecting services to AWS resources
- Optional: SQS/SNS for async booking notifications

Save as docs/architecture-diagram.png and editable source file.

**Acceptance criteria:**
- docs/architecture-diagram.png file exists
- Diagram contains labels: ALB, ECS Fargate, ECR, RDS, CloudWatch, CodeDeploy, S3
- Diagram shows 3 distinct service boxes with their API prefixes
- Diagram shows path-based routing arrows from ALB to each service
- Diagram shows RDS with 3 database labels

### Task 1.2: OpenAPI Contract Specifications

**Read first:**
- .planning/codebase/ARCHITECTURE.md (Service Boundaries section)
- backend/routes/tourRoutes.js
- backend/routes/bookingRoutes.js
- backend/routes/authRoutes.js

**Action:**
Create 3 OpenAPI YAML files defining the API contract for each service:

File: shared/api-contracts/tour-catalog-api.yaml
- Endpoints: GET /api/tours, GET /api/tours/:id, POST /api/tours, PUT /api/tours/:id, DELETE /api/tours/:id, PUT /api/tours/review/:tour_id, GET /api/tours/admin/all, GET /api/tours/by-region/:region_id, GET /api/tours/partner/:partner_id, GET /api/tours/search, GET /api/categories, POST /api/categories, DELETE /api/categories/:id, GET /api/regions, POST /api/regions, PUT /api/regions/:id, DELETE /api/regions/:id
- Health: GET /health
- Each endpoint: request schema, response schema, error responses, auth requirements

File: shared/api-contracts/booking-billing-api.yaml
- Endpoints: POST /api/bookings, GET /api/bookings/user/:user_id, PUT /api/bookings/:id, DELETE /api/bookings/:id, POST /api/payments, GET /api/payments, POST /api/invoices, GET /api/invoices
- Health: GET /health

File: shared/api-contracts/identity-partner-api.yaml
- Endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/users, GET /api/users/:id, PUT /api/users/:id, PUT /api/users/:id/role, DELETE /api/users/:id, GET /api/partners, POST /api/partners, GET /api/partners/:id, PUT /api/partners/:id/approve, DELETE /api/partners/:id
- Health: GET /health

All specs must include unified error response schema:
```yaml
ErrorResponse:
  type: object
  properties:
    error:
      type: string
    message:
      type: string
    statusCode:
      type: integer
```

**Acceptance criteria:**
- shared/api-contracts/tour-catalog-api.yaml contains `openapi: '3.0'`
- shared/api-contracts/booking-billing-api.yaml contains `openapi: '3.0'`
- shared/api-contracts/identity-partner-api.yaml contains `openapi: '3.0'`
- Each file contains `/health` endpoint definition
- Each file contains `ErrorResponse` schema

### Task 1.3: Database Schema and Ownership

**Read first:**
- backend/controllers/tourController.js (SQL queries reveal table structure)
- backend/controllers/bookingController.js
- backend/controllers/authController.js
- backend/controllers/userController.js
- backend/controllers/partnerController.js

**Action:**
Create SQL schema files for each logical database:

File: shared/db-schemas/agritour_catalog.sql
```sql
CREATE DATABASE IF NOT EXISTS agritour_catalog;
USE agritour_catalog;

CREATE TABLE tours (
  tour_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration VARCHAR(50),
  max_people INT,
  image_url VARCHAR(500),
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  partner_id INT NOT NULL,
  category_id INT,
  region_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE regions (
  region_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);
```

File: shared/db-schemas/agritour_booking.sql
```sql
CREATE DATABASE IF NOT EXISTS agritour_booking;
USE agritour_booking;

CREATE TABLE bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  tour_title VARCHAR(255),
  num_people INT,
  total_price DECIMAL(10,2),
  booking_date DATE,
  status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

CREATE TABLE invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2),
  invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);
```

File: shared/db-schemas/agritour_identity.sql
```sql
CREATE DATABASE IF NOT EXISTS agritour_identity;
USE agritour_identity;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('customer','partner','admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE partners (
  partner_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company_name VARCHAR(255),
  description TEXT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

Note: booking table stores tour_title as denormalized field to avoid cross-service joins. Booking service calls Tour Catalog API to get tour details at booking time.

**Acceptance criteria:**
- shared/db-schemas/agritour_catalog.sql contains `CREATE DATABASE IF NOT EXISTS agritour_catalog`
- shared/db-schemas/agritour_booking.sql contains `CREATE DATABASE IF NOT EXISTS agritour_booking`
- shared/db-schemas/agritour_identity.sql contains `CREATE DATABASE IF NOT EXISTS agritour_identity`
- agritour_booking.sql contains `tour_title VARCHAR(255)` (denormalized field)
- No cross-database FOREIGN KEY constraints between different database files

### Task 1.4: Team Conventions Document

**Read first:**
- .planning/codebase/CONVENTIONS.md
- .planning/GROUP_TASK_PLAN_145337.md (Section 7)

**Action:**
Create docs/team-conventions.md containing:
- Branch naming: feature/{service-name}/{description}
- Commit format: type(scope): description
- PR review rule: at least 1 reviewer from different group
- API response format: { success: boolean, data: object, error: string }
- Health endpoint: GET /health returning { status: "healthy", service: "{name}", timestamp: "ISO" }
- Environment variable naming convention
- Port assignments: tour-catalog=3001, booking-billing=3002, identity-partner=3003
- AWS resource naming: agritour-{resource-type}-{service-name}
- Cost management rules: ECS desired=0 when idle, check Lab credits daily

**Acceptance criteria:**
- docs/team-conventions.md exists
- File contains string `3001` and `3002` and `3003`
- File contains string `/health`
- File contains string `desired` (ECS cost management)

## Verification

- [ ] Architecture diagram file exists at docs/architecture-diagram.png
- [ ] 3 OpenAPI YAML files exist in shared/api-contracts/
- [ ] 3 SQL schema files exist in shared/db-schemas/
- [ ] No cross-database foreign keys in schema files
- [ ] Team conventions document exists at docs/team-conventions.md
- [ ] All files use Markdown headers, no raw XML tags
