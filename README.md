# 🌾 AgriTour – From Farm to Soul
Connecting People with Nature, Culture, and Local Farmers.

---

## 📋 Project Status: SOA Migration

This project is being migrated from a monolithic architecture to **microservices** deployed on **AWS**.

### Target Architecture
```
Client → S3 (Frontend) → ALB → ECS Fargate (3 Services) → RDS MySQL
```

### 3 Microservices
| Service | Scope | Port | Owner |
|---------|-------|------|-------|
| Tour Catalog | Tours, categories, regions | 3001 | Group A |
| Booking Billing | Bookings, payments, invoices | 3002 | Group C |
| Identity Partner | Auth, users, partners | 3003 | Group B |

### AWS Services Used
Docker, Amazon ECR, Amazon ECS Fargate, Application Load Balancer, Amazon RDS, CloudWatch, CodePipeline/CodeDeploy

### Planning Documents
See `.planning/` directory for:
- `ROADMAP.md` — 6 execution phases
- `REQUIREMENTS.md` — 16 tracked requirements
- `GROUP_TASK_PLAN_145337.md` — team execution contract
- `phases/` — detailed PLAN.md for each phase
- `codebase/MICROSERVICES-STRUCTURE.md` — target directory structure

---

## 🌿 Introduction

AgriTour is a Vietnamese agritourism platform that connects local farmers with travelers seeking authentic, nature-rich experiences.
Customers can explore real farm life, participate in hands-on activities, and enjoy peaceful countryside environments — all hosted and managed directly by farmers.

The platform includes:
- A **ReactJS frontend** (to be deployed on S3)
- **3 Node.js/Express microservices** (deployed on ECS Fargate)
- A **MySQL database** on Amazon RDS (3 logical databases)

---

## ✨ Features Overview

### 🌱 Farmer–Customer Connection
Digital bridge between local Vietnamese farmers and customers seeking nature-based experiences.

### 👨‍🌾 Partner Features
- Create, edit, delete farm experience tours
- Manage customer bookings
- Update pricing, schedules, available slots

### 🧍‍♂️ Customer Features
- Explore tours across different regions
- View detailed information: images, activities, price, availability
- Choose tickets and make bookings

### 🛡️ Admin Features
- Approve tour packages submitted by farmers
- Manage all partners, tours, customers, and bookings

### 🤖 AI Chatbot – Smart Tour Assistant
AI-powered chatbot helping customers find suitable tours based on date, location, budget, and preferences.

---

## 🛠 Tech Stack

### Frontend
- ReactJS, React Router, Context API, CSS

### Backend (Microservices)
- Node.js, Express.js, MySQL (mysql2), JWT Authentication, Swagger

### Infrastructure
- Docker, Amazon ECR, Amazon ECS Fargate
- Application Load Balancer, Amazon RDS MySQL
- Amazon S3, CloudWatch, CodePipeline

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 20+
- Docker and Docker Compose

### Quick Start (Docker)
```bash
# Clone the repository
git clone <repo-url>
cd AgriTour

# Start all services with Docker Compose
docker compose -f infra/docker-compose.yml up -d --build

# Services will be available at:
# Tour Catalog:     http://localhost:3001
# Booking Billing:  http://localhost:3002
# Identity Partner: http://localhost:3003
```

Seeded local test accounts:

- `admin@example.com` / `admin123`
- `partner@example.com` / `partner123`
- `customer@example.com` / `customer123`

### Manual Start (Development)
```bash
# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev

# Each service (in separate terminals)
cd services/tour-catalog
cp .env.example .env
npm install
node server.js
```

For local frontend testing, copy `frontend/.env.example` to `frontend/.env` so the app points at `localhost:3001`, `localhost:3002`, and `localhost:3003`.

### Environment Variables
Copy `.env.example` to `.env` in each service directory and configure:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `JWT_SECRET`
- `PORT`

---

## 📁 Project Structure

```
AgriTour/
├── services/                    # Microservices
│   ├── tour-catalog/            # Service A (Port 3001)
│   ├── booking-billing/         # Service B (Port 3002)
│   └── identity-partner/       # Service C (Port 3003)
├── frontend/                    # React SPA
├── shared/                      # API contracts and DB schemas
├── infra/                       # Docker Compose, ECS task defs, IAM
├── docs/                        # Report, architecture diagram
└── .planning/                   # Project planning docs
```

See `.planning/codebase/MICROSERVICES-STRUCTURE.md` for full details.

---