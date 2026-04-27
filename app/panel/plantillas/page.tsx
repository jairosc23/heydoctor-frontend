"use client";

const BRAND = "#078a92";

export default function PlantillasPage() {
  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat, sans-serif",
          color: BRAND,
          marginBottom: 12,
        }}
      >
        Plantillas
      </h1>
      <p style={{ color: "#666", maxWidth: 640 }}>
        Módulo de plantillas clínicas y documentos reutilizables. Próximamente
        podrás crear y aplicar plantillas desde aquí.
      </p>
    </div>
  );
}
