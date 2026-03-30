import { PublicPageShell } from "@/components/public-page-shell";

export default function ContactPage() {
  return (
    <PublicPageShell>
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Contact</span>
        <h1 className="mt-4 section-title">Contact Blink</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="surface-card rounded-[24px] p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Email</div>
            <p className="mt-3 text-sm leading-7 text-foreground">support@blink.local</p>
          </div>
          <div className="surface-card rounded-[24px] p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Response</div>
            <p className="mt-3 text-sm leading-7 text-foreground">Usually within 24 hours for setup and product questions.</p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-8 text-muted">
          Replace this placeholder email with your real support email before production launch.
        </p>
      </section>
    </PublicPageShell>
  );
}
