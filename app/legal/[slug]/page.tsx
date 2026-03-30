import { notFound } from "next/navigation";

import { PublicPageShell } from "@/components/public-page-shell";
import { getLegalPage, legalPages } from "@/lib/site-content";

type LegalPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <PublicPageShell>
      <article className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Legal</span>
        <h1 className="mt-4 section-title">{page.title}</h1>
        <p className="mt-3 text-sm leading-8 text-muted">{page.description}</p>

        <div className="mt-8 grid gap-6">
          {page.sections.map((section) => (
            <section key={section.heading} className="surface-card rounded-[24px] p-5">
              <h2 className="text-xl font-bold text-foreground">{section.heading}</h2>
              <div className="mt-3 grid gap-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-8 text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </PublicPageShell>
  );
}
