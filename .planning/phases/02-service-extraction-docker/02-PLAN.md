---
phase: 2
name: Service Extraction and Dockerization
wave: 1
depends_on: [1]
requirements: [REQ-ARCH-01, REQ-DOCKER-01, REQ-TEST-01]
files_modified:
  - services/tour-catalog/**
  - services/booking-billing/**
  - services/identity-partner/**
  - infra/docker-compose.yml
autonomous: false
---

# Phase 2: Service Extraction and Dockerization

## Objective

Extract the monolith backend into 3 independent microservices, create Dockerfiles for each, build a docker-compose.yml for local integration, and validate all services run independently with health check endpoints.

## Must-Haves (Goal-Backward Verification)

- 3 service directories under services/ with independent package.json and server.js
- Each service connects to its own logical database
- Each service has a /health endpoint
- 3 Dockerfiles that build successfully
- docker-compose.yml that starts all 3 services plus MySQL
- Cross-service joins replaced with API calls or denormalized fields
- Basic smoke tests for critical endpoints

## Tasks

### Task 2.1: Extract Tour Catalog Service (Group A)

**Read first:**
- backend/controllers/tourController.js
- backend/controllers/categoryController.js
- backend/controllers/regionController.js
- backend/routes/tourRoutes.js
- backend/routes/categoryRoutes.js
- backend/routes/regionRoutes.js
- backend/server.js (middleware setup: cors, json, static)
- backend/db.js
- .planning/codebase/MICROSERVICES-STRUCTURE.md

**Action:**
1. Create directory: services/tour-catalog/
2. Initialize: services/tour-catalog/package.json with dependencies: express, mysql2, cors, multer, dotenv
3. Create services/tour-catalog/server.js:
   - Express app listening on process.env.PORT (default 3001)
   - Mount routes: /api/tours, /api/categories, /api/regions
   - CORS enabled
   - JSON body parser
   - Health endpoint: GET /health returning { status: "healthy", service: "tour-catalog", timestamp: ISO }
4. Create services/tour-catalog/src/config/db.js:
   - mysql2 connection pool using DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (agritour_catalog), DB_PORT
   - Export promise-based pool
5. Copy and adapt controllers from backend/controllers/ to services/tour-catalog/src/controllers/:
   - tourController.js: change require("../db") to require("../config/db"), use pool.execute() instead of db.query()
   - categoryController.js: same adaptations
   - regionController.js: same adaptations
   - Remove cross-domain joins to users table: instead of JOIN users, store partner_id only and let frontend resolve partner name via Identity service
6. Copy and adapt routes to services/tour-catalog/src/routes/
7. Create services/tour-catalog/.env.example:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=agritour_catalog
   DB_PORT=3306
   JWT_SECRET=
   ```

**Acceptance criteria:**
- services/tour-catalog/package.json contains `"name": "tour-catalog"`
- services/tour-catalog/server.js contains `app.get('/health'`
- services/tour-catalog/server.js contains `process.env.PORT || 3001`
- services/tour-catalog/src/config/db.js contains `agritour_catalog` as default DB_NAME comment
- services/tour-catalog/src/controllers/tourController.js exists
- services/tour-catalog/.env.example contains `PORT=3001`

### Task 2.2: Extract Booking Billing Service (Group C)

**Read first:**
- backend/controllers/bookingController.js
- backend/controllers/paymentController.js
- backend/controllers/invoiceController.js
- backend/routes/bookingRoutes.js
- backend/routes/paymentRoutes.js
- backend/routes/invoiceRoutes.js
- backend/server.js
- backend/db.js

**Action:**
1. Create directory: services/booking-billing/
2. Initialize: services/booking-billing/package.json with dependencies: express, mysql2, cors, dotenv, axios (for cross-service calls)
3. Create services/booking-billing/server.js:
   - Express app listening on process.env.PORT (default 3002)
   - Mount routes: /api/bookings, /api/payments, /api/invoices
   - Health endpoint: GET /health
4. Create services/booking-billing/src/config/db.js for agritour_booking
5. Copy and adapt controllers:
   - bookingController.js: replace JOIN tours with denormalized tour_title field stored at booking time. Add TOUR_CATALOG_URL env var for fetching tour details via HTTP when creating booking
   - paymentController.js: adapt db connection, wrap payment + booking status update in transaction
   - invoiceController.js: adapt db connection
6. Copy and adapt routes
7. Create .env.example with TOUR_CATALOG_URL=http://localhost:3001

**Acceptance criteria:**
- services/booking-billing/package.json contains `"name": "booking-billing"`
- services/booking-billing/server.js contains `process.env.PORT || 3002`
- services/booking-billing/server.js contains `app.get('/health'`
- services/booking-billing/src/controllers/bookingController.js does not contain `JOIN tours`
- services/booking-billing/.env.example contains `TOUR_CATALOG_URL`

### Task 2.3: Extract Identity Partner Service (Group B)

**Read first:**
- backend/controllers/authController.js
- backend/controllers/userController.js
- backend/controllers/partnerController.js
- backend/routes/authRoutes.js
- backend/routes/userRoutes.js
- backend/routes/partnerRoutes.js
- backend/server.js
- backend/db.js

**Action:**
1. Create directory: services/identity-partner/
2. Initialize: services/identity-partner/package.json with dependencies: express, mysql2, cors, bcryptjs, jsonwebtoken, dotenv
3. Create services/identity-partner/server.js:
   - Express app listening on process.env.PORT (default 3003)
   - Mount routes: /api/auth, /api/users, /api/partners
   - Health endpoint: GET /health
4. Create services/identity-partner/src/config/db.js for agritour_identity
5. Copy and adapt controllers:
   - authController.js: ADD JWT issuance on successful login using jsonwebtoken.sign() with JWT_SECRET env var. Return { token, user } on login success
   - userController.js: adapt db connection
   - partnerController.js: adapt db connection, remove JOIN users (store user_id reference only)
6. Create services/identity-partner/src/middleware/authMiddleware.js:
   ```javascript
   const jwt = require('jsonwebtoken');
   
   const verifyToken = (req, res, next) => {
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return res.status(401).json({ error: 'No token provided' });
     }
     const token = authHeader.split(' ')[1];
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (err) {
       return res.status(403).json({ error: 'Invalid or expired token' });
     }
   };
   
   const requireRole = (...roles) => (req, res, next) => {
     if (!req.user || !roles.includes(req.user.role)) {
       return res.status(403).json({ error: 'Insufficient permissions' });
     }
     next();
   };
   
   module.exports = { verifyToken, requireRole };
   ```
7. Create .env.example with JWT_SECRET=your-secret-key

**Acceptance criteria:**
- services/identity-partner/package.json contains `jsonwebtoken`
- services/identity-partner/server.js contains `process.env.PORT || 3003`
- services/identity-partner/src/controllers/authController.js contains `jwt.sign`
- services/identity-partner/src/middleware/authMiddleware.js contains `verifyToken`
- services/identity-partner/src/middleware/authMiddleware.js contains `requireRole`

### Task 2.4: Create Dockerfiles

**Read first:**
- .planning/codebase/MICROSERVICES-STRUCTURE.md (Dockerfile Template section)

**Action:**
Create identical Dockerfile in each service directory with appropriate PORT:

services/tour-catalog/Dockerfile:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["node", "server.js"]
```

services/booking-billing/Dockerfile (EXPOSE 3002, healthcheck port 3002)
services/identity-partner/Dockerfile (EXPOSE 3003, healthcheck port 3003)

**Acceptance criteria:**
- services/tour-catalog/Dockerfile contains `EXPOSE 3001`
- services/booking-billing/Dockerfile contains `EXPOSE 3002`
- services/identity-partner/Dockerfile contains `EXPOSE 3003`
- All 3 Dockerfiles contain `HEALTHCHECK`
- All 3 Dockerfiles contain `node:20-alpine`

### Task 2.5: Create docker-compose.yml

**Read first:**
- .planning/codebase/MICROSERVICES-STRUCTURE.md (docker-compose template section)

**Action:**
Create infra/docker-compose.yml with the full template from MICROSERVICES-STRUCTURE.md (4 services: tour-catalog, booking-billing, identity-partner, mysql). Ensure mysql service has volume mount for shared/db-schemas/ to auto-initialize all 3 databases.

**Acceptance criteria:**
- infra/docker-compose.yml contains `tour-catalog:`
- infra/docker-compose.yml contains `booking-billing:`
- infra/docker-compose.yml contains `identity-partner:`
- infra/docker-compose.yml contains `mysql:`
- infra/docker-compose.yml contains `agritour_catalog`
- infra/docker-compose.yml contains `agritour_booking`
- infra/docker-compose.yml contains `agritour_identity`

### Task 2.6: Rename Legacy Backend

**Action:**
Rename backend/ to backend-legacy/ to preserve as reference during development.

**Acceptance criteria:**
- backend-legacy/ directory exists
- backend/ directory no longer exists (or is renamed)

## Verification

- [ ] 3 service directories exist under services/
- [ ] Each service has: server.js, package.json, Dockerfile, .env.example, src/controllers/, src/routes/, src/config/db.js
- [ ] docker-compose.yml starts all services locally: `cd infra && docker-compose up --build`
- [ ] Each service /health returns 200 with JSON
- [ ] No cross-database JOINs in any controller
