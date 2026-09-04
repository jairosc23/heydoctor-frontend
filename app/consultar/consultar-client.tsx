"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import type { DoctorProfile } from "@/lib/services/doctor-profiles";
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";
import { useConsultationPrice } from "@/lib/hooks/useConsultationPrice";
import { fetchPublicDoctors } from "@/lib/services/doctor-profiles";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import {
  HdEmptyState,
  HdErrorState,
  HdSkeleton,
  HdSkipLink,
} from "@/components/ui/HdFeedback";
import Input from "@/components/ui/Input";

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2";

const FIELD =
  "min-h-11 rounded-lg border-hd-border-default px-3 py-2.5 text-sm text-primaryDark focus:border-primary focus:ring-2 focus:ring-primaryLight";

export function ConsultarClient({
  initialDoctors,
}: {
  initialDoctors?: DoctorProfile[];
}) {
  const [doctors, setDoctors] = useState<DoctorProfile[]>(
    initialDoctors ?? [],
  );
  const [loading, setLoading] = useState(
    !(initialDoctors && initialDoctors.length > 0),
  );
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const consultationPrice = useConsultationPrice();

  useEffect(() => {
    let cancelled = false;

    if (initialDoctors && initialDoctors.length > 0) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setLoadError(false);
    fetchPublicDoctors()
      .then((profiles) => {
        if (!cancelled) {
          setDoctors(profiles);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDoctors([]);
          setLoadError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialDoctors]);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    for (const d of doctors) {
      const s = d.specialty?.trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [doctors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      if (specialty && d.specialty?.trim() !== specialty) return false;
      if (!q) return true;
      const hay = `${d.name} ${d.specialty} ${d.country} ${d.bio ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [doctors, query, specialty]);

  const priceLabel = consultationPrice.loading
    ? "…"
    : formatConsultationPrice(
        consultationPrice.amount,
        consultationPrice.currency,
      );

  return (
    <div className="min-h-screen bg-hd-surface-base pb-[env(safe-area-inset-bottom)]">
      <HdSkipLink />
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome">
        <Container className="flex h-14 items-center justify-between sm:h-16">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
          <div className="flex items-center gap-2">
            <Button
              href="/medicos"
              variant="secondary"
              className="hidden h-9 min-h-9 px-4 text-sm sm:inline-flex"
            >
              Reservar hora
            </Button>
            <Button
              href="/consulta-rapida"
              variant="primary"
              className={`h-9 min-h-9 px-3 text-sm sm:px-4 ${CTA_PRIMARY}`}
            >
              Consulta rápida
            </Button>
            <Link
              href="/login"
              className="inline-flex h-9 min-h-9 items-center rounded-lg border border-primary bg-hd-surface-chrome px-4 text-sm font-medium text-primary no-underline transition-colors duration-hd-base hover:bg-primaryLight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              style={{ fontFamily: FONT_HEADING }}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </Container>
      </header>

      <main id="contenido-principal" tabIndex={-1} className="outline-none">
        {/* Above-the-fold marketplace hero */}
        <section className="border-b border-hd-border-subtle bg-white">
          <Container className="max-w-5xl py-6 sm:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p
                  className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primaryMid"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  Marketplace clínico
                </p>
                <h1
                  className="text-2xl font-bold tracking-tight text-primaryDark sm:text-3xl"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  Encuentra tu médico y reserva online
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-primaryDark/70 sm:text-base">
                  Habla con un médico ahora o{" "}
                  <Link href="/medicos" className="font-semibold text-primary">
                    reserva una hora
                  </Link>{" "}
                  con disponibilidad pública.
                </p>
                <p className="mt-3 text-sm text-primaryDark">
                  <span className="font-semibold text-primaryMid">
                    {URGENCY_AVAILABLE_NOW}
                  </span>
                  {" · "}
                  Consultas desde{" "}
                  <strong className="text-primary">{priceLabel}</strong>
                </p>
              </div>
              <Button
                href="/consulta-rapida"
                variant="primary"
                className={`h-11 min-h-11 w-full px-5 text-sm sm:w-auto ${CTA_PRIMARY}`}
              >
                Hablar con un médico ahora
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
              <label className="block">
                <span className="sr-only">Buscar médico o especialidad</span>
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, especialidad o país…"
                  className={FIELD}
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="sr-only">Filtrar especialidad</span>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className={`w-full outline-none transition-all duration-200 ${FIELD}`}
                >
                  <option value="">Todas las especialidades</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Container>
        </section>

        <Container className="max-w-5xl py-6 sm:py-8">
          {loading ? <HdSkeleton rows={3} /> : null}

          {loadError ? (
            <HdErrorState>
              No pudimos cargar el listado ahora. Puedes intentar de nuevo o ir a{" "}
              <Link href="/consulta-rapida" className="font-semibold text-primary">
                consulta rápida
              </Link>
              .
            </HdErrorState>
          ) : null}

          {!loading && !loadError && filtered.length === 0 ? (
            <HdEmptyState
              title="No hay médicos con ese filtro"
              description="Prueba otra especialidad o limpia la búsqueda."
            >
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setSpecialty("");
                }}
              >
                Limpiar filtros
              </Button>
            </HdEmptyState>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <article
                key={d.id || d.slug}
                className="flex flex-col rounded-xl border border-hd-border-subtle bg-white p-4 shadow-sm"
                data-testid="marketplace-doctor-card"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primaryLight text-sm font-bold text-primary">
                    {d.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(d.name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="truncate text-base font-bold text-primaryDark"
                      style={{ fontFamily: FONT_HEADING }}
                    >
                      {d.name}
                    </h2>
                    <p className="truncate text-sm text-primary">
                      {d.specialty || "Medicina general"}
                    </p>
                    <p className="mt-0.5 text-xs text-primaryDark/55">
                      {d.country || "Online"}
                      {d.rating > 0
                        ? ` · ${Number(d.rating).toFixed(1)}★ (${d.ratingCount})`
                        : ""}
                    </p>
                  </div>
                </div>
                {d.bio ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-snug text-primaryDark/70">
                    {d.bio}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-primaryDark/50">
                    Perfil público disponible para reserva.
                  </p>
                )}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button
                    href={`/dr/${encodeURIComponent(d.slug)}`}
                    variant="primary"
                    className={`h-10 min-h-10 flex-1 text-sm ${CTA_PRIMARY}`}
                  >
                    Ver perfil
                  </Button>
                  <Button
                    href={`/dr/${encodeURIComponent(d.slug)}`}
                    variant="secondary"
                    className="h-10 min-h-10 flex-1 text-sm"
                  >
                    Reservar
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-primaryDark/60">
            ¿Eres médico?{" "}
            <Link
              href="/for-doctors/apply"
              className="font-semibold text-primary no-underline hover:underline"
            >
              Únete a HeyDoctor
            </Link>
            {" · "}
            <Link
              href="/pricing"
              className="font-semibold text-primary no-underline hover:underline"
            >
              Planes PRO
            </Link>
          </p>
        </Container>
      </main>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
