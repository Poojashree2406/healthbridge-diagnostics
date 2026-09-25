import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AuditLog } from '../models/AuditLog';

export const logAudit = (action: string, resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function (data: any): Response {
      res.send = originalSend;
      
      if (req.user) {
        AuditLog.create({
          userId: req.user.id,
          userEmail: req.user.email,
          role: req.user.role,
          action,
          resourceType,
          resourceId: req.params.id || req.body?.id || req.body?.bookingId,
          ipAddress: req.ip || req.socket.remoteAddress,
          status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
          details: `HTTP ${req.method} ${req.originalUrl}`
        }).catch(err => console.error('Audit log error:', err));
      }

      return originalSend.call(this, data);
    };

    next();
  };
};
