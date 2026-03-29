export const SHORT_CODE_LENGTH = 6;
export const MAX_RECENT_LINKS = 8;
export const RECENT_LINK_STORAGE_KEY = "blink-recent-links";
export const SHORT_CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const RESERVED_CODES = new Set([
  "api",
  "app",
  "r",
  "admin",
  "auth",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
]);
