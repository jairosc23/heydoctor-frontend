import { WhatsAppButton } from "@/components/WhatsAppButton";
import { WhatsAppQR } from "@/components/WhatsAppQR";

const FONT_HEADING = "Montserrat, sans-serif";
const TEXT = "#1a1a1a";
const TEXT_MUTED = "#6b7280";
const BG = "#f0fdf4";
const BORDER = "#bbf7d0";

type WhatsAppPatientCTAProps = {
  url: string;
};

/**
 * Bloque landing: botón grande + QR para agendar sin fricción (pacientes / mayores).
 */
export function WhatsAppPatientCTA({ url }: WhatsAppPatientCTAProps) {
  return (
    <section
      aria-labelledby="whatsapp-agendar-heading"
      style={{
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "56px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2
            id="whatsapp-agendar-heading"
            style={{
              fontFamily: FONT_HEADING,
              fontSize: "clamp(26px, 3.5vw, 34px)",
              fontWeight: 700,
              color: TEXT,
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Agenda tu hora por WhatsApp
          </h2>
          <p
            style={{
              margin: "0 0 28px",
              fontSize: 18,
              color: TEXT_MUTED,
              lineHeight: 1.65,
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Un solo toque abre el chat. Sin descargas ni registros.
          </p>
          <WhatsAppButton href={url} />
        </div>
        <div className="flex justify-center py-2">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <WhatsAppQR url={url} />
          </div>
        </div>
      </div>
    </section>
  );
}
