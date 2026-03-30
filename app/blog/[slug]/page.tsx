import { notFound } from "next/navigation";

import { PublicPageShell } from "@/components/public-page-shell";
import { getPublishedBlogPostBySlug } from "@/lib/blogs";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <PublicPageShell>
      <article className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Blog post</span>
        <h1 className="mt-4 section-title">{post.title}</h1>
        <div className="mt-3 text-sm text-muted">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-IN")
            : "Draft"}{" "}
          | {post.readTime}
        </div>

        <div className="mt-6 grid gap-4">
          {post.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-8 text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </PublicPageShell>
  );
}
