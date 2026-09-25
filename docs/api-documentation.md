# HealthBridge REST API Specification

Interactive Swagger / OpenAPI UI is accessible at `/api-docs` on the running server instance.

## Key Endpoints

### Authentication
- `POST /api/v1/auth/register` - Patient or staff registration
- `POST /api/v1/auth/login` - Authenticate & obtain JWT
- `GET /api/v1/auth/me` - Fetch currently logged-in user profile
- `POST /api/v1/auth/logout` - Clear auth cookies

### Diagnostic Tests & Catalog
- `GET /api/v1/tests` - Search & filter catalog by category, price, fasting
- `GET /api/v1/tests/categories` - Fetch categories
- `GET /api/v1/tests/packages` - Fetch preventive health checkup packages
- `GET /api/v1/tests/:id` - Fetch test details & FAQs

### Booking & Slots
- `GET /api/v1/centers` - List diagnostic centers
- `GET /api/v1/availability` - Check real-time slot capacity
- `POST /api/v1/bookings` - Create booking & generate HB-2026-XXXXXX ID
- `GET /api/v1/bookings` - List patient/system bookings
- `POST /api/v1/bookings/:id/cancel` - Cancel booking & process refund

### Diagnostic Journey Tracker
- `GET /api/v1/journeys/:bookingId` - Fetch 10-stage live progress
- `PUT /api/v1/journeys/status` - Advance stage status

### Reports & Health Trends
- `GET /api/v1/reports` - List authorized reports
- `GET /api/v1/reports/:id` - View medical report parameters
- `GET /api/v1/reports/:id/download` - Stream PDF report
- `POST /api/v1/reports/:id/share` - Generate temporary share link with expiry
- `GET /api/v1/reports/trends` - Historical health parameters for charting

### Payments & Invoices
- `POST /api/v1/payments/create` - Process payment via mock gateway
- `GET /api/v1/payments` - Transaction history & GST receipts
