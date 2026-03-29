"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

import { MAX_RECENT_LINKS, RECENT_LINK_STORAGE_KEY } from "@/lib/constants";
import type { LinkSnapshot, ShortenResponse } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ApiErrorResponse = {
  error?: string;
};

type LinksResponse = {
  links: LinkSnapshot[];
};

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function statLabel(value: number) {
  return `${value} click${value === 1 ? "" : "s"}`;
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.error ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

async function fetchRecentLinks(codes: string[]) {
  const response = await fetch(`/api/links?codes=${codes.join(",")}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as LinksResponse;
  return payload.links;
}

function dedupeCodes(codes: string[]) {
  return [...new Set(codes)].slice(0, MAX_RECENT_LINKS);
}

function buildLocalSnapshot(link: ShortenResponse): LinkSnapshot {
  return {
    code: link.code,
    createdAt: link.createdAt,
    clickCount: link.clickCount,
    customAlias: link.customAlias,
    lastVisitedAt: link.lastVisitedAt,
    originalUrl: link.originalUrl,
    shortUrl: link.shortUrl,
  };
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "Pricing", href: "#pricing" },
  { label: "API Docs", href: "#api" },
];

export function ShortenerApp() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const [recentLinks, setRecentLinks] = useState<LinkSnapshot[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingRecent, setIsRefreshingRecent] = useState(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeResult = result ?? recentLinks[0] ?? null;
  const aliasPreview = customAlias.trim()
    ? `blink/r/${customAlias.trim().toLowerCase()}`
    : "Auto-generated short code";

  function persistRecentCodes(codes: string[]) {
    window.localStorage.setItem(
      RECENT_LINK_STORAGE_KEY,
      JSON.stringify(dedupeCodes(codes)),
    );
  }

  async function refreshRecentLinks(codes: string[]) {
    const nextCodes = dedupeCodes(codes);

    if (nextCodes.length === 0) {
      setRecentLinks([]);
      return;
    }

    setIsRefreshingRecent(true);

    try {
      setRecentLinks(await fetchRecentLinks(nextCodes));
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      }
    } finally {
      setIsRefreshingRecent(false);
    }
  }

  useEffect(() => {
    const storedCodes = window.localStorage.getItem(RECENT_LINK_STORAGE_KEY);

    if (!storedCodes) {
      return;
    }

    try {
      const parsed = JSON.parse(storedCodes) as unknown;

      if (!Array.isArray(parsed)) {
        return;
      }

      const codes = dedupeCodes(
        parsed.filter((value): value is string => typeof value === "string"),
      );

      setRecentCodes(codes);
      void refreshRecentLinks(codes);
    } catch {
      window.localStorage.removeItem(RECENT_LINK_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!copiedValue) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopiedValue(null);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [copiedValue]);

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setStatusMessage(`${label} copied to clipboard.`);
  }

  function downloadQrCode() {
    if (!result?.qrDataUrl) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = result.qrDataUrl;
    anchor.download = `${result.code}-qr.png`;
    anchor.click();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          customAlias,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as ShortenResponse;
      const nextCodes = dedupeCodes([payload.code, ...recentCodes]);

      setResult(payload);
      setOriginalUrl("");
      setCustomAlias("");
      setRecentCodes(nextCodes);
      persistRecentCodes(nextCodes);
      setStatusMessage("Short link created successfully.");

      startTransition(() => {
        setRecentLinks((current) => {
          const nextLinks = [
            buildLocalSnapshot(payload),
            ...current.filter((item) => item.code !== payload.code),
          ];

          return nextLinks.slice(0, MAX_RECENT_LINKS);
        });
      });

      void refreshRecentLinks(nextCodes);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to shorten your URL right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* ── Navigation Bar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold text-brand-strong"
            aria-label="Blink — Free URL Shortener"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-xs font-black">
              B
            </span>
            <span className="font-display tracking-tight">Blink</span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 md:flex" role="list">
            {NAV_LINKS.map((nav) => (
              <li key={nav.label}>
                <Link
                  href={nav.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-brand-soft hover:text-brand-strong"
                >
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="#login"
              className="text-sm font-semibold text-foreground/80 hover:text-brand-strong"
            >
              Log in
            </Link>
            <Link
              href="#signup"
              className="inline-flex h-9 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-strong"
            >
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/80 text-foreground md:hidden"
          >
            {mobileMenuOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-white/40 bg-white/90 px-4 py-4 md:hidden">
            <ul className="grid gap-1" role="list">
              {NAV_LINKS.map((nav) => (
                <li key={nav.label}>
                  <Link
                    href={nav.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-brand-soft hover:text-brand-strong"
                  >
                    {nav.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-line pt-2">
                <Link
                  href="#signup"
                  className="block rounded-2xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Get started free
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* ── Main App ── */}
      <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-8 rounded-[36px] border border-white/55 bg-white/35 p-4 shadow-[0_24px_80px_rgba(30,76,120,0.12)] backdrop-blur-xl sm:p-6 lg:p-8">
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="glass-card rounded-[32px] p-6 sm:p-8">
              {/* SEO-friendly badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-brand-strong">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                Free URL Shortener — No Sign-up Required
              </div>

              {/* SEO H1 */}
              <div className="mt-6 max-w-2xl">
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Shorten URLs Instantly — Free &amp; Fast Link Shortener
                </h1>
                <p className="mt-4 max-w-xl text-base leading-8 text-muted sm:text-lg">
                  Blink is a free URL shortener that converts long, unwieldy links into short, shareable URLs in one click. Create custom short links, track click analytics, and download QR codes — all without creating an account.
                </p>
              </div>

              {/* Feature tags — keyword-rich */}
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-foreground/85">
                {[
                  "Instant URL Shortening",
                  "Free QR Code Generator",
                  "Custom Alias Support",
                  "Click Tracking & Analytics",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-white/70 px-4 py-2 font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="surface-card panel-grid mt-8 rounded-[28px] p-5 sm:p-6"
                aria-label="URL shortener form"
              >
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Paste your long URL here
                    </span>
                    <input
                      required
                      type="text"
                      inputMode="url"
                      placeholder="https://example.com/very-long-url-you-want-to-shorten"
                      value={originalUrl}
                      onChange={(event) => setOriginalUrl(event.target.value)}
                      aria-label="Enter the URL to shorten"
                      className="h-14 rounded-2xl border border-line bg-white/90 px-4 text-[15px] text-foreground outline-none placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/12"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Custom short link alias
                      <span className="ml-2 font-medium text-muted">
                        optional
                      </span>
                    </span>
                    <div className="rounded-2xl border border-line bg-white/90 px-4 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/12">
                      <div className="flex h-14 items-center gap-2">
                        <span className="hidden text-sm font-medium text-muted sm:inline">
                          blink/r/
                        </span>
                        <input
                          type="text"
                          placeholder="my-brand-link"
                          value={customAlias}
                          onChange={(event) => setCustomAlias(event.target.value)}
                          aria-label="Custom alias for your short link"
                          className="h-full w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted">
                      Use letters, numbers, <code>-</code> and <code>_</code>. Preview:{" "}
                      <span className="font-semibold text-brand-strong">
                        {aliasPreview}
                      </span>
                    </p>
                  </label>
                </div>

                {errorMessage ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                  >
                    {errorMessage}
                  </div>
                ) : null}

                {statusMessage ? (
                  <div
                    role="status"
                    className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                  >
                    {statusMessage}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(11,125,228,0.28)] hover:-translate-y-0.5 hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Shortening your link…" : "Shorten URL for Free"}
                  </button>
                  <p className="text-sm text-muted">
                    No account needed. Instant short link with QR code &amp; click stats.
                  </p>
                </div>
              </form>
            </div>

            <aside className="grid gap-6" aria-label="Link result and history">
              {/* Live result card */}
              <div className="glass-card rounded-[32px] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-strong/80">
                      Your Short Link
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
                      Ready to share
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-strong">
                    {activeResult ? "Active" : "Waiting"}
                  </div>
                </div>

                {activeResult ? (
                  <div className="surface-card mt-6 rounded-[28px] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted">Your shortened URL</p>
                        <p className="mt-1 break-all text-lg font-bold text-foreground">
                          {activeResult.shortUrl}
                        </p>
                      </div>
                      <div className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-strong">
                        {statLabel(activeResult.clickCount)}
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-7 text-muted">
                      {activeResult.originalUrl}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          copyText(activeResult.shortUrl, "Short link")
                        }
                        aria-label="Copy short link to clipboard"
                        className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-strong"
                      >
                        {copiedValue === activeResult.shortUrl
                          ? "Copied!"
                          : "Copy Short Link"}
                      </button>
                      <Link
                        href={activeResult.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open short link in a new tab"
                        className="inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5"
                      >
                        Open Link
                      </Link>
                      {result ? (
                        <button
                          type="button"
                          onClick={downloadQrCode}
                          aria-label="Download QR code as PNG image"
                          className="inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5"
                        >
                          Download QR Code
                        </button>
                      ) : null}
                    </div>

                    {result ? (
                      <div className="mt-6 rounded-[24px] bg-white p-4">
                        <Image
                          unoptimized
                          src={result.qrDataUrl}
                          alt={`Scannable QR code for short URL: ${activeResult.shortUrl}`}
                          width={176}
                          height={176}
                          className="mx-auto h-44 w-44 rounded-[22px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mt-6 rounded-[24px] border border-dashed border-line bg-white/65 p-6 text-center text-sm leading-7 text-muted">
                        Shorten a URL above to generate a free, scannable QR code.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="surface-card mt-6 rounded-[28px] p-6 text-sm leading-7 text-muted">
                    Your shortened link will appear here with a one-click copy button, QR code preview, and real-time click count.
                  </div>
                )}
              </div>

              {/* Recent links */}
              <div className="glass-card rounded-[32px] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-strong/80">
                      Link History
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
                      Your recent short links
                    </h2>
                  </div>
                  <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                    {isRefreshingRecent ? "Syncing…" : `${recentLinks.length} saved`}
                  </span>
                </div>

                {recentLinks.length > 0 ? (
                  <ol className="mt-6 grid gap-3" aria-label="Recently created short links">
                    {recentLinks.map((link) => (
                      <li key={link.code}>
                        <article className="surface-card rounded-[24px] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-brand-strong">
                                {link.code}
                              </p>
                              <p className="mt-1 break-all text-sm font-medium text-foreground">
                                {link.shortUrl}
                              </p>
                            </div>
                            <div
                              className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-strong"
                              aria-label={`${statLabel(link.clickCount)} on this link`}
                            >
                              {statLabel(link.clickCount)}
                            </div>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">
                            {link.originalUrl}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted">
                            <time dateTime={link.createdAt}>
                              Created {formatDate(link.createdAt)}
                            </time>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => copyText(link.shortUrl, "Short link")}
                                aria-label={`Copy short link ${link.shortUrl}`}
                                className="rounded-full border border-line bg-white px-3 py-2 text-foreground hover:-translate-y-0.5"
                              >
                                {copiedValue === link.shortUrl ? "Copied!" : "Copy"}
                              </button>
                              <Link
                                href={link.shortUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Visit ${link.shortUrl}`}
                                className="rounded-full border border-line bg-white px-3 py-2 text-foreground hover:-translate-y-0.5"
                              >
                                Visit
                              </Link>
                            </div>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="surface-card mt-6 rounded-[28px] p-5 text-sm leading-7 text-muted">
                    Short links you create are saved locally in your browser for quick access — no account required.
                  </div>
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
