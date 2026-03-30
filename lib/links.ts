import { and, count, desc, eq, gte, isNull, sql } from "drizzle-orm";

import {
  ADVANCED_ANALYTICS_DAYS,
  ANALYTICS_WINDOW_DAYS,
  BASIC_ANALYTICS_DAYS,
  SHORT_CODE_ALPHABET,
  SHORT_CODE_LENGTH,
  RESERVED_CODES,
} from "@/lib/constants";
import { getDb } from "@/lib/db";
import { clickEvents, earnings, links, users } from "@/lib/db/schema";
import { ConflictError, AppError } from "@/lib/errors";
import { getAdRevenueConfig, getFreeLinkLimit, getInterstitialSeconds } from "@/lib/env";
import { canCreateAnotherLink, shouldServeInterstitial, supportsAdvancedAnalytics } from "@/lib/policies";
import type {
  AuthenticatedAppUser,
  BreakdownPoint,
  CreateLinkInput,
  DashboardOverview,
  DailyAnalyticsPoint,
  LinkAnalytics,
  LinkSnapshot,
  RedirectResolution,
  UpdateLinkInput,
} from "@/lib/types";
import type { VisitContext } from "@/lib/request";
import { getOrCreatePublicGuestUser } from "@/lib/users";

type LinkRow = typeof links.$inferSelect;

const todayDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function buildShortUrl(baseUrl: string, shortCode: string) {
  return new URL(`/r/${shortCode}`, baseUrl).toString();
}

function serializeLink(row: LinkRow, baseUrl: string, ownerPlan: "free" | "paid"): LinkSnapshot {
  return {
    id: row.id,
    longUrl: row.longUrl,
    shortCode: row.shortCode,
    shortUrl: buildShortUrl(baseUrl, row.shortCode),
    customAlias: row.customAlias,
    clicks: row.clicks,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
    ownerPlan,
  };
}

function generateShortCode(length = SHORT_CODE_LENGTH) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (value) => SHORT_CODE_ALPHABET[value % SHORT_CODE_ALPHABET.length]).join("");
}

async function isShortCodeTaken(code: string) {
  const db = getDb();
  const [existing] = await db
    .select({ id: links.id })
    .from(links)
    .where(eq(links.shortCode, code))
    .limit(1);

  return Boolean(existing);
}

async function generateAvailableCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateShortCode();

    if (RESERVED_CODES.has(code)) {
      continue;
    }

    if (!(await isShortCodeTaken(code))) {
      return code;
    }
  }

  throw new AppError("Unable to generate a unique short code right now.", 500);
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function getActiveLinkCount(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ value: count(links.id) })
    .from(links)
    .where(and(eq(links.userId, userId), eq(links.isActive, true), isNull(links.deletedAt)));

  return Number(row?.value ?? 0);
}

function startDateFor(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function todayPeriodDate() {
  return todayDateFormatter.format(new Date());
}

async function addRevenueToEarnings(linkId: string, amount: number, clicksCount: number) {
  const db = getDb();
  const periodDate = todayPeriodDate();

  await db
    .insert(earnings)
    .values({
      linkId,
      periodDate,
      clicksCount,
      revenue: amount,
    })
    .onConflictDoUpdate({
      target: [earnings.linkId, earnings.periodDate],
      set: {
        clicksCount: sql`${earnings.clicksCount} + ${clicksCount}`,
        revenue: sql`${earnings.revenue} + ${amount}`,
      },
    });
}

async function getLinkRowForOwner(linkId: string, ownerId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, linkId), eq(links.userId, ownerId), isNull(links.deletedAt)))
    .limit(1);

  if (!row) {
    throw new AppError("Link not found.", 404);
  }

  return row;
}

export async function createLinkForUser(
  viewer: AuthenticatedAppUser,
  input: CreateLinkInput,
  baseUrl: string,
) {
  const db = getDb();

  if (viewer.plan === "free") {
    const activeCount = await getActiveLinkCount(viewer.id);

    if (!canCreateAnotherLink(viewer.plan, activeCount, getFreeLinkLimit())) {
      throw new AppError(
        `Free plans can only keep ${getFreeLinkLimit()} active links. Upgrade to add more.`,
        403,
      );
    }
  }

  const shortCode = input.customAlias ?? (await generateAvailableCode());

  try {
    const [link] = await db
      .insert(links)
      .values({
        userId: viewer.id,
        longUrl: input.longUrl,
        shortCode,
        customAlias: input.customAlias ?? null,
      })
      .returning();

    return serializeLink(link, baseUrl, viewer.plan);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("That custom alias is already taken.");
    }

    throw error;
  }
}

