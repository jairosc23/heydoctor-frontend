import type { ReactNode } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import {
  LANDING_HERO_DOCTOR_HEIGHT,
  LANDING_HERO_DOCTOR_WIDTH,
  LANDING_HERO_MOCK_COMPOSITE,
  LANDING_PATIENT_PIP_HEIGHT,
  LANDING_PATIENT_PIP_WIDTH,
} from "@/lib/landing-assets.constants";
import { getLandingHeroAssets } from "@/lib/landing-assets.server";

const FONT_HEADING = "Montserrat, sans-serif";

type LandingHeroProps = {
  whatsAppUrl?: string | null;
};

export function LandingHero({ whatsAppUrl }: LandingHeroProps) {
  const { doctorImageSrc, patientPipSrc } = getLandingHeroAssets();
  const primaryHref = whatsAppUrl ?? "/consulta-rapida";
  const primaryExternal = Boolean(whatsAppUrl);

  return (
    <section
      aria-labelledby="landing-hero-title"
      className="bg-white py-8 sm:py-10 lg:py-12"
    >
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,440px)] md:gap-8">
          <div className="max-w-[520px]">
            <h1
              id="landing-hero-title"
              className="mb-3 max-w-[480px] font-bold leading-[1.08] tracking-tight text-primaryDark"
              style={{
                fontFamily: FONT_HEADING,
                fontSize: "clamp(34px, 4vw, 46px)",
              }}
            >
              Médico online en menos de 1 minuto
            </h1>

            <p className="mb-6 max-w-lg text-base leading-7 text-gray-700">
              Videollamada segura desde el navegador. Atención profesional cuando
              la necesitas, sin colas ni trámites eternos.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                href={primaryHref}
                variant="primary"
                className="gap-2.5"
                {...(primaryExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <WhatsappIcon size={20} />
                Consulta por WhatsApp
              </Button>
              <Button href="/medicos" variant="secondary">
                Buscar médico
              </Button>
              <Button href="/for-doctors/apply" variant="secondary">
                Soy médico
              </Button>
            </div>
          </div>

          <LandingHeroVisual
            doctorImageSrc={doctorImageSrc}
            patientPipSrc={patientPipSrc}
          />
        </div>
      </Container>
    </section>
  );
}

function LandingHeroVisual({
  doctorImageSrc,
  patientPipSrc,
}: {
  doctorImageSrc: string;
  patientPipSrc: string | null;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[400px] md:max-w-none">
      {/*
        Composite hero JPG already includes white frame + PiP + controls.
        Avoid a second chrome layer (slate pad / heavy shadow / double radius)
        that reads as overlapping borders and green/white top glow.
      */}
      <div
        className="relative overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(2,44,44,0.08)] ring-1 ring-black/[0.04]"
        style={{
          // Container follows official SSOT intrinsic ratio — never crop the asset.
          aspectRatio: `${LANDING_HERO_DOCTOR_WIDTH} / ${LANDING_HERO_DOCTOR_HEIGHT}`,
        }}
      >
        <Image
          src={doctorImageSrc}
          alt="Médico profesional de HeyDoctor listo para una videollamada segura"
          width={LANDING_HERO_DOCTOR_WIDTH}
          height={LANDING_HERO_DOCTOR_HEIGHT}
          sizes="(max-width: 768px) 100vw, 440px"
          className="h-full w-full object-contain object-center"
          priority
          unoptimized
        />

        {!LANDING_HERO_MOCK_COMPOSITE && (
          <div
            className="absolute overflow-hidden rounded-xl border-2 border-white shadow-[0_8px_18px_rgba(0,0,0,0.14)]"
            style={{
              right: "8%",
              bottom: "14%",
              width: "34%",
              aspectRatio: `${LANDING_PATIENT_PIP_WIDTH} / ${LANDING_PATIENT_PIP_HEIGHT}`,
            }}
            aria-hidden
          >
            {patientPipSrc ? (
              <Image
                src={patientPipSrc}
                alt=""
                width={LANDING_PATIENT_PIP_WIDTH}
                height={LANDING_PATIENT_PIP_HEIGHT}
                sizes="112px"
                className="h-full w-full object-cover object-center"
                unoptimized
              />
            ) : (
              <div className="relative h-full w-full bg-gradient-to-br from-[#f3d5c0] via-[#e7b39a] to-[#c57d62]">
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <PatientSilhouette />
                </div>
              </div>
            )}
          </div>
        )}

        {!LANDING_HERO_MOCK_COMPOSITE && (
          <div
            className="absolute bottom-[4%] left-1/2 flex h-11 -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-[2px]"
            aria-hidden
          >
            <ControlIcon label="Micrófono">
              <path
                d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"
                fill="currentColor"
              />
            </ControlIcon>
            <ControlIcon label="Cámara">
              <path
                d="M17 10.5V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 3v-9l-4 3z"
                fill="currentColor"
              />
            </ControlIcon>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
              </svg>
            </span>
            <ControlIcon label="Más opciones">
              <circle cx="6" cy="12" r="1.6" fill="currentColor" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              <circle cx="18" cy="12" r="1.6" fill="currentColor" />
            </ControlIcon>
          </div>
        )}
      </div>
    </div>
  );
}

function ControlIcon({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white/95"
      aria-label={label}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        {children}
      </svg>
    </span>
  );
}

function PatientSilhouette() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="22" r="12" fill="rgba(255,255,255,0.82)" />
      <path
        d="M12 58c3.5-12 12.5-18 20-18s16.5 6 20 18"
        fill="rgba(255,255,255,0.82)"
      />
    </svg>
  );
}
