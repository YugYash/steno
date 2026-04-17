import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { FlashBanner } from "@/components/flash-banner";
import { SubmitButton } from "@/components/submit-button";
import { getCurrentUserContext } from "@/lib/auth";
import { readFlash } from "@/lib/flash";
import type { SearchParams } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BlockedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const context = await getCurrentUserContext();
  const flash = readFlash(await searchParams);

  if (context.user && context.profile?.is_active) {
    redirect(context.isAdmin ? "/admin" : "/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <section className="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-xl shadow-rose-100/60">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-rose-600">Account disabled</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          Your access has been turned off.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Your practice history is still saved, but you can&apos;t access dashboards or tests until the
          admin re-enables your account.
        </p>

        <div className="mt-6 space-y-3">
          <FlashBanner message={flash.info} kind="info" />
          <FlashBanner message={flash.error} kind="error" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to login
          </Link>
          {context.user ? (
            <form action={logoutAction}>
              <SubmitButton className="rounded-full" pendingLabel="Signing out...">
                Log out
              </SubmitButton>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}
