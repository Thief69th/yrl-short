import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PublicPageShellProps = {
  children: ReactNode;
};

export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <main className="app-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
