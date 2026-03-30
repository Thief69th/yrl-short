"use client";

import { useEffect, useState } from "react";

type InterstitialRedirectProps = {
  destination: string;
  shortUrl: string;
  eventId: string;
  countdownSeconds: number;
  adMarkup: string | null;
  sponsorUrl: string | null;
};

async function postTracking(path: string, eventId: string) {
  await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventId }),
  });
}

export function InterstitialRedirect({
  destination,
  shortUrl,
  eventId,
  countdownSeconds,
  adMarkup,
  sponsorUrl,
}: InterstitialRedirectProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    void postTracking("/api/ads/impression", eventId);
  }, [eventId]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.assign(destination);
      return;
    }

    const timeout = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [destination, secondsLeft]);

  async function handleSponsorClick() {
    if (!sponsorUrl) {
      return;
    }

    await postTracking("/api/ads/click", eventId);
    window.open(sponsorUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="app-shell items-center justify-center">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[34px] p-8 sm:p-10">
          <span className="pill">Free plan redirect</span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your link is almost ready.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
            Free-plan traffic supports Blink through a short branded sponsor stop. You&apos;ll continue automatically in{" "}
            <span className="font-semibold text-brand-strong">{secondsLeft}</span> second
            {secondsLeft === 1 ? "" : "s"}.
          </p>

          <div className="surface-card mt-8 rounded-[28px] p-5">
            <div className="text-sm text-muted">Short URL</div>
            <div className="mt-2 break-all text-lg font-bold text-foreground">{shortUrl}</div>
            <div className="mt-5 text-sm text-muted">Destination</div>
            <div className="mt-2 break-all text-sm font-medium text-foreground">{destination}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.assign(destination)}
              className="button-primary"
            >
              Continue now
            </button>
            {sponsorUrl ? (
              <button type="button" onClick={handleSponsorClick} className="button-secondary">
                Visit sponsor
              </button>
            ) : null}
          </div>
        </div>

        <aside className="glass-card rounded-[34px] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="pill">Sponsor slot</div>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground">
                Monetized interstitial
              </h2>
            </div>
            <div className="rounded-full bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-strong">
              {secondsLeft}s
            </div>
          </div>

          <div className="surface-card mt-6 rounded-[28px] p-6">
            {adMarkup ? (
              <div dangerouslySetInnerHTML={{ __html: adMarkup }} />
            ) : (
              <div className="space-y-4">
                <div className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
                  Demo ad
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Launch paid mode to remove this screen.
                </h3>
                <p className="text-sm leading-7 text-muted">
                  Free links show a short internal interstitial before redirecting. Add your ad markup with the{" "}
                  <code className="rounded bg-white px-2 py-1">AD_CODE</code> environment variable and an optional sponsor URL to track click-through.
                </p>
                <button
                  type="button"
                  onClick={handleSponsorClick}
                  disabled={!sponsorUrl}
                  className="button-primary disabled:opacity-50"
                >
                  {sponsorUrl ? "Open sponsor" : "Sponsor link not configured"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
