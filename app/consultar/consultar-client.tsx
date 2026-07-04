"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import { useRouter } from "next/navigation";
import type { DoctorProfile } from "@/lib/services/doctor-profiles";
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";
import { useConsultationPrice } from "@/lib/hooks/useConsultationPrice";
import { fetchPublicDoctors } from "@/lib/services/doctor-profiles";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const FONT_HEADING = "Montserrat, sans-serif";

/** Tokens CTA primario DS (Landing / Login / Consulta Rápida). */
const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100";

const FIELD =
  "min-h-12 rounded-lg border-hd-border-default px-3 py-3 text-base text-primaryDark focus:border-primary focus:ring-2 focus:ring-primaryLight";

export function ConsultarClient({
  initialDoctors,
}: {
  initialDoctors?: DoctorProfile[];
}) {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorProfile[]>(
    initialDoctors ?? [],
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const consultationPrice = useConsultationPrice();

  useEffect(() => {
    let cancelled = false;

    if (initialDoctors && initialDoctors.length > 0) {
      return () => {
        cancelled = true;
      };
    }

    fetchPublicDoctors()
      .then((profiles) => {
        if (!cancelled) {
          setDoctors(profiles);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDoctors([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialDoctors]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const params = new URLSearchParams({
      name: name.trim(),
      email: email.trim(),
      reason: reason.trim(),
      ...(selectedDoctor ? { doctor: selectedDoctor } : {}),
      redirect: "/panel/consultas",
    });

    router.push(`/register?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-hd-surface-base pb-[env(safe-area-inset-bottom)]">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 min-h-10 items-center rounded-lg border border-primary bg-hd-surface-chrome px-5 text-sm font-medium text-primary no-underline transition-colors duration-hd-base hover:bg-primaryLight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{ fontFamily: FONT_HEADING }}
          >
            Ya tengo cuenta
          </Link>
        </Container>
      </header>

      <main className="py-8 sm:py-12">
        <Container className="max-w-xl">
          <div className="mb-8 text-center">
            <div className="mb-6 flex w-full items-center justify-center">
              <BrandLogo markOnly markSize={72} priority />
            </div>
            <h1
              className="mb-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl"
              style={{ fontFamily: FONT_HEADING }}
            >
              Consulta médica online
            </h1>
            <p className="mx-auto max-w-md text-base leading-relaxed text-primaryDark/70 sm:text-lg">
              Conecta con un especialista en minutos. Atención profesional
              desde la comodidad de tu hogar.
            </p>
            <p
              className="mt-4 text-[15px] font-bold text-primaryMid"
              style={{ fontFamily: FONT_HEADING }}
            >
              {URGENCY_AVAILABLE_NOW}
            </p>
            <p className="mt-2 text-base text-primaryDark">
              Consulta desde{" "}
              <strong className="text-primary">
                {consultationPrice.loading
                  ? "…"
                  : formatConsultationPrice(
                      consultationPrice.amount,
                      consultationPrice.currency,
                    )}
              </strong>
            </p>
          </div>

          <Card className="p-6 shadow-premium sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="consultar-name"
                  className="mb-1 block text-sm font-semibold text-primaryDark"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  Tu nombre <span className="text-red-600">*</span>
                </label>
                <Input
                  id="consultar-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nombre completo"
                  autoComplete="name"
                  disabled={submitting}
                  className={FIELD}
                />
              </div>

              <div>
                <label
                  htmlFor="consultar-email"
                  className="mb-1 block text-sm font-semibold text-primaryDark"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  Correo electrónico <span className="text-red-600">*</span>
                </label>
                <Input
                  id="consultar-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={submitting}
                  className={FIELD}
                />
              </div>

              <div>
                <label
                  htmlFor="consultar-reason"
                  className="mb-1 block text-sm font-semibold text-primaryDark"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  Motivo de la consulta <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="consultar-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe brevemente tus síntomas o la razón de tu consulta..."
                  disabled={submitting}
                  className={`w-full resize-y outline-none transition-all duration-200 disabled:opacity-60 ${FIELD}`}
                />
              </div>

              {doctors.length > 0 && (
                <div>
                  <label
                    htmlFor="consultar-doctor"
                    className="mb-1 block text-sm font-semibold text-primaryDark"
                    style={{ fontFamily: FONT_HEADING }}
                  >
                    Seleccionar especialista (opcional)
                  </label>
                  <select
                    id="consultar-doctor"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    disabled={submitting}
                    className={`w-full outline-none transition-all duration-200 disabled:opacity-60 ${FIELD}`}
                  >
                    <option value="">Primer disponible</option>
                    {doctors.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name} — {d.specialty}{" "}
                        {d.rating > 0 ? `(${Number(d.rating).toFixed(1)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className={`w-full min-h-12 text-base ${CTA_PRIMARY}`}
              >
                {submitting ? "Preparando..." : "Hablar con médico ahora"}
              </Button>
            </form>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-primaryDark/60">
              ¿Eres médico?{" "}
              <Link
                href="/for-doctors/apply"
                className="font-semibold text-primary no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Únete a HeyDoctor
              </Link>
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
