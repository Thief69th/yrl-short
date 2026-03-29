import Link from "next/link";
import { redirect } from "next/navigation";

import { DatabaseNotConfiguredError, resolveShortLink } from "@/lib/links";

type RedirectPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = await params;

  try {
    const link = await resolveShortLink(code);

    if (link) {
      redirect(link.originalUrl);
    }
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return (
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="glass-card w-full max-w-xl rounded-[28px] p-8 text-center sm:p-10">
            <span className="inline-flex rounded-full bg-brand-soft px-4 py-1 text-sm font-semibold text-brand-strong">
              Storage setup needed
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground">
              Add your database URL first
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">
              This short link cannot resolve yet because the app is missing a
              valid <code className="rounded bg-white/70 px-2 py-1">DATABASE_URL</code>.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(11,125,228,0.28)] hover:-translate-y-0.5 hover:bg-brand-strong"
            >
              Back to home
            </Link>
          </div>
        </main>
      );
    }

    throw error;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glass-card w-full max-w-xl rounded-[28px] p-8 text-center sm:p-10">
        <span className="inline-flex rounded-full bg-brand-soft px-4 py-1 text-sm font-semibold text-brand-strong">
          Link unavailable
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground">
          This short link doesn&apos;t exist
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          The code <code className="rounded bg-white/70 px-2 py-1">{code}</code>{" "}
          was not found, may have been typed incorrectly, or is not active in
          the current database.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(11,125,228,0.28)] hover:-translate-y-0.5 hover:bg-brand-strong"
        >
          Create a new short link
        </Link>
      </div>
    </main>
  );
}
