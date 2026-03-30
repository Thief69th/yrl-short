import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";
import { listPublishedBlogPosts } from "@/lib/blogs";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();

  return (
    <PublicPageShell>
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Blog</span>
        <h1 className="mt-4 section-title">Blog</h1>
        <p className="mt-3 text-sm leading-8 text-muted">
          All public blog articles are listed here.
        </p>

        <div className="mt-6 grid gap-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="surface-card rounded-[24px] p-5 hover:-translate-y-0.5"
              >
                <div className="text-sm text-muted">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-IN")
                    : "Draft"}{" "}
                  | {post.readTime}
                </div>
                <h2 className="mt-2 text-xl font-bold text-foreground">{post.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{post.excerpt}</p>
              </Link>
            ))
          ) : (
            <div className="surface-card rounded-[24px] p-5 text-sm leading-7 text-muted">
              Abhi koi published blog post nahi hai.
            </div>
          )}
        </div>
      </section>
    </PublicPageShell>
  );
}
