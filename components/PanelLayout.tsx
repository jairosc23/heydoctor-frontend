"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";

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
   * Hidratación solo si falta `user` (p. ej. recarga con cookie). Tras login, `user` ya viene del flujo
   * determinista → no se llama `refreshUser` ni se duplica GET /me.
   */
  const [panelSessionChecked, setPanelSessionChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("theme") === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (user) {
      setPanelSessionChecked(true);
      return;
    }
    if (!panelSessionChecked) {
      void refreshUser().finally(() => setPanelSessionChecked(true));
    }
  }, [user, panelSessionChecked, refreshUser]);

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
        <div className="flex flex-col items-center gap-2 mb-9">
          <HeyDoctorLogo size={36} />
          <h2
            style={{
              fontFamily: "Montserrat",
              color: "#078a92",
              fontSize: 18,
              margin: 0,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            HeyDoctor
          </h2>
        </div>
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
        <div className="flex items-center gap-6 min-w-0 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <HeyDoctorLogo size={36} />
            <span
              className="font-semibold text-lg"
              style={{ fontFamily: "Montserrat", color: "#078a92" }}
            >
              HeyDoctor
            </span>
          </div>
          <span
            className="font-semibold text-lg text-slate-600 truncate border-l border-slate-200 pl-6"
            style={{ fontFamily: "Montserrat" }}
          >
            {displayTitle}
          </span>
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
