"use client";

import { useState } from "react";

import type { Plan, UserListItem } from "@/lib/types";

type AdminUsersTableProps = {
  initialUsers: UserListItem[];
};

export function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function togglePlan(userId: string, currentPlan: Plan) {
    setBusyId(userId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: currentPlan === "free" ? "paid" : "free",
        }),
      });

      const payload = (await response.json()) as {
        user?: UserListItem;
        error?: string;
      };

      if (!response.ok || !payload.user) {
        throw new Error(payload.error ?? "Unable to update the plan.");
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === payload.user?.id ? { ...user, plan: payload.user.plan } : user,
        ),
      );
      setMessage(`Updated ${payload.user.email} to the ${payload.user.plan} plan.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the plan.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="glass-card rounded-[32px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="pill">Manual billing control</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-foreground">
            Admin user management
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Launch v1 with a manual free-to-paid toggle while the rest of the product runs like a real SaaS.
          </p>
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-sm font-medium text-brand-strong">
          {message}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-muted">
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Links</th>
              <th className="px-4 py-3 font-semibold">Clicks</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-line/70">
                <td className="px-4 py-4">
                  <div className="font-semibold text-foreground">{user.email}</div>
                  <div className="text-xs text-muted">
                    {new Date(user.createdAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-4 uppercase tracking-[0.18em] text-muted">
                  {user.role}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
                    {user.plan}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium text-foreground">{user.totalLinks}</td>
                <td className="px-4 py-4 font-medium text-foreground">{user.totalClicks}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => togglePlan(user.id, user.plan)}
                    disabled={busyId === user.id}
                    className="button-secondary px-4 py-2 text-xs"
                  >
                    {busyId === user.id
                      ? "Saving..."
                      : user.plan === "free"
                        ? "Upgrade to paid"
                        : "Downgrade to free"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
