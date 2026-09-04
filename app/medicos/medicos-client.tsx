"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PatientGrowthHeader } from "@/components/patient-growth/patient-growth-header";
import { DoctorDiscoveryCard } from "@/components/patient-growth/doctor-discovery-card";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { HdEmptyState, HdErrorState, HdSkeleton } from "@/components/ui/HdFeedback";
import Input from "@/components/ui/Input";
import { defaultAvailabilityWindow } from "@/lib/patient-growth/discovery";
import {
  fetchPublicAvailability,
  fetchPublicDoctorDirectory,
  fetchPublicSpecialties,
  type PublicAvailabilityDoctor,
  type PublicSpecialty,
} from "@/lib/services/public-discovery";

const FONT_HEADING = "Montserrat, sans-serif";
const FIELD =
  "min-h-11 rounded-lg border-hd-border-default px-3 py-2.5 text-sm text-primaryDark focus:border-primary focus:ring-2 focus:ring-primaryLight";

export function MedicosClient({
  initialQuery,
  initialSpecialty,
}: {
  initialQuery: string;
  initialSpecialty: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [appliedSpecialty, setAppliedSpecialty] = useState(initialSpecialty);
  const [specialties, setSpecialties] = useState<PublicSpecialty[]>([]);
  const [doctors, setDoctors] = useState<PublicAvailabilityDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const windowRange = useMemo(() => defaultAvailabilityWindow(7), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    const filters = { q: appliedQuery, specialty: appliedSpecialty };
    Promise.all([
      fetchPublicSpecialties(),
      fetchPublicDoctorDirectory(filters),
      fetchPublicAvailability({
        ...filters,
        from: windowRange.from,
        to: windowRange.to,
      }),
    ])
      .then(([specialtyRows, directory, availability]) => {
        if (cancelled) return;
        setSpecialties(specialtyRows);
        const bySlug = new Map(
          availability.results.map((row) => [row.slug, row]),
        );
        setDoctors(
          directory.map((doctor) => {
            const withSlot = bySlug.get(doctor.slug);
            return (
              withSlot ?? {
                ...doctor,
                clinicTimezone: null,
                nextSlot: null,
                openSlotCount: 0,
              }
            );
          }),
        );
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setDoctors([]);
        setLoadError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appliedQuery, appliedSpecialty, windowRange.from, windowRange.to]);

  function applyFilters(nextQuery = query, nextSpecialty = specialty) {
    setAppliedQuery(nextQuery.trim());
    setAppliedSpecialty(nextSpecialty);
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextSpecialty) params.set("specialty", nextSpecialty);
    const qs = params.toString();
    router.replace(qs ? `/medicos?${qs}` : "/medicos", { scroll: false });
  }

  return (
    <div className="min-h-screen bg-hd-surface-base pb-[env(safe-area-inset-bottom)]">
      <PatientGrowthHeader />
      <main id="contenido-principal" tabIndex={-1} className="outline-none">
        <section className="border-b border-hd-border-subtle bg-white">
          <Container className="max-w-5xl py-6 sm:py-8">
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primaryMid"
              style={{ fontFamily: FONT_HEADING }}
            >
              Buscar médico
            </p>
            <h1
              className="text-2xl font-bold tracking-tight text-primaryDark sm:text-3xl"
              style={{ fontFamily: FONT_HEADING }}
            >
              Encuentra especialidad, horario y reserva
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primaryDark/70 sm:text-base">
              Recorre el directorio público, mira la próxima hora disponible y
              confirma tu teleconsulta con pago seguro.
            </p>

            <form
              className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters();
              }}
            >
              <label className="block">
                <span className="sr-only">Buscar médico</span>
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nombre, especialidad o país…"
                  className={FIELD}
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="sr-only">Especialidad</span>
                <select
                  value={specialty}
                  onChange={(event) => {
                    setSpecialty(event.target.value);
                    applyFilters(query, event.target.value);
                  }}
                  className={`w-full outline-none transition-all duration-200 ${FIELD}`}
                >
                  <option value="">Todas las especialidades</option>
                  {specialties.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.doctorCount})
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" variant="primary" className="h-11 min-h-11">
                Buscar
              </Button>
            </form>

            {specialties.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {specialties.map((item) => {
                  const active = appliedSpecialty === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        const next = active ? "" : item.name;
                        setSpecialty(next);
                        applyFilters(query, next);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-hd-border-subtle bg-hd-surface-base text-primaryDark hover:border-primary/40"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </Container>
        </section>

        <Container className="max-w-5xl py-6 sm:py-8">
          {loading ? <HdSkeleton rows={3} /> : null}

          {loadError ? (
            <HdErrorState>
              No pudimos cargar el directorio. Puedes ir a{" "}
              <Link href="/consultar" className="font-semibold text-primary">
                consulta urgente
              </Link>
              .
            </HdErrorState>
          ) : null}

          {!loading && !loadError && doctors.length === 0 ? (
            <HdEmptyState title="No hay médicos con ese filtro">
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setSpecialty("");
                  applyFilters("", "");
                }}
              >
                Limpiar filtros
              </Button>
            </HdEmptyState>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorDiscoveryCard
                key={doctor.id || doctor.slug}
                doctor={doctor}
              />
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
