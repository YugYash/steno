import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  current: "dashboard" | "admin";
  title: string;
  description: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  children: React.ReactNode;
};

export function AppShell({
  current,
  title,
  description,
  userName,
  userEmail,
  isAdmin,
  children,
}: AppShellProps) {
  const navItems = [
    { href: "/dashboard", label: "Student dashboard", current: current === "dashboard" },
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin dashboard", current: current === "admin" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              Steno
            </Link>
            <div className="mt-3 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{userName}</p>
              <p>{userEmail}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    item.current
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-200",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <form action={logoutAction}>
                <SubmitButton className="rounded-full bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">
                  Log out
                </SubmitButton>
              </form>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">{children}</main>
    </div>
  );
}
