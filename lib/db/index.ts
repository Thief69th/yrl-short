import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/lib/db/schema";
import { ConfigurationError } from "@/lib/errors";
import { getRuntimeEnv } from "@/lib/runtime-env";

type BlinkDatabase = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __blinkSql: ReturnType<typeof neon> | undefined;
  var __blinkDb: BlinkDatabase | undefined;
}

function createDatabase() {
  const connectionString = getRuntimeEnv("DATABASE_URL");

  if (!connectionString) {
    throw new ConfigurationError(
      "DATABASE_URL is not configured. Add a Neon connection string to continue.",
    );
  }

  const sql = globalThis.__blinkSql ?? neon(connectionString);
  const db = (globalThis.__blinkDb ?? drizzle(sql, { schema })) as BlinkDatabase;

  globalThis.__blinkSql = sql;
  globalThis.__blinkDb = db;

  return db;
}

export function getDb() {
  return createDatabase();
}
