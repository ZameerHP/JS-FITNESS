import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import {
  AuthRequest,
  COOKIE_NAME,
  clearAuthCookies,
  isCookieSecure,
  setSupabaseSessionCookies,
} from '../middleware/auth.js';
import {
  createSupabaseAuthClient,
  getSupabaseAdmin,
  isSupabaseAuthConfigured,
  syncAdminUserToSupabaseAuth,
} from '../services/supabase.js';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  totpCode: z.string().trim().optional(),
});

function setLegacyAuthCookie(res: Response, payload: { id: string; email: string }): void {
  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isCookieSecure(),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

async function revokeSupabaseToken(accessToken?: string): Promise<void> {
  if (!accessToken || !isSupabaseAuthConfigured()) return;
  try {
    await getSupabaseAdmin().auth.admin.signOut(accessToken);
  } catch {
    // Non-fatal if session already expired
  }
}

export async function loginAdmin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid email and password are required.' });
    return;
  }

  const { email, password, totpCode } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  if (isSupabaseAuthConfigured()) {
    const authClient = createSupabaseAuthClient();
    let signInResult = await authClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // Lazy migration: if SQLite admin row has not yet been synced into Supabase Auth
    if (signInResult.error || !signInResult.data.session || !signInResult.data.user) {
      const legacyMatch = await bcrypt.compare(password, user.passwordHash);
      if (!legacyMatch) {
        res.status(401).json({ error: 'Invalid credentials.' });
        return;
      }

      const supabaseUserId = await syncAdminUserToSupabaseAuth({
        email: normalizedEmail,
        password,
        existingSupabaseUserId: user.supabaseUserId,
      });

      if (user.supabaseUserId !== supabaseUserId) {
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { supabaseUserId },
        });
      }

      signInResult = await authClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInResult.error || !signInResult.data.session || !signInResult.data.user) {
        res.status(401).json({ error: 'Invalid credentials.' });
        return;
      }
    } else {
      const sbUser = signInResult.data.user;
      if (sbUser.app_metadata?.role !== 'admin' || user.supabaseUserId !== sbUser.id) {
        if (!user.supabaseUserId) {
          const syncedId = await syncAdminUserToSupabaseAuth({
            email: normalizedEmail,
            existingSupabaseUserId: sbUser.id,
          });
          await prisma.adminUser.update({
            where: { id: user.id },
            data: { supabaseUserId: syncedId },
          });
          signInResult = await authClient.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
        } else if (sbUser.app_metadata?.role !== 'admin') {
          await revokeSupabaseToken(signInResult.data.session.access_token);
          res.status(403).json({ error: 'Admin privileges required.' });
          return;
        }
      }
    }

    const session = signInResult.data.session!;

    if (user.totpEnabled && user.totpSecret) {
      if (!totpCode) {
        await revokeSupabaseToken(session.access_token);
        res.status(200).json({ requires2FA: true });
        return;
      }
      const validTotp = authenticator.verify({ token: totpCode, secret: user.totpSecret });
      if (!validTotp) {
        await revokeSupabaseToken(session.access_token);
        res.status(401).json({ error: 'Invalid 2FA verification code.' });
        return;
      }
    }

    setSupabaseSessionCookies(res, session.access_token, session.refresh_token);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        totpEnabled: user.totpEnabled,
      },
    });
    return;
  }

  // Fallback for local dev before Supabase URL/keys are configured
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  if (user.totpEnabled && user.totpSecret) {
    if (!totpCode) {
      res.status(200).json({ requires2FA: true });
      return;
    }
    const validTotp = authenticator.verify({ token: totpCode, secret: user.totpSecret });
    if (!validTotp) {
      res.status(401).json({ error: 'Invalid 2FA verification code.' });
      return;
    }
  }

  setLegacyAuthCookie(res, { id: user.id, email: user.email });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      totpEnabled: user.totpEnabled,
    },
  });
}

export async function logoutAdmin(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[COOKIE_NAME];
  await revokeSupabaseToken(typeof token === 'string' ? token : undefined);
  clearAuthCookies(res);
  res.json({ success: true });
}

export async function getCurrentAdmin(req: AuthRequest, res: Response): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: req.admin.id },
    select: { id: true, email: true, totpEnabled: true },
  });

  if (!user) {
    res.status(401).json({ error: 'Account not found' });
    return;
  }

  res.json({ user });
}

export async function setup2FA(req: AuthRequest, res: Response): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const secret = authenticator.generateSecret();
  await prisma.adminUser.update({
    where: { id: req.admin.id },
    data: { totpSecret: secret },
  });

  const otpauthUrl = authenticator.keyuri(req.admin.email, 'JS FITNESS INC Admin', secret);
  res.json({ secret, otpauthUrl });
}

export async function verifyAndEnable2FA(req: AuthRequest, res: Response): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { code } = req.body as { code?: string };
  if (!code) {
    res.status(400).json({ error: 'Code is required' });
    return;
  }

  const user = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
  if (!user?.totpSecret) {
    res.status(400).json({ error: '2FA setup has not been started' });
    return;
  }

  const valid = authenticator.verify({ token: code.trim(), secret: user.totpSecret });
  if (!valid) {
    res.status(400).json({ error: 'Invalid verification code' });
    return;
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { totpEnabled: true },
  });

  res.json({ success: true, totpEnabled: true });
}

export async function disable2FA(req: AuthRequest, res: Response): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  await prisma.adminUser.update({
    where: { id: req.admin.id },
    data: { totpEnabled: false, totpSecret: null },
  });

  res.json({ success: true, totpEnabled: false });
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'New password must be at least 8 characters.' });
    return;
  }

  const user = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let matches = false;
  if (isSupabaseAuthConfigured() && user.supabaseUserId) {
    const authClient = createSupabaseAuthClient();
    const check = await authClient.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (!check.error && check.data.session) {
      matches = true;
      await revokeSupabaseToken(check.data.session.access_token);
    }
  } else {
    matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  }

  if (!matches) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  let nextSupabaseUserId = user.supabaseUserId;

  if (isSupabaseAuthConfigured()) {
    nextSupabaseUserId = await syncAdminUserToSupabaseAuth({
      email: user.email,
      password: parsed.data.newPassword,
      existingSupabaseUserId: user.supabaseUserId,
    });
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      passwordHash,
      ...(nextSupabaseUserId ? { supabaseUserId: nextSupabaseUserId } : {}),
    },
  });

  res.json({ success: true });
}
