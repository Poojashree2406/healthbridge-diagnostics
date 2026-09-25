import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

describe('HealthBridge Diagnostics API Integration Tests', () => {
  let authToken: string;
  let bookingId: string;
  let bookingMongoId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthbridge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('1. GET /health should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('2. POST /api/v1/auth/register should create a new patient user', async () => {
    const testEmail = `test_patient_${Date.now()}@example.com`;
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Integration Test Patient',
      email: testEmail,
      password: 'Password123!',
      role: 'PATIENT',
      phone: '9876543210'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('3. GET /api/v1/tests should return list of diagnostic tests', async () => {
    const res = await request(app).get('/api/v1/tests');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tests)).toBe(true);
  });
});
