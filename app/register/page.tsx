"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError, heydoctorApi } from "@/lib/heydoctor-api";
import { BrandLogo } from "@/components/branding";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const FONT_HEADING = "Montserrat, sans-serif";

/** Tokens CTA primario DS (Login / Landing). */
const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100";

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
      await heydoctorApi.post(
        "/auth/register",
        { email: email.trim().toLowerCase(), password },
        { requireAuth: false },
      );
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
        <Card className="w-full max-w-md text-center shadow-premium">
          <BrandLogo
            variant="landing"
            priority
            className="mx-auto mb-6 origin-center scale-[1.12]"
          />
          <div
            className="mb-4 text-4xl font-bold text-primary"
            aria-hidden
          >
            ✓
          </div>
          <h2
            className="mb-3 text-[22px] font-bold text-primary"
            style={{ fontFamily: FONT_HEADING }}
          >
            Cuenta creada
          </h2>
          <p className="m-0 text-sm text-primaryDark/70">
            Redirigiendo al inicio de sesión...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-premium">
        <BrandLogo
          variant="landing"
          priority
          className="mx-auto mb-6 origin-center scale-[1.12]"
        />
        <h2
          className="mb-5 text-[28px] font-bold text-primary"
          style={{ fontFamily: FONT_HEADING }}
        >
          Crear Cuenta
        </h2>
        <form onSubmit={handleSubmit} className="text-left">
          <label htmlFor="register-email" className="sr-only">
            Email
          </label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
            className="mb-3"
          />
          <label htmlFor="register-password" className="sr-only">
            Contraseña
          </label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            disabled={loading}
            autoComplete="new-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
            className="mb-3"
          />
          <label htmlFor="register-confirm-password" className="sr-only">
            Confirmar contraseña
          </label>
          <Input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar contraseña"
            disabled={loading}
            autoComplete="new-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-error" : undefined}
            className="mb-4"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className={`w-full ${CTA_PRIMARY}`}
          >
            {loading ? "Registrando…" : "Registrarse"}
          </Button>
        </form>
        {error && (
          <div
            id="register-error"
            className="mt-3 min-h-[20px] text-center text-sm text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}
        <p className="mt-4 text-sm text-primaryDark/70">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-primary no-underline hover:underline focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2"
          >
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
