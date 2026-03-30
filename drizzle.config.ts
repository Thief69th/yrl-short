import { existsSync } from "node:fs";

import type { Config } from "drizzle-kit";

if (typeof process.loadEnvFile === "function") {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  if (existsSync(".env")) {
    process.loadEnvFile(".env");
  }
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
