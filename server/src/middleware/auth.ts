import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import {
  createSupabaseAuthClient,
  getSupabaseAdmin,
  isSupabaseAuthConfigured,
} from '../services/supabase.js';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    supabaseUserId?: string | null;
    accessToken?: string;
  };
}

export const COOKIE_NAME = 'js_admin_token';
export const REFRESH_COOKIE_NAME = 'js_admin_refresh';

export function isCookieSecure(): boolean {
  if (env.cookieSecure) return true;
  if (env.isVercel) return true;
  if (env.isProd && process.env.COOKIE_SECURE !== 'false') return true;
  return false;
}

export function setSupabaseSessionCookies(
  res: Response,
  accessToken: string,
  refreshToken?: string | null
): void {
  const secure = isCookieSecure();
  res.cookie(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}

export function clearAuthCookies(res: Response): void {
  const secure = isCookieSecure();
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure, sameSite: 'lax', path: '/' });
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, secure, sameSite: 'lax', path: '/' });
}

function extractAccessToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  return undefined;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractAccessToken(req);
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!token && !refreshToken) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (isSupabaseAuthConfigured()) {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      let activeUser = null;
      let activeToken = token;

      if (token) {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && data.user) {
          activeUser = data.user;
        }
      }

      if (!activeUser && typeof refreshToken === 'string' && refreshToken.length > 0) {
        const authClient = createSupabaseAuthClient();
        const { data: refreshed, error: refreshError } = await authClient.auth.refreshSession({
          refresh_token: refreshToken,
        });
        if (!refreshError && refreshed.session && refreshed.user) {
          activeUser = refreshed.user;
          activeToken = refreshed.session.access_token;
          setSupabaseSessionCookies(
            res,
            refreshed.session.access_token,
            refreshed.session.refresh_token
          );
        }
      }

      if (!activeUser) {
        res.status(401).json({ error: 'Session expired or invalid' });
        return;
      }

      const role = activeUser.app_metadata?.role;
      if (role !== 'admin') {
        res.status(403).json({ error: 'Admin privileges required' });
        return;
      }

      const email = (activeUser.email || '').toLowerCase();
      const dbAdmin = await prisma.adminUser.findFirst({
        where: {
          OR: [{ supabaseUserId: activeUser.id }, ...(email ? [{ email }] : [])],
        },
        select: { id: true, email: true, supabaseUserId: true },
      });

      if (!dbAdmin) {
        res.status(401).json({ error: 'Admin account not found' });
        return;
      }

      if (dbAdmin.supabaseUserId !== activeUser.id) {
        await prisma.adminUser.update({
          where: { id: dbAdmin.id },
          data: { supabaseUserId: activeUser.id },
        });
      }

      req.admin = {
        id: dbAdmin.id,
        email: dbAdmin.email,
        supabaseUserId: activeUser.id,
        accessToken: activeToken,
      };
      next();
      return;
    } catch (error) {
      console.error('Supabase auth verification failed:', error);
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: string; email: string };
    req.admin = { id: payload.id, email: payload.email, accessToken: token };
    next();
  } catch {
    res.status(401).json({ error: 'Session expired or invalid' });
  }
}
