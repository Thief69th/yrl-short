import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/legal", label: "Legal" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-card mt-8 rounded-[28px] px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="font-display text-xl font-bold text-foreground">Blink</div>
          <p className="mt-2 text-sm text-muted">
            Simple URL shortener with public links, dashboards, and monetized redirects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm font-medium text-muted">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 hover:bg-white hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-muted">
        Copyright {currentYear} Blink. All rights reserved.
      </div>
    </footer>
  );
}
