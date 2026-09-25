import { Router } from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authenticateJWT, getCurrentUser);
router.post('/logout', logout);

export default router;
