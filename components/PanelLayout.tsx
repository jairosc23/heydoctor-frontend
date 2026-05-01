"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";
import { cn } from "@/lib/utils";

const MENU = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pacientes", href: "/panel/pacientes" },
  { label: "Consultas", href: "/panel/consultas" },
  { label: "Agenda", href: "/panel/agenda" },
  { label: "Reportes", href: "/panel/reportes" },
  { label: "Facturación", href: "/panel/facturacion" },
  { label: "Configuración", href: "/panel/config" },
  { label: "Admin", href: "/panel/admin" },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/panel/pacientes": "Pacientes",
  "/panel/consultas": "Consultas",
  "/panel/agenda": "Agenda",
  "/panel/reportes": "Reportes",
  "/panel/facturacion": "Facturación",
  "/panel/config": "Configuración",
  "/panel/admin": "Admin",
  "/panel": "Panel",
};

function isMenuActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export default function PanelLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const displayTitle =
    title ??
    (pathname
      ? TITLES[pathname] ??
        (pathname.startsWith("/panel/consultas/")
          ? "Consultas"
          : undefined)
      : undefined) ??
    "Panel";
  const router = useRouter();
  const { isAuthenticated, logout, user, refreshUser, loading: authLoading } =
    useAuth();
  const [dark, setDark] = useState(false);
  const [panelSessionChecked, setPanelSessionChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme") === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (user) {
      setPanelSessionChecked(true);
      return;
    }
    if (!panelSessionChecked) {
      void refreshUser().finally(() => setPanelSessionChecked(true));
    }
  }, [user, panelSessionChecked, refreshUser, authLoading]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (panelSessionChecked && !isAuthenticated) {
      const path = pathname ?? "";
      const dest =
        path &&
        path !== "/login" &&
        path.startsWith("/") &&
        !path.startsWith("//")
          ? `/login?redirect=${encodeURIComponent(path)}`
          : "/login";
      router.push(dest);
    }
  }, [authLoading, panelSessionChecked, isAuthenticated, router, pathname]);

  function toggleTheme() {
    setDark((d) => !d);
    document.body.classList.toggle("dark", !dark);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", !dark ? "dark" : "light");
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  /** Teleconsulta a pantalla completa: montar siempre (la sesión gestiona loaders y auth). */
  const isPanelTeleconsultaRoute =
    !!pathname && /\/panel\/consultas\/[^/]+\/teleconsulta$/.test(pathname);

  if (isPanelTeleconsultaRoute) {
    return <>{children}</>;
  }

  if (authLoading) {
    return null;
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#eef4f7] font-sans">
      <aside className="fixed bottom-0 left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-100 bg-white p-4 shadow-soft">
        <div className="mb-8 flex flex-col items-center">
          <HeyDoctorLogo size={56} className="mx-auto mb-2" />
          <h2
            className="m-0 text-center text-lg font-semibold text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            HeyDoctor
          </h2>
        </div>
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mb-2 rounded-xl px-4 py-2 text-[15px] font-medium text-gray-700 no-underline transition-all duration-200 hover:bg-gray-50",
              isMenuActive(pathname, item.href) && "bg-primaryLight text-primary",
            )}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="mt-auto rounded-xl border-0 bg-gray-50 px-4 py-2 text-left text-[15px] text-red-600 transition-all duration-200 hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </aside>
      <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 px-6 backdrop-blur-md">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <div className="flex shrink-0 items-center gap-2">
            <HeyDoctorLogo size={36} />
            <span
              className="text-lg font-semibold text-primary"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              HeyDoctor
            </span>
          </div>
          <span
            className="truncate border-l border-gray-200 pl-6 text-lg font-semibold text-slate-600"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {displayTitle}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="max-w-[220px] truncate text-xs text-gray-600">{user?.email}</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="border-0 bg-transparent p-0 text-[22px] transition-all duration-200 hover:scale-105"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <div
            className="h-11 w-11 shrink-0 rounded-full bg-primaryMid transition-all duration-200"
            aria-hidden
          />
        </div>
      </header>
      <main className="absolute bottom-0 left-64 right-0 top-16 overflow-y-auto bg-[#eef4f7] p-8">
        {children}
      </main>
    </div>
  );
}
