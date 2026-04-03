import type { CSSProperties } from "react";

const WHATSAPP_GREEN = "#25D366";

type WhatsAppButtonProps = {
  href: string;
  label?: string;
  style?: CSSProperties;
};

/**
 * Enlace grande a wa.me (nueva pestaña). Pensado para mayores: texto claro y área táctil amplia.
 */
export function WhatsAppButton({
  href,
  label = "Agendar por WhatsApp",
  style,
}: WhatsAppButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-cta-button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 56,
        padding: "18px 40px",
        fontSize: 20,
        fontWeight: 700,
        fontFamily: "Montserrat, sans-serif",
        color: "#fff",
        background: WHATSAPP_GREEN,
        textDecoration: "none",
        borderRadius: 12,
        boxShadow: "0 4px 14px rgba(37, 211, 102, 0.45)",
        border: "2px solid rgba(255,255,255,0.2)",
        lineHeight: 1.3,
        textAlign: "center",
        maxWidth: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <span aria-hidden style={{ marginRight: 10, fontSize: 24 }}>
        💬
      </span>
      {label}
    </a>
  );
}
