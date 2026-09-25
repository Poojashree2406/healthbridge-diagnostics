import { z } from 'zod';

// Roles
export const UserRole = {
  PATIENT: 'PATIENT',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  RADIOLOGIST: 'RADIOLOGIST',
  PHYSICIAN: 'PHYSICIAN',
  ADMIN: 'ADMIN'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

// Service Modes
export const ServiceMode = {
  DIAGNOSTIC_CENTER: 'DIAGNOSTIC_CENTER',
  HOME_COLLECTION: 'HOME_COLLECTION'
} as const;
export type ServiceMode = typeof ServiceMode[keyof typeof ServiceMode];

// Booking Statuses
export const BookingStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;
export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

// Appointment Statuses
export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const;
export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

// Payment Statuses
export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

// Sample Statuses
export const SampleStatus = {
  PENDING: 'PENDING',
  COLLECTED: 'COLLECTED',
  RECEIVED_AT_LAB: 'RECEIVED_AT_LAB',
  PROCESSING: 'PROCESSING',
  REJECTED: 'REJECTED'
} as const;
export type SampleStatus = typeof SampleStatus[keyof typeof SampleStatus];

// Diagnostic Journey Stages (10 Stages)
export const DiagnosticStage = {
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  APPOINTMENT_SCHEDULED: 'APPOINTMENT_SCHEDULED',
  PATIENT_CHECK_IN: 'PATIENT_CHECK_IN',
  SAMPLE_COLLECTION: 'SAMPLE_COLLECTION',
  SAMPLE_RECEIVED: 'SAMPLE_RECEIVED',
  LAB_PROCESSING: 'LAB_PROCESSING',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  REPORT_GENERATION: 'REPORT_GENERATION',
  PHYSICIAN_REVIEW: 'PHYSICIAN_REVIEW',
  RESULT_DELIVERED: 'RESULT_DELIVERED'
} as const;
export type DiagnosticStage = typeof DiagnosticStage[keyof typeof DiagnosticStage];

// Report Parameter Result Statuses
export const ResultStatus = {
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  LOW: 'LOW',
  CRITICAL: 'CRITICAL'
} as const;
export type ResultStatus = typeof ResultStatus[keyof typeof ResultStatus];

// Report Statuses
export const ReportStatus = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED'
} as const;
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

// Insurance Claim Statuses
export const InsuranceClaimStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  PROCESSING: 'PROCESSING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PARTIALLY_APPROVED: 'PARTIALLY_APPROVED'
} as const;
export type InsuranceClaimStatus = typeof InsuranceClaimStatus[keyof typeof InsuranceClaimStatus];

// Data Interfaces
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  name: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPatientProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalHistory?: string[];
  insuranceProvider?: string;
  policyNumber?: string;
}

export interface ITestCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export interface ITest {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  measures: string;
  whyPerformed: string;
  preparationInstructions: string;
  fastingRequired: boolean;
  sampleType: string;
  turnaroundHours: number;
  price: number;
  homeCollectionAvailable: boolean;
  active: boolean;
  rating: number;
  faqs?: Array<{ question: string; answer: string }>;
}

export interface ITestPackage {
  id: string;
  code: string;
  name: string;
  description: string;
  testIds: string[];
  tests?: ITest[];
  price: number;
  discountPercent: number;
  active: boolean;
}

export interface IDiagnosticCenter {
  id: string;
  labId: string;
  labName?: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  phone: string;
  operatingHours: string;
  rating: number;
  homeCollectionAvailable: boolean;
  maxSlotsPerTime: number;
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IAvailabilitySlot {
  id: string;
  centerId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedCount: number;
  homeCollectionCapacity: number;
  homeBookedCount: number;
  isAvailable: boolean;
}

export interface IBooking {
  id: string;
  bookingId: string;
  patientId: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  testIds: string[];
  tests?: ITest[];
  packageId?: string;
  centerId: string;
  centerName?: string;
  serviceMode: ServiceMode;
  collectionAddress?: string;
  appointmentDate: string;
  timeSlot: string;
  subtotalAmount: number;
  collectionFee: number;
  discountAmount: number;
  payableAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  createdAt: string;
}

export interface IDiagnosticJourneyStage {
  stage: DiagnosticStage;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  timestamp?: string;
  department: string;
  notes?: string;
}

export interface IDiagnosticJourney {
  id: string;
  bookingId: string;
  currentStage: DiagnosticStage;
  stages: IDiagnosticJourneyStage[];
  updatedAt: string;
}

export interface ILabResultParameter {
  parameterName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  status: ResultStatus;
}

export interface IReport {
  id: string;
  reportId: string;
  bookingId: string;
  patientId: string;
  patientName?: string;
  testId: string;
  testName?: string;
  collectionDate: string;
  reportDate: string;
  parameters: ILabResultParameter[];
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  pdfFileKey?: string;
  summaryNotes?: string;
}

export interface IHealthTrendPoint {
  date: string;
  parameterName: string;
  value: number;
  unit: string;
  referenceMin?: number;
  referenceMax?: number;
  status: ResultStatus;
}

export interface IFeedback {
  id: string;
  bookingId: string;
  patientId: string;
  patientName: string;
  centerId: string;
  rating: number;
  category: string;
  comments: string;
  createdAt: string;
}

export interface IAuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  role: UserRole;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  timestamp: string;
}

// Zod Validation Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([UserRole.PATIENT, UserRole.LAB_TECHNICIAN, UserRole.RADIOLOGIST, UserRole.PHYSICIAN, UserRole.ADMIN]).default(UserRole.PATIENT),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const createBookingSchema = z.object({
  testIds: z.array(z.string()).min(1, 'At least one test must be selected'),
  packageId: z.string().optional(),
  centerId: z.string().min(1, 'Diagnostic center is required'),
  serviceMode: z.enum([ServiceMode.DIAGNOSTIC_CENTER, ServiceMode.HOME_COLLECTION]),
  collectionAddress: z.string().optional(),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  patientDetails: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email(),
    age: z.number().min(1).max(120),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'])
  })
});

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1),
  paymentMethod: z.enum(['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET', 'INSURANCE']),
  amount: z.number().positive()
});

export const updateJourneyStageSchema = z.object({
  bookingId: z.string().min(1),
  stage: z.enum([
    DiagnosticStage.BOOKING_CONFIRMED,
    DiagnosticStage.APPOINTMENT_SCHEDULED,
    DiagnosticStage.PATIENT_CHECK_IN,
    DiagnosticStage.SAMPLE_COLLECTION,
    DiagnosticStage.SAMPLE_RECEIVED,
    DiagnosticStage.LAB_PROCESSING,
    DiagnosticStage.QUALITY_REVIEW,
    DiagnosticStage.REPORT_GENERATION,
    DiagnosticStage.PHYSICIAN_REVIEW,
    DiagnosticStage.RESULT_DELIVERED
  ]),
  notes: z.string().optional()
});

export const submitFeedbackSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  category: z.string().min(1),
  comments: z.string().min(3)
});
