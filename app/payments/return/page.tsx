"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchPaymentRecord } from "@/lib/services/payments";
import { paymentIdFromHash, paymentPresentation, type PaymentRecord } from "@/lib/payments/return-contract";

type Result = { key: string; record?: PaymentRecord; failed?: boolean };

/** Read-only return. Authentication and payment ownership remain backend responsibilities. */
export default function ClinicalPaymentReturnPage() {
  const { user, loading } = useAuth();
  const [hash, setHash] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const paymentId = hash === null ? null : paymentIdFromHash(hash);
  // Bind any asynchronous result to both identity and fragment. An old account,
  // hash or refresh cannot paint a stale approval over the current request.
  const key = `${user?.id ?? ""}:${user?.clinicId ?? ""}:${paymentId ?? ""}:${revision}`;

  useEffect(() => {
    const readHash = () => setHash(window.location.hash);
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  useEffect(() => {
    setResult(null);
    if (loading || !user || !paymentId) return;
    let active = true;
    void fetchPaymentRecord(paymentId).then(
      (record) => { if (active) setResult({ key, record }); },
      () => { if (active) setResult({ key, failed: true }); },
    );
    return () => { active = false; };
  }, [loading, user?.id, user?.clinicId, paymentId, key]);

  const loginPath = paymentId
    ? `/login?redirect=${encodeURIComponent(`/payments/return#${paymentId}`)}`
    : "/login";
  const current = result?.key === key ? result : null;
  const busy = loading || hash === null || Boolean(user && paymentId && !current);
  const view = current?.record ? paymentPresentation(current.record.status) : null;
  let title = "Verificando pago";
  let description = "Consultando el estado de tu pago de forma segura.";
  let state = "loading";
  if (!busy) {
    if (!paymentId) {
      state = "error"; title = "Referencia de pago no válida";
      description = "Abre el enlace original del pago o vuelve a tus consultas.";
    } else if (!user) {
      state = "auth"; title = "Inicia sesión para verificar el pago";
      description = "Por seguridad, solo puedes consultar los pagos autorizados para tu cuenta.";
    } else if (current?.failed) {
      state = "error"; title = "No pudimos verificar el pago";
      description = "No se ha confirmado el resultado. Revisa tu sesión y vuelve a consultar el estado.";
    } else if (view) {
      ({ state, title, description } = view);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section aria-labelledby="payment-return-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 font-semibold text-primary">HeyDoctor · Pago de consulta</p>
        <div role="status" aria-live="polite" aria-busy={busy} data-testid="clinical-payment-return" data-state={state}>
          <h1 id="payment-return-title" className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-3 text-slate-600">{description}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          {user && paymentId && (
            <button type="button" disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 disabled:opacity-50" onClick={() => setRevision((n) => n + 1)}>Actualizar estado</button>
          )}
          {!loading && (!user || current?.failed) && <Link className="underline" href={loginPath}>Iniciar sesión</Link>}
          {user && <Link className="underline" href={user.role === "patient" ? "/portal" : "/panel/consultas"}>Volver a mis consultas</Link>}
        </div>
      </section>
    </main>
  );
}
