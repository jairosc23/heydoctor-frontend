"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { claimPortalBooking } from "@/lib/services/patient-portal";

const FONT = "Montserrat, sans-serif";

export default function PortalClaimBookingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const appointment = await claimPortalBooking(token.trim());
      router.push(`/portal/citas/${appointment.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo vincular la reserva (email/clínica deben coincidir)",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-2 text-3xl font-bold text-primary" style={{ fontFamily: FONT }}>
        Vincular reserva
      </h1>
      <p className="mb-6 text-sm text-primaryDark/70">
        Pega el token UUID de tu reserva pública (EPIC-1) para asociarla a esta
        cuenta. El email de la reserva debe coincidir con el de tu login.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token de reserva (UUID)"
          disabled={busy}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={busy || !token.trim()}>
          Vincular
        </Button>
      </form>
    </div>
  );
}
