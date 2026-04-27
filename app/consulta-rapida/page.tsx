"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  createGuestConsultation,
  GuestConsultationError,
} from "@/lib/services/public-consultations";
import { getWhatsAppBookingUrl } from "@/lib/whatsapp-url";

const FONT_HEADING = "Montserrat, sans-serif";
const NAME_MAX = 120;
const REASON_MAX = 4000;

/**
 * Formulario público para que un paciente sin cuenta pueda iniciar una
 * teleconsulta. La página es client-only porque hace POST a un endpoint
 * público y redirige tras crear la consulta.
 */
export default function GuestConsultationPage() {
  const router = useRouter();
  const whatsAppUrl = getWhatsAppBookingUrl();
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedReason = reason.trim();
  const valid = trimmedName.length > 0 && trimmedReason.length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
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
    <div className="min-h-screen bg-gradient-to-b from-primaryLight/30 to-white">
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

      <main className="py-10 sm:py-14">
        <Container className="max-w-xl">
          <div className="mb-6 text-center">
            <h1
              className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              style={{ fontFamily: FONT_HEADING }}
            >
              Consulta sin registrarte
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
              Cuéntanos tu nombre y el motivo. Te conectamos con un médico por
              videollamada en minutos. Sin formularios, sin cuenta.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="guest-name"
                  className="mb-1 block text-sm font-semibold text-gray-700"
                >
                  Tu nombre
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value.slice(0, NAME_MAX))
                  }
                  placeholder="Ej: María González"
                  required
                  autoComplete="name"
                  maxLength={NAME_MAX}
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="guest-reason"
                  className="mb-1 block text-sm font-semibold text-gray-700"
                >
                  Motivo de la consulta
                </label>
                <textarea
                  id="guest-reason"
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value.slice(0, REASON_MAX))
                  }
                  placeholder="Describe brevemente cómo te sientes o qué te ocurre."
                  required
                  rows={5}
                  maxLength={REASON_MAX}
                  disabled={submitting}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  {trimmedReason.length}/{REASON_MAX}
                </p>
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
                disabled={!valid || submitting}
                className="w-full"
              >
                {submitting ? "Creando consulta…" : "Iniciar consulta"}
              </Button>

              <p className="text-center text-[11px] leading-relaxed text-gray-500">
                Al enviar aceptas los{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Términos
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                >
                  Política de Privacidad
                </Link>
                .
              </p>
            </form>
          </Card>

          {whatsAppUrl && (
            <div className="mt-6 text-center">
              <p className="mb-2 text-xs text-gray-500">
                ¿Prefieres WhatsApp?
              </p>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#1fb957]"
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
