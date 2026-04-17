"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { getAdminEmail, isAdminEmail } from "@/lib/env";
import { withFlash } from "@/lib/flash";
import { slugify } from "@/lib/utils";

function getField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getCheckbox(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function requireAdminClient() {
  const adminClient = createAdminSupabaseClient();

  if (!adminClient) {
    redirect(
      withFlash(
        "/admin",
        "error",
        "SUPABASE_SERVICE_ROLE_KEY is required for admin actions.",
      ),
    );
  }

  return adminClient;
}

async function getUniqueTestSlug(adminClient: ReturnType<typeof requireAdminClient>, title: string) {
  const baseSlug = slugify(title) || "test";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await adminClient
      .from("tests")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function getProtectedProfileEmail(adminClient: ReturnType<typeof requireAdminClient>, profileId: string) {
  const { data, error } = await adminClient
    .from("profiles")
    .select("email")
    .eq("id", profileId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.email;
}

export async function createUserAction(formData: FormData) {
  await requireAdminUser();
  const adminClient = requireAdminClient();

  const fullName = getField(formData, "fullName");
  const email = getField(formData, "email").toLowerCase();
  const password = getField(formData, "password");
  const isPaid = getCheckbox(formData, "isPaid");
  const isActive = getCheckbox(formData, "isActive");

  if (!fullName || !email || !password) {
    redirect(withFlash("/admin", "error", "Name, email, and password are required."));
  }

  if (!isValidEmail(email)) {
    redirect(withFlash("/admin", "error", "Enter a valid student email address."));
  }

  if (password.length < 8) {
    redirect(withFlash("/admin", "error", "Temporary password must be at least 8 characters."));
  }

  if (isAdminEmail(email)) {
    redirect(
      withFlash(
        "/admin",
        "error",
        `Use Supabase Auth directly to manage the reserved admin account (${getAdminEmail()}).`,
      ),
    );
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    redirect(withFlash("/admin", "error", error.message));
  }

  if (!data.user) {
    redirect(withFlash("/admin", "error", "Supabase did not return the new user."));
  }

  const { error: profileError } = await adminClient.from("profiles").upsert(
    {
      id: data.user.id,
      email,
      full_name: fullName,
      is_active: isActive,
      is_paid: isPaid,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    redirect(withFlash("/admin", "error", profileError.message));
  }

  revalidatePath("/admin");
  redirect(withFlash("/admin", "success", "Student account created successfully."));
}

export async function toggleUserActiveAction(formData: FormData) {
  await requireAdminUser();
  const adminClient = requireAdminClient();

  const profileId = getField(formData, "profileId");
  const nextValue = getField(formData, "nextValue") === "true";

  if (!profileId) {
    redirect(withFlash("/admin", "error", "Missing user profile id."));
  }

  const email = await getProtectedProfileEmail(adminClient, profileId);
  if (isAdminEmail(email)) {
    redirect(withFlash("/admin", "error", "The hardcoded admin account cannot be disabled here."));
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ is_active: nextValue })
    .eq("id", profileId);

  if (error) {
    redirect(withFlash("/admin", "error", error.message));
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(
    withFlash(
      "/admin",
      "success",
      nextValue ? "User account enabled." : "User account disabled.",
    ),
  );
}

export async function toggleUserPaidAction(formData: FormData) {
  await requireAdminUser();
  const adminClient = requireAdminClient();

  const profileId = getField(formData, "profileId");
  const nextValue = getField(formData, "nextValue") === "true";

  if (!profileId) {
    redirect(withFlash("/admin", "error", "Missing user profile id."));
  }

  const email = await getProtectedProfileEmail(adminClient, profileId);
  if (isAdminEmail(email)) {
    redirect(withFlash("/admin", "error", "Paid access is not managed for the admin account."));
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ is_paid: nextValue })
    .eq("id", profileId);

  if (error) {
    redirect(withFlash("/admin", "error", error.message));
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(
    withFlash(
      "/admin",
      "success",
      nextValue ? "Paid access enabled for the user." : "Paid access removed from the user.",
    ),
  );
}

export async function createTestAction(formData: FormData) {
  await requireAdminUser();
  const adminClient = requireAdminClient();

  const title = getField(formData, "title");
  const description = getField(formData, "description");
  const accessType = getField(formData, "accessType");

  if (!title || !accessType) {
    redirect(withFlash("/admin", "error", "Title and access type are required."));
  }

  if (accessType !== "demo" && accessType !== "paid") {
    redirect(withFlash("/admin", "error", "Access type must be demo or paid."));
  }

  const slug = await getUniqueTestSlug(adminClient, title);

  const { error } = await adminClient.from("tests").insert({
    title,
    slug,
    description: description || null,
    access_type: accessType as Database["public"]["Tables"]["tests"]["Insert"]["access_type"],
  });

  if (error) {
    redirect(withFlash("/admin", "error", error.message));
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(withFlash("/admin", "success", "Practice test created successfully."));
}

export async function createRecordingAction(formData: FormData) {
  await requireAdminUser();
  const adminClient = requireAdminClient();

  const testIdValue = getField(formData, "testId");
  const title = getField(formData, "title");
  const wpmValue = getField(formData, "wpm");
  const audioUrl = getField(formData, "audioUrl");
  const referenceTranscript = getField(formData, "referenceTranscript");

  const testId = Number.parseInt(testIdValue, 10);
  const wpm = Number.parseInt(wpmValue, 10);

  if (!Number.isInteger(testId) || testId <= 0) {
    redirect(withFlash("/admin", "error", "Choose a valid test before adding a recording."));
  }

  if (!Number.isInteger(wpm) || wpm <= 0) {
    redirect(withFlash("/admin", "error", "WPM must be a positive whole number."));
  }

  if (!audioUrl || !referenceTranscript) {
    redirect(withFlash("/admin", "error", "Audio link and reference transcript are required."));
  }

  try {
    new URL(audioUrl);
  } catch {
    redirect(withFlash("/admin", "error", "Enter a valid Google Drive or audio URL."));
  }

  const { data: test, error: testError } = await adminClient
    .from("tests")
    .select("slug")
    .eq("id", testId)
    .single();

  if (testError || !test) {
    redirect(withFlash("/admin", "error", testError?.message ?? "Selected test was not found."));
  }

  const { error } = await adminClient.from("recordings").insert({
    test_id: testId,
    title: title || null,
    wpm,
    audio_url: audioUrl,
    reference_transcript: referenceTranscript,
  });

  if (error) {
    redirect(withFlash("/admin", "error", error.message));
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tests/${test.slug}`);
  redirect(withFlash("/admin", "success", "Recording added to the selected test."));
}
