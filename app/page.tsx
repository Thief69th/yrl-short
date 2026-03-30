import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

import { isClerkConfigured } from "@/lib/env";

export default function HomePage() {
  const authEnabled = isClerkConfigured();

  return (
    <main className="app-shell">
      <section className="glass-card rounded-[36px] p-6 sm:p-8 lg:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="pill">Blink URL Shortener Pro</span>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Launch a monetized short-link SaaS that feels clean, fast, and premium.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted sm:text-lg">
              Give free users a branded interstitial, give paid users instant redirects, and manage everything from a polished dashboard backed by Neon and Vercel-ready App Router infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {authEnabled ? (
              <>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="button-primary">Create account</button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="button-secondary">Sign in</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="button-primary">
                    Open dashboard
                  </Link>
                </SignedIn>
              </>
            ) : (
              <Link href="/dashboard" className="button-primary">
                Preview dashboard setup
              </Link>
            )}
            <Link href="/pricing" className="button-secondary">
              View plans
            </Link>
          </div>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card rounded-[32px] p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Free to paid plans", "Limit free users to 10 active links, then upgrade manually from the admin console."],
                ["Internal ad interstitial", "Keep monetization provider-agnostic with your own branded redirect screen."],
                ["Advanced analytics", "Paid users unlock country and device breakdowns with click history."],
                ["QR-ready short links", "Every dashboard-selected link can be copied, shared, and exported with a QR code."],
              ].map(([title, copy]) => (
                <article key={title} className="rounded-[24px] border border-line bg-white/80 p-5">
                  <div className="text-lg font-semibold text-foreground">{title}</div>
                  <p className="mt-3 text-sm leading-7 text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="glass-card rounded-[32px] p-6 sm:p-8">
            <span className="pill">Ideal launch stack</span>
            <div className="mt-5 space-y-4">
              {[
                "Next.js App Router + Tailwind CSS",
                "Clerk email/password auth with reset flow",
                "Neon Postgres with Drizzle schema + migrations",
                "Manual admin plan switching for v1",
                "Recharts analytics and branded redirect UX",
              ].map((item) => (
                <div key={item} className="surface-card rounded-[22px] px-4 py-3 text-sm font-medium text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
