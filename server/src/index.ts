import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { UPLOADS_DIR } from './services/uploads.js';
import contentRoutes from './routes/content.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

const allowedOrigins = env.clientUrl.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || !env.isProd) {
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

app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '30d' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'js-fitness-api' });
});

app.use('/api/content', contentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// In production, serve compiled client bundle
const publicClientDir = path.resolve(process.cwd(), '../client/dist');
if (env.isProd && fs.existsSync(publicClientDir)) {
  app.use(express.static(publicClientDir, { maxAge: '7d' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(publicClientDir, 'index.html'));
  });
}

app.listen(env.port, () => {
  console.log(`JS FITNESS INC API listening on http://localhost:${env.port}`);
});
