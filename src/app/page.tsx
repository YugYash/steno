import Link from "next/link";
import { redirect } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { getCurrentUserContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

const features = [
  {
    title: "student practice workflow",
    description:
      "students log in, choose a test, pick a wpm recording, listen to the dictation audio, and submit their written transcript.",
  },
  {
    title: "instant accuracy feedback",
    description:
      "grading is completely automated. we ignore spacing, case, and punctuation, showing exact mismatched words alongside the official transcript.",
  },
  {
    title: "admin controls",
    description:
      "admins can add student accounts, toggle paid access, enable/disable profiles, create tests, and upload new google drive recordings instantly.",
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
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 border-b border-cb-border">
        <Link href="/" className="text-xl font-bold tracking-tight text-cb-blue hover:text-cb-hover transition-colors">
          steno.
        </Link>
        <Link
          href="/login"
          className="rounded-[56px] bg-cb-gray px-6 py-2.5 text-sm font-semibold text-cb-dark hover:bg-slate-200 transition-all text-transform: lowercase"
        >
          log in
        </Link>
      </nav>

      {/* Hero Section (White Light Surface) */}
      <header className="mx-auto max-w-7xl px-6 py-20 md:py-32 flex flex-col items-start gap-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cb-blue">
          learning & testing platform
        </p>
        <h1 className="max-w-4xl text-5xl md:text-[80px] leading-[1.00] font-bold tracking-[-0.03em] text-cb-dark">
          teach steno, run practice tests, and review transcript accuracy.
        </h1>
        <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-slate-500 font-normal">
          steno helps students practice against audio recordings at custom words-per-minute speeds, while giving admins a seamless, premium dashboard to manage files and access.
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link
            href="/signup"
            className="rounded-[56px] bg-cb-blue px-8 py-4 text-base font-semibold text-white tracking-[0.16px] hover:bg-cb-hover transition-all text-transform: lowercase"
          >
            create student account
          </Link>
          <Link
            href="/login"
            className="rounded-[56px] bg-cb-gray px-8 py-4 text-base font-semibold text-cb-dark hover:bg-[#d8dade] transition-all border border-cb-border text-transform: lowercase"
          >
            log in
          </Link>
        </div>
      </header>

      {/* Feature Walkthroughs (Alternating Near-Black Dark Section) */}
      <section className="bg-cb-dark text-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cb-hover">
                experience steno
              </p>
              <h2 className="text-4xl md:text-[52px] leading-[1.05] font-bold tracking-tight text-white">
                engineered for seamless dictation and scoring.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                our grading engine strips out trivial layout inconsistencies to show you exactly where you tripped up, so you can focus entirely on shorthand speed.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="rounded-3xl border border-cb-border bg-cb-card p-6 shadow-xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cb-hover mb-2">what students do</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cb-blue font-bold">✓</span> Open demo or paid tests directly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cb-blue font-bold">✓</span> Choose custom speeds (WPM)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cb-blue font-bold">✓</span> Listen to audio and write the transcript
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cb-blue font-bold">✓</span> Review precise word-by-word mismatch grading
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border border-cb-border bg-cb-card p-6 shadow-xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">what admins manage</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 font-bold">✓</span> Create student accounts and enable access
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 font-bold">✓</span> Manage demo vs paid membership permissions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 font-bold">✓</span> Attach Google Drive audio files instantly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 font-bold">✓</span> Input canonical transcripts for grading
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Notification if active */}
      {!context.isConfigured ? (
        <section className="bg-cb-gray py-8 border-t border-b border-cb-border">
          <div className="mx-auto max-w-7xl px-6">
            <SetupNotice />
          </div>
        </section>
      ) : null}

      {/* Grid of Highlight Features (Light Secondary Surface background) */}
      <section className="bg-[#fcfdfe] py-24 border-t border-cb-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-cb-border bg-white p-8 transition hover:shadow-lg hover:shadow-slate-100 duration-200"
              >
                <h3 className="text-xl font-bold tracking-tight text-cb-dark text-transform: lowercase">{feature.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-500 font-normal">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cb-dark text-slate-500 py-12 border-t border-cb-border/10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-medium">steno &copy; {new Date().getFullYear()}. all rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors text-transform: lowercase">student portal</Link>
            <Link href="/signup" className="hover:text-white transition-colors text-transform: lowercase">register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
