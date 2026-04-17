import { getSetupSteps } from "@/lib/env";

export function SetupNotice() {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
        Supabase setup required
      </p>
      <h2 className="mt-2 text-2xl font-semibold">Configure the app before using auth or dashboards.</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-amber-900">
        {getSetupSteps().map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
