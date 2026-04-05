"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const rawRedirect = searchParams.get("redirect") || "/panel";
  const redirect =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/panel";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Ingresa email y contraseña");
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Usuario o contraseña incorrectos";
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("fetch") ||
        msg.includes("NetworkError")
      ) {
        setError(
          "No se pudo conectar con el servidor. Verifica tu conexión y que NEXT_PUBLIC_API_URL esté configurada."
        );
      } else if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        setError("Credenciales incorrectas o sesión no válida.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #022c2c, #05636b, #078a92)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          padding: 40,
          width: "100%",
          maxWidth: 350,
          borderRadius: 20,
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 40px rgba(0,0,0,0.25)",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <HeyDoctorLogo
          size={96}
          className="mx-auto mb-6 drop-shadow-xl"
        />
        <h2
          style={{
            color: "white",
            fontFamily: "Montserrat",
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          Acceso Médico
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            autoComplete="username"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "none",
              marginBottom: 12,
              fontSize: 15,
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            disabled={loading}
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              border: "none",
              marginBottom: 12,
              fontSize: 15,
              outline: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              marginTop: 5,
              background: "#00d4ce",
              color: "#003033",
              border: "none",
              fontSize: 17,
              borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Montserrat",
              fontWeight: "bold",
            }}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        {error && (
          <div
            style={{
              color: "#ffdada",
              marginTop: 12,
              fontSize: 14,
              minHeight: 20,
            }}
          >
            {error}
          </div>
        )}
        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 16, fontSize: 14 }}>
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            style={{ color: "#00d4ce", textDecoration: "none", fontWeight: 600 }}
          >
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
