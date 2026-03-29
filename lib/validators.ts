import { z } from "zod";

import { RESERVED_CODES } from "@/lib/constants";
import type { CreateShortLinkInput } from "@/lib/types";

const requestSchema = z.object({
  originalUrl: z.string().trim().min(1, "Please add a URL."),
  customAlias: z
    .string()
    .trim()
    .max(32, "Alias should be 32 characters or less.")
    .optional(),
});

const aliasPattern = /^[a-z0-9_-]{3,32}$/;

export function normalizeCode(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeUrl(value: string) {
  const trimmedValue = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  const parsedUrl = new URL(withProtocol);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  return parsedUrl.toString();
}

export function validateCustomAlias(value: string) {
  const normalizedAlias = normalizeCode(value);

  if (!aliasPattern.test(normalizedAlias)) {
    throw new Error(
      "Custom alias must be 3-32 characters and use only letters, numbers, hyphens, or underscores.",
    );
  }

  if (RESERVED_CODES.has(normalizedAlias)) {
    throw new Error("That alias is reserved. Choose a different alias.");
  }

  return normalizedAlias;
}

export function parseShortenPayload(payload: unknown): CreateShortLinkInput {
  const parsedPayload = requestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstIssue = parsedPayload.error.issues[0];
    throw new Error(firstIssue?.message ?? "Invalid request payload.");
  }

  const normalizedUrl = normalizeUrl(parsedPayload.data.originalUrl);
  const aliasValue = parsedPayload.data.customAlias?.trim();

  return {
    originalUrl: normalizedUrl,
    customAlias: aliasValue ? validateCustomAlias(aliasValue) : undefined,
  };
}
