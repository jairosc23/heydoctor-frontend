"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { GuestConsultationError } from "@/lib/services/public-consultations";
import { getWhatsAppBookingUrl } from "@/lib/whatsapp-url";
import { useConsultationEngine } from "@/hooks/useConsultationEngine";

const FONT_HEADING = "Montserrat, sans-serif";
const NAME_MAX = 120;
const REASON_MAX = 4000;

/**
 * Flujo público en 3 pasos (sin login): nombre → motivo → confirmar y entrar.
 */
export default function GuestConsultationPage() {
  const router = useRouter();
  const { createGuestConsultation } = useConsultationEngine();
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [step, setStepRaw] = useState(1);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setWhatsAppUrl(getWhatsAppBookingUrl(window.location.origin));
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (step === 1) nameInputRef.current?.focus();
      else if (step === 2) reasonInputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [step]);

  const setStep = (n: number) => {
    setError(null);
    setStepRaw(n);
  };

  const trimmedName = name.trim();
  const trimmedReason = reason.trim();
  const step1Ok = trimmedName.length > 0;
  const step2Ok = trimmedReason.length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1Ok || !step2Ok || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createGuestConsultation({
        name: trimmedName,
        reason: trimmedReason,
      });
      router.push(`/teleconsulta/${res.consultationId}`);
    } catch (e) {
      const message =
        e instanceof GuestConsultationError
          ? e.message
          : "No se pudo crear la consulta. Inténtalo de nuevo.";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primaryLight/30 to-white pb-[env(safe-area-inset-bottom)]">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline"
            style={{ fontFamily: FONT_HEADING, color: "#078a92" }}
          >
            <HeyDoctorLogo size={36} priority />
            <span className="text-lg font-semibold">HeyDoctor</span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-600 no-underline hover:bg-gray-50"
          >
            Iniciar Sesión
          </Link>
        </Container>
      </header>

      <main className="py-8 sm:py-12">
        <Container className="max-w-xl">
          <div className="mb-8 text-center">
            <h1
              className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
              style={{ fontFamily: FONT_HEADING }}
            >
              Médico online en menos de 1 minuto
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
              Tres pasos. Sin cuenta. Te llevamos directo a la videollamada segura.
            </p>
          </div>

          <StepIndicator step={step} />

          <Card className="p-6 sm:p-8">
            <form onSubmit={onSubmit} noValidate>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="guest-name"
                      className="mb-1 block text-sm font-semibold text-gray-700"
                    >
                      Paso 1 · Tu nombre
                    </label>
                    <input
                      ref={nameInputRef}
                      id="guest-name"
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value.slice(0, NAME_MAX))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (step1Ok && !submitting) setStep(2);
                        }
                      }}
                      placeholder="Ej: María González"
                      required
                      autoComplete="name"
                      maxLength={NAME_MAX}
                      disabled={submitting}
                      className="w-full min-h-12 rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!step1Ok || submitting}
                    className="w-full min-h-12 text-base"
                    onClick={() => step1Ok && setStep(2)}
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="guest-reason"
                      className="mb-1 block text-sm font-semibold text-gray-700"
                    >
                      Paso 2 · Motivo de la consulta
                    </label>
                    <textarea
                      ref={reasonInputRef}
                      id="guest-reason"
                      value={reason}
                      onChange={(e) =>
                        setReason(e.target.value.slice(0, REASON_MAX))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (step2Ok && !submitting) setStep(3);
                        }
                      }}
                      placeholder="Describe brevemente cómo te sientes o qué necesitas."
                      required
                      rows={5}
                      maxLength={REASON_MAX}
                      disabled={submitting}
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      {trimmedReason.length}/{REASON_MAX}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={!step2Ok || submitting}
                      className="w-full min-h-12 text-base sm:flex-1"
                      onClick={() => step2Ok && setStep(3)}
                    >
                      Revisar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full min-h-12"
                      onClick={() => setStep(1)}
                    >
                      Atrás
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm">
                    <p className="m-0 mb-2 font-semibold text-gray-900">
                      Paso 3 · Confirma y entra
                    </p>
                    <dl className="m-0 space-y-3">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                          Nombre
                        </dt>
                        <dd className="m-0 text-gray-900">{trimmedName}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                          Motivo
                        </dt>
                        <dd className="m-0 whitespace-pre-wrap text-gray-800">
                          {trimmedReason}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!step1Ok || !step2Ok || submitting}
                    className="w-full min-h-12 text-base"
                  >
                    {submitting ? "Entrando…" : "Entrar a la videollamada"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full min-h-12"
                    disabled={submitting}
                    onClick={() => setStep(2)}
                  >
                    Editar motivo
                  </Button>

                  <p className="text-center text-[11px] leading-relaxed text-gray-500">
                    Al continuar aceptas los{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Términos
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                    .
                  </p>
                </div>
              )}
            </form>
          </Card>

          {whatsAppUrl && (
            <div className="mt-6 text-center">
              <p className="mb-2 text-xs text-gray-500">¿Prefieres WhatsApp?</p>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#25d366] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#1fb957]"
              >
                <WhatsappIcon />
                Chatear por WhatsApp
              </a>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  const labels = ["Nombre", "Motivo", "Entrar"];
  return (
    <ol
      className="mb-6 flex items-center justify-center gap-2 sm:gap-4"
      aria-label="Progreso"
    >
      {labels.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-primary text-white"
                    : active
                      ? "bg-primaryMid text-white ring-2 ring-primary/30"
                      : "bg-gray-200 text-gray-600"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : n}
              </span>
              <span
                className={`hidden text-[10px] font-semibold uppercase tracking-wide sm:block ${
                  active ? "text-primary" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 ? (
              <span
                className={`mb-4 hidden h-0.5 w-6 sm:mb-5 sm:inline-block sm:w-10 ${
                  step > n ? "bg-primary" : "bg-gray-200"
                }`}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function WhatsappIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.42c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
