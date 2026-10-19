"use client";

const FONT_HEADING = "Montserrat, sans-serif";

export default function PlantillasPage() {
  return (
    <div className="space-y-3">
      <h1
        className="text-2xl font-bold text-primary"
        style={{ fontFamily: FONT_HEADING }}
      >
        Plantillas
      </h1>
      <p className="max-w-xl text-primaryDark/70">
        Módulo de plantillas clínicas y documentos reutilizables. Próximamente
        podrás crear y aplicar plantillas desde aquí.
      </p>
    </div>
  );
}
