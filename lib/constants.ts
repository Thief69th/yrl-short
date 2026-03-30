export const APP_NAME = "Blink URL Shortener Pro";
export const FREE_LINK_LIMIT = 10;
export const SHORT_CODE_LENGTH = 6;
export const SHORT_CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export const DEFAULT_INTERSTITIAL_SECONDS = 5;
export const ANALYTICS_WINDOW_DAYS = 7;
export const BASIC_ANALYTICS_DAYS = 7;
export const ADVANCED_ANALYTICS_DAYS = 30;

export const PLAN_OPTIONS = ["free", "paid"] as const;
export const ROLE_OPTIONS = ["user", "admin"] as const;
export const DEVICE_OPTIONS = ["desktop", "mobile", "tablet", "bot", "unknown"] as const;

export const RESERVED_CODES = new Set([
  "api",
  "admin",
  "ads",
  "auth",
  "dashboard",
  "pricing",
  "sign-in",
  "sign-up",
  "r",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
]);
