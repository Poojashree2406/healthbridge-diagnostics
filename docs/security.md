# Security & Compliance Checklist

- [x] **Password Hashing**: Salted bcrypt hashing with 10 work factor rounds.
- [x] **JWT Security**: HTTP-only cookies and Bearer token authorization header with expiration.
- [x] **RBAC Enforcement**: Server-side role checks (`PATIENT`, `LAB_TECHNICIAN`, `RADIOLOGIST`, `PHYSICIAN`, `ADMIN`).
- [x] **Input Validation**: Zod runtime schema validation on all incoming API payloads.
- [x] **Rate Limiting**: Express Rate Limiting (300 requests/15m general, 30 login attempts/15m).
- [x] **Security Headers**: Helmet integration enabling protective security headers.
- [x] **Audit Logging**: Immutable tracking of sensitive actions (`REPORT_VIEW`, `REPORT_DOWNLOAD`, `REPORT_SHARE`, `PAYMENT_CREATE`).
- [x] **Data Isolation**: Patients can only access reports linked directly to their `userId` or validated temporary share token.
- [x] **Temporary Report Sharing**: Time-limited share tokens with configurable expiration (1h, 24h, 7d).
- [x] **Consent Controls**: DPDP / HIPAA patient consent toggles for data processing and physician sharing.
