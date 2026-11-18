const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export interface TransformationItem {
  id: string;
  name: string;
  timeframe: string;
  category: string;
  story: string;
  beforeImage: string;
  afterImage: string;
  isDemo: boolean;
  visible: boolean;
  order: number;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl?: string | null;
  visible: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  visible: boolean;
  order: number;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  isWalkthrough: boolean;
  visible: boolean;
  order: number;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  imageUrl?: string | null;
  visible: boolean;
  order: number;
}

export interface PublicContentPayload {
  settings: Record<string, unknown>;
  transformations: TransformationItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  certifications: CertificationItem[];
}

export async function fetchPublicContent(): Promise<PublicContentPayload> {
  const res = await fetch(apiUrl('/api/content'), { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load site content');
  return res.json();
}

export async function submitContact(payload: {
  name: string;
  email: string;
  phone: string;
  interest: 'Free gym tour' | 'Strategy assessment' | 'Other';
  message: string;
  website?: string;
}) {
  const res = await fetch(apiUrl('/api/contact'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to submit form');
  }
  return data;
}
