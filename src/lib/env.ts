const SUPABASE_URL_KEYS = ["NEXT_PUBLIC_SUPABASE_URL"] as const;
const SUPABASE_PUBLISHABLE_KEY_KEYS = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

function readFirstEnv(keys: readonly string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = readFirstEnv(SUPABASE_URL_KEYS);
  const publishableKey = readFirstEnv(SUPABASE_PUBLISHABLE_KEY_KEYS);

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? null;
}

export function getAdminEmail() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabasePublicEnv());
}

export function hasServiceRoleAccess() {
  return Boolean(getSupabasePublicEnv() && getSupabaseServiceRoleKey());
}

export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = getAdminEmail();
  if (!adminEmail || !email) {
    return false;
  }

  return email.trim().toLowerCase() === adminEmail;
}

export function getSetupSteps() {
  return [
    "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    "Add SUPABASE_SERVICE_ROLE_KEY so the admin dashboard can create users and content.",
    "Set ADMIN_EMAIL to the one account that should access /admin.",
    "Run the SQL in supabase/migrations to create tables, policies, and triggers.",
  ];
}
