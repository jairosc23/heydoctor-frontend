import Link from "next/link";
import { WhatsAppPatientCTA } from "@/components/WhatsAppPatientCTA";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getWhatsAppBookingUrl } from "@/lib/whatsapp-url";

const BRAND = "#078a92";
const BRAND_DARK = "#05636b";
const BRAND_LIGHT = "#dff7f8";
const TEXT = "#1a1a1a";
const TEXT_MUTED = "#6b7280";
const BG = "#ffffff";
const BG_ALT = "#f8fafb";
const BORDER = "#e5e7eb";
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
    <div
      style={{
        fontFamily: "Open Sans, sans-serif",
        color: TEXT,
        background: BG,
        overflowX: "hidden",
      }}
    >
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
            <Link
              href="/login"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-900 no-underline transition-all duration-200 hover:bg-gray-50"
              style={{ fontFamily: FONT_HEADING }}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/consultar"
              className="rounded-xl bg-gradient-to-r from-primaryMid to-primary px-5 py-2 text-sm font-semibold text-white no-underline shadow-soft transition-all duration-200 hover:scale-105 hover:shadow-premium"
              style={{ fontFamily: FONT_HEADING }}
            >
              Consultar Ahora
            </Link>
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
              Plataforma clínica de nueva generación
            </span>
            <h1
              className="mb-5 max-w-4xl font-bold leading-[1.1] tracking-tight text-gray-900"
              style={{
                fontFamily: FONT_HEADING,
                fontSize: "clamp(36px, 5vw, 60px)",
              }}
            >
              El workspace clínico
              <br />
              <span className="text-primary">potenciado por IA</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-600">
              Consultas, telemedicina, inteligencia artificial y cumplimiento legal
              en una sola plataforma diseñada para profesionales de salud.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button href="/login" variant="primary" className="text-base min-w-[180px]">
                Empezar Gratis
              </Button>
              <Button href="#pricing" variant="secondary" className="text-base min-w-[180px]">
                Ver Plan PRO
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {whatsAppUrl ? <WhatsAppPatientCTA url={whatsAppUrl} /> : null}

      {/* ── FEATURES ── */}
      <section
        style={{
          background: BG_ALT,
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: FONT_HEADING,
                fontSize: 32,
                fontWeight: 700,
                color: TEXT,
                marginBottom: 12,
                letterSpacing: "-0.02em",
              }}
            >
              Todo lo que necesitas
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
              Herramientas clínicas modernas que antes requerían múltiples sistemas.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 24,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: BG,
                  borderRadius: 14,
                  padding: "32px 28px",
                  border: `1px solid ${BORDER}`,
                  transition: "box-shadow 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 16,
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: BRAND_LIGHT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: 18,
                    fontWeight: 700,
                    color: TEXT,
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.65 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 24px", background: BG }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: FONT_HEADING,
                fontSize: 32,
                fontWeight: 700,
                color: TEXT,
                marginBottom: 12,
                letterSpacing: "-0.02em",
              }}
            >
              Planes simples, sin sorpresas
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 16 }}>
              Empieza gratis. Upgrade cuando lo necesites.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* FREE */}
            <div
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: "40px 32px",
                background: BG,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Free
              </div>
              <div
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: 40,
                  fontWeight: 700,
                  color: TEXT,
                  marginBottom: 4,
                }}
              >
                $0
              </div>
              <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>
                Para siempre. Sin tarjeta de crédito.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
                {[
                  "Consultas básicas",
                  "Gestión de pacientes",
                  "Agenda de citas",
                  "Notas clínicas",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      padding: "8px 0",
                      fontSize: 14,
                      color: TEXT,
                      borderBottom: `1px solid ${BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: BRAND, fontWeight: 700 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px 0",
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  color: TEXT,
                  textDecoration: "none",
                  fontFamily: FONT_HEADING,
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                Empezar Gratis
              </Link>
            </div>

            {/* PRO */}
            <div
              style={{
                border: `2px solid ${BRAND}`,
                borderRadius: 16,
                padding: "40px 32px",
                background: BG,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -13,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: BRAND,
                  color: "#fff",
                  padding: "4px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: FONT_HEADING,
                  letterSpacing: "0.04em",
                }}
              >
                RECOMENDADO
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: BRAND,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Pro
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: 40,
                    fontWeight: 700,
                    color: TEXT,
                  }}
                >
                  $49
                </span>
                <span style={{ color: TEXT_MUTED, fontSize: 14 }}>/mes</span>
              </div>
              <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>
                Todo incluido. Cancela cuando quieras.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
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
                    style={{
                      padding: "8px 0",
                      fontSize: 14,
                      color: TEXT,
                      borderBottom: `1px solid ${BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ color: BRAND, fontWeight: 700 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px 0",
                  borderRadius: 10,
                  background: BRAND,
                  color: "#fff",
                  textDecoration: "none",
                  fontFamily: FONT_HEADING,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: `0 4px 16px ${BRAND}40`,
                }}
              >
                Upgrade a PRO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section style={{ background: BG_ALT, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: FONT_HEADING,
                fontSize: 32,
                fontWeight: 700,
                color: TEXT,
                marginBottom: 12,
                letterSpacing: "-0.02em",
              }}
            >
              Construido para la confianza
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
              Seguridad, trazabilidad y cumplimiento normativo desde el día uno.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {TRUST_ITEMS.map((t) => (
              <div
                key={t.title}
                style={{
                  textAlign: "center",
                  padding: "36px 28px",
                  background: BG,
                  borderRadius: 14,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{t.icon}</div>
                <h3
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: 18,
                    fontWeight: 700,
                    color: TEXT,
                    marginBottom: 8,
                  }}
                >
                  {t.title}
                </h3>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.65 }}>
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        style={{
          padding: "80px 24px",
          background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: FONT_HEADING,
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          Empieza a usar HeyDoctor hoy
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 16,
            maxWidth: 480,
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}
        >
          Crea tu cuenta gratis en 30 segundos. Sin tarjeta de crédito.
          Upgrade a PRO cuando estés listo.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/consultar"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              fontSize: 16,
              fontFamily: FONT_HEADING,
              fontWeight: 700,
              color: BRAND_DARK,
              textDecoration: "none",
              borderRadius: 10,
              background: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            Consultar Ahora
          </Link>
          <Link
            href="/for-doctors/apply"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              fontSize: 16,
              fontFamily: FONT_HEADING,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 10,
              border: "2px solid rgba(255,255,255,0.4)",
              background: "transparent",
            }}
          >
            Soy Médico
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 24px", background: BG_ALT }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: FONT_HEADING,
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 700,
              color: TEXT,
              marginBottom: 40,
            }}
          >
            Lo que dicen nuestros usuarios
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                style={{
                  background: BG,
                  borderRadius: 12,
                  padding: 24,
                  border: `1px solid ${BORDER}`,
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} style={{ color: "#f59e0b", fontSize: 16 }}>
                      &#9733;
                    </span>
                  ))}
                </div>
                <p
                  style={{
                    color: "#334155",
                    fontSize: 15,
                    lineHeight: 1.6,
                    margin: "0 0 16px",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: TEXT }}>
                    {t.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED }}>
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "40px 24px",
          borderTop: `1px solid ${BORDER}`,
          background: BG,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0 }}>
            &copy; {new Date().getFullYear()} HeyDoctor. Todos los derechos reservados.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/terms" style={{ color: TEXT_MUTED, fontSize: 13, textDecoration: "none" }}>
              Términos
            </Link>
            <Link href="/privacy" style={{ color: TEXT_MUTED, fontSize: 13, textDecoration: "none" }}>
              Privacidad
            </Link>
            <Link href="/for-doctors/apply" style={{ color: TEXT_MUTED, fontSize: 13, textDecoration: "none" }}>
              Para Médicos
            </Link>
            <Link href="/consultar" style={{ color: TEXT_MUTED, fontSize: 13, textDecoration: "none" }}>
              Consultar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
