---
phase: 4
name: Security, Integration, and Saga Workflow
wave: 3
depends_on: [2, 3]
requirements: [REQ-SEC-01, REQ-SAGA-01, REQ-TEST-01, REQ-ASYNC-01]
files_modified:
  - services/tour-catalog/src/middleware/authMiddleware.js
  - services/booking-billing/src/middleware/authMiddleware.js
  - services/booking-billing/src/controllers/bookingController.js
  - docs/saga-workflow.md
autonomous: false
---

# Phase 4: Security, Integration, and Saga Workflow

## Objective

Implement JWT authentication across all services, enforce RBAC on protected routes, design and document the Saga workflow for the Booking-Payment flow, and add integration smoke tests.

## Must-Haves (Goal-Backward Verification)

- JWT issuance on login in Identity service
- JWT verification middleware installed in all 3 services
- RBAC enforcement on admin and partner routes
- Saga workflow documented (Booking to Payment to optional Notification)
- Cross-service communication tested (Booking calls Tour Catalog for tour details)
- Integration smoke tests for critical flows
- Optional: SQS/SNS async notification on booking confirmation

## Tasks

### Task 4.1: Distribute JWT Verification Middleware

**Read first:**
- services/identity-partner/src/middleware/authMiddleware.js
- services/identity-partner/src/controllers/authController.js

**Action:**
1. Copy authMiddleware.js (verifyToken + requireRole) to:
   - services/tour-catalog/src/middleware/authMiddleware.js
   - services/booking-billing/src/middleware/authMiddleware.js
2. Add jsonwebtoken dependency to tour-catalog and booking-billing package.json:
   ```bash
   cd services/tour-catalog && npm install jsonwebtoken
   cd services/booking-billing && npm install jsonwebtoken
   ```
3. Both services must use the same JWT_SECRET environment variable as identity-partner

**Acceptance criteria:**
- services/tour-catalog/src/middleware/authMiddleware.js contains `jwt.verify`
- services/booking-billing/src/middleware/authMiddleware.js contains `jwt.verify`
- services/tour-catalog/package.json contains `jsonwebtoken`
- services/booking-billing/package.json contains `jsonwebtoken`

### Task 4.2: Apply RBAC to Protected Routes

**Read first:**
- services/tour-catalog/src/routes/tourRoutes.js
- services/booking-billing/src/routes/bookingRoutes.js
- services/identity-partner/src/routes/userRoutes.js
- services/identity-partner/src/routes/partnerRoutes.js

**Action:**
Apply verifyToken and requireRole middleware to routes:

Tour Catalog Service:
- POST /api/tours: verifyToken, requireRole('partner', 'admin')
- PUT /api/tours/:id: verifyToken, requireRole('partner', 'admin')
- DELETE /api/tours/:id: verifyToken, requireRole('admin')
- PUT /api/tours/review/:tour_id: verifyToken, requireRole('admin')
- GET /api/tours/admin/all: verifyToken, requireRole('admin')
- POST /api/categories: verifyToken, requireRole('admin')
- DELETE /api/categories/:id: verifyToken, requireRole('admin')
- GET /api/tours: public (no auth)
- GET /api/tours/:id: public (no auth)
- GET /api/regions: public (no auth)

Booking Billing Service:
- POST /api/bookings: verifyToken (any authenticated user)
- GET /api/bookings/user/:user_id: verifyToken (own bookings only)
- DELETE /api/bookings/:id: verifyToken
- POST /api/payments: verifyToken
- GET /api/payments: verifyToken, requireRole('admin')
- GET /api/invoices: verifyToken, requireRole('admin')

Identity Partner Service:
- GET /api/users: verifyToken, requireRole('admin')
- PUT /api/users/:id/role: verifyToken, requireRole('admin')
- DELETE /api/users/:id: verifyToken, requireRole('admin')
- PUT /api/partners/:id/approve: verifyToken, requireRole('admin')
- DELETE /api/partners/:id: verifyToken, requireRole('admin')
- POST /api/auth/register: public
- POST /api/auth/login: public
- GET /api/users/:id: verifyToken (own profile)

**Acceptance criteria:**
- services/tour-catalog/src/routes/tourRoutes.js contains `verifyToken`
- services/tour-catalog/src/routes/tourRoutes.js contains `requireRole`
- services/booking-billing/src/routes/bookingRoutes.js contains `verifyToken`
- services/identity-partner/src/routes/userRoutes.js contains `requireRole('admin')`

### Task 4.3: Implement Saga Workflow (Booking to Payment)

