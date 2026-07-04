"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { BrandLogo } from "@/components/branding";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      /** Navegación completa: el middleware SSR debe recibir `heydoctor_session` (no solo RSC client). */
      window.location.assign(redirect);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error desconocido al iniciar sesión.";
      const lower = msg.toLowerCase();

      if (
        lower.includes("error de red") ||
        lower.includes("failed to fetch") ||
        lower.includes("networkerror") ||
        lower.includes("network request failed") ||
        lower.includes("load failed")
      ) {
        setError(
          msg.startsWith("Error de red")
            ? msg
            : "Error de red: no se pudo contactar el API. Revisa conexión, NEXT_PUBLIC_HEYDOCTOR_API_URL, CORS con credenciales en el backend y CSP connect-src (pro-api / dominio del API).",
        );
      } else if (
        lower.includes("401") ||
        lower.includes("unauthorized") ||
        lower.includes("no autorizado") ||
        lower.includes("credenciales incorrectas")
      ) {
        setError(msg.includes("401") || msg.length < 280 ? msg : "Credenciales incorrectas o sesión no válida.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
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
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Acceso Médico
        </h2>
        <form onSubmit={handleSubmit} className="text-left">
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            autoComplete="username"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
            className="mb-3"
          />
          <label htmlFor="login-password" className="sr-only">
            Contraseña
          </label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            disabled={loading}
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error" : undefined}
            className="mb-4"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
        {error && (
          <div
            id="login-error"
            className="mt-3 min-h-[20px] text-center text-sm text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}
        <p className="mt-4 text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="rounded font-semibold text-primary no-underline hover:underline focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2"
          >
            Registrarse
          </Link>
        </p>
      </Card>
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
