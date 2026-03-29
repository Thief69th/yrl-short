function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getBaseUrlFromRequest(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;

  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const protocol = forwardedProto ?? requestUrl.protocol.replace(":", "");
  const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host;

  return normalizeBaseUrl(`${protocol}://${host}`);
}
