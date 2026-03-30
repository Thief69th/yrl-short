import { PublicPageShell } from "@/components/public-page-shell";

const features = [
  "Public URL shortening from the home page",
  "Optional custom aliases",
  "Redirect tracking with click counts",
  "Dashboard for authenticated users",
  "Free and paid plans",
  "Internal ad interstitial support",
  "QR code generation",
];

export default function FeaturesPage() {
  return (
    <PublicPageShell>
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Features</span>
        <h1 className="mt-4 section-title">What you can do with Blink</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="surface-card rounded-[24px] p-5 text-sm font-medium text-foreground">
              {feature}
            </div>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
