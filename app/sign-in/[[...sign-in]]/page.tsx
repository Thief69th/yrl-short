import "@/lib/runtime-env";

import { SignIn } from "@clerk/nextjs";

import { SetupCard } from "@/components/setup-card";
import { isClerkConfigured } from "@/lib/env";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <SetupCard
        title="Configure Clerk to enable sign in"
        description="Add your Clerk publishable and secret keys, then return here to use Blink authentication."
      />
    );
  }

  return (
    <main className="app-shell items-center justify-center">
      <SignIn />
    </main>
  );
}
