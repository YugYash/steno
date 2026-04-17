import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Profile } from "@/lib/types";

function deriveProfileRole(email: string | null, storedProfile: Database["public"]["Tables"]["profiles"]["Row"]) {
  return {
    ...storedProfile,
    role: isAdminEmail(email) ? "admin" : "student",
  } satisfies Profile;
}

async function getProfileFromAdminClient(user: User) {
  const adminClient = createAdminSupabaseClient();

  if (!adminClient) {
    return null;
  }

  const { data, error } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return deriveProfileRole(user.email ?? null, data);
}

export async function ensureProfile(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  user: User,
) {
  const { data: existingProfile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (existingProfile) {
    return deriveProfileRole(user.email ?? null, existingProfile);
  }

  const managedProfile = await getProfileFromAdminClient(user);
  if (managedProfile) {
    return managedProfile;
  }

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      full_name:
        (typeof user.user_metadata?.full_name === "string" &&
          user.user_metadata.full_name.trim()) ||
        (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
        null,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return deriveProfileRole(user.email ?? null, insertedProfile);
}

export async function getCurrentUserContext() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      isConfigured: false,
      supabase: null,
      user: null,
      profile: null,
      isAdmin: false,
    } as const;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return {
      isConfigured: true,
      supabase,
      user: null,
      profile: null,
      isAdmin: false,
    } as const;
  }

  const profile = await ensureProfile(supabase, user);

  return {
    isConfigured: true,
    supabase,
    user,
    profile,
    isAdmin: profile.role === "admin",
  } as const;
}

export async function requireAuthenticatedUser() {
  const context = await getCurrentUserContext();

  if (!context.isConfigured) {
    redirect("/");
  }

  if (!context.user || !context.profile) {
    redirect("/login?info=Please%20log%20in%20to%20continue.");
  }

  return context;
}

export async function requireActiveUser() {
  const context = await requireAuthenticatedUser();

  if (!context.profile.is_active) {
    redirect("/blocked?info=Your%20account%20has%20been%20disabled.%20Please%20contact%20the%20administrator.");
  }

  return context;
}

export async function requireAdminUser() {
  const context = await requireActiveUser();

  if (!context.isAdmin) {
    redirect("/dashboard?error=You%20do%20not%20have%20access%20to%20the%20admin%20dashboard.");
  }

  return context;
}

export async function redirectSignedInUser() {
  const context = await getCurrentUserContext();

  if (!context.user || !context.profile) {
    return;
  }

  if (!context.profile.is_active) {
    redirect("/blocked");
  }

  redirect(context.isAdmin ? "/admin" : "/dashboard");
}
