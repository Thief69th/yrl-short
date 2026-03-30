import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "paid"]);
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const deviceTypeEnum = pgEnum("device_type", [
  "desktop",
  "mobile",
  "tablet",
  "bot",
  "unknown",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 191 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    plan: planEnum("plan").notNull().default("free"),
    role: roleEnum("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIndex: index("users_email_idx").on(table.email),
  }),
);

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    longUrl: text("long_url").notNull(),
    shortCode: varchar("short_code", { length: 40 }).notNull().unique(),
    customAlias: varchar("custom_alias", { length: 32 }),
    clicks: integer("clicks").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    userIndex: index("links_user_idx").on(table.userId),
    shortCodeIndex: uniqueIndex("links_short_code_idx").on(table.shortCode),
  }),
);

export const clickEvents = pgTable(
  "click_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 }).notNull().default("UN"),
    deviceType: deviceTypeEnum("device_type").notNull().default("unknown"),
    referrer: text("referrer"),
    servedInterstitial: boolean("served_interstitial").notNull().default(false),
    impressionTracked: boolean("impression_tracked").notNull().default(false),
    adClicked: boolean("ad_clicked").notNull().default(false),
    revenueAmount: doublePrecision("revenue_amount").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    linkIndex: index("click_events_link_idx").on(table.linkId),
    userIndex: index("click_events_user_idx").on(table.userId),
    createdAtIndex: index("click_events_created_at_idx").on(table.createdAt),
  }),
);

export const earnings = pgTable(
  "earnings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    clicksCount: integer("clicks_count").notNull().default(0),
    revenue: doublePrecision("revenue").notNull().default(0),
    periodDate: date("period_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    linkIndex: index("earnings_link_idx").on(table.linkId),
    linkPeriodIndex: uniqueIndex("earnings_link_period_idx").on(
      table.linkId,
      table.periodDate,
    ),
  }),
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    authorIndex: index("blog_posts_author_idx").on(table.authorId),
    slugIndex: uniqueIndex("blog_posts_slug_idx").on(table.slug),
    publishedIndex: index("blog_posts_published_idx").on(table.isPublished, table.publishedAt),
  }),
);
