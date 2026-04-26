# Local Test Flow

## Scope

This runbook is for the current 3-service local integration:

- `tour-catalog`
- `booking-billing`
- `identity-partner`
- frontend pointing to the 3 local service URLs from `frontend/.env.example`

## Why This Flow

- It validates the full local service split before AWS work.
- It proves login/token issuance from Service C.
- It proves the current service-to-service path from Booking Billing to Tour Catalog.
- It gives seeded accounts for admin, partner, and customer smoke tests.

## Prerequisites

- Docker Desktop is running.
- Ports `3001`, `3002`, `3003`, `3307`, `3308`, and `3309` are free.
- Run commands from the repository root: `D:\2026\SOA\AgriTour`

If `docker compose` fails with `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`, start Docker Desktop first and wait until the engine is ready.

## Start The Stack

```powershell
docker compose -f infra/docker-compose.yml up -d --build --force-recreate
```

## Health Checks

```powershell
Invoke-RestMethod http://localhost:3001/health
Invoke-RestMethod http://localhost:3002/health
Invoke-RestMethod http://localhost:3003/health
```

Expected result:

- Tour Catalog returns `status = healthy`
- Booking Billing returns `status = healthy`
- Identity Partner returns `status = UP`

## Seeded Identity Accounts

The local identity schema seeds three users:

- `admin@example.com` / `admin123`
- `partner@example.com` / `partner123`
- `customer@example.com` / `customer123`

## Login And Token Smoke Test

```powershell
$loginBody = @{
  email = "admin@example.com"
  password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Method Post -Uri http://localhost:3003/api/auth/login -ContentType "application/json" -Body $loginBody
$loginResponse
```

Expected result:

- Response contains `token`
- Response contains `user.role = admin`

## RBAC Smoke Test

```powershell
$headers = @{ Authorization = "Bearer $($loginResponse.token)" }
Invoke-RestMethod -Headers $headers -Uri http://localhost:3003/api/users
```

Expected result:

- Admin token can read `/api/users`
- Requests without a token return `401`

## Validate Tour Catalog Data

The catalog schema already seeds sample tours.

```powershell
Invoke-RestMethod http://localhost:3001/api/tours
Invoke-RestMethod http://localhost:3001/api/tours/9
Invoke-RestMethod http://localhost:3001/api/categories
Invoke-RestMethod http://localhost:3001/api/regions
```

Expected result:

- `/api/tours` returns approved tours
- `/api/tours/9` returns seeded tour details including `price`

## Create A Booking Through Service B

```powershell
$bookingBody = @{
  user_id = 101
  tour_id = 9
  num_people = 2
  customer_name = "Local Tester"
  email = "tester@example.com"
  phone = "0900000000"
  payment_method = "cash"
} | ConvertTo-Json

$createdBooking = Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/bookings -ContentType "application/json" -Body $bookingBody
$createdBooking
```

Expected result:

- Response contains `booking_id`
- Response contains `tour_source = service-a`

## Read The Booking Back

```powershell
Invoke-RestMethod http://localhost:3002/api/bookings/user/101
```

Expected result:

- The created booking appears with `status = pending`
- `tour_title` and `tour_unit_price` are stored in the booking database

## Confirm Payment

```powershell
$paymentBody = @{
  booking_id = $createdBooking.booking_id
  amount = 100
  payment_method = "cash"
} | ConvertTo-Json

$createdPayment = Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/payments -ContentType "application/json" -Body $paymentBody
$createdPayment
```

Expected result:

- Response contains `payment_id`
- Booking status becomes `confirmed`

## Create Invoice

```powershell
$invoiceBody = @{
  booking_id = $createdBooking.booking_id
  payment_id = $createdPayment.payment_id
  total_amount = 100
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/invoices -ContentType "application/json" -Body $invoiceBody
```

## Fallback Test If Tour Lookup Fails

If Tour Catalog is unavailable or you want to isolate Booking Billing logic, use a request snapshot:

```powershell
$fallbackBookingBody = @{
  user_id = 202
  tour_id = 999
  num_people = 2
  total_price = 120
  customer_name = "Fallback Tester"
  email = "fallback@example.com"
  phone = "0911111111"
  tour_snapshot = @{
    tour_name = "Fallback Tour"
    price = 60
    start_date = "2026-05-01"
    end_date = "2026-05-03"
  }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/bookings -ContentType "application/json" -Body $fallbackBookingBody
```

Expected result:

- Booking is created even without a live upstream lookup
- `tour_source` returns `request-fallback`

## What This Flow Does Not Prove Yet

- AWS deployment behavior

It also does not replace browser-level frontend regression testing.

## Troubleshooting

### If Tour Catalog returns `{ "error": { "fatal": true } }`

That usually means you are still running an older `tour-catalog` image that used a single MySQL connection and got stuck after MySQL started late.

Run:

```powershell
docker compose -f infra/docker-compose.yml up -d --build --force-recreate tour-catalog
Invoke-RestMethod http://localhost:3001/api/tours/9
```

Expected result:

- The service logs show `API đang dùng database: agritour_catalog`
- `/api/tours/9` returns a real tour instead of a fatal DB error

## Stop The Stack

```powershell
docker compose -f infra/docker-compose.yml down -v
```
