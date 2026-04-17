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
  const userInitial = userName.trim().charAt(0).toUpperCase() || "S";
  const navItems = [
    { href: "/dashboard", label: "Student dashboard", current: current === "dashboard" },
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin dashboard", current: current === "admin" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-[linear-gradient(120deg,#ffffff_0%,#f8fafc_55%,#eef2ff_100%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
              Steno
            </Link>
            <div className="mt-3 space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-semibold !text-white">
                {userInitial}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{userName}</p>
                <p className="text-slate-600">{userEmail}</p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                    item.current
                      ? "bg-slate-950 !text-white shadow-sm"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <form action={logoutAction}>
                <SubmitButton className="rounded-full !bg-rose-600 px-4 py-2 text-sm font-medium !text-white ring-1 ring-rose-400/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 hover:!bg-rose-700 hover:ring-rose-500/70">
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
