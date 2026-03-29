export type CreateShortLinkInput = {
  originalUrl: string;
  customAlias?: string;
};

export type LinkSnapshot = {
  code: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  lastVisitedAt: string | null;
  customAlias: string | null;
};

export type ShortenResponse = LinkSnapshot & {
  qrDataUrl: string;
};
