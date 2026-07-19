"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { registerPatient } from "@/lib/services/patient-portal";
import { ensureMiddlewareSessionForSsr } from "@/lib/services/auth";
import { setAccessToken, bootstrapApiCsrf } from "@/lib/auth-client";

function RegisterPatientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingToken = searchParams.get("bookingToken") ?? undefined;
  const clinicIdFromQuery = searchParams.get("clinicId") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicId, setClinicId] = useState(clinicIdFromQuery);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim() || !clinicId.trim()) {
      setError("Completa nombre, email, contraseña y clinicId");
      return;
    }
    setLoading(true);
    try {
      await bootstrapApiCsrf().catch(() => undefined);
      const result = await registerPatient({
        name: name.trim(),
        email: email.trim(),
        password,
        clinicId: clinicId.trim(),
        bookingToken,
      });
      if (result.access_token) {
        setAccessToken(result.access_token);
        await ensureMiddlewareSessionForSsr();
      }
      router.replace("/portal");
      window.location.assign("/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-premium">
        <BrandLogo markOnly markSize={96} className="mx-auto mb-4" />
        <h2
          className="mb-2 text-2xl font-bold text-primary"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Crear cuenta paciente
        </h2>
        <p className="mb-5 text-sm text-primaryDark/70">
          Accede a tus citas, pagos y teleconsulta.
          {bookingToken ? " Se vinculará tu reserva actual." : ""}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <Input
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
          <Input
            type="password"
            placeholder="Contraseña (mín. 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
          <Input
            placeholder="Clinic ID (UUID)"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            disabled={loading}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-primaryDark/70">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login?redirect=/portal" className="text-primary underline">
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function PortalRegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando…</div>}>
      <RegisterPatientForm />
    </Suspense>
  );
}
