import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const rootEnv = path.resolve(process.cwd(), '../.env');
const localEnv = path.resolve(process.cwd(), '.env');

if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  jwtSecret: process.env.JWT_SECRET || 'js-fitness-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@jsfitness.ca',
  adminPassword: process.env.ADMIN_PASSWORD || 'JSFitness2026!',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  contactRecipient: process.env.CONTACT_RECIPIENT_EMAIL || 'coachingbyjatinder@gmail.com',
  calendlyTourUrl: process.env.CALENDLY_TOUR_URL || '',
  calendlyAssessmentUrl: process.env.CALENDLY_ASSESSMENT_URL || '',
};
