"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { registerPatient } from "@/lib/services/patient-portal";
import { readPortalInvite } from "@/lib/services/portal-invite-storage";
import { ensureMiddlewareSessionForSsr } from "@/lib/services/auth";
import { setAccessToken, bootstrapApiCsrf } from "@/lib/auth-client";

function RegisterPatientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingToken = searchParams.get("bookingToken") ?? "";
  const inviteFromQuery = searchParams.get("inviteToken") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteToken, setInviteToken] = useState(inviteFromQuery);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inviteFromQuery || !bookingToken) return;
    const stored = readPortalInvite(bookingToken);
    if (stored) setInviteToken(stored);
  }, [bookingToken, inviteFromQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!bookingToken.trim() || !inviteToken.trim()) {
      setError(
        "El registro requiere una reserva pública válida (booking + invitación). Completa una reserva y usa el enlace «Crear cuenta».",
      );
      return;
    }
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Completa nombre, email y contraseña");
      return;
    }
    setLoading(true);
    try {
      await bootstrapApiCsrf().catch(() => undefined);
      const result = await registerPatient({
        name: name.trim(),
        email: email.trim(),
        password,
        bookingToken: bookingToken.trim(),
        inviteToken: inviteToken.trim(),
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
          Accede a tus citas y teleconsulta. El alta queda vinculada a tu reserva
          pública.
        </p>
        {!bookingToken || !inviteToken ? (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-left text-sm text-amber-900">
            Falta el comprobante de reserva. Reserva una cita pública y abre
            «Crear cuenta paciente» desde el estado de la reserva.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <Input
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <Input
            type="email"
            placeholder="Email (el mismo de la reserva)"
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button
            type="submit"
            disabled={loading || !bookingToken || !inviteToken}
            className="w-full"
          >
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
