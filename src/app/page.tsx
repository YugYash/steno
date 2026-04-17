import Link from "next/link";
import { redirect } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUserContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

const featureCards = [
  {
    title: "Student practice workflow",
    description:
      "Students log in, choose a test, pick a WPM recording, listen to audio, and submit their transcript.",
  },
  {
    title: "Instant accuracy feedback",
    description:
      "Scores ignore spacing, case, and punctuation, then show mismatched words and the official transcript.",
  },
  {
    title: "Admin controls",
    description:
      "The admin can add users, disable accounts, mark paid students, create tests, and upload recordings.",
  },
];

export default async function HomePage() {
  const context = await getCurrentUserContext();

  if (context.user && context.profile) {
    if (!context.profile.is_active) {
      redirect("/blocked");
    }

    redirect(context.isAdmin ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_40%,_#e2e8f0_100%)]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 lg:py-16">
        <section className="grid gap-10 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur lg:grid-cols-[1.3fr_0.9fr] lg:p-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-700">
              Stenography learning platform
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Teach steno, run practice tests, and review transcript accuracy in one place.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Steno helps students practice against audio recordings at different words-per-minute
                speeds, while giving admins a simple dashboard to manage users, paid access, tests,
                and recording uploads.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
              >
                Create student account
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg shadow-slate-300/40">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-200">What students do</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
                <li>• Open demo or paid tests based on account access</li>
                <li>• Choose the required WPM recording</li>
                <li>• Listen to the audio and submit the typed transcript</li>
                <li>• Review score, mistake list, and official reference transcript</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                What admins manage
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>• Add and disable student accounts without deleting data</li>
                <li>• Toggle paid access manually</li>
                <li>• Create demo or paid tests</li>
                <li>• Attach Google Drive audio links plus canonical transcripts</li>
              </ul>
            </div>
          </div>
        </section>

        {!context.isConfigured ? <SetupNotice /> : null}

        <section className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">{feature.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
