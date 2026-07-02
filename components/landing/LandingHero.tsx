import type { ReactNode } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import {
  LANDING_HERO_DOCTOR_HEIGHT,
  LANDING_HERO_DOCTOR_WIDTH,
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
      className="bg-white py-12 sm:py-14 lg:py-14"
    >
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,480px)] lg:gap-10">
          <div className="max-w-[520px]">
            <h1
              id="landing-hero-title"
              className="mb-4 max-w-[480px] font-bold leading-[1.08] tracking-tight text-primaryDark"
              style={{
                fontFamily: FONT_HEADING,
                fontSize: "clamp(36px, 4.2vw, 48px)",
              }}
            >
              Médico online en menos de 1 minuto
            </h1>

            <p
              className="mb-4 text-xl font-semibold text-primary"
              style={{ fontFamily: FONT_HEADING }}
            >
              Atención médica online, sin esperas
            </p>

            <p className="mb-8 max-w-lg text-base leading-7 text-gray-700">
              Videollamada segura desde el navegador. Atención profesional cuando
              la necesitas, sin colas ni trámites eternos.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {primaryExternal ? (
                <a
                  href={primaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-7 text-base font-semibold text-white no-underline shadow-[0_8px_20px_rgba(37,211,102,0.18)] transition-colors duration-200 hover:bg-[#20BD5A] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
                >
                  <WhatsappIcon />
                  Consulta por WhatsApp
                </a>
              ) : (
                <Button
                  href={primaryHref}
                  variant="primary"
                  className="min-h-[52px] gap-2.5 rounded-xl bg-[#25D366] px-7 text-base font-semibold shadow-[0_8px_20px_rgba(37,211,102,0.18)] hover:from-[#20BD5A] hover:to-[#20BD5A] hover:scale-100"
                >
                  <WhatsappIcon />
                  Consulta por WhatsApp
                </Button>
              )}

              <Button
                href="/login"
                variant="secondary"
                className="min-h-[52px] rounded-xl border-gray-300 bg-white px-7 text-base font-semibold text-primaryDark hover:scale-100"
              >
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
    <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
      <div
        className="relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_20px_48px_rgba(2,44,44,0.12)]"
        style={{
          aspectRatio: `${LANDING_HERO_DOCTOR_WIDTH} / ${LANDING_HERO_DOCTOR_HEIGHT - 80}`,
        }}
      >
        <Image
          src={doctorImageSrc}
          alt="Médico profesional de HeyDoctor listo para una videollamada segura"
          width={LANDING_HERO_DOCTOR_WIDTH}
          height={LANDING_HERO_DOCTOR_HEIGHT}
          sizes="(max-width: 1024px) 100vw, 460px"
          className="h-full w-full object-cover object-[center_22%]"
          priority
        />

        <div
          className="absolute bottom-[4.5rem] right-5 overflow-hidden rounded-2xl border-[3px] border-white shadow-[0_12px_28px_rgba(0,0,0,0.2)] sm:right-6"
          style={{
            width: "28%",
            minWidth: "96px",
            maxWidth: "116px",
            aspectRatio: "3 / 4",
          }}
          aria-hidden
        >
          {patientPipSrc ? (
            <Image
              src={patientPipSrc}
              alt=""
              width={LANDING_PATIENT_PIP_WIDTH}
              height={LANDING_PATIENT_PIP_HEIGHT}
              sizes="128px"
              className="h-full w-full object-cover object-[center_20%]"
            />
          ) : (
            <div className="relative h-full w-full bg-gradient-to-br from-[#f3d5c0] via-[#e7b39a] to-[#c57d62]">
              <div className="absolute inset-0 flex items-end justify-center pb-2">
                <PatientSilhouette />
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur-[2px]"
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
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
            </svg>
          </span>
          <ControlIcon label="Más opciones">
            <circle cx="6" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="18" cy="12" r="1.6" fill="currentColor" />
          </ControlIcon>
        </div>
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
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/95"
      aria-label={label}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
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

function WhatsappIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.42c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
