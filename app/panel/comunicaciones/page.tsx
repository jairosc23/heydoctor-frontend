"use client";

const BRAND = "#078a92";

export default function ComunicacionesPage() {
  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat, sans-serif",
          color: BRAND,
          marginBottom: 12,
        }}
      >
        Comunicaciones
      </h1>
      <p style={{ color: "#666", maxWidth: 640 }}>
        Centro de mensajes y avisos al paciente (SMS, email, recordatorios).
        Estamos preparando esta sección para integrarla con tus consultas.
      </p>
    </div>
  );
}
