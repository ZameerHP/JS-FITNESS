import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __jsFitnessPrisma?: PrismaClient;
};

function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;

  // Ensure Supabase Transaction Pooler (port 6543) disables prepared statements cleanly for Prisma
  if (raw.includes(':6543') && !raw.includes('pgbouncer=')) {
    const separator = raw.includes('?') ? '&' : '?';
    return `${raw}${separator}pgbouncer=true`;
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
