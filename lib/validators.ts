import { z } from "zod";

import { RESERVED_CODES } from "@/lib/constants";
import type { CreateLinkInput, TrackAdEventInput, UpdateLinkInput } from "@/lib/types";

const linkSchema = z.object({
  longUrl: z.string().trim().min(1, "Please add a URL."),
  customAlias: z
    .string()
    .trim()
    .max(32, "Alias should be 32 characters or less.")
    .optional(),
});

const adEventSchema = z.object({
  eventId: z.string().uuid("A valid tracking id is required."),
});

const planSchema = z.object({
  plan: z.enum(["free", "paid"]),
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

function parseLinkPayload<T extends CreateLinkInput | UpdateLinkInput>(payload: unknown): T {
  const parsedPayload = linkSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstIssue = parsedPayload.error.issues[0];
    throw new Error(firstIssue?.message ?? "Invalid request payload.");
  }

  const normalizedUrl = normalizeUrl(parsedPayload.data.longUrl);
  const aliasValue = parsedPayload.data.customAlias?.trim();

  return {
    longUrl: normalizedUrl,
    customAlias: aliasValue ? validateCustomAlias(aliasValue) : undefined,
  } as T;
}

export function parseCreateLinkPayload(payload: unknown): CreateLinkInput {
  return parseLinkPayload<CreateLinkInput>(payload);
}

export function parseUpdateLinkPayload(payload: unknown): UpdateLinkInput {
  return parseLinkPayload<UpdateLinkInput>(payload);
}

export function parseTrackAdPayload(payload: unknown): TrackAdEventInput {
  const parsedPayload = adEventSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstIssue = parsedPayload.error.issues[0];
    throw new Error(firstIssue?.message ?? "Invalid request payload.");
  }

  return parsedPayload.data;
}

export function parsePlanUpdatePayload(payload: unknown) {
  const parsedPayload = planSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstIssue = parsedPayload.error.issues[0];
    throw new Error(firstIssue?.message ?? "Invalid request payload.");
  }

  return parsedPayload.data;
}
