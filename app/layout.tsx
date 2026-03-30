import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { APP_NAME } from "@/lib/constants";
import { isClerkConfigured } from "@/lib/env";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Run a monetized URL shortener SaaS with free and paid plans, branded redirects, analytics, and Neon-backed link management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );

  if (!isClerkConfigured()) {
    return content;
  }

  return <ClerkProvider afterSignOutUrl="/">{content}</ClerkProvider>;
}
