# HealthBridge Diagnostics Architecture Document

## System Overview
HealthBridge Diagnostics is designed as a **Modular Monolith Monorepo**, structured for future extraction into independent microservices.

```
Patient Web / Mobile (React + Vite + Tailwind)
                     │
              ( REST APIs / JWT )
                     ▼
         [ Express API Gateway / Server ]
  ┌────────────────────────────────────────────────────────┐
  │ Auth & RBAC Service | Test Catalog | Booking & Slots  │
  │ Diagnostic Journey  | Report Svc   | Payment & Invoice │
  └────────────────────────────────────────────────────────┘
            │                │                 │
            ▼                ▼                 ▼
      [ MongoDB Atlas ] [ Secure File Key ] [ Mock Adapters ]
      (Mongoose Models) (Short-lived URL)  (Razorpay, LIS)
```

## Microservice Decomposition Plan
Each backend directory under `server/src/controllers` corresponds to a logical bounded context:
1. **API Gateway & Auth Service**: Handles JWT issuance, rate limiting, and RBAC enforcement.
2. **Test & Lab Catalog Service**: Manages tests, categories, packages, and centers.
3. **Availability & Scheduling Service**: Manages date/slot locks and technician capacity.
4. **Booking & Journey Tracking Service**: Manages booking state machine and 10-stage timeline.
5. **Report & Analytics Service**: Handles medical parameters, reference range status flags, and PDF stream generation.
6. **Payment & Invoice Service**: Interfaces with Razorpay/Stripe mock adapters and generates GST invoices.
7. **Audit & Compliance Service**: Records all sensitive actions into a immutable audit log.
