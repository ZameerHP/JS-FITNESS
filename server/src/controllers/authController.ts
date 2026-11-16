import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { z } from 'zod';
import { prisma } from './contentController.js';
import { env } from '../config/env.js';
import { AuthRequest, COOKIE_NAME } from '../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  totpCode: z.string().trim().optional(),
});

function setAuthCookie(res: Response, payload: { id: string; email: string }): void {
  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure || env.isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export async function loginAdmin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid email and password are required.' });
    return;
  }

  const { email, password, totpCode } = parsed.data;
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

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

  setAuthCookie(res, { id: user.id, email: user.email });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      totpEnabled: user.totpEnabled,
    },
  });
}

export async function logoutAdmin(_req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, { path: '/' });
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

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  res.json({ success: true });
}
