"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireActiveUser } from "@/lib/auth";
import { fetchAccessibleRecordingById } from "@/lib/data";
import type { Database } from "@/lib/supabase/types";
import { compareTranscripts } from "@/lib/transcripts";
import { withFlash } from "@/lib/flash";

function getField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitAttemptAction(formData: FormData) {
  const context = await requireActiveUser();
  const recordingIdValue = getField(formData, "recordingId");
  const submittedTranscript = getField(formData, "submittedTranscript");

  const recordingId = Number.parseInt(recordingIdValue, 10);

  if (!Number.isInteger(recordingId) || recordingId <= 0) {
    redirect(withFlash("/dashboard", "error", "The selected recording is invalid."));
  }

  if (!submittedTranscript) {
    redirect(withFlash("/dashboard", "error", "Paste your transcript before submitting."));
  }

  const recording = await fetchAccessibleRecordingById(context.supabase, recordingId);

  if (!recording || !recording.test) {
    redirect(
      withFlash(
        "/dashboard",
        "error",
        "That recording is unavailable or you do not have access to it.",
      ),
    );
  }

  const comparison = compareTranscripts(recording.reference_transcript, submittedTranscript);

  const { data, error } = await context.supabase
    .from("attempts")
    .insert({
      user_id: context.user.id,
      recording_id: recording.id,
      submitted_transcript: submittedTranscript,
      accuracy: comparison.accuracy,
      matched_words: comparison.matchedWords,
      reference_word_count: comparison.referenceWordCount,
      submitted_word_count: comparison.submittedWordCount,
      mistake_count: comparison.mistakeCount,
      mistake_details: comparison.mistakes as unknown as Database["public"]["Tables"]["attempts"]["Insert"]["mistake_details"],
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(withFlash("/dashboard", "error", error?.message ?? "Unable to save your attempt."));
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tests/${recording.test.slug}`);
  redirect(
    withFlash(
      `/dashboard/attempts/${data.id}`,
      "success",
      "Transcript submitted. Review your score and mistakes below.",
    ),
  );
}
