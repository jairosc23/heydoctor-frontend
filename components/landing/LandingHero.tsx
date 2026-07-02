import Image from "next/image";
import { BrandLogo } from "@/components/branding";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

const FONT_HEADING = "Montserrat, sans-serif";
const HERO_DOCTOR_IMAGE = "/og-image.jpg";
const HERO_DOCTOR_WIDTH = 640;
const HERO_DOCTOR_HEIGHT = 800;

const TRUST_INDICATORS = [
  "Privado y encriptado",
  "Sin tarjeta de crédito",
  "Funciona desde cualquier dispositivo",
] as const;

type LandingHeroProps = {
  whatsAppUrl?: string | null;
};

export function LandingHero({ whatsAppUrl }: LandingHeroProps) {
  const primaryHref = whatsAppUrl ?? "/consulta-rapida";
  const primaryExternal = Boolean(whatsAppUrl);

  return (
    <section
      aria-labelledby="landing-hero-title"
      className="bg-gradient-to-b from-primaryLight/30 via-white to-white py-12 sm:py-16 lg:py-20"
    >
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-12 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,440px)]">
          <div className="order-1">
            <div className="mb-6">
              <BrandLogo variant="landing" priority />
            </div>

            <span className="mb-5 inline-flex rounded-full bg-primaryLight px-4 py-1.5 text-sm font-semibold tracking-wide text-primaryMid">
              Atención médica online, sin esperas
            </span>

            <h1
              id="landing-hero-title"
              className="mb-5 max-w-2xl font-bold leading-[1.08] tracking-tight text-gray-900"
              style={{
                fontFamily: FONT_HEADING,
                fontSize: "clamp(32px, 4.8vw, 56px)",
              }}
            >
              Médico online en menos de 1 minuto
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600">
              Videollamada segura desde el navegador. Atención profesional cuando
              la necesitas, sin colas ni trámites eternos.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {primaryExternal ? (
                <a
                  href={primaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#25d366] px-8 text-lg font-semibold text-white no-underline shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-[#1fb957] hover:shadow-premium focus:outline-none focus:ring-2 focus:ring-[#25d366] focus:ring-offset-2"
                >
                  <WhatsappIcon />
                  Consulta por WhatsApp
                </a>
              ) : (
                <Button
                  href={primaryHref}
                  variant="primary"
                  className="min-h-14 px-8 text-lg font-semibold shadow-premium"
                >
                  <span className="mr-2 inline-flex" aria-hidden>
                    <WhatsappIcon />
                  </span>
                  Consulta por WhatsApp
                </Button>
              )}

              <Button
                href="/login"
                variant="secondary"
                className="min-h-14 px-8 text-base sm:min-w-[180px]"
              >
                Soy médico
              </Button>
            </div>

            <ul
              className="mt-8 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2"
              aria-label="Beneficios de la consulta"
            >
              {TRUST_INDICATORS.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <span aria-hidden className="font-bold text-primary">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="order-2">
            <LandingHeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}

function LandingHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
      <div
        className="relative overflow-hidden rounded-[1.75rem] bg-primaryLight/40 shadow-premium ring-1 ring-primaryLight"
        style={{ aspectRatio: `${HERO_DOCTOR_WIDTH} / ${HERO_DOCTOR_HEIGHT}` }}
      >
        <Image
          src={HERO_DOCTOR_IMAGE}
          alt="Médica profesional de HeyDoctor lista para una videollamada segura"
          width={HERO_DOCTOR_WIDTH}
          height={HERO_DOCTOR_HEIGHT}
          sizes="(max-width: 1024px) 100vw, 420px"
          className="h-full w-full object-cover object-center"
          priority
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primaryDark/25 via-transparent to-transparent"
          aria-hidden
        />

        <aside
          className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-[280px]"
          aria-label="Vista previa de videollamada segura"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"
                aria-hidden
              />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Videollamada segura
              </p>
            </div>
            <span className="rounded-full bg-primaryLight px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primaryMid">
              En vivo
            </span>
          </div>

          <div className="overflow-hidden rounded-xl bg-slate-900">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden />
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <p className="ml-1 truncate text-[11px] font-medium text-white/80">
                consulta.heydoctor.health
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1 p-2">
              <MockVideoTile label="Paciente" tone="slate" />
              <MockVideoTile label="Médico" tone="primary" active />
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-gray-600">
            Conéctate desde el navegador. Sin descargas ni esperas.
          </p>
        </aside>
      </div>
    </div>
  );
}

function MockVideoTile({
  label,
  tone,
  active = false,
}: {
  label: string;
  tone: "slate" | "primary";
  active?: boolean;
}) {
  const bg =
    tone === "primary"
      ? "bg-gradient-to-br from-primaryMid to-primaryDark"
      : "bg-gradient-to-br from-slate-600 to-slate-800";

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-lg ${bg} ${
        active ? "ring-2 ring-emerald-400/80" : ""
      }`}
    >
      <div className="absolute inset-0 flex items-end p-2">
        <span className="rounded-md bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white">
          {label}
        </span>
      </div>
    </div>
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
