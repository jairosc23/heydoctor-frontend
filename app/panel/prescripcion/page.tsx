"use client";

import Link from "next/link";

const BRAND = "#078a92";

export default function PrescripcionPage() {
  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat, sans-serif",
          color: BRAND,
          marginBottom: 12,
        }}
      >
        Prescripción
      </h1>
      <p style={{ color: "#666", marginBottom: 16, maxWidth: 640 }}>
        Las recetas y el vademécum se gestionan dentro de cada consulta activa.
        Abre una consulta para ver medicamentos sugeridos y crear recetas.
      </p>
      <Link
        href="/panel/consultas"
        style={{
          display: "inline-block",
          padding: "10px 18px",
          background: BRAND,
          color: "white",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Ir a consultas
      </Link>
    </div>
  );
}
