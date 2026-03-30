"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import type { LinkSnapshot } from "@/lib/types";

type PublicShortenerProps = {
  defaultUrl?: string;
};

type PublicResponse = {
  link?: LinkSnapshot;
  error?: string;
};

export function PublicShortener({ defaultUrl = "" }: PublicShortenerProps) {
  const [longUrl, setLongUrl] = useState(defaultUrl);
  const [customAlias, setCustomAlias] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<LinkSnapshot | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!result?.shortUrl) {
      setQrDataUrl(null);
      return;
    }

    void QRCode.toDataURL(result.shortUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: "#0a84ff",
        light: "#ffffff",
      },
    }).then(setQrDataUrl);
  }, [result?.shortUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/public/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          longUrl,
          customAlias,
        }),
      });

      const payload = (await response.json()) as PublicResponse;

      if (!response.ok || !payload.link) {
        throw new Error(payload.error ?? "Unable to shorten this URL.");
      }

      setResult(payload.link);
      setLongUrl("");
      setCustomAlias("");
      setMessage("Short URL created successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to shorten this URL.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!result?.shortUrl) {
      return;
    }

    await navigator.clipboard.writeText(result.shortUrl);
    setMessage("Short URL copied to clipboard.");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="glass-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Public shortener</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-foreground">
          Shorten a URL without logging in
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Paste any long link, choose an optional alias, and create a short URL instantly.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Long URL</span>
            <input
              required
              value={longUrl}
              onChange={(event) => setLongUrl(event.target.value)}
              placeholder="https://example.com/my-long-url"
              className="field"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-foreground">Custom alias</span>
            <input
              value={customAlias}
              onChange={(event) => setCustomAlias(event.target.value)}
              placeholder="my-link"
              className="field"
            />
          </label>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-brand/12 bg-brand-soft px-4 py-3 text-sm font-medium text-brand-strong">
            {message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="button-primary">
            {busy ? "Creating..." : "Shorten URL"}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setLongUrl("");
              setCustomAlias("");
              setResult(null);
              setMessage(null);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <aside className="surface-card rounded-[32px] p-6 sm:p-8">
        <span className="pill">Result</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-foreground">
          Ready to share
        </h2>

        {result ? (
          <>
            <div className="mt-6 rounded-[24px] border border-line bg-white p-5">
              <div className="text-sm text-muted">Short URL</div>
              <div className="mt-2 break-all text-lg font-bold text-foreground">
                {result.shortUrl}
              </div>
              <div className="mt-4 text-sm text-muted">Destination</div>
              <div className="mt-2 break-all text-sm text-foreground">{result.longUrl}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => void copyLink()} className="button-primary">
                Copy link
              </button>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="button-secondary"
              >
                Open
              </a>
            </div>

            <div className="mt-6 rounded-[24px] bg-white p-4">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt={`QR code for ${result.shortUrl}`}
                  width={220}
                  height={220}
                  unoptimized
                  className="mx-auto h-[220px] w-[220px] rounded-[18px] object-contain"
                />
              ) : null}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-line bg-white/70 p-6 text-sm leading-7 text-muted">
            Your shortened URL and QR code will appear here.
          </div>
        )}
      </aside>
    </section>
  );
}
