import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __jsFitnessPrisma?: PrismaClient;
};

function resolveDatabaseUrl(): string | undefined {
  let raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;

  // Strip accidental surrounding quotes if copied from .env into a dashboard field
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }
  if (!raw) return undefined;

  // Ensure Supabase Transaction Pooler (port 6543) disables prepared statements cleanly for Prisma
  if (raw.includes(':6543')) {
    const params: string[] = [];
    if (!raw.includes('pgbouncer=')) params.push('pgbouncer=true');
    if (!raw.includes('connection_limit=')) params.push('connection_limit=1');
    if (params.length > 0) {
      const separator = raw.includes('?') ? '&' : '?';
      raw = `${raw}${separator}${params.join('&')}`;
    }
  }
  return raw;
}

const datasourceUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.__jsFitnessPrisma ||
  new PrismaClient(
    datasourceUrl
      ? {
          datasources: {
            db: { url: datasourceUrl },
          },
        }
      : undefined
  );

if (!globalForPrisma.__jsFitnessPrisma) {
  globalForPrisma.__jsFitnessPrisma = prisma;
}
