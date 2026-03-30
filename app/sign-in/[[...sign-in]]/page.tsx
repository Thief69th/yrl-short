import "@/lib/runtime-env";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

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
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-[34px] p-6 sm:p-8">
          <span className="pill">Login</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
            Login with your existing account
          </h1>
          <p className="mt-3 text-sm leading-8 text-muted">
            Ek email par ek hi account hota hai. Agar account pehle se bana hua hai, sirf same email aur
            password se login karo.
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/sign-up" className="button-secondary">
              Need a new account?
            </Link>
            <Link href="/" className="button-secondary">
              Back to home
            </Link>
          </div>
        </div>

        <div className="glass-card flex items-center justify-center rounded-[34px] p-6 sm:p-8">
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
        </div>
      </section>
    </main>
  );
}
