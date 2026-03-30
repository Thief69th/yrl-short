import { PublicPageShell } from "@/components/public-page-shell";

export default function AboutPage() {
  return (
    <PublicPageShell>
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">About</span>
        <h1 className="mt-4 section-title">About Blink</h1>
        <div className="mt-5 grid gap-4">
          <p className="text-sm leading-8 text-muted">
            Blink is a simple URL shortener built for both public users and signed-in customers. Visitors can shorten links instantly, while account holders get dashboard access, analytics, and plan controls.
          </p>
          <p className="text-sm leading-8 text-muted">
            The app is built with Next.js App Router, Neon Postgres, Tailwind CSS, and Clerk authentication. It is designed to be deployable on Vercel and easy to expand later.
          </p>
        </div>
      </section>
    </PublicPageShell>
  );
}
