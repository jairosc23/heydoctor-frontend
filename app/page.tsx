import Link from "next/link";
import { GrowthLandingVisitBeacon } from "@/components/GrowthLandingVisitBeacon";
import { WhatsAppPatientCTA } from "@/components/WhatsAppPatientCTA";
import HomeQuickAccess from "@/components/HomeQuickAccess";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getWhatsAppBookingUrl } from "@/lib/whatsapp-url";

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

const ENTERPRISE_TRUST_SIGNALS = [
  "Backend Enterprise V1",
  "Production Ready",
  "Clinical Foundation",
  "AI Governance",
  "Observability",
  "Interactive Demo",
];

const CLINICAL_STORY = [
  {
    title: "Paciente",
    description:
      "La atención parte de una consulta clara, con contexto clínico y señales relevantes para el médico.",
  },
  {
    title: "Clinical Foundation",
    description:
      "El backend consolida memoria, órdenes, alertas y datos de consulta en una base clínica consistente.",
  },
  {
    title: "AI Governance",
    description:
      "La IA opera con contratos, guardrails y evidencia, manteniendo trazabilidad para revisión clínica.",
  },
  {
    title: "Observability",
    description:
      "Health, readiness y señales operativas permiten evaluar la plataforma con criterio production-ready.",
  },
];

const ENTERPRISE_CAPABILITIES = [
  {
    title: "Clinical Foundation",
    description:
      "Snapshot clínico consistente para paciente, consulta, memoria, órdenes y alertas.",
  },
  {
    title: "AI Governance",
    description:
      "Ejecuciones IA con políticas internas, metadatos, contratos y degradación controlada.",
  },
  {
    title: "Production Ready",
    description:
      "Backend Enterprise V1 preparado para operación clínica con readiness y smoke checks.",
  },
  {
    title: "Marketplace",
    description:
      "Descubre especialidades y perfiles de médicos. Explorar no requiere plan PRO.",
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
      <GrowthLandingVisitBeacon />
      <LandingNav />

      <LandingHero whatsAppUrl={whatsAppUrl} />

      {/* ── ACCESO RÁPIDO (CTA guest + WhatsApp + QR) ── */}
      <HomeQuickAccess />

      {whatsAppUrl ? <WhatsAppPatientCTA url={whatsAppUrl} /> : null}

      {/* ── ENTERPRISE TRUST BAR ── */}
      <section className="border-y border-primaryLight bg-white py-8">
        <Container>
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primaryMid">
              Backend Enterprise V1
            </p>
            <h2
              className="mt-2 text-2xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: FONT_HEADING }}
            >
              Plataforma clínica con IA gobernada y operación production-ready
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {ENTERPRISE_TRUST_SIGNALS.map((signal) => (
              <div
                key={signal}
                className="rounded-2xl border border-primaryLight bg-primaryLight/40 px-4 py-3 text-center"
              >
                <p className="text-sm font-semibold text-primaryDark">{signal}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CLINICAL STORY ── */}
      <section className="bg-white py-20">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primaryMid">
                Clinical Story
              </p>
              <h2
                className="mb-4 text-3xl font-bold tracking-tight text-gray-900"
                style={{ fontFamily: FONT_HEADING }}
              >
                Del paciente a la evidencia clínica, sin perder trazabilidad.
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-gray-600">
                HeyDoctor conecta el flujo comercial existente con una base enterprise:
                Clinical Foundation, gobernanza de IA, observabilidad e Interactive Demo
                para evaluar capacidades reales sin ejecutar acciones mutables.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {CLINICAL_STORY.map((step, index) => (
                  <Card key={step.title} className="border border-gray-100 shadow-soft">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <h3
                      className="mb-2 text-lg font-bold text-gray-900"
                      style={{ fontFamily: FONT_HEADING }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
                  </Card>
                ))}
              </div>
            </div>
            <Card className="border-2 border-primaryLight bg-gradient-to-br from-primaryLight/70 to-white">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primaryMid">
                Interactive Demo
              </p>
              <h3
                className="mb-3 text-2xl font-bold text-gray-900"
                style={{ fontFamily: FONT_HEADING }}
              >
                Evalúa el recorrido clínico enterprise
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-700">
                La demo muestra workspace clínico, Copilot, capa de evidencia y señales de
                readiness con Mock Mode por defecto.
              </p>
              <div className="flex flex-col gap-3">
                <Button href="/demo/interactive" variant="primary" className="w-full">
                  Ver Demo Interactiva
                </Button>
                <Button href="/consultar" variant="secondary" className="w-full bg-white">
                  Explorar Marketplace
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* ── ENTERPRISE CAPABILITIES ── */}
      <section className="bg-gray-50 py-20">
        <Container>
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primaryMid">
              Enterprise Capabilities
            </p>
            <h2
              className="mb-3 text-3xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: FONT_HEADING }}
            >
              Capacidades productivas sobre el flujo clínico existente
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Backend Enterprise V1 aporta fundamento clínico, gobernanza, observabilidad
              y activación comercial sin reemplazar la experiencia actual de pacientes y médicos.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ENTERPRISE_CAPABILITIES.map((capability) => (
              <Card key={capability.title} className="h-full border border-gray-100 text-left">
                <h3
                  className="mb-3 text-lg font-bold text-gray-900"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  {capability.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {capability.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

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
              <Button href="/pricing" variant="primary" className="w-full">
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
      <LandingFooter whatsAppUrl={whatsAppUrl} />
    </div>
  );
}
