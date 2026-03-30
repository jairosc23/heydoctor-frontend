"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchCurrentUser } from "@/lib/services/auth-session";

const BRAND = "#078a92";
const BRAND_DARK = "#05636b";

type SyncState = "syncing" | "ready" | "pending" | "error";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function PaymentSuccessPage() {
  const [state, setState] = useState<SyncState>("syncing");
  const { refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function syncPlan() {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const me = await fetchCurrentUser();

          if (cancelled) return;

          await refreshUser();

          if (me.plan === "pro") {
            setState("ready");
            return;
          }
        } catch {
          if (cancelled) return;
        }

        if (attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY_MS);
          if (cancelled) return;
        }
      }

      if (!cancelled) {
        setState("pending");
      }
    }

    syncPlan();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  if (state === "syncing") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafb",
          fontFamily: "Open Sans, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="animate-spin"
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e5e7eb",
              borderTopColor: BRAND,
              borderRadius: "50%",
              margin: "0 auto 20px",
            }}
          />
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: BRAND_DARK,
            }}
          >
            Activando PRO…
          </p>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
            Confirmando tu pago
          </p>
        </div>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafb",
          fontFamily: "Open Sans, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#fff",
            borderRadius: 20,
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            border: "1px solid #fef3c7",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#fffbeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 36,
            }}
          >
            ⏳
          </div>

          <h1
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#92400e",
              marginBottom: 12,
            }}
          >
            Pago en proceso
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            Tu pago fue recibido pero la activación del plan PRO puede tardar
            unos minutos. Si no se activa en los próximos 10 minutos, contacta
            soporte.
          </p>

          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              fontSize: 16,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 10,
              background: BRAND,
              boxShadow: `0 4px 16px ${BRAND}40`,
            }}
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafb",
        fontFamily: "Open Sans, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: "56px 40px",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#dff7f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 36,
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: BRAND_DARK,
            marginBottom: 12,
          }}
        >
          PRO Activado
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: 16,
            lineHeight: 1.7,
            marginBottom: 8,
          }}
        >
          Tu cuenta ahora tiene acceso completo a:
        </p>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 auto 32px",
            maxWidth: 300,
          }}
        >
          {[
            "Asistente IA Clínico",
            "Videollamadas integradas",
            "Dashboard analítico",
            "Exportación legal",
          ].map((item) => (
            <li
              key={item}
              style={{
                padding: "8px 0",
                fontSize: 15,
                color: "#1a1a1a",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ color: BRAND, fontWeight: 700 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "14px 36px",
            fontSize: 16,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            color: "#fff",
            textDecoration: "none",
            borderRadius: 10,
            background: BRAND,
            boxShadow: `0 4px 16px ${BRAND}40`,
          }}
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
