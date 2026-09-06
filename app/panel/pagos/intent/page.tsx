"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentFlow } from "@/components/payments/PaymentFlow";

function PaymentIntentPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const consultationId = params.get("consultationId") ?? undefined;
  const appointmentId = params.get("appointmentId") ?? undefined;
  const redirectStatus = params.get("redirect_status");

  const retryHref = (() => {
    const next = new URLSearchParams();
    if (consultationId) next.set("consultationId", consultationId);
    if (appointmentId) next.set("appointmentId", appointmentId);
    const query = next.toString();
    return query ? `/panel/pagos/intent?${query}` : "/panel/pagos/intent";
  })();

  if (redirectStatus === "succeeded") {
    return (
      <p role="status" className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-soft">
        El pago se completó correctamente.
      </p>
    );
  }
  if (redirectStatus === "pending") {
    return (
      <p role="status" className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-soft">
        El pago está en proceso. Te confirmaremos cuando se complete.
      </p>
    );
  }
  if (redirectStatus === "failed") {
    return (
      <div className="mx-auto max-w-xl space-y-3 rounded-2xl bg-white p-6 shadow-soft">
        <p role="alert">El pago no se pudo completar.</p>
        <button
          type="button"
          onClick={() => {
            router.replace(retryHref);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <PaymentFlow
      consultationId={consultationId}
      appointmentId={appointmentId}
    />
  );
}

export default function PaymentIntentPage() {
  return (
    <Suspense fallback={<p role="status">Cargando pago…</p>}>
      <PaymentIntentPageInner />
    </Suspense>
  );
}
