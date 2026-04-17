import Link from "next/link";
import { redirect } from "next/navigation";

import { submitAttemptAction } from "@/app/actions/student";
import { FlashBanner } from "@/components/flash-banner";
import { SubmitButton } from "@/components/submit-button";
import { requireActiveUser } from "@/lib/auth";
import { fetchAccessibleRecordingById } from "@/lib/data";
import { readFlash } from "@/lib/flash";
import { getPlayableAudioUrl } from "@/lib/utils";
import type { SearchParams } from "@/lib/types";

export default async function RecordingPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; recordingId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const context = await requireActiveUser();
  const { slug, recordingId } = await params;
  const flash = readFlash(await searchParams);
  const parsedRecordingId = Number.parseInt(recordingId, 10);

  if (!Number.isInteger(parsedRecordingId) || parsedRecordingId <= 0) {
    redirect("/dashboard?error=The%20selected%20recording%20is%20invalid.");
  }

  const recording = await fetchAccessibleRecordingById(context.supabase, parsedRecordingId);

  if (!recording || !recording.test || recording.test.slug !== slug) {
    redirect(
      "/dashboard?error=That%20recording%20is%20unavailable%20or%20you%20do%20not%20have%20access%20to%20it.",
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/dashboard/tests/${slug}`} className="text-sm font-semibold text-sky-700">
            ← Back to test
          </Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {recording.wpm} WPM
          </span>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Practice now</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {recording.test.title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {recording.title || `Listen to the audio at ${recording.wpm} WPM and type the transcript below.`}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700">Audio player</p>
          <audio className="mt-4 w-full" controls preload="none" src={getPlayableAudioUrl(recording.audio_url)}>
            Your browser does not support HTML audio playback.
          </audio>
          <p className="mt-4 text-xs leading-6 text-slate-500">
            If the embedded Google Drive link does not play, open the original source in a new tab:
            {" "}
            <a
              href={recording.audio_url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-sky-700"
            >
              open audio link
            </a>
            .
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <p className="font-semibold text-slate-900">How scoring works</p>
          <ul className="mt-3 space-y-2">
            <li>• Only the words matter for matching — not spaces, punctuation, or case.</li>
            <li>• Submit your transcript in the editor on the right.</li>
            <li>• After submitting, you&apos;ll see your accuracy, mistakes, and the official reference text.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Submit transcript</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Type or paste what you hear
          </h2>
        </div>

        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />

        <form action={submitAttemptAction} className="space-y-4">
          <input type="hidden" name="recordingId" value={recording.id} />
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Transcript</span>
            <textarea
              name="submittedTranscript"
              required
              rows={14}
              className="w-full rounded-[1.5rem] border border-slate-300 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-sky-500"
              placeholder="Type the transcript exactly as you hear it..."
            />
          </label>
          <SubmitButton className="w-full" pendingLabel="Submitting transcript...">
            Submit transcript
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
