import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { sendContactNotification } from '../services/mail.js';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Please enter a valid email address').max(180),
  phone: z.string().trim().max(40).optional().default(''),
  interest: z.enum(['Free gym tour', 'Strategy assessment', 'Other']),
  message: z.string().trim().min(5, 'Please include a short message').max(3000),
  website: z.string().optional().default(''), // Honeypot field
});

export async function submitContactForm(req: Request, res: Response): Promise<void> {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { website, ...data } = parsed.data;
  if (website && website.trim().length > 0) {
    // Honeypot caught spam bot: silently pretend success
    res.status(200).json({ success: true, message: 'Message received.' });
    return;
  }

  try {
    const record = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        interest: data.interest,
        message: data.message,
      },
    });

    const contactSetting = await prisma.siteSetting.findUnique({ where: { key: 'contact' } });
    let recipientEmail: string | undefined;
    if (contactSetting) {
      try {
        const parsedSetting = JSON.parse(contactSetting.value);
        recipientEmail = parsedSetting?.email;
      } catch {
        // ignore invalid json
      }
    }

    try {
      await sendContactNotification(
        {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          interest: data.interest,
          message: data.message,
        },
        recipientEmail
      );
    } catch (mailError) {
      console.error('Contact submission saved, but SMTP notification failed:', mailError);
    }

    res.status(201).json({
      success: true,
      id: record.id,
      message: 'Your inquiry has been received. Jatinder will follow up shortly.',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Unable to send message right now. Please try WhatsApp or call us.' });
  }
}