export async function createPublicLink(input: CreateLinkInput, baseUrl: string) {
  const guestUser = await getOrCreatePublicGuestUser();
  const db = getDb();
  const shortCode = input.customAlias ?? (await generateAvailableCode());

  try {
    const [link] = await db
      .insert(links)
      .values({
        userId: guestUser.id,
        longUrl: input.longUrl,
        shortCode,
        customAlias: input.customAlias ?? null,
      })
      .returning();

    return serializeLink(link, baseUrl, guestUser.plan);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("That custom alias is already taken.");
    }

    throw error;
  }
}

export async function listLinksForUser(viewer: AuthenticatedAppUser, baseUrl: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(links)
    .where(and(eq(links.userId, viewer.id), isNull(links.deletedAt)))
    .orderBy(desc(links.createdAt));

  return rows.map((row) => serializeLink(row, baseUrl, viewer.plan));
}

export async function updateLinkForUser(
  viewer: AuthenticatedAppUser,
  linkId: string,
  input: UpdateLinkInput,
  baseUrl: string,
) {
  const db = getDb();
  const current = await getLinkRowForOwner(linkId, viewer.id);

  const shortCode =
    input.customAlias && input.customAlias !== current.customAlias
      ? input.customAlias
      : current.shortCode;
  const customAlias =
    input.customAlias && input.customAlias !== current.customAlias
      ? input.customAlias
      : current.customAlias;

  try {
    const [updated] = await db
      .update(links)
      .set({
        longUrl: input.longUrl,
        shortCode,
        customAlias,
        updatedAt: new Date(),
      })
      .where(eq(links.id, linkId))
      .returning();

    return serializeLink(updated, baseUrl, viewer.plan);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("That custom alias is already taken.");
    }

    throw error;
  }
}

export async function deleteLinkForUser(viewer: AuthenticatedAppUser, linkId: string) {
  const db = getDb();
  await getLinkRowForOwner(linkId, viewer.id);

  const [updated] = await db
    .update(links)
    .set({
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(links.id, linkId))
    .returning();

  return updated?.id ?? linkId;
}

async function getDailyChartForOwner(ownerId: string, days: number, linkId?: string) {
  const db = getDb();
  const whereClause = linkId
    ? and(eq(clickEvents.userId, ownerId), eq(clickEvents.linkId, linkId), gte(clickEvents.createdAt, startDateFor(days)))
    : and(eq(clickEvents.userId, ownerId), gte(clickEvents.createdAt, startDateFor(days)));

  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${clickEvents.createdAt}), 'YYYY-MM-DD')`,
      clicks: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${clickEvents.revenueAmount}), 0)::float`,
    })
    .from(clickEvents)
    .where(whereClause)
    .groupBy(sql`date_trunc('day', ${clickEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${clickEvents.createdAt}) asc`);

  return rows.map(
    (row): DailyAnalyticsPoint => ({
      date: row.date,
      clicks: Number(row.clicks),
      revenue: Number(row.revenue),
    }),
  );
}

async function getBreakdownForOwner(
  ownerId: string,
  column: typeof clickEvents.countryCode | typeof clickEvents.deviceType,
  linkId?: string,
) {
  const db = getDb();
  const whereClause = linkId
    ? and(eq(clickEvents.userId, ownerId), eq(clickEvents.linkId, linkId), gte(clickEvents.createdAt, startDateFor(ADVANCED_ANALYTICS_DAYS)))
    : and(eq(clickEvents.userId, ownerId), gte(clickEvents.createdAt, startDateFor(ADVANCED_ANALYTICS_DAYS)));

  const rows = await db
    .select({
      label: column,
      value: sql<number>`count(*)::int`,
    })
    .from(clickEvents)
    .where(whereClause)
    .groupBy(column)
    .orderBy(sql`count(*) desc`);

  return rows.map(
    (row): BreakdownPoint => ({
      label: row.label ?? "Unknown",
      value: Number(row.value),
    }),
  );
}

