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
      title="Admin dashboard"
      description="Manage student accounts, paid access, practice tests, and recording uploads."
      userName={context.profile.full_name || context.user.email || "Admin"}
      userEmail={context.user.email || ""}
      isAdmin
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-lg shadow-slate-300/30">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Student profiles</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{profiles.length}</h2>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active users</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{activeUsers}</h2>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Paid users</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{paidUsers}</h2>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recordings</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{recordingCount}</h2>
        </article>
      </div>

      <div className="space-y-3">
        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Add new user</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Create a student account manually
              </h2>
            </div>
            <form action={createUserAction} className="mt-5 grid gap-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Full name</span>
                <input name="fullName" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Email address</span>
                <input type="email" name="email" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Temporary password</span>
                <input type="password" name="password" minLength={8} required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="isPaid" className="size-4" />
                  Mark as paid user
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked className="size-4" />
                  Account enabled
                </label>
              </div>
              <SubmitButton pendingLabel="Creating user...">Create student</SubmitButton>
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Create test</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Add a new demo or paid test
              </h2>
            </div>
            <form action={createTestAction} className="mt-5 grid gap-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Test title</span>
                <input name="title" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Description</span>
                <textarea name="description" rows={4} className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Access type</span>
                <select name="accessType" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500">
                  <option value="demo">Demo</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
              <SubmitButton pendingLabel="Creating test...">Create test</SubmitButton>
            </form>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upload recording</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Attach Google Drive audio + reference transcript
              </h2>
            </div>
            <form action={createRecordingAction} className="mt-5 grid gap-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Select test</span>
                <select name="testId" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500">
                  <option value="">Choose a test</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.title} ({test.access_type})
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Recording title (optional)</span>
                <input name="title" className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" placeholder="e.g. Lesson 1 - Warm up" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>WPM</span>
                  <input type="number" name="wpm" min={1} required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Google Drive audio URL</span>
                  <input type="url" name="audioUrl" required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" placeholder="https://drive.google.com/..." />
                </label>
              </div>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Reference transcript</span>
                <textarea name="referenceTranscript" rows={8} required className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500" placeholder="Paste the canonical transcript here..." />
              </label>
              <SubmitButton pendingLabel="Saving recording...">Add recording</SubmitButton>
            </form>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Users</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Manage student access
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {profiles.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No student profiles found yet.
                </div>
              ) : (
                profiles.map((profile) => {
                  const protectedAdmin = isAdminEmail(profile.email);
                  return (
                    <article key={profile.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                            {profile.full_name || profile.email || "Unnamed user"}
                          </h3>
                          <p className="text-sm text-slate-500">{profile.email || "No email stored"}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            Created {formatDate(profile.created_at)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                          <span className={`rounded-full px-3 py-1 ${profile.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {profile.is_active ? "Active" : "Disabled"}
                          </span>
                          <span className={`rounded-full px-3 py-1 ${profile.is_paid ? "bg-sky-100 text-sky-800" : "bg-slate-200 text-slate-700"}`}>
                            {profile.is_paid ? "Paid" : "Demo"}
                          </span>
                          {protectedAdmin ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">Admin</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {protectedAdmin ? (
                          <p className="text-sm text-amber-700">The reserved admin account is protected from dashboard toggles.</p>
                        ) : (
                          <>
                            <form action={toggleUserActiveAction}>
                              <input type="hidden" name="profileId" value={profile.id} />
                              <input type="hidden" name="nextValue" value={profile.is_active ? "false" : "true"} />
                              <SubmitButton className="bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">
                                {profile.is_active ? "Disable account" : "Enable account"}
                              </SubmitButton>
                            </form>
                            <form action={toggleUserPaidAction}>
                              <input type="hidden" name="profileId" value={profile.id} />
                              <input type="hidden" name="nextValue" value={profile.is_paid ? "false" : "true"} />
                              <SubmitButton className="bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">
                                {profile.is_paid ? "Remove paid access" : "Grant paid access"}
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

          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Tests and recordings</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Current catalog
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {tests.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No tests created yet.
                </div>
              ) : (
                tests.map((test) => (
                  <article key={test.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-slate-950">{test.title}</h3>
                        <p className="text-sm text-slate-500">/{test.slug}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                        <span className={`rounded-full px-3 py-1 ${test.access_type === "paid" ? "bg-sky-100 text-sky-800" : "bg-slate-200 text-slate-700"}`}>
                          {test.access_type}
                        </span>
                        <span className={`rounded-full px-3 py-1 ${test.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {test.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {test.description || "No description added yet."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      {(test.recordings ?? []).length === 0 ? (
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">No recordings</span>
                      ) : (
                        (test.recordings ?? []).map((recording) => (
                          <span key={recording.id} className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            {recording.wpm} WPM{recording.title ? ` · ${recording.title}` : ""}
                          </span>
                        ))
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
