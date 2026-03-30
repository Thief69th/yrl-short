import "@/lib/runtime-env";

import { SignIn } from "@clerk/nextjs";

import { SetupCard } from "@/components/setup-card";
import { isClerkClientConfigured } from "@/lib/env";

export default function SignInPage() {
  if (!isClerkClientConfigured()) {
    return (
      <SetupCard
        title="Configure Clerk to enable sign in"
        description="Add your Clerk publishable key, then return here to use Blink authentication."
      />
    );
  }

  return (
    <main className="app-shell items-center justify-center">
      <SignIn />
    </main>
  );
}
