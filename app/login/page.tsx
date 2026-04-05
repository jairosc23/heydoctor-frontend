"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
          "No se pudo conectar con el servidor. Verifica tu conexión y que NEXT_PUBLIC_API_URL esté configurada.",
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-premium">
        <HeyDoctorLogo size={96} className="mx-auto mb-6 drop-shadow-xl" />
        <h2
          className="mb-5 text-[28px] font-bold text-gray-900"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Acceso Médico
        </h2>
        <form onSubmit={handleSubmit} className="text-left">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            autoComplete="username"
            className="mb-3"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            disabled={loading}
            autoComplete="current-password"
            className="mb-4"
          />
          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
        {error && (
          <div className="mt-3 min-h-[20px] text-center text-sm text-red-600">{error}</div>
        )}
        <p className="mt-4 text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-primary no-underline hover:underline">
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
