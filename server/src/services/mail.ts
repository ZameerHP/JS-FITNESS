import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

interface ContactMailPayload {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

export async function sendContactNotification(
  data: ContactMailPayload,
  recipientOverride?: string
): Promise<{ delivered: boolean; mode: 'smtp' | 'console' }> {
  const toEmail = recipientOverride || env.contactRecipient;

  const html = `
    <div style="background:#050505;color:#ffffff;padding:28px;font-family:Inter,Arial,sans-serif;border:1px solid #B6F500;border-radius:16px;">
      <h2 style="color:#B6F500;margin:0 0 12px;font-size:22px;letter-spacing:0.06em;">JS FITNESS INC — NEW INQUIRY</h2>
      <p style="color:#C9C9C9;margin:0 0 18px;">A visitor submitted the contact form on jsfitness.ca.</p>
      <table style="width:100%;border-collapse:collapse;color:#ffffff;">
        <tr><td style="padding:8px 0;color:#8C8C8C;width:130px;">Name</td><td style="padding:8px 0;">${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#8C8C8C;">Email</td><td style="padding:8px 0;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding:8px 0;color:#8C8C8C;">Phone</td><td style="padding:8px 0;">${escapeHtml(data.phone || 'Not provided')}</td></tr>
        <tr><td style="padding:8px 0;color:#8C8C8C;">Interest</td><td style="padding:8px 0;color:#B6F500;font-weight:700;">${escapeHtml(data.interest)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:14px;background:#0B0B0C;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">
        <div style="color:#8C8C8C;font-size:12px;margin-bottom:6px;">MESSAGE</div>
        <div style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(data.message)}</div>
      </div>
    </div>
  `;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    console.log('[Mail Dev Fallback] Contact notification captured:', {
      to: toEmail,
      ...data,
    });
    return { delivered: true, mode: 'console' };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  await transporter.sendMail({
    from: `"JS FITNESS INC Website" <${env.smtpUser}>`,
    to: toEmail,
    replyTo: data.email,
    subject: `[JS FITNESS] ${data.interest} — ${data.name}`,
    html,
  });

  return { delivered: true, mode: 'smtp' };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
