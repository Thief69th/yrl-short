import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const links = pgTable(
  "links",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    originalUrl: text("original_url").notNull(),
    customAlias: varchar("custom_alias", { length: 32 }),
    clickCount: integer("click_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastVisitedAt: timestamp("last_visited_at", { withTimezone: true }),
  },
  (table) => ({
    codeIndex: index("links_code_idx").on(table.code),
  }),
);
