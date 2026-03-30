const ENV_KEYS = [
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
] as const;

for (const key of ENV_KEYS) {
  const value = process.env[key];

  if (typeof value === "string") {
    process.env[key] = value.trim();
  }
}

export function getRuntimeEnv(name: (typeof ENV_KEYS)[number]) {
  return process.env[name]?.trim() ?? "";
}
