import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { InterstitialRedirect } from "@/components/interstitial-redirect";
import { resolveRedirect } from "@/lib/links";
import { getBaseUrlFromHeaders, getVisitContext } from "@/lib/request";

type RedirectPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = await params;
  const headerList = await headers();
  const baseUrl = getBaseUrlFromHeaders(headerList);
  const result = await resolveRedirect(code, baseUrl, getVisitContext(headerList));

  if (result.status === "redirect") {
    redirect(result.destination);
  }

  if (result.status === "interstitial") {
    return (
      <InterstitialRedirect
        destination={result.destination}
        shortUrl={result.shortUrl}
        eventId={result.eventId}
        countdownSeconds={result.countdownSeconds}
        adMarkup={result.adMarkup}
        sponsorUrl={process.env.NEXT_PUBLIC_AD_SPONSOR_URL ?? null}
      />
    );
  }

  return (
    <main className="app-shell items-center justify-center">
      <section className="glass-card w-full max-w-2xl rounded-[34px] p-8 text-center sm:p-10">
        <span className="pill">Link unavailable</span>
        <h1 className="mt-5 font-display text-4xl font-bold text-foreground">
          This short link doesn&apos;t exist
        </h1>
        <p className="mt-4 text-base leading-8 text-muted">
          The code <code className="rounded bg-white px-2 py-1">{code}</code> was not found or is no longer active.
        </p>
        <Link href="/" className="button-primary mt-8">
          Create a new short link
        </Link>
      </section>
    </main>
  );
}
