# Frontend Migration Guide

## Short Answer

Yes. The frontend should be migrated gradually from the old backend path to the new microservices instead of waiting until the very end.

## Why This Matters Now

- The final project must have 3 independent services.
- The frontend currently uses one shared `VITE_API_URL`, so it still assumes a monolithic API shape.
- If the frontend stays coupled to the old backend too long, Phase 4, Phase 5, and the final demo will all get blocked at once.

## Current Situation

- Tour reads already fit Service A well.
- Booking writes and user booking reads belong to Service B.
- Login, registration, user, and partner flows must move to Service C once `identity-partner` is implemented.

## Recommended Migration Strategy

### Rule 1

Stop treating the frontend as a client of `backend/`. Treat it as a client of service contracts.

### Rule 2

During local development, either:

- use one Vite proxy entry point like `/api/...`, or
- use separate environment variables for each service.

### Rule 3

In AWS production, prefer one public API base through the ALB and let path-based routing forward to each service.

## Best Target Shape

### Local development

- `VITE_TOUR_API_URL=http://localhost:3001/api`
- `VITE_BOOKING_API_URL=http://localhost:3002/api`
- `VITE_IDENTITY_API_URL=http://localhost:3003/api`

### AWS deployment

- `VITE_API_URL=http://<alb-dns>/api`

With ALB routing, the frontend can keep calling:

- `/api/tours...`
- `/api/bookings...`
- `/api/auth...`

and the ALB decides which service receives the request.

## Practical Migration Order

### Wave 1: Tour Catalog first

Move these screens fully to Service A:

- `src/pages/Tour/Tour.jsx`
- `src/pages/Tour/TourDetail.jsx`
- `src/pages/Booking/BookPage.jsx`
- partner/admin tour list screens that only read tour data

### Wave 2: Booking Billing next

Move these screens to Service B:

- `src/pages/Booking/ConfirmBookingPage.jsx`
- `src/pages/User/UserPanel.jsx`
- any payment and invoice follow-up screens

### Wave 3: Identity Partner last but mandatory

Move these screens to Service C:

- `src/components/LoginPopup/LoginPopup.jsx`
- partner management screens
- admin user and partner approval screens

## Refactor Rule For FE Code

Do not keep inline `fetch` calls scattered forever.

Create a thin API layer later under a folder such as:

- `src/services/tourApi.js`
- `src/services/bookingApi.js`
- `src/services/identityApi.js`

That keeps the page components stable even when the backend host layout changes.

## What To Do Immediately

1. Keep Tour and Booking pages pointed to Service A and Service B, not `backend/`.
2. Do not wait for Service C before moving public tour and booking flows.
3. Once Service C exists, migrate login and role-based screens next.
4. Before AWS cutover, replace any hardcoded local URLs with ALB-based env values.

## Important Constraint

Because your teacher requires 3 services for the final version you described, frontend auth and partner-facing paths cannot stay on the monolith in the submitted architecture. Even if you test 2 services first, the final FE must stop depending on the old backend.