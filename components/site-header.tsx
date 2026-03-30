"use client";

import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass-card sticky top-4 z-20 rounded-[28px] px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl font-bold text-foreground">
          Blink
        </Link>

        <nav className="hidden flex-wrap items-center gap-2 text-sm font-medium text-muted lg:flex">
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

        <div className="hidden flex-wrap items-center gap-3 lg:flex">
          {authEnabled ? (
            <>
              <SignedOut>
                <Link href="/sign-in" className="button-secondary">
                  Login
                </Link>
                <Link href="/sign-up" className="button-primary">
                  Create account
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="button-primary">
                  Dashboard
                </Link>
                <SignOutButton>
                  <button className="button-secondary">Logout</button>
                </SignOutButton>
                <div className="rounded-full bg-white/80 p-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          ) : (
            <Link href="/dashboard" className="button-primary">
              Dashboard
            </Link>
          )}
        </div>

        <button
          type="button"
          className="button-secondary px-4 py-2 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className={`${menuOpen ? "grid" : "hidden"} mt-4 gap-4 lg:hidden`}>
        <nav className="grid gap-2 text-sm font-medium text-muted">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-white/75 px-4 py-3 hover:bg-white hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="grid gap-3">
          {authEnabled ? (
            <>
              <SignedOut>
                <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="button-secondary">
                  Login
                </Link>
                <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="button-primary">
                  Create account
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="button-primary">
                  Open dashboard
                </Link>
                <SignOutButton>
                  <button className="button-secondary">Logout</button>
                </SignOutButton>
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
