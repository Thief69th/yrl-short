import type { DeviceType } from "@/lib/types";

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getConfiguredBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;

  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  return null;
}

export function getBaseUrlFromHeaders(headersList: Headers) {
  const configuredUrl = getConfiguredBaseUrl();

  if (configuredUrl) {
    return configuredUrl;
  }

  const forwardedProto = headersList.get("x-forwarded-proto") ?? "https";
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";

  return normalizeBaseUrl(`${forwardedProto}://${host}`);
}

export function getBaseUrlFromRequest(request: Request) {
  const configuredUrl = getConfiguredBaseUrl();

  if (configuredUrl) {
    return configuredUrl;
  }

  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const protocol = forwardedProto ?? requestUrl.protocol.replace(":", "");
  const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host;

  return normalizeBaseUrl(`${protocol}://${host}`);
}

function parseDeviceType(userAgent: string): DeviceType {
  const source = userAgent.toLowerCase();

  if (!source) {
    return "unknown";
  }

  if (/bot|crawl|spider|slurp/.test(source)) {
    return "bot";
  }

  if (/ipad|tablet/.test(source)) {
    return "tablet";
  }

  if (/mobi|iphone|android/.test(source)) {
    return "mobile";
  }

  return "desktop";
}

export type VisitContext = {
  countryCode: string;
  deviceType: DeviceType;
  referrer: string | null;
};

export function getVisitContext(headersList: Headers): VisitContext {
  const userAgent = headersList.get("user-agent") ?? "";
  const countryCode =
    (headersList.get("x-vercel-ip-country") ?? "UN").slice(0, 2).toUpperCase() ||
    "UN";
  const referrer = headersList.get("referer");

  return {
    countryCode,
    deviceType: parseDeviceType(userAgent),
    referrer,
  };
}
