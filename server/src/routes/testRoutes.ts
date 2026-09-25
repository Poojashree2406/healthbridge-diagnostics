import { Router } from 'express';
import {
  getTests,
  getTestCategories,
  getTestPackages,
  getTestById,
  createTest,
  updateTest,
  deleteTest
} from '../controllers/testController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '@healthbridge/shared';

const router = Router();

router.get('/', getTests);
router.get('/categories', getTestCategories);
router.get('/packages', getTestPackages);
router.get('/:id', getTestById);

router.post('/', authenticateJWT, requireRole([UserRole.ADMIN]), createTest);
router.put('/:id', authenticateJWT, requireRole([UserRole.ADMIN]), updateTest);
router.delete('/:id', authenticateJWT, requireRole([UserRole.ADMIN]), deleteTest);

export default router;
