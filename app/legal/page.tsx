import Link from "next/link";

import { PublicPageShell } from "@/components/public-page-shell";
import { legalPages } from "@/lib/site-content";

export default function LegalIndexPage() {
  return (
    <PublicPageShell>
      <section className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Legal</span>
        <h1 className="mt-4 section-title">Legal Pages</h1>
        <p className="mt-3 text-sm leading-8 text-muted">
          All legal and policy pages are available here.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {legalPages.map((page) => (
            <Link
              key={page.slug}
              href={`/legal/${page.slug}`}
              className="surface-card rounded-[24px] p-5 hover:-translate-y-0.5"
            >
              <h2 className="text-lg font-bold text-foreground">{page.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{page.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
