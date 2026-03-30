import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";
import { PublicShortener } from "@/components/public-shortener";

const features = [
  "Shorten URLs without logging in",
  "Use custom aliases when available",
  "Open dashboard after sign in",
  "Track redirects and manage plans",
];

export default function HomePage() {
  return (
    <PublicPageShell>
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Home</span>
        <h1 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
          Simple short links for everyone
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
          Paste a long URL below and create a short link instantly. If you want analytics and account tools, you can sign in later.
        </p>
      </section>

      <PublicShortener />

      <section className="surface-card rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Features</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Blink keeps the home page simple. The shortener stays first, and the main features stay right below it.
            </p>
          </div>
          <Link href="/features" className="button-secondary">
            View all features
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-[22px] border border-line bg-white px-4 py-4 text-sm font-medium text-foreground"
            >
              {feature}
            </div>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
