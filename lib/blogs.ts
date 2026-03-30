import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { AppError, ConflictError } from "@/lib/errors";
import type {
  AuthenticatedAppUser,
  BlogEditorInput,
  BlogPostDetail,
  BlogPostSummary,
} from "@/lib/types";

type BlogRow = typeof blogPosts.$inferSelect;

function estimateReadTime(content: string) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
}

function buildParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function createSlugFromTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 180);
}

function serializeSummary(row: BlogRow, authorEmail: string): BlogPostSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    authorEmail,
    isPublished: row.isPublished,
    readTime: estimateReadTime(row.content),
  };
}

function serializeDetail(row: BlogRow, authorEmail: string): BlogPostDetail {
  const summary = serializeSummary(row, authorEmail);

  return {
    ...summary,
    paragraphs: buildParagraphs(row.content),
  };
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function getBlogRowForAdmin(blogId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      post: blogPosts,
      authorEmail: users.email,
    })
    .from(blogPosts)
    .innerJoin(users, eq(users.id, blogPosts.authorId))
    .where(eq(blogPosts.id, blogId))
    .limit(1);

  if (!row) {
    throw new AppError("Blog post not found.", 404);
  }

  return row;
}

export async function listPublishedBlogPosts() {
  const db = getDb();
  const rows = await db
    .select({
      post: blogPosts,
      authorEmail: users.email,
    })
    .from(blogPosts)
    .innerJoin(users, eq(users.id, blogPosts.authorId))
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));

  return rows.map((row) => serializeSummary(row.post, row.authorEmail));
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const db = getDb();
  const [row] = await db
    .select({
      post: blogPosts,
      authorEmail: users.email,
    })
    .from(blogPosts)
    .innerJoin(users, eq(users.id, blogPosts.authorId))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
    .limit(1);

  return row ? serializeDetail(row.post, row.authorEmail) : null;
}

export async function listAdminBlogPosts() {
  const db = getDb();
  const rows = await db
    .select({
      post: blogPosts,
      authorEmail: users.email,
    })
    .from(blogPosts)
    .innerJoin(users, eq(users.id, blogPosts.authorId))
    .orderBy(desc(blogPosts.updatedAt));

  return rows.map((row) => serializeSummary(row.post, row.authorEmail));
}

export async function createBlogPostForAdmin(
  viewer: AuthenticatedAppUser,
  input: BlogEditorInput,
) {
  const db = getDb();
  const slug = input.slug ?? createSlugFromTitle(input.title);

  if (!slug) {
    throw new AppError("Unable to generate a slug for this blog post.");
  }

  try {
    const [created] = await db
      .insert(blogPosts)
      .values({
        authorId: viewer.id,
        title: input.title,
        slug,
        excerpt: input.excerpt,
        content: input.content,
        isPublished: input.isPublished,
        publishedAt: input.isPublished ? new Date() : null,
      })
      .returning();

    return serializeSummary(created, viewer.email);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("That blog slug is already in use.");
    }

    throw error;
  }
}

export async function updateBlogPostForAdmin(
  blogId: string,
  input: BlogEditorInput,
) {
  const db = getDb();
  const current = await getBlogRowForAdmin(blogId);
  const slug = input.slug ?? createSlugFromTitle(input.title);

  if (!slug) {
    throw new AppError("Unable to generate a slug for this blog post.");
  }

  const nextPublishedAt =
    input.isPublished && !current.post.isPublished
      ? new Date()
      : input.isPublished
        ? current.post.publishedAt ?? new Date()
        : null;

  try {
    const [updated] = await db
      .update(blogPosts)
      .set({
        title: input.title,
        slug,
        excerpt: input.excerpt,
        content: input.content,
        isPublished: input.isPublished,
        publishedAt: nextPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, blogId))
      .returning();

    return serializeSummary(updated, current.authorEmail);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("That blog slug is already in use.");
    }

    throw error;
  }
}

export async function deleteBlogPostForAdmin(blogId: string) {
  const db = getDb();
  const [deleted] = await db
    .delete(blogPosts)
    .where(eq(blogPosts.id, blogId))
    .returning({ id: blogPosts.id });

  if (!deleted) {
    throw new AppError("Blog post not found.", 404);
  }

  return deleted.id;
}
