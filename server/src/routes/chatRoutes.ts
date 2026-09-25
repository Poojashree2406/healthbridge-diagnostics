import { Router } from 'express';
import { chatWithMedBot } from '../controllers/chatController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Allow both authenticated and guest access (authenticated users get report context)
router.post('/message', (req, res, next) => {
  // Try to authenticate but don't fail if no token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authenticateJWT(req as any, res, next);
  }
  return next();
}, chatWithMedBot);

export default router;
