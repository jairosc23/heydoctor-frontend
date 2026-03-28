import Link from "next/link";

const BRAND = "#078a92";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafb",
        fontFamily: "Open Sans, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: "48px 36px",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 64,
            fontWeight: 700,
            color: BRAND,
            marginBottom: 8,
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 20,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 12,
          }}
        >
          Página no encontrada
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            fontSize: 15,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            color: "#fff",
            textDecoration: "none",
            background: BRAND,
            borderRadius: 10,
          }}
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
