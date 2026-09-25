import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { PatientProfile } from '../models/PatientProfile';
import { PhysicianProfile } from '../models/PhysicianProfile';
import { registerSchema, loginSchema } from '@healthbridge/shared';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'healthbridge_super_secret_jwt_key_2026_production_grade';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'healthbridge_super_secret_refresh_jwt_key_2026';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const user = await User.create({
      email: validatedData.email,
      passwordHash,
      role: validatedData.role,
      name: validatedData.name,
      phone: validatedData.phone
    });

    if (validatedData.role === 'PATIENT') {
      await PatientProfile.create({
        userId: user._id,
        name: user.name,
        phone: user.phone || '9876543210',
        dob: '1992-05-15',
        gender: 'MALE',
        address: {
          street: '123 Health Ave',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        }
      });
    } else if (validatedData.role === 'PHYSICIAN') {
      await PhysicianProfile.create({
        userId: user._id,
        name: user.name,
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        licenseNumber: 'MCI-2026-9999',
        phone: user.phone || '9876543210'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.errors ? err.errors[0].message : err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.errors ? err.errors[0].message : err.message });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = await User.findById(req.user.id).select('-passwordHash');
  return res.json({ success: true, user });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  return res.json({ success: true, message: 'Logged out successfully' });
};