export async function getDashboardOverview(
  viewer: AuthenticatedAppUser,
  baseUrl: string,
): Promise<DashboardOverview> {
  const db = getDb();
  const recentRows = await db
    .select()
    .from(links)
    .where(and(eq(links.userId, viewer.id), isNull(links.deletedAt)))
    .orderBy(desc(links.createdAt))
    .limit(6);

  const [totals] = await db
    .select({
      totalLinks: count(links.id),
      activeLinks: sql<number>`count(*) filter (where ${links.isActive} = true and ${links.deletedAt} is null)::int`,
      totalClicks: sql<number>`coalesce(sum(${links.clicks}), 0)::int`,
    })
    .from(links)
    .where(eq(links.userId, viewer.id));

  const [revenueRow] = await db
    .select({
      estimatedRevenue: sql<number>`coalesce(sum(${earnings.revenue}), 0)::float`,
    })
    .from(earnings)
    .innerJoin(links, eq(earnings.linkId, links.id))
    .where(eq(links.userId, viewer.id));

  const chartDays = viewer.plan === "paid" ? ADVANCED_ANALYTICS_DAYS : BASIC_ANALYTICS_DAYS;

  return {
    viewer,
    totals: {
      totalLinks: Number(totals?.totalLinks ?? 0),
      activeLinks: Number(totals?.activeLinks ?? 0),
      totalClicks: Number(totals?.totalClicks ?? 0),
      estimatedRevenue: Number(revenueRow?.estimatedRevenue ?? 0),
    },
    recentLinks: recentRows.map((row) => serializeLink(row, baseUrl, viewer.plan)),
    chart: await getDailyChartForOwner(viewer.id, chartDays),
    countryBreakdown: supportsAdvancedAnalytics(viewer.plan)
      ? await getBreakdownForOwner(viewer.id, clickEvents.countryCode)
      : [],
    deviceBreakdown: supportsAdvancedAnalytics(viewer.plan)
      ? await getBreakdownForOwner(viewer.id, clickEvents.deviceType)
      : [],
  };
}

export async function getLinkAnalytics(
  viewer: AuthenticatedAppUser,
  linkId: string,
  baseUrl: string,
): Promise<LinkAnalytics> {
  const link = await getLinkRowForOwner(linkId, viewer.id);

  return {
    link: serializeLink(link, baseUrl, viewer.plan),
    chart: await getDailyChartForOwner(viewer.id, ANALYTICS_WINDOW_DAYS, linkId),
    countryBreakdown: supportsAdvancedAnalytics(viewer.plan)
      ? await getBreakdownForOwner(viewer.id, clickEvents.countryCode, linkId)
      : [],
    deviceBreakdown: supportsAdvancedAnalytics(viewer.plan)
      ? await getBreakdownForOwner(viewer.id, clickEvents.deviceType, linkId)
      : [],
  };
}

export async function resolveRedirect(
  code: string,
  baseUrl: string,
  context: VisitContext,
): Promise<RedirectResolution> {
  const db = getDb();
  const normalizedCode = code.trim().toLowerCase();
  const [row] = await db
    .select({
      id: links.id,
      longUrl: links.longUrl,
      shortCode: links.shortCode,
      userId: links.userId,
      ownerPlan: users.plan,
    })
    .from(links)
    .innerJoin(users, eq(users.id, links.userId))
    .where(
      and(eq(links.shortCode, normalizedCode), eq(links.isActive, true), isNull(links.deletedAt)),
    )
    .limit(1);

  if (!row) {
    return { status: "missing" };
  }

  const servedInterstitial = shouldServeInterstitial(row.ownerPlan);
  const [event] = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(clickEvents)
      .values({
        linkId: row.id,
        userId: row.userId,
        countryCode: context.countryCode,
        deviceType: context.deviceType,
        referrer: context.referrer,
        servedInterstitial,
      })
      .returning();

    await tx
      .update(links)
      .set({
        clicks: sql`${links.clicks} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(links.id, row.id));

    return [created];
  });

  if (!servedInterstitial) {
    return {
      status: "redirect",
      destination: row.longUrl,
    };
  }

  return {
    status: "interstitial",
    destination: row.longUrl,
    shortUrl: buildShortUrl(baseUrl, row.shortCode),
    eventId: event.id,
    countdownSeconds: getInterstitialSeconds(),
    adMarkup: process.env.AD_CODE ?? null,
  };
}

export async function recordAdImpression(eventId: string) {
  const db = getDb();
  const { impressionValue } = getAdRevenueConfig();

  const [event] = await db
    .update(clickEvents)
    .set({
      impressionTracked: true,
      revenueAmount: sql`${clickEvents.revenueAmount} + ${impressionValue}`,
    })
    .where(and(eq(clickEvents.id, eventId), eq(clickEvents.impressionTracked, false)))
    .returning({
      linkId: clickEvents.linkId,
    });

  if (!event) {
    return { tracked: false };
  }

  await addRevenueToEarnings(event.linkId, impressionValue, 1);
  return { tracked: true };
}

export async function recordAdClick(eventId: string) {
  const db = getDb();
  const { clickValue } = getAdRevenueConfig();

  const [event] = await db
    .update(clickEvents)
    .set({
      adClicked: true,
      revenueAmount: sql`${clickEvents.revenueAmount} + ${clickValue}`,
    })
    .where(and(eq(clickEvents.id, eventId), eq(clickEvents.adClicked, false)))
    .returning({
      linkId: clickEvents.linkId,
    });

  if (!event) {
    return { tracked: false };
  }

  await addRevenueToEarnings(event.linkId, clickValue, 0);
  return { tracked: true };
}
