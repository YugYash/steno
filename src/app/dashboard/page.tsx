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

  const hasTests = tests.length > 0;
  const hasAttempts = attempts.length > 0;

  return (
    <>
      {/* Top Banner section */}
      <section className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cb-blue">today&apos;s focus</p>
            <h2 className="text-3xl font-bold tracking-tight text-cb-dark">
              {hasTests ? "practice a test and boost your accuracy" : "your dashboard is ready"}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-500 font-normal">
              {hasTests
                ? "start with a recording that matches your pace, then review mistakes immediately after submission."
                : "no tests are available yet. ask your admin to add a demo test or mark your account as paid."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={hasTests ? `/dashboard/tests/${tests[0]?.slug}` : "/dashboard"}
              className="rounded-[56px] bg-cb-blue px-6 py-3 text-sm font-semibold text-white tracking-[0.16px] hover:bg-cb-hover transition-all text-transform: lowercase"
            >
              {hasTests ? "start next test" : "refresh dashboard"}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-[56px] bg-cb-gray px-6 py-3 text-sm font-semibold text-cb-dark hover:bg-slate-200 transition-all border border-cb-border text-transform: lowercase"
            >
              view overview
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-3xl bg-cb-dark p-6 text-white shadow-xl flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cb-hover font-semibold">access level</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {context.profile.is_paid ? "paid member" : "demo member"}
            </h2>
          </div>
          <p className="mt-4 text-xs leading-normal text-slate-400 font-medium">
            {context.profile.is_paid
              ? "you can practice both paid and demo tests."
              : "you currently see demo tests only. paid tests unlock when the admin marks you as paid."}
          </p>
        </article>

        <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">available tests</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-cb-dark">{tests.length}</h2>
          </div>
          <p className="mt-4 text-xs leading-normal text-slate-500 font-medium">
            includes all tests your current account can access.
          </p>
        </article>

        <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm flex flex-col justify-between min-h-[160px] md:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">recent average</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-cb-dark">
              {formatPercent(averageScore)}%
            </h2>
          </div>
          <p className="mt-4 text-xs leading-normal text-slate-500 font-medium">
            based on your latest {attempts.length || 0} recorded attempt{attempts.length === 1 ? "" : "s"}.
          </p>
        </article>
      </div>

      <div className="space-y-3">
        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />
      </div>

      {/* Main Grid layout */}
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">practice tests</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-cb-dark">
              pick a test and start dictation practice
            </h2>
          </div>

          <div className="grid gap-5">
            {tests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-cb-gray/50 p-6 text-sm text-slate-500">
                <p>
                  no tests are available for your account yet. ask the admin to add a demo test or mark
                  your account as paid.
                </p>
              </div>
            ) : (
              tests.map((test) => (
                <article
                  key={test.id}
                  className="rounded-2xl border border-cb-border bg-white p-5 transition-all duration-200 hover:border-cb-blue hover:shadow-md flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold tracking-tight text-cb-dark">{test.title}</h3>
                      <span className="rounded-full bg-cb-gray px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {test.access_type}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 font-normal">
                      {test.description || "no description added yet."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 font-medium">
                      {(test.recordings ?? []).map((recording) => (
                        <span key={recording.id} className="rounded-full bg-cb-gray px-3 py-1 text-[11px] font-semibold text-cb-dark">
                          {recording.wpm} wpm
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-cb-border/30 flex justify-end">
                    <Link
                      href={`/dashboard/tests/${test.slug}`}
                      className="rounded-[56px] bg-cb-gray text-cb-blue border border-cb-blue hover:bg-cb-blue hover:text-white px-5 py-2 text-xs font-bold tracking-[0.16px] text-transform: lowercase transition-all duration-200 cursor-pointer"
                    >
                      open test
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">recent attempts</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-cb-dark">
              review your latest scores
            </h2>
          </div>

          <div className="rounded-2xl border border-cb-border bg-cb-gray/30 px-4 py-3">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {hasAttempts
                ? `you have ${attempts.length} recent attempt${attempts.length === 1 ? "" : "s"} to review.`
                : "complete your first attempt to track progress here."}
            </p>
          </div>

          <div className="space-y-4">
            {attempts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-cb-gray/30 p-5 text-sm leading-relaxed text-slate-500">
                you haven&apos;t submitted any transcript yet. open a test and complete your first practice attempt.
              </div>
            ) : (
              attempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/dashboard/attempts/${attempt.id}`}
                  className="block rounded-2xl border border-cb-border bg-white p-4 transition-all duration-200 hover:border-cb-blue hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-cb-dark text-sm leading-snug">
                        {attempt.recording?.test?.title || "practice test"}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {attempt.recording?.wpm ?? "-"} wpm · {formatDate(attempt.created_at)}
                      </p>
                    </div>
                    <span className="rounded-full bg-cb-gray px-3 py-1.5 text-xs font-bold text-cb-blue border border-cb-border">
                      {formatPercent(attempt.accuracy)}%
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">
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
