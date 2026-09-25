import { Response, NextFunction } from 'express';
import { UserRole } from '@healthbridge/shared';
import { AuthRequest } from './auth';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of roles [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};
