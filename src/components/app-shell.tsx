"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userInitial = userName.trim().charAt(0).toUpperCase() || "S";

  const navItems = [
    {
      href: "/dashboard",
      label: "student dashboard",
      current: current === "dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "admin dashboard",
            current: current === "admin",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const showExpanded = !isMobile ? !isCollapsed : true;

    return (
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col flex-1">
          {/* Brand Header */}
          <div className={cn("flex h-20 items-center border-b border-cb-border px-6", showExpanded ? "justify-between" : "justify-center")}>
            <Link href="/" className="text-2xl font-bold tracking-tight text-cb-blue hover:text-cb-hover transition-colors shrink-0">
              {showExpanded ? "steno." : "s."}
            </Link>
            {(mobileMenuOpen && isMobile) && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-2 text-slate-400 hover:text-cb-dark rounded-full hover:bg-cb-gray transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-full hover:bg-cb-gray text-slate-400 hover:text-cb-blue border border-cb-border transition-colors cursor-pointer shrink-0"
              >
                {isCollapsed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Navigation List */}
          <nav className="flex-1 space-y-2 px-4 py-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={!showExpanded ? item.label : undefined}
                className={cn(
                  "rounded-[56px] py-3 text-sm font-semibold tracking-[0.16px] text-transform: lowercase flex items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-blue",
                  showExpanded ? "px-5 gap-3.5 justify-start" : "px-0 justify-center w-12 mx-auto",
                  item.current
                    ? "bg-cb-blue text-white hover:bg-cb-hover shadow-sm shadow-cb-blue/15"
                    : "text-cb-dark hover:bg-cb-gray",
                )}
              >
                {item.icon}
                {showExpanded && <span className="truncate">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Profile & Log Out */}
        <div className="border-t border-cb-border px-4 py-6 space-y-4 bg-slate-50/50">
          <div className={cn("flex items-center gap-3", showExpanded ? "px-3 py-1" : "justify-center py-1")}>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-cb-blue text-sm font-semibold text-white shrink-0">
              {userInitial}
            </div>
            {showExpanded && (
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-cb-dark text-sm truncate leading-tight">{userName}</p>
                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{userEmail}</p>
              </div>
            )}
          </div>

          <form action={logoutAction} className="pt-2">
            <button
              type="submit"
              title={!showExpanded ? "log out" : undefined}
              className={cn(
                "rounded-[56px] bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:text-rose-700 py-3 text-sm font-semibold text-rose-600 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2",
                showExpanded ? "w-full" : "w-12 mx-auto"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
              {showExpanded && <span>log out</span>}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cb-gray/30">
      {/* 1. Desktop Sidebar Component */}
      <aside className={cn("hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col border-r border-cb-border bg-white shadow-xs transition-all duration-300 ease-in-out", isCollapsed ? "w-20" : "w-64")}>
        <SidebarContent />
      </aside>

      {/* 2. Responsive Mobile Top-Bar Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-cb-border bg-white px-6 shadow-xs lg:hidden">
        <Link href="/" className="text-xl font-bold tracking-tight text-cb-blue">
          steno.
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -mr-2 text-cb-dark hover:text-cb-blue hover:bg-cb-gray rounded-full transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* 3. Mobile Navigation Drawer (Overlay slide-out) */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Overlay mask */}
          <div
            className="fixed inset-0 bg-cb-dark/30 backdrop-blur-xs transition-opacity duration-300 ease-out"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide container */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs bg-white shadow-xl animate-slide-right">
            <aside className="w-full flex flex-col h-full">
              <SidebarContent isMobile={true} />
            </aside>
          </div>
        </div>
      )}

      {/* 4. Main Body Content (Offset by Desktop Sidebar) */}
      <div className={cn("flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out", isCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        <div className="border-b border-cb-border bg-white py-6 shadow-xs">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-cb-dark md:text-3xl text-transform: lowercase">
              {title}
            </h1>
            <p className="mt-1.5 text-xs font-medium text-slate-400 leading-normal">
              {description}
            </p>
          </div>
        </div>
        <main className="mx-auto w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-8 md:py-10 flex-1 flex">
          {children}
        </main>
      </div>
    </div>
  );
}
