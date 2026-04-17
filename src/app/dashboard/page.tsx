import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { fetchAccessibleTests, fetchRecentAttempts } from "@/lib/data";
import { readFlash } from "@/lib/flash";
import { requireActiveUser } from "@/lib/auth";
import { formatDate, formatPercent } from "@/lib/utils";
import type { SearchParams } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const context = await requireActiveUser();
  const flash = readFlash(await searchParams);
  const [tests, attempts] = await Promise.all([
    fetchAccessibleTests(context.supabase),
    fetchRecentAttempts(context.supabase),
  ]);

  const averageScore =
    attempts.length > 0
      ? attempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / attempts.length
      : 0;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-lg shadow-slate-300/30">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Access level</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {context.profile.is_paid ? "Paid member" : "Demo member"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            {context.profile.is_paid
              ? "You can practice both paid and demo tests."
              : "You currently see demo tests only. Paid tests unlock when the admin marks you as paid."}
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Available tests</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{tests.length}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Includes all tests your current account can access.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recent average</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {formatPercent(averageScore)}%
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Based on your latest {attempts.length || 0} recorded attempt{attempts.length === 1 ? "" : "s"}.
          </p>
        </article>
      </div>

      <div className="space-y-3">
        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />
      </div>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Practice tests</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Pick a test and start dictation practice
              </h2>
            </div>
          </div>

          <div className="grid gap-4">
            {tests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No tests are available for your account yet. Ask the admin to add a demo test or mark
                your account as paid.
              </div>
            ) : (
              tests.map((test) => (
                <article
                  key={test.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{test.title}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200">
                      {test.access_type}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {test.description || "No description added yet."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    {(test.recordings ?? []).map((recording) => (
                      <span key={recording.id} className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                        {recording.wpm} WPM
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/dashboard/tests/${test.slug}`}
                    className="mt-5 inline-flex text-sm font-semibold text-sky-700"
                  >
                    Open test →
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recent attempts</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Review your latest scores
            </h2>
          </div>

          <div className="space-y-3">
            {attempts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                You haven&apos;t submitted any transcript yet. Open a test and complete your first practice attempt.
              </div>
            ) : (
              attempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/dashboard/attempts/${attempt.id}`}
                  className="block rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {attempt.recording?.test?.title || "Practice test"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {attempt.recording?.wpm ?? "-"} WPM · {formatDate(attempt.created_at)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 ring-1 ring-slate-200">
                      {formatPercent(attempt.accuracy)}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {attempt.mistake_count} mistake{attempt.mistake_count === 1 ? "" : "s"} across {attempt.reference_word_count} reference words.
                  </p>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
