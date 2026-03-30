"use client";

import { useState } from "react";

import type { BlogPostSummary } from "@/lib/types";

type AdminBlogManagerProps = {
  initialPosts: BlogPostSummary[];
};

type BlogResponse = {
  post?: BlogPostSummary;
  error?: string;
};

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as BlogResponse;
    return payload.error ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  isPublished: true,
};

export function AdminBlogManager({ initialPosts }: AdminBlogManagerProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function startEdit(post: BlogPostSummary) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      isPublished: post.isPublished,
    });
    setMessage(`Editing "${post.title}".`);
  }

  function resetEditor(nextMessage?: string) {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(nextMessage ?? null);
  }

  async function savePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const payload = (await response.json()) as BlogResponse;

      if (!response.ok || !payload.post) {
        throw new Error(payload.error ?? "Unable to save this blog post.");
      }

      const savedPost = payload.post;

      setPosts((current) => {
        if (editingId) {
          return current.map((post) => (post.id === savedPost.id ? savedPost : post));
        }

        return [savedPost, ...current];
      });

      resetEditor(editingId ? "Blog post updated." : "Blog post created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save this blog post.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(postId: string) {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/blogs/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setPosts((current) => current.filter((post) => post.id !== postId));

      if (editingId === postId) {
        resetEditor("Blog post removed.");
      } else {
        setMessage("Blog post removed.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete this blog post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="blog-manager" className="glass-card rounded-[32px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="pill">Blog manager</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-foreground">
            Write and publish blog posts
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Yahin se blog title, summary, content, aur publish state manage karo. Published posts turant public
            blog page par dikh jayenge.
          </p>
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-sm font-medium text-brand-strong">
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={savePost} className="surface-card rounded-[28px] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {editingId ? "Edit blog post" : "New blog post"}
              </div>
              <p className="mt-1 text-sm leading-7 text-muted">
                Content ko normal paragraphs me likho. Har paragraph ke beech ek blank line do.
              </p>
            </div>
            {editingId ? (
              <button type="button" className="button-secondary" onClick={() => resetEditor("Editor reset.")}>
                Cancel
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Title</span>
              <input
                required
                className="field"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="How to use Blink for campaigns"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Slug</span>
              <input
                className="field"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="optional-custom-slug"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Short summary</span>
              <textarea
                required
                rows={3}
                className="field h-auto py-3"
                value={form.excerpt}
                onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                placeholder="2-3 lines me batao ki blog kis bare me hai."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Blog content</span>
              <textarea
                required
                rows={12}
                className="field h-auto py-3"
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder={"Paragraph 1...\n\nParagraph 2...\n\nParagraph 3..."}
              />
            </label>
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}
            />
            Publish this post on the public blog page
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="button-primary">
              {busy ? "Saving..." : editingId ? "Update post" : "Create post"}
            </button>
            <button
              type="button"
              disabled={busy}
              className="button-secondary"
              onClick={() => resetEditor("Editor cleared.")}
            >
              Reset
            </button>
          </div>
        </form>

        <section className="surface-card rounded-[28px] p-5">
          <div className="text-sm font-semibold text-foreground">Existing blog posts</div>
          <p className="mt-1 text-sm leading-7 text-muted">
            Draft aur published dono posts yahan dikhte hain.
          </p>

          <div className="mt-5 grid gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="rounded-[24px] border border-line bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">{post.title}</div>
                      <div className="mt-1 text-xs text-muted">
                        /blog/{post.slug} · {post.readTime}
                      </div>
                    </div>
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
                      {post.isPublished ? "published" : "draft"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-muted">{post.excerpt}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="button-secondary px-4 py-2 text-xs" onClick={() => startEdit(post)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button-secondary px-4 py-2 text-xs"
                      onClick={() => void deletePost(post.id)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-line bg-white/70 p-5 text-sm leading-7 text-muted">
                Abhi koi blog post nahi hai. Left side form se pehla post create karo.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
