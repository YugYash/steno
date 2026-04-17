import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashBanner } from "@/components/flash-banner";
import { fetchAccessibleTestBySlug } from "@/lib/data";
import { requireActiveUser } from "@/lib/auth";
import { readFlash } from "@/lib/flash";
import type { SearchParams } from "@/lib/types";

export default async function TestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const context = await requireActiveUser();
  const { slug } = await params;
  const flash = readFlash(await searchParams);
  const test = await fetchAccessibleTestBySlug(context.supabase, slug);

  if (!test) {
    redirect(
      "/dashboard?error=This%20test%20is%20not%20available%20for%20your%20account%20right%20now.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="text-sm font-semibold text-sky-700">
            ← Back to dashboard
          </Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {test.access_type}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{test.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          {test.description || "Listen carefully, type the transcript, and submit your attempt for automatic comparison."}
        </p>
      </div>

      <div className="space-y-3">
        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />
      </div>

      <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Available recordings</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Choose the WPM you want to practice
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(test.recordings ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
              No active recordings have been added to this test yet.
            </div>
          ) : (
            (test.recordings ?? []).map((recording) => (
              <article
                key={recording.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recording</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {recording.wpm} WPM
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {recording.title || `Practice this test at ${recording.wpm} words per minute.`}
                </p>
                <Link
                  href={`/dashboard/tests/${test.slug}/recordings/${recording.id}`}
                  className="mt-5 inline-flex text-sm font-semibold text-sky-700"
                >
                  Open practice player →
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
