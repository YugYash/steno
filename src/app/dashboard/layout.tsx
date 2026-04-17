import { AppShell } from "@/components/app-shell";
import { requireActiveUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await requireActiveUser();

  return (
    <AppShell
      current="dashboard"
      title="Student dashboard"
      description="Choose a test, practice at the right WPM, and review your latest submissions."
      userName={context.profile.full_name || context.user.email || "Student"}
      userEmail={context.user.email || ""}
      isAdmin={context.isAdmin}
    >
      {children}
    </AppShell>
  );
}
