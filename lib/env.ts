import { DEFAULT_INTERSTITIAL_SECONDS, FREE_LINK_LIMIT } from "@/lib/constants";

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function isClerkServerConfigured() {
  return Boolean(process.env.CLERK_SECRET_KEY);
}

export function isClerkClientConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function isClerkConfigured() {
  return isClerkServerConfigured();
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getFreeLinkLimit() {
  return parseNumber(process.env.FREE_LINK_LIMIT, FREE_LINK_LIMIT);
}

export function getInterstitialSeconds() {
  return parseNumber(
    process.env.NEXT_PUBLIC_AD_INTERSTITIAL_SECONDS,
    DEFAULT_INTERSTITIAL_SECONDS,
  );
}

export function getAdRevenueConfig() {
  return {
    impressionValue: parseNumber(process.env.AD_IMPRESSION_VALUE, 0.01),
    clickValue: parseNumber(process.env.AD_CLICK_VALUE, 0.05),
  };
}
