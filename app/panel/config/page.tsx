"use client";

import { useAuth } from "@/lib/context/AuthContext";

const BRAND = "#078a92";

export default function ConfigPage() {
  const { user } = useAuth();
  const displayName = user?.email ? user.email.split("@")[0] : undefined;

  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat",
          color: BRAND,
          marginBottom: 12,
        }}
      >
        Configuración
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Ajustes del centro médico y tu cuenta.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <h3
            style={{
              fontFamily: "Montserrat",
              fontSize: 16,
              color: "#333",
              marginBottom: 16,
            }}
          >
            Mi cuenta
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#999", display: "block", marginBottom: 4 }}>
                Email
              </label>
              <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                {user?.email ?? "—"}
              </p>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#999", display: "block", marginBottom: 4 }}>
                Nombre
              </label>
              <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                {displayName || "—"}
              </p>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#999", display: "block", marginBottom: 4 }}>
                Rol
              </label>
              <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                {user?.role || "—"}
              </p>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#999", display: "block", marginBottom: 4 }}>
                Plan
              </label>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  background: user?.plan === "pro" ? "#dff7f8" : "#f3f4f6",
                  color: user?.plan === "pro" ? BRAND : "#666",
                }}
              >
                {(user?.plan ?? "free").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <h3
            style={{
              fontFamily: "Montserrat",
              fontSize: 16,
              color: "#333",
              marginBottom: 16,
            }}
          >
            Centro Médico
          </h3>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
            La configuración del centro médico (nombre, dirección, horarios,
            especialidades) estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  );
}
