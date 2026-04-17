import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";
import type { Attempt, PracticeTest, RecordingSummary, TranscriptMistake } from "@/lib/types";

function parseMistakes(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as TranscriptMistake[];
  }

  return value as TranscriptMistake[];
}

export async function fetchAccessibleTests(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("tests")
    .select(
      `
        id,
        title,
        slug,
        description,
        access_type,
        is_active,
        created_at,
        updated_at,
        recordings (
          id,
          title,
          wpm,
          audio_url,
          is_active,
          created_at
        )
      `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<PracticeTest & { recordings: RecordingSummary[] | null }>).map(
    (test) => ({
      ...test,
      recordings: (test.recordings ?? [])
        .filter((recording) => recording.is_active)
        .sort((left, right) => left.wpm - right.wpm),
    }),
  );
}

export async function fetchAccessibleTestBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  const { data, error } = await supabase
    .from("tests")
    .select(
      `
        id,
        title,
        slug,
        description,
        access_type,
        is_active,
        created_at,
        updated_at,
        recordings (
          id,
          title,
          wpm,
          audio_url,
          is_active,
          created_at
        )
      `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const test = data as PracticeTest & { recordings: RecordingSummary[] | null };

  return {
    ...test,
    recordings: (test.recordings ?? [])
      .filter((recording) => recording.is_active)
      .sort((left, right) => left.wpm - right.wpm),
  } satisfies PracticeTest;
}

export async function fetchAccessibleRecordingById(
  supabase: SupabaseClient<Database>,
  recordingId: number,
) {
  const { data, error } = await supabase
    .from("recordings")
    .select(
      `
        id,
        test_id,
        title,
        wpm,
        audio_url,
        reference_transcript,
        is_active,
        created_at,
        updated_at,
        test:tests (
          id,
          title,
          slug,
          description,
          access_type,
          is_active,
          created_at,
          updated_at
        )
      `,
    )
    .eq("id", recordingId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as
    | (Database["public"]["Tables"]["recordings"]["Row"] & { test: PracticeTest | null })
    | null) ?? null;
}

export async function fetchRecentAttempts(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("attempts")
    .select(
      `
        id,
        user_id,
        recording_id,
        submitted_transcript,
        accuracy,
        matched_words,
        reference_word_count,
        submitted_word_count,
        mistake_count,
        mistake_details,
        created_at,
        recording:recordings (
          id,
          title,
          wpm,
          audio_url,
          reference_transcript,
          is_active,
          created_at,
          updated_at,
          test:tests (
            id,
            title,
            slug,
            description,
            access_type,
            is_active,
            created_at,
            updated_at
          )
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<
    Attempt & {
      recording: (Database["public"]["Tables"]["recordings"]["Row"] & {
        test: PracticeTest | null;
      }) | null;
    }
  >).map((attempt) => ({
    ...attempt,
    mistake_details: parseMistakes(attempt.mistake_details),
  }));
}

export async function fetchAttemptById(supabase: SupabaseClient<Database>, attemptId: number) {
  const { data, error } = await supabase
    .from("attempts")
    .select(
      `
        id,
        user_id,
        recording_id,
        submitted_transcript,
        accuracy,
        matched_words,
        reference_word_count,
        submitted_word_count,
        mistake_count,
        mistake_details,
        created_at,
        recording:recordings (
          id,
          title,
          wpm,
          audio_url,
          reference_transcript,
          is_active,
          created_at,
          updated_at,
          test:tests (
            id,
            title,
            slug,
            description,
            access_type,
            is_active,
            created_at,
            updated_at
          )
        )
      `,
    )
    .eq("id", attemptId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const attempt = data as Attempt & {
    recording: (Database["public"]["Tables"]["recordings"]["Row"] & {
      test: PracticeTest | null;
    }) | null;
  };

  return {
    ...attempt,
    mistake_details: parseMistakes(attempt.mistake_details),
  };
}

export async function fetchAdminProfiles(adminClient: SupabaseClient<Database>) {
  const { data, error } = await adminClient
    .from("profiles")
    .select("id, email, full_name, is_active, is_paid, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchAdminTests(adminClient: SupabaseClient<Database>) {
  const { data, error } = await adminClient
    .from("tests")
    .select(
      `
        id,
        title,
        slug,
        description,
        access_type,
        is_active,
        created_at,
        updated_at,
        recordings (
          id,
          title,
          wpm,
          audio_url,
          is_active,
          created_at
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<PracticeTest & { recordings: RecordingSummary[] | null }>).map(
    (test) => ({
      ...test,
      recordings: (test.recordings ?? []).sort((left, right) => left.wpm - right.wpm),
    }),
  );
}
