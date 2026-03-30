import { SignUp } from "@clerk/nextjs";

import { SetupCard } from "@/components/setup-card";
import { isClerkConfigured } from "@/lib/env";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <SetupCard
        title="Configure Clerk to enable sign up"
        description="Add your Clerk publishable and secret keys, then return here to create accounts."
      />
    );
  }

  return (
    <main className="app-shell items-center justify-center">
      <SignUp />
    </main>
  );
}
