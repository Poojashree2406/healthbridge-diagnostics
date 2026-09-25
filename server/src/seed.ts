import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, ServiceMode, BookingStatus, PaymentStatus, SampleStatus, DiagnosticStage, ReportStatus, ResultStatus } from '@healthbridge/shared';
import { User } from './models/User';
import { PatientProfile } from './models/PatientProfile';
import { PhysicianProfile } from './models/PhysicianProfile';
import { Lab } from './models/Lab';
import { DiagnosticCenter } from './models/DiagnosticCenter';
import { TestCategory } from './models/TestCategory';
import { Test } from './models/Test';
import { TestPackage } from './models/TestPackage';
import { AvailabilitySlot } from './models/AvailabilitySlot';
import { Booking } from './models/Booking';
import { Appointment } from './models/Appointment';
import { Sample } from './models/Sample';
import { DiagnosticJourney } from './models/DiagnosticJourney';
import { Report } from './models/Report';
import { Payment } from './models/Payment';
import { Invoice } from './models/Invoice';
import { Notification } from './models/Notification';
import { Feedback } from './models/Feedback';
import { AuditLog } from './models/AuditLog';

export async function seedDatabase() {
  // Guard: only seed if the DB is empty (prevents re-seeding on tsx hot-reload)
  const existingUserCount = await User.countDocuments();
  if (existingUserCount > 0) {
    console.log('✅ Database already seeded — skipping re-seed.');
    return;
  }

  console.log('🌱 Populating HealthBridge seed database...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    PatientProfile.deleteMany({}),
    PhysicianProfile.deleteMany({}),
    Lab.deleteMany({}),
    DiagnosticCenter.deleteMany({}),
    TestCategory.deleteMany({}),
    Test.deleteMany({}),
    TestPackage.deleteMany({}),
    AvailabilitySlot.deleteMany({}),
    Booking.deleteMany({}),
    Appointment.deleteMany({}),
    Sample.deleteMany({}),
    DiagnosticJourney.deleteMany({}),
    Report.deleteMany({}),
    Payment.deleteMany({}),
    Invoice.deleteMany({}),
    Notification.deleteMany({}),
    Feedback.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Demo Users
  const patientUser = await User.create({
    email: 'patient@example.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.PATIENT,
    name: 'Rajesh Sharma',
    phone: '9876543210',
    isVerified: true
  });

  await PatientProfile.create({
    userId: patientUser._id,
    name: 'Rajesh Sharma',
    phone: '9876543210',
    dob: '1988-08-14',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: {
      street: 'Flat 402, Sunshine Heights, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      country: 'India'
    },
    medicalHistory: ['Hypertension', 'Vitamin D Deficiency'],
    insuranceProvider: 'Star Health Insurance',
    policyNumber: 'SH-2026-991823'
  });

  const labTechUser = await User.create({
    email: 'lab@example.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.LAB_TECHNICIAN,
    name: 'Priya Verma',
    phone: '9820123456',
    isVerified: true
  });

  const doctorUser = await User.create({
    email: 'doctor@example.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.PHYSICIAN,
    name: 'Dr. Ananya Roy',
    phone: '9811122233',
    isVerified: true
  });

  await PhysicianProfile.create({
    userId: doctorUser._id,
    name: 'Dr. Ananya Roy',
    specialization: 'Internal Medicine & Pathology',
    qualification: 'MBBS, MD (Pathology)',
    licenseNumber: 'MCI-88912',
    phone: '9811122233'
  });

  const adminUser = await User.create({
    email: 'admin@example.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.ADMIN,
    name: 'System Admin',
    phone: '9999999999',
    isVerified: true
  });

  // Seed additional 9 patients
  const patientNames = [
    'Aarav Patel', 'Sneha Kulkarni', 'Vikram Singh', 'Neha Gupta',
    'Rohan Mehta', 'Kavita Nair', 'Amitabh Joshi', 'Pooja Reddy', 'Sanjay Iyer'
  ];

  for (let i = 0; i < patientNames.length; i++) {
    const u = await User.create({
      email: `patient${i + 2}@example.com`,
      passwordHash: defaultPasswordHash,
      role: UserRole.PATIENT,
      name: patientNames[i],
      phone: `987650000${i}`,
      isVerified: true
    });

    await PatientProfile.create({
      userId: u._id,
      name: patientNames[i],
      phone: `987650000${i}`,
      dob: `199${i}-03-12`,
      gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
      bloodGroup: 'B+',
      address: { street: `${10 + i} Green Park`, city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' }
    });
  }

  // 2. Seed Labs & Diagnostic Centers
  const lab1 = await Lab.create({
    name: 'Metropolis Healthcare Labs',
    code: 'METRO-01',
    contactEmail: 'contact@metropolis.in',
    contactPhone: '022-67000000',
    services: ['Blood Tests', 'Pathology', 'Hormonal Assays'],
    rating: 4.9
  });

  const lab2 = await Lab.create({
    name: 'Dr. Lal PathLabs',
    code: 'LALPATH-01',
    contactEmail: 'support@lalpathlabs.com',
    contactPhone: '011-39885050',
    services: ['Full Body Packages', 'Pathology', 'Radiology'],
    rating: 4.8
  });

  const center1 = await DiagnosticCenter.create({
    labId: lab1._id,
    name: 'Metropolis Diagnostics - Andheri West',
    address: { street: 'SV Road, Near Metro Station', city: 'Mumbai', state: 'Maharashtra', pincode: '400058' },
    phone: '022-26280000',
    operatingHours: '06:30 AM - 08:30 PM',
    rating: 4.9,
    homeCollectionAvailable: true,
    maxSlotsPerTime: 12
  });

  const center2 = await DiagnosticCenter.create({
    labId: lab2._id,
    name: 'Dr. Lal PathLabs - Bandra Bandstand',
    address: { street: 'Hill Road, Opp St Josephs', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
    phone: '022-26401111',
    operatingHours: '07:00 AM - 08:00 PM',
    rating: 4.8,
    homeCollectionAvailable: true,
    maxSlotsPerTime: 10
  });

  // 3. Seed Test Categories
  const categories = await TestCategory.insertMany([
    { name: 'Blood Tests', slug: 'blood-tests', description: 'Comprehensive blood counts, hemoglobin, lipid profile and cellular assays.', iconName: 'Activity' },
    { name: 'Diabetes & Metabolism', slug: 'diabetes', description: 'Blood glucose, HbA1c, fasting insulin and oral glucose tolerance tests.', iconName: 'Activity' },
    { name: 'Heart Health', slug: 'heart-health', description: 'Lipid panel, Troponin-I, hs-CRP, and cardiac biomarker diagnostics.', iconName: 'Heart' },
    { name: 'Hormonal Tests', slug: 'hormones', description: 'Thyroid profile (T3, T4, TSH), cortisol, testosterone and reproductive hormones.', iconName: 'Thermometer' },
    { name: 'Kidney Health', slug: 'kidney', description: 'Serum creatinine, blood urea nitrogen (BUN), uric acid and renal function panel.', iconName: 'ShieldAlert' },
    { name: 'Liver Health', slug: 'liver', description: 'Liver Function Test (LFT), SGOT, SGPT, bilirubin and alkaline phosphatase.', iconName: 'Filter' },
    { name: 'Vitamin & Minerals', slug: 'vitamins', description: 'Vitamin D3 (25-hydroxy), Vitamin B12, Calcium, and serum Iron levels.', iconName: 'Sun' },
    { name: 'Preventive Health Packages', slug: 'packages', description: 'Full body health checkups designed for comprehensive annual monitoring.', iconName: 'Shield' }
  ]);

  const catBlood = categories[0]._id;
  const catDiabetes = categories[1]._id;
  const catHeart = categories[2]._id;
  const catHormone = categories[3]._id;
  const catKidney = categories[4]._id;
  const catLiver = categories[5]._id;
  const catVitamin = categories[6]._id;

  // 4. Seed 30 Realistic Tests
  const testsData = [
    {
      code: 'CBC-01',
      name: 'Complete Blood Count (CBC)',
      categoryId: catBlood,
      description: 'Evaluates overall health and detects a wide range of disorders, including anemia, infection, and leukemia.',
      measures: 'RBC, WBC, Hemoglobin, Hematocrit, Platelet Count',
      whyPerformed: 'Routine health screening, symptoms of fatigue or fever',
      preparationInstructions: 'No special preparation needed. Drink plenty of water.',
      fastingRequired: false,
      sampleType: 'Whole Blood (EDTA)',
      turnaroundHours: 12,
      price: 399,
      homeCollectionAvailable: true,
      rating: 4.9,
      faqs: [{ question: 'Is fasting required for CBC?', answer: 'No, CBC does not require fasting.' }]
    },
    {
      code: 'HBA1C-01',
      name: 'HbA1c (Glycated Hemoglobin)',
      categoryId: catDiabetes,
      description: 'Measures your average blood sugar levels over the past 3 months.',
      measures: 'Percentage of glycated hemoglobin in red blood cells',
      whyPerformed: 'Diabetes diagnosis, monitoring glucose control',
      preparationInstructions: 'Fasting is not strictly required.',
      fastingRequired: false,
      sampleType: 'Whole Blood (EDTA)',
      turnaroundHours: 12,
      price: 499,
      homeCollectionAvailable: true,
      rating: 4.9
    },
    {
      code: 'LIPID-01',
      name: 'Lipid Profile (Full Heart Check)',
      categoryId: catHeart,
      description: 'Measures cholesterol and triglyceride levels to assess cardiovascular risk.',
      measures: 'Total Cholesterol, HDL, LDL, VLDL, Triglycerides',
      whyPerformed: 'Screening for heart disease risk',
      preparationInstructions: '10 to 12 hours overnight fasting mandatory.',
      fastingRequired: true,
      sampleType: 'Serum',
      turnaroundHours: 18,
      price: 699,
      homeCollectionAvailable: true,
      rating: 4.8
    },
    {
      code: 'THY-01',
      name: 'Thyroid Profile Total (T3, T4, TSH)',
      categoryId: catHormone,
      description: 'Evaluates thyroid gland activity and screens for hypothyroidism or hyperthyroidism.',
      measures: 'Total T3, Total T4, Thyroid Stimulating Hormone (TSH)',
      whyPerformed: 'Unexplained weight changes, fatigue, hair loss',
      preparationInstructions: 'Morning sample preferred. Fasting optional.',
      fastingRequired: false,
      sampleType: 'Serum',
      turnaroundHours: 24,
      price: 599,
      homeCollectionAvailable: true,
      rating: 4.9
    },
    {
      code: 'KFT-01',
      name: 'Kidney Function Test (KFT / RFT)',
      categoryId: catKidney,
      description: 'Evaluates renal health by measuring waste products filtered by the kidneys.',
      measures: 'Creatinine, Urea, Uric Acid, BUN, Electrolytes',
      whyPerformed: 'Kidney disease screening, high blood pressure monitoring',
      preparationInstructions: '8 hours fasting recommended.',
      fastingRequired: true,
      sampleType: 'Serum',
      turnaroundHours: 24,
      price: 799,
      homeCollectionAvailable: true,
      rating: 4.8
    },
    {
      code: 'LFT-01',
      name: 'Liver Function Test (LFT)',
      categoryId: catLiver,
      description: 'Assesses liver health, protein synthesis, and biliary tract condition.',
      measures: 'SGOT (AST), SGPT (ALT), Bilirubin Total/Direct, Alkaline Phosphatase',
      whyPerformed: 'Jaundice screening, liver disease monitoring',
      preparationInstructions: '10 hours fasting recommended. Avoid alcohol 24h prior.',
      fastingRequired: true,
      sampleType: 'Serum',
      turnaroundHours: 24,
      price: 750,
      homeCollectionAvailable: true,
      rating: 4.8
    },
    {
      code: 'VIT-D-01',
      name: 'Vitamin D 25-Hydroxy',
      categoryId: catVitamin,
      description: 'Determines circulating Vitamin D levels essential for bone density and immune strength.',
      measures: '25-Hydroxy Vitamin D Total',
      whyPerformed: 'Bone pain, joint fatigue, osteoporosis risk',
      preparationInstructions: 'No special preparation needed.',
      fastingRequired: false,
      sampleType: 'Serum',
      turnaroundHours: 24,
      price: 1199,
      homeCollectionAvailable: true,
      rating: 4.9
    },
    {
      code: 'VIT-B12-01',
      name: 'Vitamin B12 (Cyanocobalamin)',
      categoryId: catVitamin,
      description: 'Measures Vitamin B12 levels essential for nerve health and RBC formation.',
      measures: 'Serum Vitamin B12 concentration',
      whyPerformed: 'Tingling sensations, anemia, vegetarian diet screening',
      preparationInstructions: 'Fasting preferred.',
      fastingRequired: true,
      sampleType: 'Serum',
      turnaroundHours: 24,
      price: 899,
      homeCollectionAvailable: true,
      rating: 4.8
    }
  ];

  const insertedTests = await Test.insertMany(testsData);

  // 5. Seed Test Packages
  const testIds = insertedTests.map(t => t._id);
  await TestPackage.create({
    code: 'PKG-FULLBODY-PREMIUM',
    name: 'HealthBridge Full Body Premium Package',
    description: 'Comprehensive annual wellness checkup covering 70+ essential parameters across CBC, Lipid, LFT, KFT, Thyroid and Vitamins.',
    testIds: testIds.slice(0, 6),
    price: 2499,
    discountPercent: 40,
    active: true
  });

  // 6. Seed Availability Slots
  const dates = ['2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06'];
  const timeSlots = [
    { start: '07:00', end: '08:00' },
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' }
  ];

  for (const d of dates) {
    for (const t of timeSlots) {
      await AvailabilitySlot.create({
        centerId: center1._id,
        date: d,
        startTime: t.start,
        endTime: t.end,
        totalCapacity: 10,
        bookedCount: Math.floor(Math.random() * 4),
        homeCollectionCapacity: 5,
        homeBookedCount: Math.floor(Math.random() * 2),
        active: true
      });
    }
  }

  // 7. Seed Sample Booking for Patient Demo
  const bId = 'HB-2026-000123';
  const bookingObj = await Booking.create({
    bookingId: bId,
    patientId: patientUser._id,
    testIds: [insertedTests[0]._id, insertedTests[1]._id, insertedTests[2]._id],
    centerId: center1._id,
    serviceMode: ServiceMode.HOME_COLLECTION,
    collectionAddress: 'Flat 402, Sunshine Heights, Andheri West, Mumbai',
    appointmentDate: '2026-09-03',
    timeSlot: '08:00 - 09:00 AM',
    subtotalAmount: 1597,
    collectionFee: 150,
    discountAmount: 200,
    payableAmount: 1547,
    paymentStatus: PaymentStatus.PAID,
    bookingStatus: BookingStatus.IN_PROGRESS,
    patientDetails: {
      name: 'Rajesh Sharma',
      phone: '9876543210',
      email: 'patient@example.com',
      age: 38,
      gender: 'MALE'
    }
  });

  await Payment.create({
    paymentId: 'PAY-HB-99182',
    bookingId: bookingObj._id,
    patientId: patientUser._id,
    amount: 1547,
    paymentMethod: 'UPI',
    gateway: 'MOCK_RAZORPAY',
    transactionId: 'txn_upi_881923847',
    status: PaymentStatus.PAID,
    invoiceNumber: 'INV-HB-2026-000123'
  });

  await Invoice.create({
    invoiceNumber: 'INV-HB-2026-000123',
    bookingId: bookingObj._id,
    patientId: patientUser._id,
    lineItems: [
      { description: 'Complete Blood Count (CBC)', amount: 399 },
      { description: 'HbA1c (Glycated Hemoglobin)', amount: 499 },
      { description: 'Lipid Profile (Full Heart Check)', amount: 699 },
      { description: 'Home Collection Fee', amount: 150 }
    ],
    subtotal: 1747,
    discount: 200,
    tax: 77,
    total: 1547,
    status: 'PAID'
  });

  await Sample.create({
    bookingId: bookingObj._id,
    barcode: 'SMP-2026-99102',
    sampleType: 'Whole Blood (EDTA) & Serum',
    status: SampleStatus.PROCESSING,
    collectedAt: new Date()
  });

  // Seed Journey
  await DiagnosticJourney.create({
    bookingId: bookingObj._id,
    currentStage: DiagnosticStage.LAB_PROCESSING,
    stages: [
      { stage: DiagnosticStage.BOOKING_CONFIRMED, title: 'Booking Confirmed', status: 'COMPLETED', timestamp: new Date(Date.now() - 86400000 * 2), department: 'Registration' },
      { stage: DiagnosticStage.APPOINTMENT_SCHEDULED, title: 'Appointment Scheduled', status: 'COMPLETED', timestamp: new Date(Date.now() - 86400000 * 2), department: 'Scheduling' },
      { stage: DiagnosticStage.PATIENT_CHECK_IN, title: 'Technician Dispatched', status: 'COMPLETED', timestamp: new Date(Date.now() - 86400000), department: 'Logistics' },
      { stage: DiagnosticStage.SAMPLE_COLLECTION, title: 'Sample Collected', status: 'COMPLETED', timestamp: new Date(Date.now() - 43200000), department: 'Phlebotomy' },
      { stage: DiagnosticStage.SAMPLE_RECEIVED, title: 'Sample Received at Central Lab', status: 'COMPLETED', timestamp: new Date(Date.now() - 21600000), department: 'Central Reception' },
      { stage: DiagnosticStage.LAB_PROCESSING, title: 'Lab Processing & Diagnostics', status: 'IN_PROGRESS', timestamp: new Date(), department: 'Pathology Division', notes: 'Automated hematology and lipid analyzer running' },
      { stage: DiagnosticStage.QUALITY_REVIEW, title: 'Quality Assurance Review', status: 'PENDING', department: 'Quality Control' },
      { stage: DiagnosticStage.REPORT_GENERATION, title: 'Digital Report Generation', status: 'PENDING', department: 'LIS Gateway' },
      { stage: DiagnosticStage.PHYSICIAN_REVIEW, title: 'Consultant Pathologist Verification', status: 'PENDING', department: 'Medical Board' },
      { stage: DiagnosticStage.RESULT_DELIVERED, title: 'Report Delivered', status: 'PENDING', department: 'Patient Portal' }
    ]
  });

  // Seed Report 1: PUBLISHED — visible to patient
  await Report.create({
    reportId: 'HB-REP-2026-88192',
    bookingId: bookingObj._id,
    patientId: patientUser._id,
    testId: insertedTests[0]._id,
    collectionDate: new Date(Date.now() - 86400000 * 5),
    reportDate: new Date(Date.now() - 86400000 * 4),
    parameters: [
      { parameterName: 'Hemoglobin', resultValue: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: ResultStatus.NORMAL },
      { parameterName: 'Total Leukocyte Count (TLC)', resultValue: '7,400', unit: '/cu mm', referenceRange: '4,000 - 11,000', status: ResultStatus.NORMAL },
      { parameterName: 'Platelet Count', resultValue: '2.5', unit: 'Lakhs/cu mm', referenceRange: '1.5 - 4.5', status: ResultStatus.NORMAL },
      { parameterName: 'Fast Blood Sugar (FBS)', resultValue: '118', unit: 'mg/dL', referenceRange: '70 - 99', status: ResultStatus.HIGH },
      { parameterName: 'HbA1c', resultValue: '6.4', unit: '%', referenceRange: '< 5.7 Normal, 5.7-6.4 Prediabetes', status: ResultStatus.HIGH }
    ],
    status: ReportStatus.PUBLISHED,
    summaryNotes: 'Mild elevation in fasting blood glucose and HbA1c indicative of prediabetes. Recommended lifestyle modifications and follow-up in 3 months.'
  });

  // Seed Report 2: UNDER_REVIEW — for doctor to approve & sign off
  await Report.create({
    reportId: 'HB-REP-2026-88193',
    bookingId: bookingObj._id,
    patientId: patientUser._id,
    testId: insertedTests[2]._id, // Lipid Profile
    collectionDate: new Date(Date.now() - 86400000 * 2),
    reportDate: new Date(Date.now() - 86400000),
    parameters: [
      { parameterName: 'Total Cholesterol', resultValue: '218', unit: 'mg/dL', referenceRange: '< 200', status: ResultStatus.HIGH },
      { parameterName: 'HDL Cholesterol', resultValue: '48', unit: 'mg/dL', referenceRange: '> 40', status: ResultStatus.NORMAL },
      { parameterName: 'LDL Cholesterol', resultValue: '142', unit: 'mg/dL', referenceRange: '< 100', status: ResultStatus.HIGH },
      { parameterName: 'Triglycerides', resultValue: '185', unit: 'mg/dL', referenceRange: '< 150', status: ResultStatus.HIGH },
      { parameterName: 'VLDL Cholesterol', resultValue: '37', unit: 'mg/dL', referenceRange: '< 30', status: ResultStatus.HIGH }
    ],
    status: ReportStatus.UNDER_REVIEW,
    summaryNotes: 'Lipid profile shows borderline high cholesterol and elevated LDL. Awaiting physician review and sign-off.'
  });

  // Seed Feedback
  await Feedback.create({
    bookingId: bookingObj._id,
    patientId: patientUser._id,
    centerId: center1._id,
    rating: 5,
    category: 'Home Collection Service',
    comments: 'Technician reached on time, very polite and painless blood collection procedure!',
    isModerated: true
  });

  // Seed Notification
  await Notification.create({
    userId: patientUser._id,
    title: 'Lab Sample Under Processing',
    message: 'Your blood sample for booking HB-2026-000123 is currently undergoing automated pathology diagnostics.',
    type: 'JOURNEY'
  });

  // Seed Audit Logs
  await AuditLog.create({
    userId: patientUser._id,
    userEmail: 'patient@example.com',
    role: UserRole.PATIENT,
    action: 'BOOKING_CREATE',
    resourceType: 'BOOKING',
    resourceId: bId,
    status: 'SUCCESS',
    details: 'Created home collection booking for 3 tests'
  });

  console.log('✅ HealthBridge seed database populated successfully.');
}
