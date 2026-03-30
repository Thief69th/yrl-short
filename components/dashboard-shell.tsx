"use client";

import { SignOutButton, UserButton } from "@clerk/nextjs";
import QRCode from "qrcode";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AnalyticsChart } from "@/components/analytics-chart";
import type { DashboardOverview, LinkAnalytics, LinkSnapshot } from "@/lib/types";

type DashboardShellProps = {
  initialOverview: DashboardOverview;
};

type ApiError = {
  error?: string;
};

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as ApiError;
    return payload.error ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DashboardShell({ initialOverview }: DashboardShellProps) {
  const [overview, setOverview] = useState(initialOverview);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(
    initialOverview.recentLinks[0]?.id ?? null,
  );
  const [selectedAnalytics, setSelectedAnalytics] = useState<LinkAnalytics | null>(null);
  const [formState, setFormState] = useState({ longUrl: "", customAlias: "" });
  const [editingLink, setEditingLink] = useState<LinkSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const selectedLink = useMemo(() => {
    if (selectedAnalytics?.link) {
      return selectedAnalytics.link;
    }

    return overview.recentLinks.find((link) => link.id === selectedLinkId) ?? null;
  }, [overview.recentLinks, selectedAnalytics, selectedLinkId]);

  useEffect(() => {
    if (!selectedLinkId) {
      setSelectedAnalytics(null);
      return;
    }

    let cancelled = false;

    async function loadAnalytics() {
      const response = await fetch(`/api/analytics/links/${selectedLinkId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const payload = (await response.json()) as {
        analytics: LinkAnalytics;
      };

      if (!cancelled) {
        setSelectedAnalytics(payload.analytics);
      }
    }

    void loadAnalytics().catch((error) => {
      if (!cancelled) {
        setMessage(error instanceof Error ? error.message : "Unable to load link analytics.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedLinkId]);

  useEffect(() => {
    if (!selectedLink?.shortUrl) {
      setQrDataUrl(null);
      return;
    }

    void QRCode.toDataURL(selectedLink.shortUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: "#0a84ff",
        light: "#ffffff",
      },
    }).then(setQrDataUrl);
  }, [selectedLink?.shortUrl]);

  async function refreshOverview(nextSelectedId?: string | null) {
    const response = await fetch("/api/analytics/overview", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const payload = (await response.json()) as { overview: DashboardOverview };
    setOverview(payload.overview);
    setSelectedLinkId(nextSelectedId ?? payload.overview.recentLinks[0]?.id ?? null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(
        editingLink ? `/api/links/${editingLink.id}` : "/api/links",
        {
          method: editingLink ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState),
        },
      );
      const payload = (await response.json()) as { link?: LinkSnapshot; error?: string };

      if (!response.ok || !payload.link) {
        throw new Error(payload.error ?? "Unable to save this link.");
      }

      setFormState({ longUrl: "", customAlias: "" });
      setEditingLink(null);
      setMessage(editingLink ? "Link updated successfully." : "Link created successfully.");
      await refreshOverview(payload.link.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save this link.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLink(linkId: string) {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/links/${linkId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setMessage("Link archived.");
      await refreshOverview();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to archive this link.");
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(link: LinkSnapshot) {
    setEditingLink(link);
    setFormState({
      longUrl: link.longUrl,
      customAlias: link.customAlias ?? "",
    });
    setMessage("Editing existing link.");
  }

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setMessage(`${label} copied to clipboard.`);
  }

  const chartData = selectedAnalytics?.chart ?? overview.chart;
  const countryData = selectedAnalytics?.countryBreakdown ?? overview.countryBreakdown;
  const deviceData = selectedAnalytics?.deviceBreakdown ?? overview.deviceBreakdown;

  return (
    <main className="dashboard-shell">
      <div className="dashboard-grid">
        <aside className="glass-card rounded-[34px] p-6">
          <div className="flex items-center justify-between gap-3 lg:block">
            <div>
              <div className="pill">Blink Pro</div>
              <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
                Welcome back
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted">
                {overview.viewer.email}
              </p>
            </div>
            <div className="rounded-full bg-white/80 p-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>

          <nav className="mt-8 grid gap-3">
            <Link href="/dashboard" className="button-primary justify-start">
              Dashboard
            </Link>
            <Link href="/pricing" className="button-secondary justify-start">
              Pricing
            </Link>
            {overview.viewer.role === "admin" ? (
              <Link href="/admin" className="button-secondary justify-start">
                Admin console
              </Link>
            ) : null}
            {overview.viewer.role === "admin" ? (
              <Link href="/admin#blog-manager" className="button-secondary justify-start">
                Write blog
              </Link>
            ) : null}
            <SignOutButton>
              <button className="button-secondary justify-start">Logout</button>
            </SignOutButton>
          </nav>

          <div className="surface-card mt-8 rounded-[28px] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Current plan
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="font-display text-2xl font-bold text-foreground">
                {overview.viewer.plan === "paid" ? "Paid Pro" : "Free"}
              </div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-strong">
                {overview.viewer.role}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">
              {overview.viewer.plan === "paid"
                ? "Ads are disabled and advanced analytics are enabled."
                : "Free plans can keep 10 active links and show a short sponsor interstitial."}
            </p>
          </div>
        </aside>

        <section className="grid gap-6">
          <header className="glass-card rounded-[34px] p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="pill">Control center</span>
                <h2 className="mt-4 section-title">Create, manage, and track your links.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-muted">
                  Account ek baar create karo, uske baad same email aur password se login rakho. Dashboard mobile par
                  bhi clean aur simple rahega.
                </p>
              </div>
              <Link href="/pricing" className="button-secondary">
                Upgrade options
              </Link>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="stat-card">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total links</div>
              <div className="mt-4 font-display text-4xl font-bold text-foreground">{overview.totals.totalLinks}</div>
            </article>
            <article className="stat-card">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Active links</div>
              <div className="mt-4 font-display text-4xl font-bold text-foreground">{overview.totals.activeLinks}</div>
            </article>
            <article className="stat-card">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total clicks</div>
              <div className="mt-4 font-display text-4xl font-bold text-foreground">{overview.totals.totalClicks}</div>
            </article>
            <article className="stat-card">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Estimated revenue</div>
              <div className="mt-4 font-display text-4xl font-bold text-foreground">
                {formatCurrency(overview.totals.estimatedRevenue)}
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={submitForm} className="glass-card rounded-[32px] p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="pill">{editingLink ? "Edit link" : "Create link"}</span>
                  <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                    {editingLink ? "Update your destination or alias" : "Launch a new short link"}
                  </h3>
                </div>
                {editingLink ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setEditingLink(null);
                      setFormState({ longUrl: "", customAlias: "" });
                      setMessage("Edit mode cancelled.");
                    }}
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-foreground">Long URL</span>
                  <input
                    required
                    className="field"
                    placeholder="https://example.com/campaign"
                    value={formState.longUrl}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, longUrl: event.target.value }))
                    }
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-foreground">Custom alias</span>
                  <input
                    className="field"
                    placeholder="team-launch"
                    value={formState.customAlias}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, customAlias: event.target.value }))
                    }
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
                  {busy ? "Saving..." : editingLink ? "Save changes" : "Create link"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void refreshOverview(selectedLinkId)}
                  className="button-secondary"
                >
                  Refresh overview
                </button>
              </div>
            </form>

            <section className="glass-card rounded-[32px] p-6 sm:p-7">
              <span className="pill">Selected link</span>
              <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                Share-ready output
              </h3>

              {selectedLink ? (
                <div className="surface-card mt-6 rounded-[28px] p-5">
                  <div className="text-sm text-muted">Short URL</div>
                  <div className="mt-2 break-all text-lg font-bold text-foreground">
                    {selectedLink.shortUrl}
                  </div>
                  <div className="mt-4 text-sm text-muted">Destination</div>
                  <div className="mt-2 break-all text-sm font-medium text-foreground">
                    {selectedLink.longUrl}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-primary"
                      onClick={() => void copyText(selectedLink.shortUrl, "Short URL")}
                    >
                      Copy link
                    </button>
                    <Link
                      href={selectedLink.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary"
                    >
                      Open
                    </Link>
                  </div>

                  <div className="mt-6 rounded-[24px] bg-white p-4">
                    {qrDataUrl ? (
                      <Image
                        src={qrDataUrl}
                        alt={`QR code for ${selectedLink.shortUrl}`}
                        width={192}
                        height={192}
                        unoptimized
                        className="mx-auto h-48 w-48 rounded-[20px] object-contain"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center text-sm text-muted">
                        Preparing QR code...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="surface-card mt-6 rounded-[28px] p-6 text-sm leading-7 text-muted">
                  Create or select a link to see its QR code and share-ready card.
                </div>
              )}
            </section>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="glass-card rounded-[32px] p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="pill">Traffic</span>
                  <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                    Click performance
                  </h3>
                </div>
                <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-muted">
                  {overview.viewer.plan === "paid" ? "Advanced analytics" : "Basic analytics"}
                </div>
              </div>
              <div className="mt-6">
                <AnalyticsChart data={chartData} />
              </div>
            </section>

            <section className="glass-card rounded-[32px] p-6 sm:p-7">
              <span className="pill">Breakdowns</span>
              <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                Country and device mix
              </h3>

              {overview.viewer.plan === "paid" ? (
                <div className="mt-6 grid gap-4">
                  <div className="surface-card rounded-[24px] p-4">
                    <div className="text-sm font-semibold text-foreground">Top countries</div>
                    <div className="mt-4 grid gap-2">
                      {countryData.slice(0, 5).map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted">{item.label}</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="surface-card rounded-[24px] p-4">
                    <div className="text-sm font-semibold text-foreground">Top devices</div>
                    <div className="mt-4 grid gap-2">
                      {deviceData.slice(0, 5).map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted">{item.label}</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="surface-card mt-6 rounded-[28px] p-6 text-sm leading-7 text-muted">
                  Country and device breakdowns are part of the paid plan. Upgrade to remove ads and unlock advanced analytics.
                </div>
              )}
            </section>
          </section>

          <section className="glass-card rounded-[32px] p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="pill">Recent links</span>
                <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                  Link inventory
                </h3>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="hidden min-w-full text-left text-sm lg:table">
                <thead>
                  <tr className="text-muted">
                    <th className="px-4 py-3 font-semibold">Short link</th>
                    <th className="px-4 py-3 font-semibold">Destination</th>
                    <th className="px-4 py-3 font-semibold">Clicks</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentLinks.map((link) => (
                    <tr key={link.id} className="border-t border-line/70">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedLinkId(link.id)}
                          className="text-left"
                        >
                          <div className="font-semibold text-brand-strong">{link.shortCode}</div>
                          <div className="mt-1 break-all text-xs text-muted">{link.shortUrl}</div>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs break-all text-foreground">{link.longUrl}</div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-foreground">{link.clicks}</td>
                      <td className="px-4 py-4 text-muted">{formatDate(link.createdAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="button-secondary px-4 py-2 text-xs"
                            onClick={() => beginEdit(link)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button-secondary px-4 py-2 text-xs"
                            onClick={() => void copyText(link.shortUrl, "Short URL")}
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            className="button-secondary px-4 py-2 text-xs"
                            disabled={busy}
                            onClick={() => void deleteLink(link.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid gap-4 lg:hidden">
                {overview.recentLinks.map((link) => (
                  <article key={link.id} className="surface-card rounded-[24px] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedLinkId(link.id)}
                        className="text-left"
                      >
                        <div className="font-semibold text-brand-strong">{link.shortCode}</div>
                        <div className="mt-1 break-all text-xs text-muted">{link.shortUrl}</div>
                      </button>
                      <div className="text-right text-sm">
                        <div className="font-semibold text-foreground">{link.clicks} clicks</div>
                        <div className="mt-1 text-xs text-muted">{formatDate(link.createdAt)}</div>
                      </div>
                    </div>

                    <div className="mt-3 break-all text-sm text-foreground">{link.longUrl}</div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-xs"
                        onClick={() => beginEdit(link)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-xs"
                        onClick={() => void copyText(link.shortUrl, "Short URL")}
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        className="button-secondary px-4 py-2 text-xs"
                        disabled={busy}
                        onClick={() => void deleteLink(link.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <footer className="px-2 pb-2 text-sm text-muted">
            Blink URL Shortener Pro runs on Next.js App Router, Clerk authentication, and Neon Postgres.
          </footer>
        </section>
      </div>
    </main>
  );
}
