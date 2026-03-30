import { count, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { links, users } from "@/lib/db/schema";
import { AuthorizationError } from "@/lib/errors";
import { isAdminEmail } from "@/lib/env";
import type { AuthenticatedAppUser, Plan, UserListItem } from "@/lib/types";

type UserRow = typeof users.$inferSelect;

function serializeUser(row: UserRow): AuthenticatedAppUser {
  return {
    id: row.id,
    clerkUserId: row.clerkUserId,
    email: row.email,
    plan: row.plan,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function upsertAppUser(input: {
  clerkUserId: string;
  email: string;
}) {
  const db = getDb();
  const role = isAdminEmail(input.email) ? "admin" : "user";

  const [user] = await db
    .insert(users)
    .values({
      clerkUserId: input.clerkUserId,
      email: input.email.toLowerCase(),
      role,
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        email: input.email.toLowerCase(),
        role,
        updatedAt: new Date(),
      },
    })
    .returning();

  return serializeUser(user);
}

export async function requireAdmin(viewer: AuthenticatedAppUser) {
  if (viewer.role !== "admin") {
    throw new AuthorizationError();
  }

  return viewer;
}

export async function listUsersForAdmin() {
  const db = getDb();

  const rows = await db
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      email: users.email,
      plan: users.plan,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      totalLinks: count(links.id),
      totalClicks: sql<number>`coalesce(sum(${links.clicks}), 0)::int`,
    })
    .from(users)
    .leftJoin(links, eq(links.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return rows.map(
    (row): UserListItem => ({
      id: row.id,
      clerkUserId: row.clerkUserId,
      email: row.email,
      plan: row.plan,
      role: row.role,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      totalLinks: Number(row.totalLinks ?? 0),
      totalClicks: Number(row.totalClicks ?? 0),
    }),
  );
}

export async function updateUserPlan(userId: string, plan: Plan) {
  const db = getDb();
  const [user] = await db
    .update(users)
    .set({
      plan,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!user) {
    throw new Error("User not found.");
  }

  return serializeUser(user);
}
