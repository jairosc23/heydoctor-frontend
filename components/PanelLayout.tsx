"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";

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

export default function PanelLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const displayTitle = title ?? TITLES[pathname || ""] ?? "Panel";
  const router = useRouter();
  const { isAuthenticated, logout, user, refreshUser } = useAuth();
  const [dark, setDark] = useState(false);
  /**
   * Al entrar al shell del panel (no en AuthProvider global): intentar `refreshUser` una vez por montaje.
   * Si ya hubo login en memoria, solo confirma perfil; si hay refresh cookie, rehidrata sin carrera con login.
   */
  const [panelSessionChecked, setPanelSessionChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme") === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshUser();
      } finally {
        if (!cancelled) setPanelSessionChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  useEffect(() => {
    if (panelSessionChecked && !isAuthenticated) {
      router.push("/login");
    }
  }, [panelSessionChecked, isAuthenticated, router]);

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
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#eef4f7",
        fontFamily: "Open Sans",
      }}
    >
      <aside
        style={{
          width: 260,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(0,0,0,0.05)",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          padding: "30px 20px",
          boxShadow: "4px 0 30px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            fontFamily: "Montserrat",
            color: "#078a92",
            fontSize: 24,
            marginBottom: 35,
            textAlign: "center",
          }}
        >
          HeyDoctor
        </h2>
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: 14,
              marginBottom: 12,
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 15,
              background: pathname === item.href ? "#dff7f8" : "rgba(255,255,255,0.4)",
              color: "#333",
            }}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => void handleLogout()}
          style={{
            marginTop: "auto",
            padding: 14,
            borderRadius: 10,
            border: "none",
            background: "rgba(255,255,255,0.4)",
            color: "red",
            cursor: "pointer",
            fontSize: 15,
            textAlign: "left",
          }}
        >
          Cerrar sesión
        </button>
      </aside>
      <header
        style={{
          height: 70,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          position: "fixed",
          left: 260,
          right: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 25px",
        }}
      >
        <div
          style={{
            fontFamily: "Montserrat",
            fontSize: 22,
            color: "#078a92",
            fontWeight: 600,
          }}
        >
          {displayTitle}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 13, color: "#555", maxWidth: 220 }}>
            {user?.email}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              cursor: "pointer",
              fontSize: 22,
              background: "none",
              border: "none",
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <div
            style={{
              width: 45,
              height: 45,
              background: "#07acb5",
              borderRadius: "50%",
            }}
          />
        </div>
      </header>
      <main
        style={{
          position: "absolute",
          left: 260,
          top: 70,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          padding: 35,
          background: "#eef4f7",
        }}
      >
        {children}
      </main>
    </div>
  );
}
