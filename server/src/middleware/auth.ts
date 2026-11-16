import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

export const COOKIE_NAME = 'js_admin_token';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: string; email: string };
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired or invalid' });
  }
}
