import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { isSupabaseAuthConfigured, isSupabaseStorageConfigured } from './services/supabase.js';
import { UPLOADS_DIR } from './services/uploads.js';
import { asyncHandler } from './middleware/asyncHandler.js';
import contentRoutes from './routes/content.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.set('trust proxy', 1);
app.use(compression());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: false,
  })
);

function buildAllowedOrigins(): Set<string> {
  const origins = new Set(
    env.clientUrl
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  );
  if (env.vercelUrl) {
    origins.add(`https://${env.vercelUrl}`);
  }
  if (env.vercelProdUrl) {
    origins.add(`https://${env.vercelProdUrl}`);
  }
  return origins;
}

const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || !env.isProd) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

if (!env.isVercel && fs.existsSync(UPLOADS_DIR)) {
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '30d' }));
}

app.get(
  '/api/health',
  asyncHandler(async (req: Request, res: Response) => {
    const status = {
      ok: true,
      service: 'js-fitness-api',
      database: 'supabase-postgresql',
      auth: isSupabaseAuthConfigured() ? 'supabase-auth' : 'jwt-fallback',
      storage: isSupabaseStorageConfigured() ? 'supabase-storage' : 'local',
    };

    if (req.query.deep === '1') {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({ ...status, dbConnected: true });
    }

    return res.json(status);
  })
);

app.use('/api/content', contentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// In standalone Node production (Docker/VPS), serve compiled client bundle directly.
// On Vercel, static assets are served by Vercel Edge Network using client/dist.
const publicClientDir = path.resolve(process.cwd(), '../client/dist');
if (!env.isVercel && env.isProd && fs.existsSync(publicClientDir)) {
  app.use(
    '/assets',
    express.static(path.join(publicClientDir, 'assets'), { maxAge: '1y', immutable: true })
  );
  app.use(
    '/fonts',
    express.static(path.join(publicClientDir, 'fonts'), { maxAge: '365d', immutable: true })
  );
  app.use(
    '/images',
    express.static(path.join(publicClientDir, 'images'), { maxAge: '365d', immutable: true })
  );
  app.use(express.static(publicClientDir, { maxAge: '5m', etag: true }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.sendFile(path.join(publicClientDir, 'index.html'));
  });
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  if (err instanceof Error && /Only JPG, PNG, WebP, and AVIF/i.test(err.message)) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof Error && err.message === 'Origin not allowed by CORS') {
    res.status(403).json({ error: err.message });
    return;
  }

  console.error('Unhandled API error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export const config = {
  maxDuration: 30,
};

export default app;
