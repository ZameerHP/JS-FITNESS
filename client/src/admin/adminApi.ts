export async function adminFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers:
      options.body instanceof FormData
        ? options.headers
        : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function uploadAdminImage(file: File): Promise<{
  url: string;
  avifUrl: string;
  thumbUrl: string;
  srcSet: string;
}> {
  const form = new FormData();
  form.append('image', file);
  return adminFetch('/api/admin/upload', {
    method: 'POST',
    body: form,
  });
}
