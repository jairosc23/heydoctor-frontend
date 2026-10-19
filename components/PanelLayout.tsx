"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { BrandLogo } from "@/components/branding";
import {
  UnsavedChangesGuardProvider,
  useUnsavedChangesGuard,
} from "@/lib/unsaved-changes-guard/unsaved-changes-guard-context";
import { isUnmodifiedLeftClick } from "@/lib/unsaved-changes-guard/is-unmodified-left-click";
import { cn } from "@/lib/utils";
import { trackRedirectToLogin } from "@/lib/session-analytics";
import { ClinicalBetaFeedbackWidget } from "@/components/clinical-beta/ClinicalBetaFeedbackWidget";
import { CLINICAL_OVERLAY_CLASS } from "@/lib/clinical-overlay-contract";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";
import { useVisualWorkspaceState } from "@/lib/clinical-workspace/use-visual-workspace-state";

const MENU = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pacientes", href: "/panel/pacientes" },
  { label: "Consultas", href: "/panel/consultas" },
  { label: "Agenda", href: "/panel/agenda" },
  { label: "Reportes", href: "/panel/reportes" },
  { label: "Facturación", href: "/panel/facturacion" },
  { label: "Configuración", href: "/panel/config" },
  { label: "Perfil profesional", href: "/panel/settings/professional-profile" },
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
  "/panel/settings/professional-profile": "Perfil profesional",
  "/panel/admin": "Admin",
  "/panel": "Panel",
};

const FONT_NAV = "Montserrat, sans-serif";

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
  return (
    <UnsavedChangesGuardProvider>
      <PanelLayoutShell title={title}>{children}</PanelLayoutShell>
    </UnsavedChangesGuardProvider>
  );
}

function PanelLayoutShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { requestNavigation } = useUnsavedChangesGuard();
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
  const [navOpen, setNavOpen] = useState(false);
  const [panelSessionChecked, setPanelSessionChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme") === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) {
      clinicalWorkspaceKernel.dismiss("panel-nav");
      return;
    }
    clinicalWorkspaceKernel.present({
      id: "panel-nav",
      kind: "drawer",
      blocking: true,
      onDismiss: () => setNavOpen(false),
      backdropAriaLabel: "Cerrar menú de navegación",
      backdropClassName: "bg-primaryDark/40 md:hidden",
    });
    return () => {
      clinicalWorkspaceKernel.dismiss("panel-nav");
    };
  }, [navOpen]);

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
      trackRedirectToLogin(path);
      router.push(dest);
      return;
    }
    // EPIC-2: Patient Portal accounts must never remain on Staff shell.
    if (panelSessionChecked && isAuthenticated && user?.role === "patient") {
      router.replace("/portal");
    }
  }, [
    authLoading,
    panelSessionChecked,
    isAuthenticated,
    user?.role,
    router,
    pathname,
  ]);

  function toggleTheme() {
    setDark((d) => !d);
    document.body.classList.toggle("dark", !dark);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", !dark ? "dark" : "light");
    }
  }

  async function handleLogout() {
    requestNavigation(async () => {
      await logout();
      router.push("/login");
    });
  }

  const visualWorkspace = useVisualWorkspaceState();
  const viewport = clinicalWorkspaceKernel.getViewport();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--workspace-sidebar-w",
      `${viewport.sidebarWidth}px`,
    );
    root.style.setProperty("--hd-sidebar-w", `${viewport.sidebarWidth}px`);
  }, [viewport.sidebarWidth]);

  if (visualWorkspace.mode === "fullscreen") {
    return <>{children}</>;
  }

  if (authLoading) {
    return null;
  }

  return (
    <div
      className="flex min-h-screen overflow-hidden bg-hd-surface-base font-sans"
      style={{
        ["--workspace-sidebar-w" as string]: `${viewport.sidebarWidth}px`,
        ["--workspace-header-h" as string]: `${viewport.panelHeaderHeight}px`,
      }}
    >
      <aside
        className={cn(
          "pointer-events-auto fixed bottom-0 left-0 top-0 flex h-screen w-[var(--workspace-sidebar-w)] flex-col border-r border-hd-border-subtle bg-hd-surface-chrome p-4 shadow-hd-2 transition-transform duration-hd-base",
          CLINICAL_OVERLAY_CLASS.navigation,
          navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        data-testid="panel-sidebar"
        data-overlay-layer="navigation"
      >
        <div className="mb-8 flex flex-col items-center">
          <BrandLogo variant="nav" markSize={56} className="flex-col items-center gap-1" />
        </div>
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Navegación del panel">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (!isUnmodifiedLeftClick(event)) return;
                event.preventDefault();
                setNavOpen(false);
                requestNavigation(item.href);
              }}
              className={cn(
                "mb-2 rounded-lg px-4 py-2 text-[15px] font-medium text-primaryDark no-underline transition-colors duration-hd-base hover:bg-hd-surface-muted hover:text-primary",
                isMenuActive(pathname, item.href) && "bg-primaryLight text-primary",
              )}
              style={{ fontFamily: FONT_NAV }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => void handleLogout()}
          data-testid="panel-logout"
          className="relative z-10 mt-auto mb-14 shrink-0 rounded-lg border-0 bg-hd-surface-muted px-4 py-2 text-left text-[15px] font-medium text-red-600 transition-colors duration-hd-base hover:bg-red-50"
          style={{ fontFamily: FONT_NAV }}
        >
          Cerrar sesión
        </button>
      </aside>

      <header
        className={cn(
          "fixed left-0 right-0 top-0 flex h-[var(--workspace-header-h)] items-center justify-between border-b border-hd-border-subtle bg-hd-surface-chrome px-4 shadow-hd-1 md:left-[var(--workspace-sidebar-w)] md:px-6",
          CLINICAL_OVERLAY_CLASS.chrome,
        )}
        data-overlay-layer="chrome"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hd-border-default bg-hd-surface-chrome text-primaryDark transition-colors duration-hd-base hover:bg-hd-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
            aria-expanded={navOpen}
            aria-label={navOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            onClick={() => setNavOpen((value) => !value)}
          >
            <span className="sr-only">{navOpen ? "Cerrar menú" : "Abrir menú"}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              {navOpen ? (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 6h12M4 10h12M4 14h12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
          <div className="hidden min-w-0 md:block">
            <BrandLogo variant="nav" priority />
          </div>
          <span
            className="truncate border-l border-hd-border-default pl-3 text-lg font-semibold text-primaryDark md:pl-6"
            style={{ fontFamily: FONT_NAV }}
          >
            {displayTitle}
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          <span className="hidden max-w-[220px] truncate text-xs text-primaryDark/70 sm:inline">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-[22px] w-[22px] items-center justify-center border-0 bg-transparent p-0 text-primaryDark transition-transform duration-hd-base hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={dark ? "Activar tema claro" : "Activar tema oscuro"}
          >
            {dark ? (
              <Sun className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
            ) : (
              <Moon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
            )}
          </button>
          <div
            className="h-10 w-10 shrink-0 rounded-full bg-primaryMid transition-colors duration-hd-base md:h-11 md:w-11"
            aria-hidden
          />
        </div>
      </header>

      <main className="absolute bottom-0 left-0 right-0 top-[var(--workspace-header-h)] overflow-y-auto bg-hd-surface-base p-4 md:left-[var(--workspace-sidebar-w)] md:p-8">
        {children}
      </main>
      <ClinicalBetaFeedbackWidget />
    </div>
  );
}
