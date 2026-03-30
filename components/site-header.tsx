import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

import { isClerkConfigured } from "@/lib/env";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const authEnabled = isClerkConfigured();

  return (
    <header className="glass-card sticky top-4 z-20 rounded-[28px] px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl font-bold text-foreground">
          Blink
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-muted">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 hover:bg-white hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap gap-3">
          {authEnabled ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="button-secondary">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="button-primary">Create account</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="button-primary">
                  Dashboard
                </Link>
              </SignedIn>
            </>
          ) : (
            <Link href="/dashboard" className="button-primary">
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
