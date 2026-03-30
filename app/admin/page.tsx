import { redirect } from "next/navigation";

import { AdminUsersTable } from "@/components/admin-users-table";
import { SetupCard } from "@/components/setup-card";
import { requireViewer } from "@/lib/auth";
import { AuthenticationError, AuthorizationError, ConfigurationError } from "@/lib/errors";
import { requireAdmin, listUsersForAdmin } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let users = [];

  try {
    const viewer = await requireViewer();
    await requireAdmin(viewer);
    users = await listUsersForAdmin();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect("/sign-in");
    }

    if (error instanceof AuthorizationError) {
      redirect("/dashboard");
    }

    if (error instanceof ConfigurationError) {
      return (
        <SetupCard
          title="Admin console unavailable"
          description="Blink needs Clerk and Neon configured before user management can load."
        />
      );
    }

    throw error;
  }

  return (
    <main className="dashboard-shell">
      <AdminUsersTable initialUsers={users} />
    </main>
  );
}
