"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Container from "@/components/ui/Container";
import { buildConsultaRapidaUrl, getWhatsAppBookingUrl } from "@/lib/whatsapp-url";

const FONT_HEADING = "Montserrat, sans-serif";
const QR_SIZE = 180;

/**
 * URL hacia donde apunta el QR de la home. Prioridad:
 * 1) `NEXT_PUBLIC_SITE_URL` (definido para metadata en `app/layout.tsx`)
 * 2) `NEXT_PUBLIC_APP_URL`
 * 3) Dominio canónico `https://heydoctor.health`
 */
function resolveSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "https://heydoctor.health";
}

export default function HomeQuickAccess() {
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const siteUrl = resolveSiteUrl();
  const qrTarget = buildConsultaRapidaUrl(siteUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setWhatsAppUrl(getWhatsAppBookingUrl(window.location.origin));
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrTarget, {
      width: QR_SIZE,
      margin: 2,
      color: { dark: "#0a4a4f", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((data) => {
        if (!cancelled) setQrDataUrl(data);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [qrTarget]);

  return (
    <section
      id="acceso-qr"
      aria-labelledby="quick-access-title"
      className="bg-gradient-to-br from-primaryLight/40 via-white to-primaryLight/30 py-16"
    >
      <Container>
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
              <span aria-hidden>⚡</span> En menos de 1 minuto
            </span>
            <h2
              id="quick-access-title"
              className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-[42px]"
              style={{ fontFamily: FONT_HEADING }}
            >
              Médico online en menos de 1 minuto
            </h2>
            <p className="mb-3 max-w-md text-lg font-semibold leading-snug text-gray-800">
              Sin cuenta. Sin descargas. Sin esperas.
            </p>
            <p className="mb-7 max-w-md text-sm leading-relaxed text-gray-600">
              Solo necesitas tu nombre y el motivo. Te conectamos con un médico
              en una videollamada segura, directo desde el navegador.
            </p>

            <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
              <Link
                href="/consulta-rapida"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primaryMid to-primary px-6 py-3.5 text-base font-semibold text-white no-underline shadow-soft transition-all duration-200 hover:scale-[1.02] hover:shadow-premium"
              >
                <BoltIcon />
                Consulta sin registrarte
              </Link>

              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25d366] px-6 py-3.5 text-base font-semibold text-white no-underline shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-[#1fb957]"
                >
                  <WhatsappIcon />
                  WhatsApp
                </a>
              ) : null}
            </div>

            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-600">
              <li className="inline-flex items-center gap-1">
                <span aria-hidden className="text-primary">✓</span>
                Privado y encriptado
              </li>
              <li className="inline-flex items-center gap-1">
                <span aria-hidden className="text-primary">✓</span>
                Sin tarjeta de crédito
              </li>
              <li className="inline-flex items-center gap-1">
                <span aria-hidden className="text-primary">✓</span>
                Funciona en cualquier celular
              </li>
            </ul>

            <p className="mt-4 text-xs text-gray-500">
              ¿Eres médico?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Inicia sesión aquí
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div
              className="rounded-2xl bg-white p-4 shadow-premium ring-1 ring-gray-100"
              style={{ width: QR_SIZE + 32 }}
            >
              <div
                className="mx-auto flex items-center justify-center rounded-xl bg-gray-50"
                style={{ width: QR_SIZE, height: QR_SIZE }}
              >
                {qrDataUrl ? (
                  <Image
                    unoptimized
                    src={qrDataUrl}
                    width={QR_SIZE}
                    height={QR_SIZE}
                    alt={`Código QR: consulta rápida HeyDoctor`}
                    style={{ display: "block", borderRadius: 8 }}
                  />
                ) : (
                  <span className="px-3 text-center text-xs text-gray-500">
                    Generando QR…
                  </span>
                )}
              </div>
            </div>
            <p className="text-center text-xs font-bold text-gray-800">
              Escanea para abrir en tu celular
            </p>
            <p className="text-center text-[11px] text-gray-500 break-all px-1">
              {qrTarget}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function BoltIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 2 4.5 13.5h6L9 22l9-12.5h-6L13 2z" />
    </svg>
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
