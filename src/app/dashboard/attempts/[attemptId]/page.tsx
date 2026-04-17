import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashBanner } from "@/components/flash-banner";
import { fetchAttemptById } from "@/lib/data";
import { readFlash } from "@/lib/flash";
import { requireActiveUser } from "@/lib/auth";
import { formatDate, formatPercent } from "@/lib/utils";
import type { SearchParams } from "@/lib/types";

export default async function AttemptDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const context = await requireActiveUser();
  const { attemptId } = await params;
  const flash = readFlash(await searchParams);
  const parsedAttemptId = Number.parseInt(attemptId, 10);

  if (!Number.isInteger(parsedAttemptId) || parsedAttemptId <= 0) {
    redirect("/dashboard?error=The%20selected%20attempt%20is%20invalid.");
  }

  const attempt = await fetchAttemptById(context.supabase, parsedAttemptId);

  if (!attempt || !attempt.recording || !attempt.recording.test) {
    redirect("/dashboard?error=That%20attempt%20was%20not%20found.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="text-sm font-semibold text-sky-700">
            ← Back to dashboard
          </Link>
          <Link
            href={`/dashboard/tests/${attempt.recording.test.slug}/recordings/${attempt.recording.id}`}
            className="text-sm font-semibold text-sky-700"
          >
            Practice again →
          </Link>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          {attempt.recording.test.title} · {attempt.recording.wpm} WPM
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Submitted on {formatDate(attempt.created_at)}. Review your score, mismatched words, and the
          reference transcript below.
        </p>
      </div>

      <div className="space-y-3">
        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-lg shadow-slate-300/30">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Accuracy</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{formatPercent(attempt.accuracy)}%</h2>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Matched words</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{attempt.matched_words}</h2>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Reference words</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{attempt.reference_word_count}</h2>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Mistakes</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{attempt.mistake_count}</h2>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Mistake review</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Word-by-word mismatch summary
            </h2>
          </div>
          {attempt.mistake_details.length === 0 ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
              Excellent work — this submission matched the reference after normalization.
            </div>
          ) : (
            <ul className="space-y-3">
              {attempt.mistake_details.map((mistake, index) => (
                <li key={`${mistake.type}-${mistake.referenceIndex}-${mistake.submittedIndex}-${index}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <p className="font-semibold text-slate-950">
                    {mistake.type === "substitution"
                      ? "Substitution"
                      : mistake.type === "deletion"
                        ? "Missing word"
                        : "Extra word"}
                  </p>
                  <p className="mt-2">
                    Expected: <span className="font-semibold text-slate-950">{mistake.expected || "—"}</span>
                  </p>
                  <p>
                    Actual: <span className="font-semibold text-slate-950">{mistake.actual || "—"}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <div className="grid gap-6">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Your submission</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Submitted transcript
              </h2>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
              {attempt.submitted_transcript}
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Reference transcript</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Official answer key
              </h2>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
              {attempt.recording.reference_transcript}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
