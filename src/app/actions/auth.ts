"use server";

import { redirect } from "next/navigation";

import { ensureProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/env";
import { withFlash } from "@/lib/flash";

function getField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect(withFlash("/login", "error", "Supabase is not configured yet."));
  }

  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");

  if (!email || !password) {
    redirect(withFlash("/login", "error", "Email and password are required."));
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(withFlash("/login", "error", error.message));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(withFlash("/login", "error", userError?.message ?? "Unable to verify your account."));
  }

  const profile = await ensureProfile(supabase, user);

  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect(
      withFlash(
        "/blocked",
        "info",
        "Your account has been disabled. Please contact the administrator.",
      ),
    );
  }

  redirect(isAdminEmail(user.email) ? "/admin" : "/dashboard");
}

export async function signupAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect(withFlash("/signup", "error", "Supabase is not configured yet."));
  }

  const fullName = getField(formData, "fullName");
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");

  if (!fullName || !email || !password) {
    redirect(withFlash("/signup", "error", "Name, email, and password are required."));
  }

  if (!isValidEmail(email)) {
    redirect(withFlash("/signup", "error", "Enter a valid email address."));
  }

  if (password.length < 8) {
    redirect(withFlash("/signup", "error", "Password must be at least 8 characters long."));
  }

  if (isAdminEmail(email)) {
    redirect(
      withFlash(
        "/signup",
        "error",
        "This email is reserved for the hardcoded admin account. Use the admin login instead.",
      ),
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(withFlash("/signup", "error", error.message));
  }

  if (!data.user) {
    redirect(withFlash("/signup", "error", "Unable to create your account right now."));
  }

  if (!data.session) {
    redirect(
      withFlash(
        "/login",
        "success",
        "Account created. If email confirmation is enabled, verify your email before logging in.",
      ),
    );
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect(withFlash("/login", "success", "You have been logged out."));
}
