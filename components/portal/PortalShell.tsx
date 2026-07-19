"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/branding";
import { useAuth } from "@/lib/context/AuthContext";
import Button from "@/components/ui/Button";

const NAV = [
  { href: "/portal", label: "Inicio" },
  { href: "/portal/citas", label: "Mis citas" },
  { href: "/portal/historial", label: "Historial" },
  { href: "/portal/pagos", label: "Pagos" },
  { href: "/portal/perfil", label: "Perfil" },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && user?.role !== "patient") {
      router.replace("/panel");
      return;
    }
    if (!isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname || "/portal")}`,
      );
    }
  }, [loading, isAuthenticated, user?.role, pathname, router]);

  return (
    <div className="min-h-screen bg-hd-surface-base text-primaryDark">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-4">
          <Link href="/portal" className="no-underline">
            <BrandLogo markSize={36} />
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold">
            {NAV.map((item) => {
              const active =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "text-primary underline decoration-2 underline-offset-4"
                      : "text-primaryDark/70 hover:text-primary"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-primaryDark/60 sm:inline">
              {user?.email}
            </span>
            <Button
              variant="secondary"
              className="px-3 py-2 text-sm"
              onClick={() => void logout().then(() => router.push("/login"))}
            >
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-4 py-8">{children}</main>
    </div>
  );
}
