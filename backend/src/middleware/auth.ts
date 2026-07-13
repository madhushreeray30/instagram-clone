import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Missing authentication token');
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided',
      },
    });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    logger.warn('Invalid or expired token');
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }

  req.userId = payload.userId;
  req.email = payload.email;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.userId = payload.userId;
      req.email = payload.email;
    }
  }

  next();
}
