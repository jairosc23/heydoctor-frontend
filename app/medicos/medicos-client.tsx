"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  adminLevelLabel,
  buildMedicosQuery,
  countryDisplayName,
  isNationalCoverage,
  subdivisionAfterCountryChange,
  subdivisionDisplayName,
} from "@/lib/patient-growth/jurisdiction-ui";
import {
  fetchPublicAvailability,
  fetchPublicDoctorDirectory,
  fetchPublicJurisdictions,
  fetchPublicSpecialties,
  type PublicAvailabilityDoctor,
  type PublicJurisdiction,
  type PublicSpecialty,
} from "@/lib/services/public-discovery";

const FONT_HEADING = "Montserrat, sans-serif";
const FIELD =
  "min-h-11 rounded-lg border-hd-border-default px-3 py-2.5 text-sm text-primaryDark focus:border-primary focus:ring-2 focus:ring-primaryLight";

export function MedicosClient({
  initialQuery,
  initialSpecialty,
  initialCountry,
  initialSubdivision,
}: {
  initialQuery: string;
  initialSpecialty: string;
  initialCountry: string;
  initialSubdivision: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [patientCountry, setPatientCountry] = useState(initialCountry);
  const [patientSubdivision, setPatientSubdivision] = useState(initialSubdivision);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [appliedSpecialty, setAppliedSpecialty] = useState(initialSpecialty);
  const [appliedCountry, setAppliedCountry] = useState(initialCountry);
  const [appliedSubdivision, setAppliedSubdivision] = useState(initialSubdivision);
  const [specialties, setSpecialties] = useState<PublicSpecialty[]>([]);
  const [jurisdictions, setJurisdictions] = useState<PublicJurisdiction[]>([]);
  const [doctors, setDoctors] = useState<PublicAvailabilityDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const windowRange = useMemo(() => defaultAvailabilityWindow(7), []);
  const selectedJurisdiction = jurisdictions.find(
    (row) => row.countryCode === patientCountry,
  );
  const subdivisionChoices = selectedJurisdiction?.subdivisions ?? [];
  const hideSubdivision = isNationalCoverage(subdivisionChoices);

  const jurisdictionReconciled = useRef(false);

  useEffect(() => {
    if (jurisdictionReconciled.current) return;
    let cancelled = false;
    fetchPublicJurisdictions()
      .then((rows) => {
        if (cancelled) return;
        jurisdictionReconciled.current = true;
        setJurisdictions(rows);
        const current = rows.find((row) => row.countryCode === initialCountry);
        if (initialCountry && !current) {
          setPatientCountry("");
          setPatientSubdivision("");
          setAppliedCountry("");
          setAppliedSubdivision("");
          router.replace(
            buildMedicosQuery({
              q: initialQuery,
              specialty: initialSpecialty,
            }),
            { scroll: false },
          );
          return;
        }
        if (!current) return;
        const nextSubdivision = subdivisionAfterCountryChange(
          initialSubdivision,
          current.subdivisions,
        );
        if (nextSubdivision === initialSubdivision) return;
        setPatientSubdivision(nextSubdivision);
        setAppliedSubdivision(nextSubdivision);
        router.replace(
          buildMedicosQuery({
            q: initialQuery,
            specialty: initialSpecialty,
            patientCountry: initialCountry,
            patientSubdivision: nextSubdivision,
          }),
          { scroll: false },
        );
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initialCountry, initialQuery, initialSpecialty, initialSubdivision, router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    const country = appliedCountry.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(country)) {
      fetchPublicSpecialties()
        .then((specialtyRows) => {
          if (cancelled) return;
          setSpecialties(specialtyRows);
          setDoctors([]);
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
    }
    const filters = {
      q: appliedQuery,
      specialty: appliedSpecialty,
      patientCountry: country,
      patientSubdivision: appliedSubdivision.trim().toUpperCase() || undefined,
    };
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
  }, [appliedQuery, appliedSpecialty, appliedCountry, appliedSubdivision, windowRange.from, windowRange.to]);

  function applyFilters(
    nextQuery = query,
    nextSpecialty = specialty,
    nextCountry = patientCountry,
    nextSubdivision = patientSubdivision,
  ) {
    const country = nextCountry.trim().toUpperCase();
    const subdivision = nextSubdivision.trim().toUpperCase();
    setQuery(nextQuery);
    setSpecialty(nextSpecialty);
    setPatientCountry(country);
    setPatientSubdivision(subdivision);
    setAppliedQuery(nextQuery.trim());
    setAppliedSpecialty(nextSpecialty);
    setAppliedCountry(country);
    setAppliedSubdivision(subdivision);
    router.replace(
      buildMedicosQuery({
        q: nextQuery,
        specialty: nextSpecialty,
        patientCountry: country,
        patientSubdivision: subdivision,
      }),
      { scroll: false },
    );
  }

  function onCountryChange(nextCountry: string) {
    const row = jurisdictions.find((item) => item.countryCode === nextCountry);
    const nextSubdivision = subdivisionAfterCountryChange(
      patientSubdivision,
      row?.subdivisions ?? [],
    );
    applyFilters(query, specialty, nextCountry, nextSubdivision);
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
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_220px_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                applyFilters();
              }}
            >
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-primaryDark">
                  País
                </span>
                <select
                  value={patientCountry}
                  onChange={(event) => onCountryChange(event.target.value)}
                  className={`w-full outline-none transition-all duration-200 ${FIELD}`}
                  required
                >
                  <option value="">Selecciona un país</option>
                  {jurisdictions.map((row) => (
                    <option key={row.countryCode} value={row.countryCode}>
                      {countryDisplayName(row.countryCode)}
                    </option>
                  ))}
                </select>
              </label>
              {hideSubdivision ? null : (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-primaryDark">
                    {adminLevelLabel(patientCountry)}
                  </span>
                  <select
                    value={patientSubdivision}
                    onChange={(event) => {
                      const next = event.target.value;
                      setPatientSubdivision(next);
                      applyFilters(query, specialty, patientCountry, next);
                    }}
                    className={`w-full outline-none transition-all duration-200 ${FIELD}`}
                    disabled={!patientCountry}
                  >
                    <option value="">
                      {patientCountry ? "Sin especificar" : "Selecciona un país"}
                    </option>
                    {subdivisionChoices.map((code) => (
                      <option key={code} value={code}>
                        {subdivisionDisplayName(code)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
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

          {!loading && !loadError && !/^[A-Z]{2}$/.test(appliedCountry) ? (
            <HdEmptyState title="Elige el país de atención">
              El listado muestra solo países donde hay un profesional público
              con licencia verificada.
            </HdEmptyState>
          ) : null}

          {!loading && !loadError && /^[A-Z]{2}$/.test(appliedCountry) && doctors.length === 0 ? (
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
