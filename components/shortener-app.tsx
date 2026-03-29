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
        setErrorMessage("Unable to create a short link right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-8 rounded-[36px] border border-white/55 bg-white/35 p-4 shadow-[0_24px_80px_rgba(30,76,120,0.12)] backdrop-blur-xl sm:p-6 lg:p-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-card rounded-[32px] p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-brand-strong">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              Telegram-style URL shortener
            </div>
            <div className="mt-6 max-w-2xl">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Turn long links into crisp, share-ready URLs.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-muted sm:text-lg">
                Blink keeps shortening simple: custom aliases, instant QR
                output, recent history, and quick redirects in one bright,
                fast interface.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-foreground/85">
              {["Fast redirects", "QR included", "Alias support", "Browser history"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-white/70 px-4 py-2 font-medium"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="surface-card panel-grid mt-8 rounded-[28px] p-5 sm:p-6"
            >
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Original URL
                  </span>
                  <input
                    required
                    type="text"
                    inputMode="url"
                    placeholder="https://example.com/your-really-long-link"
                    value={originalUrl}
                    onChange={(event) => setOriginalUrl(event.target.value)}
                    className="h-14 rounded-2xl border border-line bg-white/90 px-4 text-[15px] text-foreground outline-none placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/12"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Custom alias
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
                        placeholder="team-launch"
                        value={customAlias}
                        onChange={(event) => setCustomAlias(event.target.value)}
                        className="h-full w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted">
                    Letters, numbers, <code>-</code> and <code>_</code> only.
                    Preview:{" "}
                    <span className="font-semibold text-brand-strong">
                      {aliasPreview}
                    </span>
                  </p>
                </label>
              </div>

              {errorMessage ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              {statusMessage ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {statusMessage}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-14 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(11,125,228,0.28)] hover:-translate-y-0.5 hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Creating short link..." : "Shorten URL"}
                </button>
                <p className="text-sm text-muted">
                  Clean redirect route with click tracking and QR-ready output.
                </p>
              </div>
            </form>
          </div>

          <aside className="grid gap-6">
            <div className="glass-card rounded-[32px] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-strong/80">
                    Live result
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
                    Share-ready card
                  </h2>
                </div>
                <div className="rounded-2xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-strong">
                  {activeResult ? "Ready" : "Waiting"}
                </div>
              </div>

              {activeResult ? (
                <div className="surface-card mt-6 rounded-[28px] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted">Short link</p>
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
                      className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-strong"
                    >
                      {copiedValue === activeResult.shortUrl
                        ? "Copied"
                        : "Copy link"}
                    </button>
                    <Link
                      href={activeResult.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5"
                    >
                      Open
                    </Link>
                    {result ? (
                      <button
                        type="button"
                        onClick={downloadQrCode}
                        className="inline-flex items-center justify-center rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5"
                      >
                        Download QR
                      </button>
                    ) : null}
                  </div>

                  {result ? (
                    <div className="mt-6 rounded-[24px] bg-white p-4">
                      <Image
                        unoptimized
                        src={result.qrDataUrl}
                        alt={`QR code for ${activeResult.shortUrl}`}
                        width={176}
                        height={176}
                        className="mx-auto h-44 w-44 rounded-[22px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[24px] border border-dashed border-line bg-white/65 p-6 text-center text-sm leading-7 text-muted">
                      Create a new link to generate a downloadable QR code here.
                    </div>
                  )}
                </div>
              ) : (
                <div className="surface-card mt-6 rounded-[28px] p-6 text-sm leading-7 text-muted">
                  Your latest link appears here with copy actions, QR preview,
                  and quick stats.
                </div>
              )}
            </div>

            <div className="glass-card rounded-[32px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-strong/80">
                    Recent links
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
                    Browser-saved history
                  </h2>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {isRefreshingRecent ? "Syncing" : `${recentLinks.length} saved`}
                </span>
              </div>

              {recentLinks.length > 0 ? (
                <div className="mt-6 grid gap-3">
                  {recentLinks.map((link) => (
                    <article
                      key={link.code}
                      className="surface-card rounded-[24px] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-brand-strong">
                            {link.code}
                          </p>
                          <p className="mt-1 break-all text-sm font-medium text-foreground">
                            {link.shortUrl}
                          </p>
                        </div>
                        <div className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-strong">
                          {statLabel(link.clickCount)}
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">
                        {link.originalUrl}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted">
                        <span>Created {formatDate(link.createdAt)}</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => copyText(link.shortUrl, "Short link")}
                            className="rounded-full border border-line bg-white px-3 py-2 text-foreground hover:-translate-y-0.5"
                          >
                            {copiedValue === link.shortUrl ? "Copied" : "Copy"}
                          </button>
                          <Link
                            href={link.shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-line bg-white px-3 py-2 text-foreground hover:-translate-y-0.5"
                          >
                            Visit
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="surface-card mt-6 rounded-[28px] p-5 text-sm leading-7 text-muted">
                  Shortened links you create in this browser will stay pinned
                  here for quick access.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
