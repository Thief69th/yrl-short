import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

declare global {
  var __blinkSql: ReturnType<typeof postgres> | undefined;
  var __blinkDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
  var __blinkInit: Promise<void> | undefined;
}

type DatabaseBundle = {
  db: ReturnType<typeof drizzle<typeof schema>>;
  sql: ReturnType<typeof postgres>;
};

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

function createBundle(): DatabaseBundle {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new DatabaseNotConfiguredError();
  }

  const sql =
    globalThis.__blinkSql ??
    postgres(connectionString, {
      prepare: false,
      max: 1,
    });

  const db =
    globalThis.__blinkDb ??
    drizzle(sql, {
      schema,
    });

  globalThis.__blinkSql = sql;
  globalThis.__blinkDb = db;

  return { db, sql };
}

export function getDatabase() {
  return createBundle();
}

export async function ensureDatabase() {
  const { sql } = createBundle();

  globalThis.__blinkInit ??= (async () => {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(32) NOT NULL UNIQUE,
        original_url TEXT NOT NULL,
        custom_alias VARCHAR(32),
        click_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_visited_at TIMESTAMPTZ
      );
    `);

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS links_code_idx
      ON links (code);
    `);
  })();

  await globalThis.__blinkInit;
}
