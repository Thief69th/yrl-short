import { eq, inArray, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import {
  MAX_RECENT_LINKS,
  RESERVED_CODES,
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
} from "@/lib/constants";
import { ensureDatabase, getDatabase } from "@/lib/db";
import { links } from "@/lib/db/schema";
import type { CreateShortLinkInput, LinkSnapshot } from "@/lib/types";
import { normalizeCode } from "@/lib/validators";

type LinkRow = InferSelectModel<typeof links>;

export class LinkConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LinkConflictError";
  }
}

export { DatabaseNotConfiguredError } from "@/lib/db";

function buildShortUrl(baseUrl: string, code: string) {
  return new URL(`/r/${code}`, baseUrl).toString();
}

function serializeLink(row: LinkRow, baseUrl: string): LinkSnapshot {
  return {
    code: row.code,
    createdAt: row.createdAt.toISOString(),
    clickCount: row.clickCount,
    customAlias: row.customAlias,
    lastVisitedAt: row.lastVisitedAt?.toISOString() ?? null,
    originalUrl: row.originalUrl,
    shortUrl: buildShortUrl(baseUrl, row.code),
  };
}

function generateCode(length = SHORT_CODE_LENGTH) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(bytes, (value) => {
    const index = value % SHORT_CODE_ALPHABET.length;
    return SHORT_CODE_ALPHABET[index];
  }).join("");
}

async function isCodeTaken(code: string) {
  const { db } = getDatabase();
  const existing = await db
    .select({ code: links.code })
    .from(links)
    .where(eq(links.code, code))
    .limit(1);

  return existing.length > 0;
}

async function generateAvailableCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = generateCode();

    if (RESERVED_CODES.has(candidate)) {
      continue;
    }

    if (!(await isCodeTaken(candidate))) {
      return candidate;
    }
  }

  throw new Error("Unable to create a unique short code. Please try again.");
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function createShortLink(
  input: CreateShortLinkInput,
  baseUrl: string,
) {
  await ensureDatabase();

  const { db } = getDatabase();
  const code = input.customAlias ?? (await generateAvailableCode());

  try {
    const [createdLink] = await db
      .insert(links)
      .values({
        code,
        customAlias: input.customAlias ?? null,
        originalUrl: input.originalUrl,
      })
      .returning();

    return serializeLink(createdLink, baseUrl);
  } catch (error) {
    if (isUniqueViolation(error) && input.customAlias) {
      throw new LinkConflictError(
        "That custom alias is already taken. Try another one.",
      );
    }

    throw error;
  }
}

export async function getLinksByCodes(codes: string[], baseUrl: string) {
  if (codes.length === 0) {
    return [];
  }

  await ensureDatabase();

  const { db } = getDatabase();
  const normalizedCodes = [...new Set(codes.map((code) => normalizeCode(code)))]
    .filter(Boolean)
    .slice(0, MAX_RECENT_LINKS);

  const rows = await db
    .select()
    .from(links)
    .where(inArray(links.code, normalizedCodes));

  const rowMap = new Map(rows.map((row) => [row.code, row]));

  return normalizedCodes
    .map((code) => rowMap.get(code))
    .filter((row): row is LinkRow => Boolean(row))
    .map((row) => serializeLink(row, baseUrl));
}

export async function resolveShortLink(code: string) {
  await ensureDatabase();

  const { db } = getDatabase();
  const normalizedCode = normalizeCode(code);
  const [updatedLink] = await db
    .update(links)
    .set({
      clickCount: sql`${links.clickCount} + 1`,
      lastVisitedAt: new Date(),
    })
    .where(eq(links.code, normalizedCode))
    .returning({
      originalUrl: links.originalUrl,
    });

  return updatedLink ?? null;
}
