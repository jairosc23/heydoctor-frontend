import Link from "next/link";
import { WhatsAppPatientCTA } from "@/components/WhatsAppPatientCTA";
import HomeQuickAccess from "@/components/HomeQuickAccess";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getWhatsAppBookingUrl } from "@/lib/whatsapp-url";

const BRAND = "#078a92";
const FONT_HEADING = "Montserrat, sans-serif";

const FEATURES = [
  {
    icon: "🧠",
    title: "Asistente IA Clínico",
    description:
      "Sugerencias de diagnóstico, notas clínicas generadas automáticamente y resúmenes inteligentes de consulta.",
  },
  {
    icon: "📹",
    title: "Telemedicina en Video",
    description:
      "Videollamadas WebRTC integradas con consentimiento legal y grabación opcional para auditoría.",
  },
  {
    icon: "🛡️",
    title: "Cumplimiento Legal",
    description:
      "Consentimiento informado con snapshot inmutable, firma digital y exportación PDF para auditoría.",
  },
  {
    icon: "📊",
    title: "Dashboard Analítico",
    description:
      "Métricas de adopción, rolling metrics de negocio y reportes diarios automatizados.",
  },
];

const TRUST_ITEMS = [
  {
    icon: "🔒",
    title: "Datos Encriptados",
    description: "Comunicaciones cifradas end-to-end. JWT con rotación segura.",
  },
  {
    icon: "📋",
    title: "Audit Trail Completo",
    description:
      "Cada acción queda registrada con metadata estructurada para trazabilidad total.",
  },
  {
    icon: "🩺",
    title: "Diseñado para Médicos",
    description:
      "Flujos clínicos optimizados por profesionales de salud, no ingenieros.",
  },
];

const TESTIMONIALS = [
  {
    name: "Dra. Carolina Méndez",
    role: "Dermatóloga, Santiago",
    text: "HeyDoctor transformó mi consulta. Puedo atender pacientes desde cualquier lugar con la misma calidad que en presencial.",
    stars: 5,
  },
  {
    name: "Roberto Campos",
    role: "Paciente",
    text: "Conseguí una consulta con un especialista en 15 minutos. El proceso fue rápido, seguro y profesional.",
    stars: 5,
  },
  {
    name: "Dr. Andrés Silva",
    role: "Medicina General, Medellín",
    text: "La integración con IA para notas clínicas me ahorra horas de trabajo. El soporte legal está impecable.",
    stars: 5,
  },
];

