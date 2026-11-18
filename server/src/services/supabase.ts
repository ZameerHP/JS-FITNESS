import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let cachedAdminClient: SupabaseClient | null = null;

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey && env.supabaseAnonKey);
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return cachedAdminClient;
}

/**
 * Create a per-operation non-persisted anon client so sign-in / token refresh
 * calls never mutate auth headers on a shared singleton client across requests.
 */
export function createSupabaseAuthClient(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findSupabaseUserByEmail(email: string): Promise<User | null> {
  const admin = getSupabaseAdmin();
  const normalized = email.toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(`Failed to list Supabase Auth users: ${error.message}`);
    }
    const match = data.users.find((u) => (u.email || '').toLowerCase() === normalized);
    if (match) return match;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

export async function syncAdminUserToSupabaseAuth(options: {
  email: string;
  password?: string;
  existingSupabaseUserId?: string | null;
}): Promise<string> {
  const admin = getSupabaseAdmin();
  const normalizedEmail = options.email.trim().toLowerCase();

  let targetUser: User | null = null;
  if (options.existingSupabaseUserId) {
    const { data, error } = await admin.auth.admin.getUserById(options.existingSupabaseUserId);
    if (!error && data.user) {
      targetUser = data.user;
    }
  }

  if (!targetUser) {
    targetUser = await findSupabaseUserByEmail(normalizedEmail);
  }

  if (targetUser) {
    const nextMetadata = {
      ...(targetUser.app_metadata || {}),
      role: 'admin',
    };
    const updatePayload: {
      email?: string;
      email_confirm?: boolean;
      app_metadata?: Record<string, unknown>;
      password?: string;
    } = {
      email: normalizedEmail,
      email_confirm: true,
      app_metadata: nextMetadata,
    };
    if (options.password) {
      updatePayload.password = options.password;
    }

    const { data, error } = await admin.auth.admin.updateUserById(targetUser.id, updatePayload);
    if (error || !data.user) {
      throw new Error(`Failed to update Supabase Auth admin: ${error?.message || 'Unknown error'}`);
    }
    return data.user.id;
  }

  if (!options.password) {
    throw new Error(`Password required to create Supabase Auth user for ${normalizedEmail}`);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password: options.password,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create Supabase Auth admin: ${error?.message || 'Unknown error'}`);
  }

  return data.user.id;
}
