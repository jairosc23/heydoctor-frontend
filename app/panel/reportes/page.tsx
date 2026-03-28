"use client";

const BRAND = "#078a92";

export default function ReportesPage() {
  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat",
          color: BRAND,
          marginBottom: 12,
        }}
      >
        Reportes y Estadísticas
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Métricas y análisis del rendimiento clínico.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {[
          {
            title: "Resumen de consultas",
            desc: "Total de consultas por período, estado y doctor.",
            icon: "📊",
          },
          {
            title: "Actividad de pacientes",
            desc: "Nuevos pacientes, frecuencia de visitas y retención.",
            icon: "👥",
          },
          {
            title: "Exportación legal",
            desc: "Descarga CSV/PDF para auditoría y cumplimiento.",
            icon: "📄",
          },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              background: "white",
              padding: 24,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
            <h3
              style={{
                fontFamily: "Montserrat",
                fontSize: 16,
                color: "#333",
                marginBottom: 8,
              }}
            >
              {item.title}
            </h3>
            <p style={{ color: "#888", fontSize: 13, lineHeight: 1.5 }}>
              {item.desc}
            </p>
            <p
              style={{
                color: "#bbb",
                fontSize: 12,
                marginTop: 12,
                fontStyle: "italic",
              }}
            >
              Próximamente
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
