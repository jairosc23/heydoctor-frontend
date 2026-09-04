"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PatientGrowthHeader } from "@/components/patient-growth/patient-growth-header";
import Container from "@/components/ui/Container";
import {
  fetchPublicSpecialties,
  type PublicSpecialty,
} from "@/lib/services/public-discovery";

const FONT_HEADING = "Montserrat, sans-serif";

export function EspecialidadesClient() {
  const [specialties, setSpecialties] = useState<PublicSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicSpecialties()
      .then((rows) => {
        if (cancelled) return;
        setSpecialties(rows);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-hd-surface-base">
      <PatientGrowthHeader />
      <main
        id="contenido-principal"
        tabIndex={-1}
        className="outline-none py-8 sm:py-12"
      >
        <Container className="max-w-5xl">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primaryMid"
            style={{ fontFamily: FONT_HEADING }}
          >
            Especialidades
          </p>
          <h1
            className="text-2xl font-bold tracking-tight text-primaryDark sm:text-3xl"
            style={{ fontFamily: FONT_HEADING }}
          >
            Elige la especialidad y ve horarios
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primaryDark/70">
            Cada especialidad abre el directorio de médicos públicos con la
            próxima disponibilidad.
          </p>

          {loading ? (
            <p className="mt-8 text-sm text-primaryDark/60">
              Cargando especialidades…
            </p>
          ) : null}

          {loadError ? (
            <p className="mt-8 text-sm text-amber-900" role="alert">
              No pudimos cargar las especialidades. Intenta de nuevo o ve a{" "}
              <Link href="/medicos" className="font-semibold text-primary">
                buscar médico
              </Link>
              .
            </p>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((item) => (
              <Link
                key={item.name}
                href={`/medicos?specialty=${encodeURIComponent(item.name)}`}
                className="rounded-2xl border border-hd-border-subtle bg-white p-5 no-underline shadow-sm transition hover:border-primary/40 hover:shadow-premium"
              >
                <h2
                  className="text-lg font-bold text-primaryDark"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  {item.name}
                </h2>
                <p className="mt-1 text-sm text-primaryDark/60">
                  {item.doctorCount}{" "}
                  {item.doctorCount === 1
                    ? "médico disponible"
                    : "médicos disponibles"}
                </p>
                <p className="mt-4 text-sm font-semibold text-primary">
                  Ver disponibilidad
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
