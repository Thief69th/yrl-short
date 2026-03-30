import "@/lib/runtime-env";

import { SignUp } from "@clerk/nextjs";

import { SetupCard } from "@/components/setup-card";
import { isClerkClientConfigured } from "@/lib/env";

export default function SignUpPage() {
  if (!isClerkClientConfigured()) {
    return (
      <SetupCard
        title="Configure Clerk to enable sign up"
        description="Add your Clerk publishable key, then return here to create accounts."
      />
    );
  }

  return (
    <main className="app-shell items-center justify-center">
      <SignUp />
    </main>
  );
}
