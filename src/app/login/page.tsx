import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { FlashBanner } from "@/components/flash-banner";
import { SetupNotice } from "@/components/setup-notice";
import { SubmitButton } from "@/components/submit-button";
import { readFlash } from "@/lib/flash";
import { redirectSignedInUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import type { SearchParams } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await redirectSignedInUser();
  const flash = readFlash(await searchParams);
  const configured = isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-700">Steno login</p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Welcome back to your steno practice workspace.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Log in to continue your practice sessions, review previous submissions, or manage tests
            and students if you are the admin.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Don&apos;t have an account yet?</p>
          <Link href="/signup" className="mt-3 inline-flex text-sm font-semibold text-sky-700">
            Create a student account →
          </Link>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Log in</h2>
          <p className="text-sm text-slate-600">Use your student or admin credentials.</p>
        </div>

        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.success} kind="success" />
        <FlashBanner message={flash.info} kind="info" />

        {!configured ? (
          <SetupNotice />
        ) : (
          <form action={loginAction} className="space-y-4">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="student@example.com"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Password</span>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="Enter your password"
              />
            </label>
            <SubmitButton className="w-full" pendingLabel="Logging in...">
              Log in
            </SubmitButton>
          </form>
        )}
      </section>
    </main>
  );
}
