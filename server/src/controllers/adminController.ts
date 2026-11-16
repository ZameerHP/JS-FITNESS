import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma, invalidateContentCache, DEFAULT_SETTINGS } from './contentController.js';
import { processAndSaveImage } from '../services/uploads.js';

export async function getAdminOverview(_req: Request, res: Response): Promise<void> {
  const [settingsRows, transformations, testimonials, gallery, videos, certifications, contacts] =
    await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.transformation.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }),
      prisma.testimonial.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }),
      prisma.galleryItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }),
      prisma.videoItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }),
      prisma.certification.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }),
      prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of settingsRows) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }

  res.json({
    settings,
    transformations,
    testimonials,
    gallery,
    videos,
    certifications,
    contacts,
  });
}

export async function updateSetting(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    key: z.string().min(1).max(60),
    value: z.unknown(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid setting payload' });
    return;
  }

  const { key, value } = parsed.data;
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });

  invalidateContentCache();
  res.json({ success: true, key, value });
}

export async function handleImageUpload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided' });
    return;
  }

  try {
    const result = await processAndSaveImage(req.file.buffer);
    res.status(201).json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process image upload' });
  }
}

// Transformations
export async function upsertTransformation(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    timeframe: z.string().min(1),
    category: z.string().default('Fat Loss & Muscle'),
    story: z.string().default(''),
    beforeImage: z.string().min(1),
    afterImage: z.string().min(1),
    isDemo: z.boolean().default(false),
    visible: z.boolean().default(true),
    order: z.number().int().default(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid transformation payload', details: parsed.error.flatten() });
    return;
  }

  const { id, ...data } = parsed.data;
  const item = id
    ? await prisma.transformation.update({ where: { id }, data })
    : await prisma.transformation.create({ data });

  invalidateContentCache();
  res.json(item);
}

export async function deleteTransformation(req: Request, res: Response): Promise<void> {
  await prisma.transformation.delete({ where: { id: String(req.params.id) } });
  invalidateContentCache();
  res.json({ success: true });
}

// Testimonials
export async function upsertTestimonial(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    role: z.string().default('JS FITNESS Member'),
    quote: z.string().min(3),
    rating: z.number().int().min(1).max(5).default(5),
    avatarUrl: z.string().optional().nullable(),
    visible: z.boolean().default(true),
    order: z.number().int().default(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid testimonial payload' });
    return;
  }

  const { id, ...data } = parsed.data;
  const item = id
    ? await prisma.testimonial.update({ where: { id }, data })
    : await prisma.testimonial.create({ data });

  invalidateContentCache();
  res.json(item);
}

export async function deleteTestimonial(req: Request, res: Response): Promise<void> {
  await prisma.testimonial.delete({ where: { id: String(req.params.id) } });
  invalidateContentCache();
  res.json({ success: true });
}

// Gallery
export async function upsertGalleryItem(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    imageUrl: z.string().min(1),
    category: z.string().default('Facility'),
    visible: z.boolean().default(true),
    order: z.number().int().default(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid gallery item' });
    return;
  }

  const { id, ...data } = parsed.data;
  const item = id
    ? await prisma.galleryItem.update({ where: { id }, data })
    : await prisma.galleryItem.create({ data });

  invalidateContentCache();
  res.json(item);
}

export async function reorderGallery(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    ids: z.array(z.string()),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid order payload' });
    return;
  }

  await Promise.all(
    parsed.data.ids.map((id, idx) =>
      prisma.galleryItem.update({ where: { id }, data: { order: idx } })
    )
  );
  invalidateContentCache();
  res.json({ success: true });
}

export async function deleteGalleryItem(req: Request, res: Response): Promise<void> {
  await prisma.galleryItem.delete({ where: { id: String(req.params.id) } });
  invalidateContentCache();
  res.json({ success: true });
}

// Videos
export async function upsertVideoItem(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    url: z.string().min(1),
    thumbnailUrl: z.string().optional().nullable(),
    isWalkthrough: z.boolean().default(false),
    visible: z.boolean().default(true),
    order: z.number().int().default(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid video item' });
    return;
  }

  const { id, ...data } = parsed.data;
  const item = id
    ? await prisma.videoItem.update({ where: { id }, data })
    : await prisma.videoItem.create({ data });

  invalidateContentCache();
  res.json(item);
}

export async function deleteVideoItem(req: Request, res: Response): Promise<void> {
  await prisma.videoItem.delete({ where: { id: String(req.params.id) } });
  invalidateContentCache();
  res.json({ success: true });
}

// Certifications
export async function upsertCertification(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    issuer: z.string().min(1),
    year: z.string().default(''),
    imageUrl: z.string().optional().nullable(),
    visible: z.boolean().default(true),
    order: z.number().int().default(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid certification' });
    return;
  }

  const { id, ...data } = parsed.data;
  const item = id
    ? await prisma.certification.update({ where: { id }, data })
    : await prisma.certification.create({ data });

  invalidateContentCache();
  res.json(item);
}

export async function deleteCertification(req: Request, res: Response): Promise<void> {
  await prisma.certification.delete({ where: { id: String(req.params.id) } });
  invalidateContentCache();
  res.json({ success: true });
}

// Contact Inbox
export async function markContactRead(req: Request, res: Response): Promise<void> {
  const read = Boolean(req.body?.read ?? true);
  const item = await prisma.contactSubmission.update({
    where: { id: String(req.params.id) },
    data: { read },
  });
  res.json(item);
}

export async function deleteContact(req: Request, res: Response): Promise<void> {
  await prisma.contactSubmission.delete({ where: { id: String(req.params.id) } });
  res.json({ success: true });
}
