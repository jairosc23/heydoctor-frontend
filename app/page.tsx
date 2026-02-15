import Link from "next/link";

export default function HomePage() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "60px 20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/logo-heydoctor.png"
        alt="HeyDoctor"
        width={140}
        height={140}
        style={{ marginBottom: 30 }}
      />
      <h1
        style={{
          color: "#078a92",
          fontSize: "2.4rem",
          fontFamily: "Montserrat",
          marginBottom: 12,
        }}
      >
        Bienvenido a HeyDoctor
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Atención médica online y presencial en Viña del Mar.
      </p>
      <Link
        href="/login"
        style={{
          display: "inline-block",
          padding: "14px 22px",
          background: "#078a92",
          color: "white",
          borderRadius: 10,
          textDecoration: "none",
          fontSize: "1.1rem",
          fontFamily: "Montserrat",
        }}
      >
        Ingresar
      </Link>
    </section>
  );
}
