import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";

export default function PricingPage() {
  return (
    <PublicPageShell>
      <section className="glass-card rounded-[36px] p-6 sm:p-8 lg:p-10">
        <span className="pill">Pricing</span>
        <h1 className="mt-5 section-title">Simple launch pricing for Blink Pro.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
          Start with manual plan switching for v1, then add billing later without changing the product structure.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="surface-card rounded-[32px] p-6">
            <div className="pill">Free</div>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground">$0</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted">
              <li>10 active links</li>
              <li>Branded ad interstitial before redirect</li>
              <li>Basic click totals and recent links</li>
              <li>QR-ready share cards</li>
            </ul>
          </article>

          <article className="glass-card rounded-[32px] p-6">
            <div className="pill">Paid Pro</div>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground">$12 / month</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted">
              <li>Unlimited active links</li>
              <li>No interstitial ads</li>
              <li>Country and device analytics</li>
              <li>Priority growth dashboard</li>
            </ul>
            <p className="mt-5 text-sm leading-7 text-muted">
              Launch mode uses an admin-managed upgrade path. Move to Stripe or Razorpay later without rebuilding the app.
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="button-primary">
            Open dashboard
          </Link>
          <Link href="/" className="button-secondary">
            Back home
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