export default function LandingPage() {
  const whatsAppUrl = getWhatsAppBookingUrl();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline"
            style={{ fontFamily: FONT_HEADING, color: BRAND }}
          >
            <HeyDoctorLogo size={36} priority />
            <span className="text-lg font-semibold">HeyDoctor</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/consultar"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 no-underline transition-all duration-200 hover:bg-gray-50"
            >
              Consultar
            </Link>
            <Link
              href="/for-doctors/apply"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 no-underline transition-all duration-200 hover:bg-gray-50"
            >
              Para Médicos
            </Link>
            <Button href="/login" variant="secondary" className="px-5 py-2 text-sm font-[family-name:Montserrat,sans-serif]">
              Iniciar Sesión
            </Button>
            <Button href="/consulta-rapida" variant="primary" className="px-5 py-2 text-sm font-[family-name:Montserrat,sans-serif]">
              Consulta rápida
            </Button>
          </div>
        </Container>
      </header>

      {/* ── HERO ── */}
      <section className="py-20">
        <Container>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex w-full justify-center">
              <HeyDoctorLogo size={88} priority />
            </div>
            <span className="mb-6 inline-block rounded-full bg-primaryLight px-4 py-1.5 text-sm font-semibold tracking-wide text-primaryMid">
              Atención médica online, sin esperas
            </span>
            <h1
              className="mb-5 max-w-4xl font-bold leading-[1.1] tracking-tight text-gray-900"
              style={{
                fontFamily: FONT_HEADING,
                fontSize: "clamp(32px, 5vw, 56px)",
              }}
            >
              Médico online en menos de 1 minuto
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-600">
              Videollamada segura desde el navegador. Atención profesional cuando
              la necesitas, sin colas ni trámites eternos.
            </p>
            <div className="flex w-full max-w-lg flex-col items-stretch justify-center gap-4 sm:max-w-2xl sm:items-center">
              <Button href="/consulta-rapida" variant="primary" className="min-h-14 w-full px-8 text-lg font-semibold shadow-premium sm:min-h-16 sm:max-w-md sm:px-12">
                Empezar ahora — sin registro
              </Button>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                <Button href="#acceso-qr" variant="secondary" className="min-h-12 w-full text-base sm:w-auto sm:min-w-[180px]">
                  Ver código QR
                </Button>
                <Button href="/login" variant="secondary" className="min-h-12 w-full text-base sm:w-auto sm:min-w-[180px]">
                  Soy médico
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── ACCESO RÁPIDO (CTA guest + WhatsApp + QR) ── */}
      <HomeQuickAccess />

      {whatsAppUrl ? <WhatsAppPatientCTA url={whatsAppUrl} /> : null}

      {/* ── FEATURES ── */}
      <section className="bg-gray-50 py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2
              className="mb-3 text-3xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: FONT_HEADING }}
            >
              Todo lo que necesitas
            </h2>
            <p className="mx-auto max-w-xl text-gray-600">
              Herramientas clínicas modernas que antes requerían múltiples sistemas.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="flex h-full flex-col text-left">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primaryLight text-2xl">
                  {f.icon}
                </div>
                <h3
                  className="mb-2 text-lg font-bold text-gray-900"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">{f.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white py-20">
        <Container className="max-w-4xl">
          <div className="mb-12 text-center">
            <h2
              className="mb-3 text-3xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: FONT_HEADING }}
            >
              Planes simples, sin sorpresas
            </h2>
            <p className="text-gray-600">Empieza gratis. Upgrade cuando lo necesites.</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <Card className="flex flex-col">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Free
              </div>
              <div
                className="mb-1 text-4xl font-bold text-gray-900"
                style={{ fontFamily: FONT_HEADING }}
              >
                $0
              </div>
              <p className="mb-6 text-sm text-gray-600">Para siempre. Sin tarjeta de crédito.</p>
              <ul className="mb-8 flex-1 list-none space-y-0 divide-y divide-gray-100 border-t border-gray-100 p-0">
                {[
                  "Consultas básicas",
                  "Gestión de pacientes",
                  "Agenda de citas",
                  "Notas clínicas",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 py-2 text-sm text-gray-800"
                  >
                    <span className="font-bold text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/login" variant="secondary" className="w-full">
                Empezar Gratis
              </Button>
            </Card>

            <Card className="relative flex flex-col border-2 border-primary pt-8 shadow-premium">
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wide text-white"
                style={{ fontFamily: FONT_HEADING }}
              >
                Recomendado
              </div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Pro
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold text-gray-900"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  $49
                </span>
                <span className="text-sm text-gray-500">/mes</span>
              </div>
              <p className="mb-6 text-sm text-gray-600">Todo incluido. Cancela cuando quieras.</p>
              <ul className="mb-8 flex-1 list-none space-y-0 divide-y divide-gray-100 border-t border-gray-100 p-0">
                {[
                  "Todo lo del plan Free",
                  "Asistente IA Clínico",
                  "Videollamadas integradas",
                  "Dashboard analítico",
                  "Exportación legal PDF/CSV",
                  "Firma digital de consultas",
                  "Soporte prioritario",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 py-2 text-sm text-gray-800"
                  >
                    <span className="font-bold text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/login" variant="primary" className="w-full">
                Upgrade a PRO
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      {/* ── TRUST ── */}
      <section className="bg-gray-50 py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2
              className="mb-3 text-3xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: FONT_HEADING }}
            >
              Construido para la confianza
            </h2>
            <p className="mx-auto max-w-xl text-gray-600">
              Seguridad, trazabilidad y cumplimiento normativo desde el día uno.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TRUST_ITEMS.map((t) => (
              <Card key={t.title} className="text-center">
                <div className="mb-4 text-4xl">{t.icon}</div>
                <h3
                  className="mb-2 text-lg font-bold text-gray-900"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  {t.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">{t.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-primaryDark via-primaryMid to-primary py-20 text-center">
        <Container>
          <h2
            className="mb-4 font-bold text-white"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: "clamp(28px, 4vw, 40px)",
            }}
          >
            Empieza a usar HeyDoctor hoy
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-white/80">
            Crea tu cuenta gratis en 30 segundos. Sin tarjeta de crédito.
            Upgrade a PRO cuando estés listo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Button
              href="/consulta-rapida"
              variant="secondary"
              className="min-w-[200px] border-0 bg-white font-[family-name:Montserrat,sans-serif] text-gray-900 shadow-premium hover:bg-gray-100"
            >
              Hablar con médico ahora
            </Button>
            <Button
              href="/for-doctors/apply"
              variant="secondary"
              className="min-w-[200px] border-2 border-white/40 bg-transparent font-[family-name:Montserrat,sans-serif] text-white hover:bg-white/10"
            >
              Soy Médico
            </Button>
          </div>
        </Container>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 py-20">
        <Container>
          <h2
            className="mb-12 text-center text-3xl font-bold text-gray-900"
            style={{ fontFamily: FONT_HEADING }}
          >
            Lo que dicen nuestros usuarios
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="text-left">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} className="text-base text-amber-500">
                      &#9733;
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-sm italic leading-relaxed text-slate-700">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="m-0 text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="m-0 text-xs text-gray-600">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <p className="m-0 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HeyDoctor. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/terms" className="text-sm text-gray-500 no-underline hover:text-primary">
              Términos
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 no-underline hover:text-primary">
              Privacidad
            </Link>
            <Link
              href="/for-doctors/apply"
              className="text-sm text-gray-500 no-underline hover:text-primary"
            >
              Para Médicos
            </Link>
            <Link href="/consultar" className="text-sm text-gray-500 no-underline hover:text-primary">
              Consultar
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
