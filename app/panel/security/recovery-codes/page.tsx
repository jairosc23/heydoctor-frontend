"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import PanelLayout from "@/components/PanelLayout";
import { useAuth } from "@/lib/context/AuthContext";
import { rotateMfaBackupCodes } from "@/lib/mfa-recovery-rotation";

export default function RecoveryCodesPage() {
  const { user } = useAuth();
  const [totp, setTotp] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const clear = () => { setCodes(null); setTotp(""); };
    window.addEventListener("pagehide", clear);
    return () => { window.removeEventListener("pagehide", clear); clear(); };
  }, []);

  const staff = user?.role === "doctor" || user?.role === "admin";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!staff || busy || codes || !/^\d{6}$/.test(totp)) return;
    setError("");
    setBusy(true);
    try {
      const next = await rotateMfaBackupCodes(totp);
      setCodes(next);
      setTotp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la operación.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelLayout title="Seguridad de la cuenta">
      <main className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-primary/20 bg-white p-6 shadow-sm" aria-label="Códigos de recuperación MFA">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-primaryDark">Regenerar códigos de recuperación</h1>
          <p className="text-sm text-primaryDark/80">Esta operación invalida inmediatamente todos tus códigos anteriores y genera ocho nuevos. Tu autenticador actual seguirá funcionando.</p>
        </header>
        {!staff ? (
          <p role="alert" className="text-red-700">Solo el personal médico autenticado puede realizar esta operación.</p>
        ) : codes === null ? (
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <label htmlFor="recovery-rotation-totp" className="block text-sm font-medium text-primaryDark">Código actual de seis dígitos de tu aplicación Authenticator</label>
            <input
              id="recovery-rotation-totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={totp}
              onChange={(event) => setTotp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-lg border border-primary/30 p-3 text-lg tracking-widest"
              aria-describedby="mfa-rotation-advice"
              required
              disabled={busy}
            />
            <p id="mfa-rotation-advice" className="text-sm text-primaryDark/70">
              Usa únicamente el código de tu factor TOTP configurado. No se aceptan códigos de recuperación para autorizar esta acción. Nunca compartas el código ni fotografíes esta pantalla.
            </p>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50" type="submit" disabled={busy || totp.length !== 6}>
              {busy ? "Verificando…" : "Invalidar códigos anteriores y generar nuevos"}
            </button>
          </form>
        ) : (
          <section className="space-y-4" aria-label="Nuevos códigos de recuperación">
            <p role="status" className="font-semibold text-primaryDark">Los códigos anteriores han sido reemplazados. Estos ocho nuevos códigos se muestran una sola vez.</p>
            <p className="text-sm text-primaryDark/80">Guárdalos fuera del navegador en un gestor de contraseñas seguro. No los copies en este chat, no tomes capturas y no los incluyas en informes.</p>
            <ol className="grid gap-2 rounded-xl border border-primary/20 p-4 font-mono text-sm sm:grid-cols-2" aria-label="Códigos mostrados una sola vez">
              {codes.map((code, idx) => <li key={idx} className="select-text break-all">{idx + 1}. {code}</li>)}
            </ol>
            <label className="flex items-start gap-3 text-sm text-primaryDark">
              <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1" />
              He guardado los códigos nuevos en un lugar seguro. Entiendo que no volverán a mostrarse.
            </label>
            <button type="button" disabled={!acknowledged} onClick={() => { setCodes(null); window.location.assign("/dashboard"); }} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50">
              Terminar y ocultar códigos
            </button>
          </section>
        )}
        <Link href="/dashboard" className="block text-sm font-semibold text-primary underline">Volver al panel</Link>
      </main>
    </PanelLayout>
  );
}
