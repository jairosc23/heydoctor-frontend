"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "heydoctor_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(8px)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <p style={{ color: "#e2e8f0", fontSize: 13, margin: 0, maxWidth: 600 }}>
        Utilizamos cookies estrictamente necesarias para el funcionamiento de la
        plataforma (autenticación y sesión). No utilizamos cookies publicitarias
        ni de seguimiento.{" "}
        <Link
          href="/cookies"
          style={{ color: "#5eead4", textDecoration: "underline" }}
        >
          Más información
        </Link>
      </p>
      <button
        onClick={handleAccept}
        style={{
          padding: "10px 24px",
          background: "#078a92",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Aceptar
      </button>
    </div>
  );
}
