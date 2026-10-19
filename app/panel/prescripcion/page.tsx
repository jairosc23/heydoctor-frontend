"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2";

export default function PrescripcionPage() {
  return (
    <div className="space-y-4">
      <h1
        className="text-2xl font-bold text-primary"
        style={{ fontFamily: FONT_HEADING }}
      >
        Prescripción
      </h1>
      <p className="max-w-xl text-primaryDark/70">
        Las recetas y el vademécum se gestionan dentro de cada consulta activa.
        Abre una consulta para ver medicamentos sugeridos y crear recetas.
      </p>
      <Button href="/panel/consultas" variant="primary" className={CTA_PRIMARY}>
        Ir a consultas
      </Button>
    </div>
  );
}
