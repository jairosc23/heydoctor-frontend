"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ADMIN_NAV = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/subscriptions", label: "Suscripciones" },
  { href: "/admin/ops", label: "Ops" },
  { href: "/admin/growth", label: "Growth" },
] as const;

function AdminNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded px-2 py-1 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
        active
          ? "font-semibold text-slate-900"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            HeyDoctor · Admin
          </p>
          <nav
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
            aria-label="Navegación admin"
          >
            {ADMIN_NAV.map(({ href, label }) => (
              <AdminNavLink key={href} href={href} label={label} />
            ))}
            <Link
              href="/panel"
              className="rounded px-2 py-1 text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Panel
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
