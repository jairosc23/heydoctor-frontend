"use client";

const BRAND = "#078a92";

export default function FacturacionPage() {
  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat",
          color: BRAND,
          marginBottom: 12,
        }}
      >
        Facturación
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Gestión de facturación y pagos del centro médico.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Facturas emitidas", value: "0", color: "#07acb5" },
          { label: "Pendientes de cobro", value: "0", color: "#f2a900" },
          { label: "Pagadas este mes", value: "0", color: "#0bb38a" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderLeft: `5px solid ${card.color}`,
            }}
          >
            <h3 style={{ color: "#999", marginBottom: 8, fontSize: 13 }}>
              {card.label}
            </h3>
            <p style={{ fontSize: 28, color: BRAND, margin: 0, fontWeight: 700 }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <p style={{ color: "#999", fontSize: 14 }}>
          El módulo de facturación estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
