import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE, LEGAL_VERSION, PRODUCT } from "@/lib/legal-constants";

const TEAL = "#078a92";

const LEGAL_NAV = [
  { href: "/terms", label: "Términos" },
  { href: "/privacy", label: "Privacidad" },
  { href: "/telemedicine-consent", label: "Consentimiento" },
  { href: "/data-processing", label: "Datos" },
  { href: "/cookies", label: "Cookies" },
];

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <nav
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "Montserrat",
            fontWeight: 700,
            fontSize: 22,
            color: TEAL,
            textDecoration: "none",
          }}
        >
          {PRODUCT.name}
        </Link>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {LEGAL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ color: "#475569", fontSize: 13, textDecoration: "none", fontWeight: 500 }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 96px" }}>
        <h1
          style={{
            fontFamily: "Montserrat",
            color: "#0f172a",
            fontSize: 34,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 36 }}>
          Versión {LEGAL_VERSION} &middot; Vigente desde: {LEGAL_EFFECTIVE_DATE}
        </p>

        <div
          style={{
            color: "#334155",
            fontSize: 15,
            lineHeight: 1.85,
          }}
        >
          {children}
        </div>
      </div>

      <footer
        style={{
          padding: "24px 32px",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
          &copy; {new Date().getFullYear()} SAVAC LTDA &middot; RUT 76.373.761-6 &middot; {PRODUCT.name}
        </p>
      </footer>
    </div>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ marginBottom: 28, scrollMarginTop: 80 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: 10,
        }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
