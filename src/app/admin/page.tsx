import { notFound } from "next/navigation";

import {
  createRecordingAction,
  createTestAction,
  createUserAction,
  toggleUserActiveAction,
  toggleUserPaidAction,
} from "@/app/actions/admin";
import { AppShell } from "@/components/app-shell";
import { FlashBanner } from "@/components/flash-banner";
import { SetupNotice } from "@/components/setup-notice";
import { SubmitButton } from "@/components/submit-button";
import { requireAdminUser } from "@/lib/auth";
import { fetchAdminProfiles, fetchAdminTests } from "@/lib/data";
import { isAdminEmail, hasServiceRoleAccess } from "@/lib/env";
import { readFlash } from "@/lib/flash";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { SearchParams } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const context = await requireAdminUser();
  const flash = readFlash(await searchParams);

  if (!hasServiceRoleAccess()) {
    return (
      <AppShell
        current="admin"
        title="Admin dashboard"
        description="Finish your Supabase service-role setup to manage students and content."
        userName={context.profile.full_name || context.user.email || "Admin"}
        userEmail={context.user.email || ""}
        isAdmin
      >
        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />
        <SetupNotice />
      </AppShell>
    );
  }

  const adminClient = createAdminSupabaseClient();
  if (!adminClient) {
    notFound();
  }

  const [profiles, tests] = await Promise.all([
    fetchAdminProfiles(adminClient),
    fetchAdminTests(adminClient),
  ]);

  const activeUsers = profiles.filter((profile) => profile.is_active).length;
  const paidUsers = profiles.filter((profile) => profile.is_paid).length;
  const recordingCount = tests.reduce((count, test) => count + (test.recordings?.length ?? 0), 0);

  return (
    <AppShell
      current="admin"
      title="admin dashboard"
      description="manage student accounts, paid access, practice tests, and recording dictations."
      userName={context.profile.full_name || context.user.email || "Admin"}
      userEmail={context.user.email || ""}
      isAdmin
    >
      {/* Overview Stats Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl bg-cb-dark p-6 text-white shadow-xl flex flex-col justify-between min-h-[120px]">
          <p className="text-xs uppercase tracking-[0.24em] text-cb-hover font-semibold">student profiles</p>
          <h2 className="text-3xl font-bold tracking-tight mt-2">{profiles.length}</h2>
        </article>
        <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">active users</p>
          <h2 className="text-3xl font-bold tracking-tight text-cb-dark mt-2">{activeUsers}</h2>
        </article>
        <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">paid users</p>
          <h2 className="text-3xl font-bold tracking-tight text-cb-dark mt-2">{paidUsers}</h2>
        </article>
        <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">recordings</p>
          <h2 className="text-3xl font-bold tracking-tight text-cb-dark mt-2">{recordingCount}</h2>
        </article>
      </div>

      <div className="space-y-3">
        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />
      </div>

      {/* Main Grid: Create content vs current catalog */}
      <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          
          {/* Card: Add new user */}
          <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">add new user</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-cb-dark">
                create a student account manually
              </h2>
            </div>
            <form action={createUserAction} className="mt-6 grid gap-5">
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  full name
                </label>
                <input
                  name="fullName"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  email address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john.doe@example.com"
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  temporary password
                </label>
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  required
                  placeholder="minimum 8 characters"
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-cb-border bg-cb-gray/30 px-5 py-3.5 text-sm text-cb-dark font-medium hover:bg-cb-gray/50 transition-colors cursor-pointer">
                  <input type="checkbox" name="isPaid" className="size-4 rounded border-slate-300 accent-cb-blue" />
                  <span>mark as paid user</span>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-cb-border bg-cb-gray/30 px-5 py-3.5 text-sm text-cb-dark font-medium hover:bg-cb-gray/50 transition-colors cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked className="size-4 rounded border-slate-300 accent-cb-blue" />
                  <span>account enabled</span>
                </label>
              </div>
              <div className="pt-2">
                <SubmitButton pendingLabel="creating student..." className="w-full">
                  create student
                </SubmitButton>
              </div>
            </form>
          </article>

          {/* Card: Create Test */}
          <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">create test</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-cb-dark">
                add a new demo or paid test
              </h2>
            </div>
            <form action={createTestAction} className="mt-6 grid gap-5">
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  test title
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Practice Set 5 - Shorthand Speed"
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="describe the dictation content (brief summary)..."
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  access type
                </label>
                <select
                  name="accessType"
                  required
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="demo">Demo (Free for everyone)</option>
                  <option value="paid">Paid (Unlocked for paid members only)</option>
                </select>
              </div>
              <div className="pt-2">
                <SubmitButton pendingLabel="creating test..." className="w-full">
                  create test
                </SubmitButton>
              </div>
            </form>
          </article>

          {/* Card: Upload Recording (Visual redesign to make it ultra simple for admin) */}
          <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">upload recording</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-cb-dark">
                attach audio + reference transcript
              </h2>
            </div>
            <form action={createRecordingAction} className="mt-6 grid gap-5">
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  select test
                </label>
                <select
                  name="testId"
                  required
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="">choose a target test...</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.title} ({test.access_type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  recording title (optional)
                </label>
                <input
                  name="title"
                  placeholder="e.g. Dictation warm up, Slow speed prep"
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                    wpm (speed)
                  </label>
                  <input
                    type="number"
                    name="wpm"
                    min={1}
                    required
                    placeholder="e.g. 80"
                    className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                    google drive audio URL
                  </label>
                  <input
                    type="url"
                    name="audioUrl"
                    required
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.15em] font-bold text-slate-400 mb-2 block">
                  reference transcript (canonical copy for grading)
                </label>
                <textarea
                  name="referenceTranscript"
                  rows={6}
                  required
                  placeholder="paste the canonical dictation script exactly. spelling, formatting, and casing will be automatically normalized during assessment..."
                  className="w-full rounded-2xl border border-cb-border px-5 py-3.5 bg-white text-cb-dark focus:outline-none focus:border-cb-blue focus:ring-1 focus:ring-cb-blue transition-all text-sm font-medium font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <SubmitButton pendingLabel="saving recording..." className="w-full">
                  add recording dictation
                </SubmitButton>
              </div>
            </form>
          </article>
        </div>

        {/* Catalog and lists */}
        <div className="space-y-8">
          
          {/* Card: Users */}
          <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">users</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-cb-dark">
                manage student access
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {profiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-cb-gray/50 p-6 text-sm text-slate-500 text-center">
                  no student profiles found yet.
                </div>
              ) : (
                profiles.map((profile) => {
                  const protectedAdmin = isAdminEmail(profile.email);
                  return (
                    <article key={profile.id} className="rounded-2xl border border-cb-border bg-white p-5 transition-all duration-200 hover:shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-cb-dark leading-snug">
                            {profile.full_name || profile.email || "unnamed user"}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">{profile.email || "no email stored"}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                            joined {formatDate(profile.created_at)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                          <span className={`rounded-full px-2.5 py-1 ${profile.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                            {profile.is_active ? "active" : "disabled"}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 ${profile.is_paid ? "bg-cb-blue/10 text-cb-blue border border-cb-blue/20" : "bg-cb-gray text-slate-600 border border-cb-border"}`}>
                            {profile.is_paid ? "paid" : "demo"}
                          </span>
                          {protectedAdmin ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 border border-amber-100">admin</span>
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-cb-border/30 pt-3">
                        {protectedAdmin ? (
                          <p className="text-xs text-amber-700 leading-normal font-medium">the reserved admin account is protected from dashboard toggles.</p>
                        ) : (
                          <>
                            <form action={toggleUserActiveAction}>
                              <input type="hidden" name="profileId" value={profile.id} />
                              <input type="hidden" name="nextValue" value={profile.is_active ? "false" : "true"} />
                              <SubmitButton className="rounded-[56px] bg-white text-cb-dark border border-cb-border hover:bg-cb-gray font-semibold text-xs tracking-[0.16px] text-transform: lowercase transition-all px-4 py-2 bg-none shadow-none cursor-pointer">
                                {profile.is_active ? "disable account" : "enable account"}
                              </SubmitButton>
                            </form>
                            <form action={toggleUserPaidAction}>
                              <input type="hidden" name="profileId" value={profile.id} />
                              <input type="hidden" name="nextValue" value={profile.is_paid ? "false" : "true"} />
                              <SubmitButton className="rounded-[56px] bg-white text-cb-dark border border-cb-border hover:bg-cb-gray font-semibold text-xs tracking-[0.16px] text-transform: lowercase transition-all px-4 py-2 bg-none shadow-none cursor-pointer">
                                {profile.is_paid ? "remove paid access" : "grant paid access"}
                              </SubmitButton>
                            </form>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </article>

          {/* Card: Tests and recordings catalog */}
          <article className="rounded-3xl border border-cb-border bg-white p-6 shadow-sm lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">tests and recordings</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-cb-dark">
                current catalog
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {tests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-cb-gray/50 p-6 text-sm text-slate-500 text-center">
                  no tests created yet.
                </div>
              ) : (
                tests.map((test) => (
                  <article key={test.id} className="rounded-2xl border border-cb-border bg-white p-5 transition-all duration-200 hover:shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-cb-dark leading-snug">{test.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">/{test.slug}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className={`rounded-full px-2.5 py-1 ${test.access_type === "paid" ? "bg-cb-blue/10 text-cb-blue border border-cb-blue/20" : "bg-cb-gray text-slate-600 border border-cb-border"}`}>
                          {test.access_type}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 ${test.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                          {test.is_active ? "active" : "hidden"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500 font-medium">
                      {test.description || "no description added yet."}
                    </p>
                    
                    <div className="mt-4 flex flex-col gap-2 border-t border-cb-border/30 pt-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">recordings</p>
                      {(test.recordings ?? []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">no dictation recordings uploaded yet</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(test.recordings ?? []).map((recording) => (
                            <span key={recording.id} className="rounded-full bg-cb-gray px-3 py-1 text-[11px] font-semibold text-cb-dark border border-cb-border/50">
                              {recording.wpm} wpm{recording.title ? ` · ${recording.title}` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
