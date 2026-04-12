"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError, heydoctorApi } from "@/lib/heydoctor-api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Ingresa email y contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await heydoctorApi.post("/auth/register", { email: email.trim(), password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error al registrarse";
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError")
      ) {
        setError("No se pudo conectar con el servidor.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "none",
    marginBottom: 12,
    fontSize: 15,
    outline: "none",
    background: "rgba(255,255,255,0.15)",
    color: "white",
  };

  if (success) {
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
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h2
            style={{
              color: "white",
              fontFamily: "Montserrat",
              fontSize: 22,
              marginBottom: 12,
            }}
          >
            Cuenta creada
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      </div>
    );
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
        <h2
          style={{
            color: "white",
            fontFamily: "Montserrat",
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          Crear Cuenta
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            disabled={loading}
            style={inputStyle}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            disabled={loading}
            style={inputStyle}
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
            {loading ? "Registrando…" : "Registrarse"}
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
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            style={{ color: "#00d4ce", textDecoration: "none", fontWeight: 600 }}
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
