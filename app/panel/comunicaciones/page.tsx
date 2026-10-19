"use client";

const FONT_HEADING = "Montserrat, sans-serif";

export default function ComunicacionesPage() {
  return (
    <div className="space-y-3">
      <h1
        className="text-2xl font-bold text-primary"
        style={{ fontFamily: FONT_HEADING }}
      >
        Comunicaciones
      </h1>
      <p className="max-w-xl text-primaryDark/70">
        Centro de mensajes y avisos al paciente (SMS, email, recordatorios).
        Estamos preparando esta sección para integrarla con tus consultas.
      </p>
    </div>
  );
}
