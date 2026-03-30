import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";
import { blogPosts } from "@/lib/site-content";

export default function BlogPage() {
  return (
    <PublicPageShell>
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Blog</span>
        <h1 className="mt-4 section-title">Blog</h1>
        <p className="mt-3 text-sm leading-8 text-muted">
          All public blog articles are listed here.
        </p>

        <div className="mt-6 grid gap-4">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="surface-card rounded-[24px] p-5 hover:-translate-y-0.5"
            >
              <div className="text-sm text-muted">
                {post.publishedAt} · {post.readTime}
              </div>
              <h2 className="mt-2 text-xl font-bold text-foreground">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{post.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
