# Local Test Flow

## Scope

This runbook is for the current implementation only:

- Supported now: `tour-catalog` and `booking-billing`
- Not ready yet: `identity-partner`, JWT login, RBAC-protected flows

## Why This Flow

- It validates the 2 services that already exist.
- It proves the current service-to-service path from Booking Billing to Tour Catalog.
- It does not depend on unfinished auth work.

## Prerequisites

- Docker Desktop is running.
- Ports `3001`, `3002`, `3307`, and `3308` are free.
- Run commands from the repository root: `D:\2026\SOA\AgriTour`

## Start The Stack

```powershell
docker compose -f infra/docker-compose.yml up -d --build --force-recreate
```

## Health Checks

```powershell
Invoke-RestMethod http://localhost:3001/health
Invoke-RestMethod http://localhost:3002/health
```

Expected result:

- Tour Catalog returns `status = healthy`
- Booking Billing returns `status = healthy`

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

- JWT issuance
- RBAC enforcement
- Partner approval flow
- AWS deployment behavior

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
