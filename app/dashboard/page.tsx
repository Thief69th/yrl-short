import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { SetupCard } from "@/components/setup-card";
import { requireViewer } from "@/lib/auth";
import { ConfigurationError, AuthenticationError } from "@/lib/errors";
import { getDashboardOverview } from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let overview = null;

  try {
    const viewer = await requireViewer();
    overview = await getDashboardOverview(
      viewer,
      getBaseUrlFromRequest(new Request(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")),
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect("/sign-in");
    }

    if (error instanceof ConfigurationError) {
      return (
        <SetupCard
          title="Add your auth and database configuration"
          description="Blink needs Clerk and Neon environment variables before the dashboard can load."
          code={`DATABASE_URL=postgres://...\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...\nCLERK_SECRET_KEY=sk_...`}
        />
      );
    }

    throw error;
  }

  return <DashboardShell initialOverview={overview} />;
}