**Read first:**
- services/booking-billing/src/controllers/bookingController.js
- services/booking-billing/src/controllers/paymentController.js
- services/tour-catalog/src/controllers/tourController.js

**Action:**
1. Design the Saga pattern for the booking flow:

Saga: Create Booking Flow (Orchestration-based)
- Step 1: Client calls POST /api/bookings with tour_id, user_id, num_people
- Step 2: Booking Service calls Tour Catalog Service GET /api/tours/:tour_id to verify tour exists and get price
- Step 3: Booking Service creates booking record with status=pending
- Step 4: Client calls POST /api/payments with booking_id and payment details
- Step 5: Payment Service creates payment record and updates booking status to confirmed
- Compensating action: If payment fails, Booking Service updates booking status to cancelled

2. Implement in bookingController.js createBooking:
```javascript
const axios = require('axios');

exports.createBooking = async (req, res) => {
  try {
    // Step 1: Verify tour exists via Tour Catalog Service
    const tourResponse = await axios.get(
      `${process.env.TOUR_CATALOG_URL}/api/tours/${req.body.tour_id}`
    );
    const tour = tourResponse.data;
    
    // Step 2: Calculate total and create booking
    const totalPrice = tour.price * req.body.num_people;
    const booking = {
      user_id: req.user.user_id, // from JWT
      tour_id: req.body.tour_id,
      tour_title: tour.title, // denormalized
      num_people: req.body.num_people,
      total_price: totalPrice,
      booking_date: req.body.booking_date,
      status: 'pending',
      full_name: req.body.full_name,
      email: req.body.email,
      phone: req.body.phone
    };
    
    const [result] = await db.execute(
      'INSERT INTO bookings SET ?', [booking]
    );
    
    res.status(201).json({
      success: true,
      data: { booking_id: result.insertId, ...booking }
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
```

3. Document saga in docs/saga-workflow.md with:
   - Sequence diagram (Mermaid or draw.io)
   - Step descriptions
   - Compensating transactions
   - Failure scenarios

**Acceptance criteria:**
- services/booking-billing/src/controllers/bookingController.js contains `axios.get`
- services/booking-billing/src/controllers/bookingController.js contains `TOUR_CATALOG_URL`
- services/booking-billing/src/controllers/bookingController.js contains `tour_title: tour.title`
- docs/saga-workflow.md contains `Compensating` (compensating transaction)
- docs/saga-workflow.md contains `Step 1` and `Step 2`

### Task 4.4: Optional Async Notification (SQS/SNS)

**Read first:**
- AWS SQS/SNS documentation

**Action:**
If team has remaining budget and time:
1. Create SNS topic: agritour-booking-notifications
2. After payment confirmation in paymentController.js, publish message to SNS:
   ```javascript
   const AWS = require('aws-sdk');
   const sns = new AWS.SNS();
   
   await sns.publish({
     TopicArn: process.env.SNS_TOPIC_ARN,
     Message: JSON.stringify({
       event: 'booking_confirmed',
       booking_id: bookingId,
       user_email: booking.email
     })
   }).promise();
   ```
3. Document the flow in docs/saga-workflow.md

If not implementing, document the design decision and include it in the technical report as a designed-but-deferred extension.

**Acceptance criteria:**
- Either: SNS topic created AND paymentController.js contains `sns.publish`
- Or: docs/saga-workflow.md contains section about async notification design

### Task 4.5: Integration Smoke Tests

**Action:**
Create test scripts for critical flows:

1. services/tour-catalog/tests/smoke.sh:
```bash
#!/bin/bash
BASE_URL=${1:-http://localhost:3001}
echo "Testing Tour Catalog Service..."
curl -s $BASE_URL/health | grep -q "healthy" && echo "PASS: health" || echo "FAIL: health"
curl -s $BASE_URL/api/tours | grep -q "tour" && echo "PASS: list tours" || echo "FAIL: list tours"
curl -s $BASE_URL/api/categories | grep -q "category" && echo "PASS: list categories" || echo "FAIL: list categories"
```

2. Similar for booking-billing and identity-partner
3. Integration test script: infra/test-integration.sh that tests cross-service flow

**Acceptance criteria:**
- services/tour-catalog/tests/smoke.sh exists and is executable
- infra/test-integration.sh exists

## Verification

- [ ] JWT login returns token from identity-partner service
- [ ] Protected routes reject requests without token (401)
- [ ] Protected admin routes reject non-admin tokens (403)
- [ ] Booking creation calls Tour Catalog API to verify tour
- [ ] Saga workflow documented in docs/saga-workflow.md
- [ ] Smoke tests pass against running services
