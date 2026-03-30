import { redirect } from "next/navigation";

import { AdminBlogManager } from "@/components/admin-blog-manager";
import { AdminUsersTable } from "@/components/admin-users-table";
import { SetupCard } from "@/components/setup-card";
import { requireViewer } from "@/lib/auth";
import { listAdminBlogPosts } from "@/lib/blogs";
import { AuthenticationError, AuthorizationError, ConfigurationError } from "@/lib/errors";
import { requireAdmin, listUsersForAdmin } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let users = [];
  let posts = [];

  try {
    const viewer = await requireViewer();
    await requireAdmin(viewer);
    users = await listUsersForAdmin();
    posts = await listAdminBlogPosts();
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
      <div className="grid gap-6">
        <AdminUsersTable initialUsers={users} />
        <AdminBlogManager initialPosts={posts} />
      </div>
    </main>
  );
}
