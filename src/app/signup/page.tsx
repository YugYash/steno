import Link from "next/link";

import { signupAction } from "@/app/actions/auth";
import { FlashBanner } from "@/components/flash-banner";
import { SetupNotice } from "@/components/setup-notice";
import { SubmitButton } from "@/components/submit-button";
import { redirectSignedInUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { readFlash } from "@/lib/flash";
import type { SearchParams } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await redirectSignedInUser();
  const flash = readFlash(await searchParams);
  const configured = isSupabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <section className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-700">Create account</p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Start practicing steno with guided audio tests.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Sign up as a student to access demo tests immediately after login. Paid tests unlock when
            the admin marks your account as paid.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Already have an account?</p>
          <Link href="/login" className="mt-3 inline-flex text-sm font-semibold text-sky-700">
            Go to login →
          </Link>
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Create your account</h2>
          <p className="text-sm text-slate-600">Students can sign up here. The admin account is configured separately.</p>
        </div>

        <FlashBanner message={flash.error} kind="error" />
        <FlashBanner message={flash.info} kind="info" />

        {!configured ? (
          <SetupNotice />
        ) : (
          <form action={signupAction} className="space-y-4">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Full name</span>
              <input
                type="text"
                name="fullName"
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="Your full name"
              />
            </label>
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
                minLength={8}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500"
                placeholder="At least 8 characters"
              />
            </label>
            <SubmitButton className="w-full" pendingLabel="Creating account...">
              Create account
            </SubmitButton>
          </form>
        )}
      </section>
    </main>
  );
}
