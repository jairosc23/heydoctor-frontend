"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const FONT_HEADING = "Montserrat, sans-serif";

const ADMIN_NAV = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/subscriptions", label: "Suscripciones" },
  { href: "/admin/ops", label: "Ops / Signal" },
  { href: "/admin/clinical-beta", label: "Clinical Beta" },
  { href: "/admin/growth", label: "Growth" },
] as const;

function AdminNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium no-underline transition-colors duration-hd-base focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "bg-primaryLight text-primary"
          : "text-primaryDark/70 hover:bg-hd-surface-muted hover:text-primary",
      )}
      style={{ fontFamily: FONT_HEADING }}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-hd-surface-base text-primaryDark">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="no-underline">
              <BrandLogo variant="nav" priority />
            </Link>
            <span
              className="hidden border-l border-hd-border-default pl-3 text-xs font-semibold uppercase tracking-wide text-primaryDark/60 sm:inline"
              style={{ fontFamily: FONT_HEADING }}
            >
              Admin
            </span>
          </div>
          <nav
            className="flex flex-wrap items-center gap-1 sm:gap-2"
            aria-label="Navegación admin"
          >
            {ADMIN_NAV.map(({ href, label }) => (
              <AdminNavLink key={href} href={href} label={label} />
            ))}
            <Link
              href="/panel"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-primaryDark/70 no-underline transition-colors hover:bg-hd-surface-muted hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              style={{ fontFamily: FONT_HEADING }}
            >
              Panel
            </Link>
          </nav>
        </Container>
      </header>
      {children}
    </div>
  );
}
