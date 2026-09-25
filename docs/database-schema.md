# Database Schema Documentation

## Primary MongoDB Collections & Indexes

### 1. `users`
- Fields: `email` (unique index), `passwordHash`, `role` (index), `name`, `phone` (index), `isVerified`, `mfaEnabled`.
- Relationships: 1-to-1 with `patientprofiles` or `physicianprofiles`.

### 2. `tests`
- Fields: `code` (unique index), `name` (text index), `categoryId` (ref `TestCategory`), `price` (index), `sampleType`, `turnaroundHours`, `fastingRequired`, `homeCollectionAvailable`.

### 3. `availabilityslots`
- Fields: `centerId`, `date`, `startTime`, `endTime`, `totalCapacity`, `bookedCount`, `homeCollectionCapacity`, `homeBookedCount`.
- Compound Index: `{ centerId: 1, date: 1, startTime: 1 }` (unique constraint preventing double booking).

### 4. `bookings`
- Fields: `bookingId` (HB-2026-XXXXXX, unique index), `patientId` (index), `testIds`, `centerId`, `serviceMode`, `appointmentDate` (index), `timeSlot`, `payableAmount`, `paymentStatus`, `bookingStatus`.

### 5. `diagnosticjourneys`
- Fields: `bookingId` (unique ref), `currentStage`, `stages` array (`[{ stage, title, status, timestamp, department, notes }]`).

### 6. `reports`
- Fields: `reportId` (unique index), `bookingId`, `patientId` (index), `testId`, `collectionDate`, `reportDate` (index), `parameters` (`[{ parameterName, resultValue, unit, referenceRange, status }]`), `status`.

### 7. `auditlogs`
- Fields: `userId` (index), `userEmail`, `role`, `action` (index), `resourceType` (index), `ipAddress`, `status`, `timestamp` (index).
