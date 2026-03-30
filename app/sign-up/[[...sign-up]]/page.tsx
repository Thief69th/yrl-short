import "@/lib/runtime-env";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

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
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-[34px] p-6 sm:p-8">
          <span className="pill">Create account</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
            Create your Blink account
          </h1>
          <p className="mt-3 text-sm leading-8 text-muted">
            Account sirf ek baar banao. Uske baad hamesha sign in page par same email aur password use karo.
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/sign-in" className="button-secondary">
              Already have an account?
            </Link>
            <Link href="/" className="button-secondary">
              Back to home
            </Link>
          </div>
        </div>

        <div className="glass-card flex items-center justify-center rounded-[34px] p-6 sm:p-8">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
        </div>
      </section>
    </main>
  );
}
