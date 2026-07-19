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
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const appointment = await claimPortalBooking(
        token.trim(),
        inviteToken.trim(),
      );
      router.push(`/portal/citas/${appointment.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo vincular (se requieren booking + invitación + email coincidente)",
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
        Necesitas el token de reserva y el comprobante de invitación generados al
        crear la reserva pública. El email debe coincidir con tu cuenta.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token de reserva (UUID)"
          disabled={busy}
        />
        <Input
          value={inviteToken}
          onChange={(e) => setInviteToken(e.target.value)}
          placeholder="Invitación portal (UUID)"
          disabled={busy}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          type="submit"
          disabled={busy || !token.trim() || !inviteToken.trim()}
        >
          Vincular
        </Button>
      </form>
    </div>
  );
}
