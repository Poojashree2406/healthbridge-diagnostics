import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import {
  UserRole, ServiceMode, BookingStatus, PaymentStatus, AppointmentStatus,
  SampleStatus, DiagnosticStage, ReportStatus, ResultStatus
} from '@healthbridge/shared';
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
  // Guard: skip if already seeded
  const existingCount = await User.countDocuments();
  if (existingCount > 0) {
    console.log('✅ DB already seeded — skipping.');
    return;
  }

  console.log('🌱 Seeding HealthBridge database with rich demo data...');
  const pw = await bcrypt.hash('Password123!', 10);

  // ─── 1. USERS ─────────────────────────────────────────────────────────────
  const [
    patient1, patient2, patient3, patient4, patient5,
    doctor1, doctor2,
    lab1, lab2,
    adminUser
  ] = await User.insertMany([
    // Patients
    { name: 'Rajesh Sharma',    email: 'patient@example.com',   passwordHash: pw, role: UserRole.PATIENT,        phone: '9876543210', isVerified: true },
    { name: 'Priya Mehta',      email: 'priya@example.com',     passwordHash: pw, role: UserRole.PATIENT,        phone: '9845123456', isVerified: true },
    { name: 'Arjun Reddy',      email: 'arjun@example.com',     passwordHash: pw, role: UserRole.PATIENT,        phone: '9912345678', isVerified: true },
    { name: 'Sunita Patel',     email: 'sunita@example.com',    passwordHash: pw, role: UserRole.PATIENT,        phone: '9823456789', isVerified: true },
    { name: 'Kavya Nair',       email: 'kavya@example.com',     passwordHash: pw, role: UserRole.PATIENT,        phone: '9734567890', isVerified: true },
    // Doctors
    { name: 'Dr. Ananya Roy',   email: 'doctor@example.com',    passwordHash: pw, role: UserRole.PHYSICIAN,      phone: '9988776655', isVerified: true },
    { name: 'Dr. Vikram Singh', email: 'doctor2@example.com',   passwordHash: pw, role: UserRole.RADIOLOGIST,    phone: '9977665544', isVerified: true },
    // Lab Technicians
    { name: 'Ravi Kumar',       email: 'lab@example.com',       passwordHash: pw, role: UserRole.LAB_TECHNICIAN, phone: '9866554433', isVerified: true },
    { name: 'Meena Pillai',     email: 'lab2@example.com',      passwordHash: pw, role: UserRole.LAB_TECHNICIAN, phone: '9855443322', isVerified: true },
    // Admin
    { name: 'Admin User',       email: 'admin@example.com',     passwordHash: pw, role: UserRole.ADMIN,          phone: '9800000001', isVerified: true },
  ]);

  // ─── 2. PATIENT PROFILES ──────────────────────────────────────────────────
  await PatientProfile.insertMany([
    { userId: patient1._id, name: 'Rajesh Sharma', phone: '9876543210', dob: '1988-05-14', gender: 'MALE', bloodGroup: 'B+', address: { street: '404 Palm Grove, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', country: 'India' }, emergencyContact: { name: 'Sunita Sharma', relation: 'Spouse', phone: '9876543219' }, medicalHistory: ['Mild Hypertension', 'Prediabetes'] },
    { userId: patient2._id, name: 'Priya Mehta', phone: '9845123456', dob: '1994-09-22', gender: 'FEMALE', bloodGroup: 'O+', address: { street: '12 Green Glen Layout, Bellandur', city: 'Bengaluru', state: 'Karnataka', pincode: '560103', country: 'India' }, emergencyContact: { name: 'Rohan Mehta', relation: 'Brother', phone: '9845123459' }, medicalHistory: ['Hypothyroidism', 'Vitamin D Deficiency'] },
    { userId: patient3._id, name: 'Arjun Reddy', phone: '9912345678', dob: '1982-11-03', gender: 'MALE', bloodGroup: 'A+', address: { street: '88 Jubilee Enclave, Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', country: 'India' }, emergencyContact: { name: 'Divya Reddy', relation: 'Spouse', phone: '9912345670' }, medicalHistory: ['Hyperlipidemia', 'Family history of CAD'] },
    { userId: patient4._id, name: 'Sunita Patel', phone: '9823456789', dob: '1976-02-18', gender: 'FEMALE', bloodGroup: 'AB+', address: { street: '202 Sunrise Heights, Jayanagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560041', country: 'India' }, emergencyContact: { name: 'Deepak Patel', relation: 'Spouse', phone: '9823456780' }, medicalHistory: ['Kidney Stone History'] },
    { userId: patient5._id, name: 'Kavya Nair', phone: '9734567890', dob: '1998-07-30', gender: 'FEMALE', bloodGroup: 'O-', address: { street: '77 Ferns Paradise, Marathahalli', city: 'Bengaluru', state: 'Karnataka', pincode: '560037', country: 'India' }, emergencyContact: { name: 'Radhika Nair', relation: 'Mother', phone: '9734567899' }, medicalHistory: ['Iron Deficiency Anemia'] },
  ]);

  // ─── 3. PHYSICIAN PROFILES ────────────────────────────────────────────────
  await PhysicianProfile.insertMany([
    { userId: doctor1._id, name: 'Dr. Ananya Roy', specialization: 'Pathology & Clinical Biochemistry', qualification: 'MD Pathology, MBBS', licenseNumber: 'MCI-88912', hospitalAffiliation: 'HealthBridge Central Lab', phone: '9988776655' },
    { userId: doctor2._id, name: 'Dr. Vikram Singh', specialization: 'Radiology & Imaging', qualification: 'MD Radiology, MBBS, FRCR', licenseNumber: 'MCI-77821', hospitalAffiliation: 'HealthBridge Imaging Center', phone: '9977665544' },
  ]);

  // ─── 4. LAB & CENTERS ─────────────────────────────────────────────────────
  const [lab, lab2Obj] = await Lab.insertMany([
    { name: 'HealthBridge Central Laboratory', code: 'LAB-HB-001', contactEmail: 'central@healthbridge.com', contactPhone: '080-41234567', services: ['Pathology', 'Biochemistry', 'Hematology', 'Microbiology'], rating: 4.9, active: true },
    { name: 'HealthBridge Express Lab',         code: 'LAB-HB-002', contactEmail: 'express@healthbridge.com', contactPhone: '080-45678901', services: ['Radiology', 'Pathology', 'Biochemistry'], rating: 4.7, active: true },
  ]);

  const [center1, center2, center3] = await DiagnosticCenter.insertMany([
    { labId: lab._id, name: 'HealthBridge Bangalore Central', address: { street: '42, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' }, phone: '080-41234567', operatingHours: 'Mon-Sun: 6:00 AM – 10:00 PM', rating: 4.8, homeCollectionAvailable: true, maxSlotsPerTime: 20 },
    { labId: lab._id, name: 'HealthBridge Koramangala', address: { street: '12, 80 Feet Road, Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' }, phone: '080-45678901', operatingHours: 'Mon-Sat: 7:00 AM – 9:00 PM', rating: 4.7, homeCollectionAvailable: true, maxSlotsPerTime: 15 },
    { labId: lab2Obj._id, name: 'HealthBridge Indiranagar', address: { street: '100 Feet Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' }, phone: '080-56789012', operatingHours: 'Mon-Sun: 7:00 AM – 8:00 PM', rating: 4.6, homeCollectionAvailable: false, maxSlotsPerTime: 12 },
  ]);

  // ─── 5. TEST CATEGORIES ───────────────────────────────────────────────────
  const categories = await TestCategory.insertMany([
    { name: 'Hematology',           slug: 'hematology',           iconName: 'Droplets',     description: 'Blood cell counts and related disorders', active: true },
    { name: 'Biochemistry',         slug: 'biochemistry',         iconName: 'FlaskConical', description: 'Chemical analysis of blood and urine', active: true },
    { name: 'Diabetes & Endocrine', slug: 'diabetes',             iconName: 'Activity',     description: 'Glucose, HbA1c, thyroid hormones', active: true },
    { name: 'Lipid Profile',        slug: 'lipid',                iconName: 'Heart',        description: 'Cholesterol and cardiovascular risk markers', active: true },
    { name: 'Liver Function',       slug: 'liver',                iconName: 'Shield',       description: 'Hepatic enzymes and liver health markers', active: true },
    { name: 'Kidney Function',      slug: 'kidney',               iconName: 'Filter',       description: 'Renal health and electrolyte balance', active: true },
    { name: 'Thyroid Profile',      slug: 'thyroid',              iconName: 'Zap',          description: 'TSH, T3, T4 hormonal analysis', active: true },
    { name: 'Vitamins & Minerals',  slug: 'vitamins',             iconName: 'Sun',          description: 'Vitamin D, B12, Iron, Folate levels', active: true },
    { name: 'Cardiac Markers',      slug: 'cardiac',              iconName: 'Heartbeat',    description: 'Troponin, CK-MB and cardiac risk markers', active: true },
    { name: 'Urine Analysis',       slug: 'urine',                iconName: 'TestTube',     description: 'Complete urine examination', active: true },
  ]);

  const [catHem, catBio, catDia, catLip, catLiv, catKid, catThy, catVit, catCar, catUri] = categories;

  // ─── 6. TESTS ─────────────────────────────────────────────────────────────
  const tests = await Test.insertMany([
    // Hematology
    { code: 'CBC001', name: 'Complete Blood Count (CBC)', categoryId: catHem._id, description: 'Comprehensive blood cell analysis including RBC, WBC, Hemoglobin, Hematocrit and Platelet count.', measures: 'RBC, WBC, Hemoglobin, Hematocrit, MCV, MCH, MCHC, Platelets', whyPerformed: 'Screens for anemia, infection, clotting disorders and general health', preparationInstructions: 'No fasting required. Drink water normally.', sampleType: 'Whole Blood (EDTA)', turnaroundHours: 4, price: 399, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.9 },
    { code: 'CBC002', name: 'CBC with Differential', categoryId: catHem._id, description: 'CBC with detailed white blood cell differential count.', measures: 'All CBC parameters + Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils', whyPerformed: 'Diagnoses infections, allergies, leukemia and immune system status', preparationInstructions: 'No special preparation needed.', sampleType: 'Whole Blood (EDTA)', turnaroundHours: 6, price: 549, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },
    { code: 'HEM003', name: 'Peripheral Smear Examination', categoryId: catHem._id, description: 'Microscopic examination of blood cells for morphology.', measures: 'RBC morphology, WBC morphology, Platelet morphology', whyPerformed: 'Detects malaria, sickle cell disease and blood cell disorders', preparationInstructions: 'No preparation required.', sampleType: 'Whole Blood', turnaroundHours: 12, price: 299, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.7 },

    // Biochemistry
    { code: 'BIO001', name: 'Comprehensive Metabolic Panel (CMP)', categoryId: catBio._id, description: '14-test panel covering kidney, liver, electrolytes and glucose.', measures: 'Glucose, BUN, Creatinine, Sodium, Potassium, CO2, Chloride, Calcium, Total Protein, Albumin, ALT, AST, ALP, Bilirubin', whyPerformed: 'Monitors overall organ function and metabolic health', preparationInstructions: 'Fast for 8-10 hours before test. Water is permitted.', sampleType: 'Serum', turnaroundHours: 6, price: 899, homeCollectionAvailable: true, fastingRequired: true, active: true, rating: 4.8 },
    { code: 'BIO002', name: 'Basic Metabolic Panel (BMP)', categoryId: catBio._id, description: '8-test panel for kidney function, electrolytes and glucose.', measures: 'Glucose, BUN, Creatinine, Sodium, Potassium, CO2, Chloride, Calcium', whyPerformed: 'Screens kidney function and electrolyte balance', preparationInstructions: 'Fast for 8 hours. Water is allowed.', sampleType: 'Serum', turnaroundHours: 4, price: 549, homeCollectionAvailable: true, fastingRequired: true, active: true, rating: 4.7 },

    // Diabetes
    { code: 'DIA001', name: 'HbA1c (Glycated Hemoglobin)', categoryId: catDia._id, description: 'Average blood sugar levels over past 2-3 months. Essential for diabetes management.', measures: 'HbA1c (%)', whyPerformed: 'Diagnoses and monitors diabetes management', preparationInstructions: 'No fasting required. Can be done anytime.', sampleType: 'Whole Blood', turnaroundHours: 4, price: 499, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.9 },
    { code: 'DIA002', name: 'Fasting Blood Sugar (FBS)', categoryId: catDia._id, description: 'Blood glucose level after 8-10 hours fasting.', measures: 'Fasting plasma glucose (mg/dL)', whyPerformed: 'Screens for diabetes and prediabetes', preparationInstructions: 'Fast for minimum 8 hours. Only water allowed.', sampleType: 'Serum/Plasma', turnaroundHours: 2, price: 149, homeCollectionAvailable: true, fastingRequired: true, active: true, rating: 4.9 },
    { code: 'DIA003', name: 'Post Prandial Blood Sugar (PPBS)', categoryId: catDia._id, description: 'Blood glucose 2 hours after a meal.', measures: 'Post-meal plasma glucose (mg/dL)', whyPerformed: 'Assesses glucose metabolism after meals', preparationInstructions: 'Sample collected 2 hours after standard meal.', sampleType: 'Serum/Plasma', turnaroundHours: 2, price: 149, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },
    { code: 'DIA004', name: 'Insulin Fasting', categoryId: catDia._id, description: 'Measures fasting insulin to assess insulin resistance.', measures: 'Serum insulin (uIU/mL)', whyPerformed: 'Diagnoses insulin resistance, PCOS and metabolic syndrome', preparationInstructions: 'Fast for 10-12 hours.', sampleType: 'Serum', turnaroundHours: 8, price: 699, homeCollectionAvailable: true, fastingRequired: true, active: true, rating: 4.7 },

    // Lipid
    { code: 'LIP001', name: 'Lipid Profile (Full)', categoryId: catLip._id, description: 'Complete cholesterol panel: Total, HDL, LDL, VLDL, Triglycerides.', measures: 'Total Cholesterol, HDL, LDL, VLDL, Triglycerides, Cholesterol Ratio', whyPerformed: 'Assesses cardiovascular risk and guides statin therapy', preparationInstructions: 'Fast for 10-12 hours. Avoid alcohol for 24 hours.', sampleType: 'Serum', turnaroundHours: 4, price: 699, homeCollectionAvailable: true, fastingRequired: true, active: true, rating: 4.9 },
    { code: 'LIP002', name: 'Apolipoprotein A1 and B', categoryId: catLip._id, description: 'Advanced cardiovascular risk markers beyond standard cholesterol.', measures: 'Apolipoprotein A1 (mg/dL), Apolipoprotein B (mg/dL), Apo B/A1 ratio', whyPerformed: 'Detailed atherogenic risk evaluation', preparationInstructions: 'Fast for 12 hours before test.', sampleType: 'Serum', turnaroundHours: 8, price: 999, homeCollectionAvailable: true, fastingRequired: true, active: true, rating: 4.6 },

    // Liver
    { code: 'LFT001', name: 'Liver Function Test (LFT)', categoryId: catLiv._id, description: 'Complete hepatic panel: SGPT, SGOT, Bilirubin, Alkaline Phosphatase, Albumin.', measures: 'SGPT (ALT), SGOT (AST), Total Bilirubin, Direct Bilirubin, Alkaline Phosphatase, Total Protein, Albumin, Globulin', whyPerformed: 'Evaluates liver health and detects hepatic inflammation or jaundice', preparationInstructions: 'No special fasting needed. Avoid alcohol 24h prior.', sampleType: 'Serum', turnaroundHours: 6, price: 599, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },
    { code: 'LFT002', name: 'Hepatitis B Surface Antigen (HBsAg)', categoryId: catLiv._id, description: 'Detects presence of Hepatitis B virus infection.', measures: 'HBsAg (Reactive / Non-Reactive)', whyPerformed: 'Diagnoses Hepatitis B viral infection', preparationInstructions: 'No preparation required.', sampleType: 'Serum', turnaroundHours: 4, price: 399, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.9 },

    // Kidney
    { code: 'KFT001', name: 'Kidney Function Test (KFT/RFT)', categoryId: catKid._id, description: 'Comprehensive renal panel: Creatinine, Urea, Uric Acid, eGFR, Electrolytes.', measures: 'Serum Creatinine, Blood Urea, Uric Acid, eGFR, Sodium, Potassium, Chloride', whyPerformed: 'Monitors renal function and detects kidney dysfunction', preparationInstructions: 'Stay well hydrated. No fasting required.', sampleType: 'Serum', turnaroundHours: 4, price: 599, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },
    { code: 'KFT002', name: 'Serum Uric Acid', categoryId: catKid._id, description: 'Measures uric acid levels to detect gout risk.', measures: 'Serum Uric Acid (mg/dL)', whyPerformed: 'Diagnoses gout, hyperuricemia and kidney stone risk', preparationInstructions: 'Avoid high-purine foods (meat/seafood) 24h before.', sampleType: 'Serum', turnaroundHours: 2, price: 199, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.7 },

    // Thyroid
    { code: 'THY001', name: 'Thyroid Profile (T3, T4, TSH)', categoryId: catThy._id, description: 'Complete thyroid function evaluation with T3, T4, TSH.', measures: 'Total T3 (ng/dL), Total T4 (ug/dL), TSH (uIU/mL)', whyPerformed: 'Diagnoses hypothyroidism, hyperthyroidism and thyroid nodules', preparationInstructions: 'Collect sample before morning thyroid medication.', sampleType: 'Serum', turnaroundHours: 6, price: 799, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.9 },
    { code: 'THY002', name: 'TSH (Thyroid Stimulating Hormone)', categoryId: catThy._id, description: 'Single TSH test for thyroid screening.', measures: 'TSH (uIU/mL)', whyPerformed: 'First-line screening test for thyroid disorder', preparationInstructions: 'No fasting required.', sampleType: 'Serum', turnaroundHours: 4, price: 299, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },

    // Vitamins
    { code: 'VIT001', name: 'Vitamin D3 (25-OH)', categoryId: catVit._id, description: 'Measures 25-hydroxy Vitamin D levels. Essential for bone and immune health.', measures: '25-OH Vitamin D3 (ng/mL)', whyPerformed: 'Detects Vitamin D deficiency causing bone weakness and fatigue', preparationInstructions: 'No fasting required. Can be collected any time.', sampleType: 'Serum', turnaroundHours: 8, price: 899, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.9 },
    { code: 'VIT002', name: 'Vitamin B12 (Cyanocobalamin)', categoryId: catVit._id, description: 'Serum Vitamin B12 to assess neurological and haematological health.', measures: 'Serum Vitamin B12 (pg/mL)', whyPerformed: 'Detects B12 deficiency causing neuropathy, anemia and memory issues', preparationInstructions: 'No fasting needed. Morning sample preferred.', sampleType: 'Serum', turnaroundHours: 8, price: 799, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.9 },
    { code: 'VIT003', name: 'Serum Ferritin and Iron Studies', categoryId: catVit._id, description: 'Iron stores assessment including ferritin, serum iron and TIBC.', measures: 'Serum Ferritin (ng/mL), Serum Iron (ug/dL), TIBC (ug/dL), Transferrin Saturation (%)', whyPerformed: 'Evaluates iron deficiency anemia and iron overload', preparationInstructions: 'Fast for 8 hours. Avoid iron pills for 24 hours.', sampleType: 'Serum', turnaroundHours: 8, price: 699, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.7 },
    { code: 'VIT004', name: 'Vitamin D + B12 + Folate Combo', categoryId: catVit._id, description: 'Triple vitamin panel for comprehensive nutritional status.', measures: 'Vitamin D3, Vitamin B12, Serum Folate', whyPerformed: 'Complete nutritional deficiency check', preparationInstructions: 'No fasting required.', sampleType: 'Serum', turnaroundHours: 10, price: 1799, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },

    // Cardiac
    { code: 'CAR001', name: 'Cardiac Risk Profile', categoryId: catCar._id, description: 'Comprehensive cardiac panel: Troponin I, CK-MB, LDH, hs-CRP, Homocysteine.', measures: 'Troponin I, CK-MB, LDH, hs-CRP, Homocysteine, Lipid Profile', whyPerformed: 'Evaluates cardiac damage and long-term cardiovascular risk', preparationInstructions: 'Fast for 10 hours. Avoid strenuous exercise 24h prior.', sampleType: 'Serum', turnaroundHours: 6, price: 1499, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },
    { code: 'CAR002', name: 'hs-CRP (High Sensitivity CRP)', categoryId: catCar._id, description: 'Sensitive marker of inflammation and cardiovascular risk.', measures: 'hs-CRP (mg/L)', whyPerformed: 'Measures low-grade systemic inflammation and vascular risk', preparationInstructions: 'No fasting needed.', sampleType: 'Serum', turnaroundHours: 4, price: 499, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.7 },

    // Urine
    { code: 'URI001', name: 'Complete Urine Examination (CUE)', categoryId: catUri._id, description: 'Physical, chemical and microscopic examination of urine.', measures: 'Color, Specific Gravity, pH, Protein, Glucose, Ketones, Bilirubin, RBC, WBC, Casts', whyPerformed: 'Screens for urinary tract infection, kidney disease, diabetes', preparationInstructions: 'Collect early morning mid-stream clean-catch urine.', sampleType: 'Urine (Mid-stream)', turnaroundHours: 2, price: 199, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.8 },
    { code: 'URI002', name: 'Urine Culture and Sensitivity', categoryId: catUri._id, description: 'Identifies bacteria causing UTI and determines antibiotic sensitivity.', measures: 'Bacterial Growth (CFU/mL), Pathogen Name, Antibiotic Susceptibility Panel', whyPerformed: 'Diagnoses UTI and guides targeted antibiotic therapy', preparationInstructions: 'Collect mid-stream urine in sterile container provided.', sampleType: 'Urine (Mid-stream)', turnaroundHours: 48, price: 599, homeCollectionAvailable: true, fastingRequired: false, active: true, rating: 4.7 },
  ]);

  const [tCBC, tCBCDiff, tSmear, tCMP, tBMP, tHbA1c, tFBS, tPPBS, tInsulin,
         tLipid, tApoLip, tLFT, tHBsAg, tKFT, tUricAcid, tThyFull, tTSH,
         tVitD, tVitB12, tFerritin, tVitCombo, tCardiac, tCRP, tCUE, tUrine] = tests;

  // ─── 7. TEST PACKAGES ─────────────────────────────────────────────────────
  await TestPackage.insertMany([
    { code: 'PKG-WELLNESS', name: 'Complete Wellness Package', description: 'Comprehensive annual health check covering 8 key panels.', testIds: [tCBC._id, tHbA1c._id, tLipid._id, tLFT._id, tKFT._id, tThyFull._id, tVitD._id, tVitB12._id], price: 3999, discountPercent: 30, active: true },
    { code: 'PKG-DIABETES', name: 'Diabetes Management Pack', description: 'Complete diabetes monitoring and management panel.', testIds: [tHbA1c._id, tFBS._id, tPPBS._id, tInsulin._id, tKFT._id, tLipid._id], price: 2199, discountPercent: 25, active: true },
    { code: 'PKG-CARDIAC',  name: 'Heart Health Package', description: 'Advanced cardiovascular risk assessment panel.', testIds: [tCardiac._id, tLipid._id, tApoLip._id, tCRP._id, tCBC._id], price: 3499, discountPercent: 20, active: true },
    { code: 'PKG-WOMEN',    name: 'Women\'s Health Package', description: 'Tailored health screen for women including thyroid, vitamins and hormones.', testIds: [tCBC._id, tThyFull._id, tVitD._id, tVitB12._id, tFerritin._id, tLFT._id], price: 2799, discountPercent: 22, active: true },
    { code: 'PKG-SENIOR',   name: 'Senior Citizens Package (60+)', description: 'Comprehensive screening for elderly health management.', testIds: [tCBC._id, tCMP._id, tLipid._id, tThyFull._id, tVitD._id, tVitB12._id, tKFT._id, tCUE._id], price: 4499, discountPercent: 35, active: true },
  ]);

  // ─── 8. AVAILABILITY SLOTS ────────────────────────────────────────────────
  const today = new Date();
  const slots: any[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    for (const time of ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00']) {
      slots.push({ centerId: center1._id, date: dateStr, startTime: time.split('-')[0], endTime: time.split('-')[1], totalCapacity: 20, bookedCount: Math.floor(Math.random() * 8), homeCollectionCapacity: 10, homeBookedCount: Math.floor(Math.random() * 4), isAvailable: true });
      slots.push({ centerId: center2._id, date: dateStr, startTime: time.split('-')[0], endTime: time.split('-')[1], totalCapacity: 15, bookedCount: Math.floor(Math.random() * 5), homeCollectionCapacity: 8, homeBookedCount: Math.floor(Math.random() * 3), isAvailable: true });
    }
  }
  await AvailabilitySlot.insertMany(slots);

  // ─── 9. HELPER: CREATE FULL BOOKING CHAIN ─────────────────────────────────
  const makeBooking = async (opts: {
    bId: string; patient: any; tests: any[]; center: any; mode: ServiceMode;
    date: string; status: BookingStatus; payStatus: PaymentStatus;
    amount: number; barcode: string; sampleStatus: SampleStatus;
    journeyStage: DiagnosticStage; reportStatus?: ReportStatus; reportId?: string;
    reportParams?: any[]; days?: number;
  }) => {
    const booking = await Booking.create({
      bookingId: opts.bId,
      patientId: opts.patient._id,
      testIds: opts.tests.map(t => t._id),
      centerId: opts.center._id,
      serviceMode: opts.mode,
      appointmentDate: opts.date,
      timeSlot: '08:00 - 09:00',
      subtotalAmount: opts.amount,
      collectionFee: opts.mode === ServiceMode.HOME_COLLECTION ? 150 : 0,
      discountAmount: 0,
      payableAmount: opts.amount + (opts.mode === ServiceMode.HOME_COLLECTION ? 150 : 0),
      paymentStatus: opts.payStatus,
      bookingStatus: opts.status,
      patientDetails: { name: opts.patient.name, phone: opts.patient.phone, email: opts.patient.email, age: 32, gender: 'MALE' }
    });

    const appointmentDateObj = new Date(opts.date);
    await Appointment.create({
      bookingId: booking._id,
      patientId: opts.patient._id,
      centerId: opts.center._id,
      serviceMode: opts.mode,
      dateTime: appointmentDateObj,
      status: opts.status === BookingStatus.COMPLETED ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED
    });

    await Payment.create({
      paymentId: `PAY-${opts.bId}`,
      bookingId: booking._id,
      patientId: opts.patient._id,
      amount: booking.payableAmount,
      currency: 'INR',
      paymentMethod: 'UPI',
      gateway: 'MOCK_RAZORPAY',
      transactionId: `txn_${Math.random().toString(36).slice(2, 12)}`,
      status: opts.payStatus,
      invoiceNumber: `INV-${opts.bId}`
    });

    await Invoice.create({
      invoiceNumber: `INV-${opts.bId}`,
      bookingId: booking._id,
      patientId: opts.patient._id,
      lineItems: opts.tests.map(t => ({ description: t.name, amount: t.price })),
      subtotal: opts.amount,
      discount: 0,
      tax: 0,
      total: booking.payableAmount,
      status: opts.payStatus === PaymentStatus.PAID ? 'PAID' : 'PAID'
    });

    await Sample.create({
      bookingId: booking._id,
      barcode: opts.barcode,
      sampleType: opts.tests[0]?.sampleType || 'Whole Blood (EDTA)',
      status: opts.sampleStatus,
      collectedAt: opts.sampleStatus !== SampleStatus.PENDING ? new Date() : undefined
    });

    // Build 10 journey stages
    const allStages = [
      DiagnosticStage.BOOKING_CONFIRMED, DiagnosticStage.APPOINTMENT_SCHEDULED,
      DiagnosticStage.PATIENT_CHECK_IN, DiagnosticStage.SAMPLE_COLLECTION,
      DiagnosticStage.SAMPLE_RECEIVED, DiagnosticStage.LAB_PROCESSING,
      DiagnosticStage.QUALITY_REVIEW, DiagnosticStage.REPORT_GENERATION,
      DiagnosticStage.PHYSICIAN_REVIEW, DiagnosticStage.RESULT_DELIVERED
    ];
    const stageIdx = allStages.indexOf(opts.journeyStage);

    const stages = allStages.map((stage, i) => ({
      stage,
      title: [
        'Booking Confirmed', 'Appointment Scheduled', 'Patient Check-In',
        'Sample Collection', 'Sample Received at Lab', 'Lab Processing',
        'Quality Assurance', 'Report Generation', 'Physician Review', 'Result Delivered'
      ][i],
      status: (i < stageIdx ? 'COMPLETED' : i === stageIdx ? 'IN_PROGRESS' : 'PENDING') as 'COMPLETED' | 'IN_PROGRESS' | 'PENDING',
      timestamp: i <= stageIdx ? new Date(Date.now() - (stageIdx - i) * 3600000) : undefined,
      department: ['Registration', 'Scheduling', 'Logistics', 'Phlebotomy', 'Central Reception', 'Pathology', 'QC', 'LIS', 'Medical Board', 'Patient Portal'][i],
      notes: i <= stageIdx ? `Completed stage: ${stage}` : undefined
    }));

    await DiagnosticJourney.create({ bookingId: booking._id, currentStage: opts.journeyStage, stages });

    if (opts.reportStatus && opts.reportId && opts.reportParams) {
      await Report.create({
        reportId: opts.reportId,
        bookingId: booking._id,
        patientId: opts.patient._id,
        testId: opts.tests[0]._id,
        collectionDate: new Date(Date.now() - (opts.days || 2) * 86400000),
        reportDate: new Date(Date.now() - ((opts.days || 2) - 1) * 86400000),
        parameters: opts.reportParams,
        status: opts.reportStatus,
        reviewedBy: opts.reportStatus === ReportStatus.PUBLISHED ? doctor1._id : undefined,
        reviewedAt: opts.reportStatus === ReportStatus.PUBLISHED ? new Date() : undefined,
        summaryNotes: opts.reportStatus === ReportStatus.PUBLISHED
          ? 'Report reviewed, digitally signed and verified by consulting pathologist. All clinical parameters evaluated.'
          : 'Awaiting physician review and digital sign-off.'
      });
    }

    return booking;
  };

  // ─── 10. SEED BOOKINGS & REPORTS ──────────────────────────────────────────
  // Patient 1: Rajesh
  await makeBooking({
    bId: 'HB-2026-000101', patient: patient1, tests: [tCBC, tHbA1c, tLipid], center: center1,
    mode: ServiceMode.HOME_COLLECTION, date: '2026-09-20', status: BookingStatus.COMPLETED, payStatus: PaymentStatus.PAID,
    amount: 1547, barcode: 'SMP-HB-20260101', sampleStatus: SampleStatus.PROCESSING,
    journeyStage: DiagnosticStage.RESULT_DELIVERED,
    reportStatus: ReportStatus.PUBLISHED, reportId: 'HB-REP-2026-10101',
    reportParams: [
      { parameterName: 'Hemoglobin', resultValue: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: ResultStatus.NORMAL },
      { parameterName: 'Total WBC Count', resultValue: '7,400', unit: '/cu mm', referenceRange: '4,000 - 11,000', status: ResultStatus.NORMAL },
      { parameterName: 'Platelet Count', resultValue: '2.5', unit: 'Lakhs/cu mm', referenceRange: '1.5 - 4.5', status: ResultStatus.NORMAL },
      { parameterName: 'HbA1c', resultValue: '6.8', unit: '%', referenceRange: '< 5.7 Normal', status: ResultStatus.HIGH },
      { parameterName: 'Total Cholesterol', resultValue: '215', unit: 'mg/dL', referenceRange: '< 200', status: ResultStatus.HIGH },
      { parameterName: 'LDL Cholesterol', resultValue: '138', unit: 'mg/dL', referenceRange: '< 100', status: ResultStatus.HIGH },
      { parameterName: 'HDL Cholesterol', resultValue: '44', unit: 'mg/dL', referenceRange: '> 40', status: ResultStatus.NORMAL },
      { parameterName: 'Triglycerides', resultValue: '172', unit: 'mg/dL', referenceRange: '< 150', status: ResultStatus.HIGH },
    ]
  });

  await makeBooking({
    bId: 'HB-2026-000102', patient: patient1, tests: [tLFT, tKFT], center: center1,
    mode: ServiceMode.DIAGNOSTIC_CENTER, date: '2026-09-23', status: BookingStatus.IN_PROGRESS, payStatus: PaymentStatus.PAID,
    amount: 1198, barcode: 'SMP-HB-20260102', sampleStatus: SampleStatus.RECEIVED_AT_LAB,
    journeyStage: DiagnosticStage.LAB_PROCESSING,
    reportStatus: ReportStatus.UNDER_REVIEW, reportId: 'HB-REP-2026-10102',
    reportParams: [
      { parameterName: 'SGPT (ALT)', resultValue: '52', unit: 'U/L', referenceRange: '7 - 56', status: ResultStatus.NORMAL },
      { parameterName: 'SGOT (AST)', resultValue: '45', unit: 'U/L', referenceRange: '10 - 40', status: ResultStatus.HIGH },
      { parameterName: 'Total Bilirubin', resultValue: '1.1', unit: 'mg/dL', referenceRange: '0.1 - 1.2', status: ResultStatus.NORMAL },
      { parameterName: 'Serum Creatinine', resultValue: '1.0', unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: ResultStatus.NORMAL },
      { parameterName: 'Blood Urea Nitrogen', resultValue: '18', unit: 'mg/dL', referenceRange: '7 - 20', status: ResultStatus.NORMAL },
    ]
  });

  await makeBooking({
    bId: 'HB-2026-000103', patient: patient1, tests: [tThyFull], center: center2,
    mode: ServiceMode.HOME_COLLECTION, date: '2026-09-28', status: BookingStatus.SCHEDULED, payStatus: PaymentStatus.PAID,
    amount: 799, barcode: 'SMP-HB-20260103', sampleStatus: SampleStatus.PENDING,
    journeyStage: DiagnosticStage.APPOINTMENT_SCHEDULED
  });

  // Patient 2: Priya
  await makeBooking({
    bId: 'HB-2026-000201', patient: patient2, tests: [tThyFull, tVitD, tVitB12], center: center1,
    mode: ServiceMode.HOME_COLLECTION, date: '2026-09-18', status: BookingStatus.COMPLETED, payStatus: PaymentStatus.PAID,
    amount: 2497, barcode: 'SMP-HB-20260201', sampleStatus: SampleStatus.PROCESSING,
    journeyStage: DiagnosticStage.RESULT_DELIVERED,
    reportStatus: ReportStatus.PUBLISHED, reportId: 'HB-REP-2026-20101',
    reportParams: [
      { parameterName: 'TSH', resultValue: '7.8', unit: 'mIU/L', referenceRange: '0.5 - 4.5', status: ResultStatus.HIGH },
      { parameterName: 'Free T3', resultValue: '2.9', unit: 'pg/mL', referenceRange: '2.3 - 4.2', status: ResultStatus.NORMAL },
      { parameterName: 'Free T4', resultValue: '0.7', unit: 'ng/dL', referenceRange: '0.8 - 1.8', status: ResultStatus.LOW },
      { parameterName: 'Vitamin D3 (25-OH)', resultValue: '14.2', unit: 'ng/mL', referenceRange: '30 - 100', status: ResultStatus.LOW },
      { parameterName: 'Vitamin B12', resultValue: '186', unit: 'pg/mL', referenceRange: '200 - 900', status: ResultStatus.LOW },
    ]
  });

  await makeBooking({
    bId: 'HB-2026-000202', patient: patient2, tests: [tCBC, tFerritin], center: center2,
    mode: ServiceMode.DIAGNOSTIC_CENTER, date: '2026-09-29', status: BookingStatus.CONFIRMED, payStatus: PaymentStatus.PAID,
    amount: 1098, barcode: 'SMP-HB-20260202', sampleStatus: SampleStatus.PENDING,
    journeyStage: DiagnosticStage.BOOKING_CONFIRMED
  });

  // Patient 3: Arjun
  await makeBooking({
    bId: 'HB-2026-000301', patient: patient3, tests: [tCardiac, tLipid, tCRP], center: center3,
    mode: ServiceMode.DIAGNOSTIC_CENTER, date: '2026-09-19', status: BookingStatus.COMPLETED, payStatus: PaymentStatus.PAID,
    amount: 2697, barcode: 'SMP-HB-20260301', sampleStatus: SampleStatus.PROCESSING,
    journeyStage: DiagnosticStage.PHYSICIAN_REVIEW,
    reportStatus: ReportStatus.UNDER_REVIEW, reportId: 'HB-REP-2026-30101',
    reportParams: [
      { parameterName: 'Troponin I', resultValue: '0.02', unit: 'ng/mL', referenceRange: '< 0.04', status: ResultStatus.NORMAL },
      { parameterName: 'CK-MB', resultValue: '28', unit: 'U/L', referenceRange: '< 25', status: ResultStatus.HIGH },
      { parameterName: 'Total Cholesterol', resultValue: '242', unit: 'mg/dL', referenceRange: '< 200', status: ResultStatus.HIGH },
      { parameterName: 'LDL Cholesterol', resultValue: '168', unit: 'mg/dL', referenceRange: '< 100', status: ResultStatus.CRITICAL },
      { parameterName: 'HDL Cholesterol', resultValue: '35', unit: 'mg/dL', referenceRange: '> 40', status: ResultStatus.LOW },
      { parameterName: 'hs-CRP', resultValue: '4.2', unit: 'mg/L', referenceRange: '< 1.0 Low Risk', status: ResultStatus.CRITICAL },
    ]
  });

  // Patient 4: Sunita
  await makeBooking({
    bId: 'HB-2026-000401', patient: patient4, tests: [tKFT, tCUE, tUricAcid], center: center1,
    mode: ServiceMode.HOME_COLLECTION, date: '2026-09-21', status: BookingStatus.IN_PROGRESS, payStatus: PaymentStatus.PAID,
    amount: 997, barcode: 'SMP-HB-20260401', sampleStatus: SampleStatus.COLLECTED,
    journeyStage: DiagnosticStage.SAMPLE_COLLECTION
  });

  await makeBooking({
    bId: 'HB-2026-000402', patient: patient4, tests: [tCBC, tBMP], center: center2,
    mode: ServiceMode.DIAGNOSTIC_CENTER, date: '2026-09-30', status: BookingStatus.SCHEDULED, payStatus: PaymentStatus.PENDING,
    amount: 948, barcode: 'SMP-HB-20260402', sampleStatus: SampleStatus.PENDING,
    journeyStage: DiagnosticStage.BOOKING_CONFIRMED
  });

  // Patient 5: Kavya
  await makeBooking({
    bId: 'HB-2026-000501', patient: patient5, tests: [tCBC, tHbA1c, tThyFull, tVitD, tVitB12], center: center1,
    mode: ServiceMode.HOME_COLLECTION, date: '2026-09-22', status: BookingStatus.COMPLETED, payStatus: PaymentStatus.PAID,
    amount: 3244, barcode: 'SMP-HB-20260501', sampleStatus: SampleStatus.PROCESSING,
    journeyStage: DiagnosticStage.QUALITY_REVIEW,
    reportStatus: ReportStatus.DRAFT, reportId: 'HB-REP-2026-50101',
    reportParams: [
      { parameterName: 'Hemoglobin', resultValue: '11.8', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: ResultStatus.LOW },
      { parameterName: 'HbA1c', resultValue: '5.4', unit: '%', referenceRange: '< 5.7 Normal', status: ResultStatus.NORMAL },
      { parameterName: 'TSH', resultValue: '3.2', unit: 'mIU/L', referenceRange: '0.5 - 4.5', status: ResultStatus.NORMAL },
      { parameterName: 'Vitamin D3', resultValue: '22', unit: 'ng/mL', referenceRange: '30 - 100', status: ResultStatus.LOW },
      { parameterName: 'Vitamin B12', resultValue: '245', unit: 'pg/mL', referenceRange: '200 - 900', status: ResultStatus.NORMAL },
    ]
  });

  // ─── 11. FEEDBACK ─────────────────────────────────────────────────────────
  await Feedback.insertMany([
    { bookingId: (await Booking.findOne({ bookingId: 'HB-2026-000101' }))?._id, patientId: patient1._id, centerId: center1._id, rating: 5, category: 'Home Collection', comments: 'Phlebotomist arrived exactly on time! Very professional, painless blood draw.', isModerated: true },
    { bookingId: (await Booking.findOne({ bookingId: 'HB-2026-000201' }))?._id, patientId: patient2._id, centerId: center1._id, rating: 4, category: 'Report Delivery', comments: 'Reports were ready before the promised time. Clear and easy to understand.', isModerated: true },
    { bookingId: (await Booking.findOne({ bookingId: 'HB-2026-000301' }))?._id, patientId: patient3._id, centerId: center3._id, rating: 5, category: 'Lab Quality', comments: 'Impressed by the NABL certification standards. Fast digital report delivery!', isModerated: true },
    { bookingId: (await Booking.findOne({ bookingId: 'HB-2026-000501' }))?._id, patientId: patient5._id, centerId: center1._id, rating: 4, category: 'Staff Behavior', comments: 'Very friendly staff, made me feel comfortable during the test procedure.', isModerated: true },
  ]);

  // ─── 12. NOTIFICATIONS ────────────────────────────────────────────────────
  await Notification.insertMany([
    { userId: patient1._id, title: '✅ Report Ready', message: 'Your CBC + HbA1c + Lipid Profile report is ready. Please check the Reports section.', type: 'REPORT' },
    { userId: patient1._id, title: '⏳ Sample Under Processing', message: 'Your LFT + KFT sample is being processed at the central lab.', type: 'JOURNEY' },
    { userId: patient2._id, title: '⚠️ Abnormal Values Detected', message: 'Your Thyroid & Vitamin report shows values outside normal range. Please consult your physician.', type: 'REPORT' },
    { userId: patient3._id, title: '🩺 Physician Review Pending', message: 'Your Cardiac Risk report is under physician review. You will be notified once signed off.', type: 'JOURNEY' },
    { userId: patient5._id, title: '📋 Booking Confirmed', message: 'Home collection for your Wellness Package is confirmed for tomorrow 8:00 AM.', type: 'BOOKING' },
    { userId: lab1._id,   title: '🔬 New Samples Pending', message: '3 new samples arrived and are pending barcode scan at the reception counter.', type: 'SYSTEM' },
    { userId: doctor1._id, title: '📝 Reports Awaiting Approval', message: '2 reports are pending your digital sign-off. Please review and publish.', type: 'SYSTEM' },
  ]);

  // ─── 13. AUDIT LOGS ───────────────────────────────────────────────────────
  await AuditLog.insertMany([
    { userId: patient1._id, userEmail: patient1.email, role: UserRole.PATIENT, action: 'BOOKING_CREATE', resourceType: 'BOOKING', status: 'SUCCESS', details: 'Created home collection for CBC + HbA1c + Lipid Profile' },
    { userId: patient1._id, userEmail: patient1.email, role: UserRole.PATIENT, action: 'PAYMENT_COMPLETE', resourceType: 'PAYMENT', status: 'SUCCESS', details: 'UPI payment completed for HB-2026-000101' },
    { userId: patient2._id, userEmail: patient2.email, role: UserRole.PATIENT, action: 'BOOKING_CREATE', resourceType: 'BOOKING', status: 'SUCCESS', details: 'Home collection for Thyroid + Vitamin panel' },
    { userId: lab1._id,   userEmail: lab1.email, role: UserRole.LAB_TECHNICIAN, action: 'SAMPLE_SCAN',    resourceType: 'SAMPLE', status: 'SUCCESS', details: 'Barcode SMP-HB-20260101 scanned and received at lab' },
    { userId: lab1._id,   userEmail: lab1.email, role: UserRole.LAB_TECHNICIAN, action: 'SAMPLE_STATUS_UPDATE', resourceType: 'SAMPLE', status: 'SUCCESS', details: 'Sample SMP-HB-20260101 status -> PROCESSING' },
    { userId: doctor1._id, userEmail: doctor1.email, role: UserRole.PHYSICIAN, action: 'REPORT_APPROVE',  resourceType: 'REPORT', status: 'SUCCESS', details: 'Report HB-REP-2026-10101 reviewed, digitally signed and published' },
    { userId: adminUser._id, userEmail: adminUser.email, role: UserRole.ADMIN, action: 'USER_LIST_ACCESS', resourceType: 'USER', status: 'SUCCESS', details: 'Admin accessed full user directory' },
    { userId: adminUser._id, userEmail: adminUser.email, role: UserRole.ADMIN, action: 'ADMIN_LOGIN', resourceType: 'AUTH', status: 'SUCCESS', details: 'Admin login session initialized' },
  ]);

  console.log('====================================================');
  console.log('✅ HealthBridge demo database seeded successfully!');
  console.log('   👥  10 Users (5 Patients, 2 Doctors, 2 Lab Techs, 1 Admin)');
  console.log('   👤   5 Patient Profiles (Medical history, emergency contacts)');
  console.log('   🩺   2 Physician Profiles');
  console.log('   🏥   2 Labs & 3 Diagnostic Centers');
  console.log('   🧪  25 Tests across 10 Categories');
  console.log('   📦   5 Test Packages');
  console.log('   📅  70 Availability Slots');
  console.log('   📋   8 Bookings across all 10 Diagnostic Journey stages');
  console.log('   🔬   8 Samples with Barcodes & Statuses');
  console.log('   📄   5 Diagnostic Reports (PUBLISHED, UNDER_REVIEW, DRAFT)');
  console.log('   💰   8 Payments & Invoices');
  console.log('   ⭐   4 Verified Patient Feedbacks');
  console.log('   🔔   7 Multi-Role Notifications');
  console.log('   📊   8 HIPAA/Audit Log Entries');
  console.log('====================================================');
}

// If run directly via `npm run seed` or `tsx src/seed.ts`
if (require.main === module || process.argv[1]?.includes('seed')) {
  (async () => {
    const mongoose = await import('mongoose');
    const path = await import('path');
    const fs = await import('fs');

    let uri = process.env.MONGODB_URI;
    if (!uri) {
      const uriFile = path.join(process.cwd(), '.mongodb-uri');
      if (fs.existsSync(uriFile)) {
        uri = fs.readFileSync(uriFile, 'utf8').trim();
      } else {
        uri = 'mongodb://127.0.0.1:27700/healthbridge';
      }
    }

    try {
      console.log(`🔌 Connecting to database at ${uri}...`);
      await mongoose.default.connect(uri);
      // Clear database to ensure clean reseed
      await mongoose.default.connection.dropDatabase();
      console.log('🧹 Cleaned existing database collections');
      await seedDatabase();
      await mongoose.default.disconnect();
      console.log('🔌 Disconnected from database. Done!');
      process.exit(0);
    } catch (err) {
      console.error('❌ Seed execution failed:', err);
      process.exit(1);
    }
  })();
}
