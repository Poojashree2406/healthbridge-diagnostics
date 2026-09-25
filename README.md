# HealthBridge Diagnostics Platform

> **"Your Complete Diagnostic Journey, Connected."**

HealthBridge Diagnostics is an enterprise-grade Digital Healthcare Diagnostic Management Platform built using the **MERN Stack** (MongoDB, Express, React, Node.js) with **TypeScript**.

---

## 🌟 Key Features

1. **Test Discovery & Search**: 30+ pathology and radiology tests with category filters, preparation instructions, fasting flags, and turnaround times.
2. **Multi-Step Booking Wizard**: Seamless 8-step wizard supporting Diagnostic Center visits and Home Sample Collection.
3. **Real-Time Slot Capacity**: Server-side slot locking algorithm preventing double booking.
4. **Mock Payment & Invoicing**: Integrated mock payment gateway (Razorpay/Stripe architecture) generating instant GST invoices.
5. **10-Stage Diagnostic Journey Tracker**: Interactive live timeline tracking booking, sample collection, lab processing, quality control, doctor review, and result delivery.
6. **Medical Report Viewer**: Professional medical report template displaying parameter tables with status flags (NORMAL, HIGH, LOW, CRITICAL).
7. **Secure Temporary Report Sharing**: Generate time-limited share links (1h, 24h, 7d) for referring physicians.
8. **Health Trend Analytics**: Interactive Recharts visualization tracking historical parameters (HbA1c, Fasting Blood Sugar, Hemoglobin, Cholesterol, Vitamin D).
9. **Multi-Role Workspaces**:
   - **Patient Dashboard**: Active journey widget, upcoming appointments, reports, health trends.
   - **Lab Technician Dashboard**: Sample collection queue, barcode tracking, journey stage updates.
   - **Doctor Portal**: Authorized patient records review & report sign-off.
   - **Admin Control Panel**: Analytics metrics, user directory, security audit logs (HIPAA & DPDP compliance).

---

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion, date-fns, TanStack Query, Axios, React Hook Form, Zod
- **Backend**: Node.js, Express.js, TypeScript, Mongoose, JWT, bcryptjs, Helmet, CORS, Express Rate Limit, Swagger OpenAPI
- **Database**: MongoDB / MongoDB Atlas
- **Architecture**: Modular Monolith Monorepo (`client/`, `server/`, `shared/`, `docs/`, `docker/`)

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Patient** | `patient@example.com` | `Password123!` |
| **Lab Technician** | `lab@example.com` | `Password123!` |
| **Physician / Doctor** | `doctor@example.com` | `Password123!` |
| **Admin** | `admin@example.com` | `Password123!` |

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas connection URI

### Installation & Launch

```bash
# 1. Install workspace dependencies
npm install

# 2. Build shared library types
npm run build:shared

# 3. Seed MongoDB with realistic demo data
npm run seed

# 4. Start backend server (Port 5000)
npm run dev:server

# 5. In a new terminal, start Vite frontend (Port 5173)
npm run dev:client
```

Open your browser at `http://localhost:5173` to experience the platform.
Swagger API Documentation is available at `http://localhost:5000/api-docs`.

---

## 🐳 Docker Support

To run the full stack containerized with MongoDB:

```bash
docker-compose up --build -d
```
