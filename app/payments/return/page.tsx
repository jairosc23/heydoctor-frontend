"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearClinicalPaymentReturn,
  readClinicalPaymentReturn,
} from "@/lib/services/clinical-payment-return";
import { fetchPaymentIntentStatus } from "@/lib/services/payment-intents";
import { fetchConsultationPaymentStatus } from "@/lib/services/payments";
import {
  fetchPublicBookingStatus,
  mockCompletePublicCheckout,
} from "@/lib/services/public-booking";

type SyncState = "loading" | "missing" | "error";

function ClinicalPaymentReturnInner() {
  const router = useRouter();
  const params = useSearchParams();
  const paymentId = params.get("paymentId")?.trim() ?? "";
  const [state, setState] = useState<SyncState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function completeReturn() {
      if (!paymentId) {
        setState("missing");
        return;
      }
      const retained = readClinicalPaymentReturn();
      if (!retained || retained.paymentId !== paymentId) {
        setState("missing");
        return;
      }

      try {
        if (retained.kind === "consultation") {
          await fetchConsultationPaymentStatus(retained.consultationId);
          if (cancelled) return;
          const consultationId = retained.consultationId;
          clearClinicalPaymentReturn();
          router.replace(`/panel/consultas/${consultationId}`);
          return;
        }
        if (retained.kind === "appointment") {
          await fetchPaymentIntentStatus(retained.paymentId);
          if (cancelled) return;
          clearClinicalPaymentReturn();
          router.replace("/panel");
          return;
        }
        if (retained.simulated) {
          try {
            await mockCompletePublicCheckout(retained.bookingToken);
          } catch {
            /* mock endpoint may 404 outside local/e2e */
          }
        }
        await fetchPublicBookingStatus(retained.bookingToken);
        if (cancelled) return;
        const bookingToken = retained.bookingToken;
        clearClinicalPaymentReturn();
        router.replace(`/dr/booking/${bookingToken}`);
      } catch {
        if (!cancelled) setState("error");
      }
    }

    void completeReturn();
    return () => {
      cancelled = true;
    };
  }, [paymentId, router]);

  if (state === "loading") {
    return (
      <p role="status" className="mx-auto max-w-xl p-6">
        Confirmando el pago…
      </p>
    );
  }

  if (state === "missing") {
    return (
      <div className="mx-auto max-w-xl space-y-3 p-6">
        <p role="alert">No encontramos el contexto de este pago.</p>
        <Link href="/panel" className="text-primary underline">
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-3 p-6">
      <p role="alert">No pudimos verificar el pago. Inténtalo de nuevo.</p>
      <Link href="/panel" className="text-primary underline">
        Volver al panel
      </Link>
    </div>
  );
}

export default function ClinicalPaymentReturnPage() {
  return (
    <Suspense fallback={<p role="status">Confirmando el pago…</p>}>
      <ClinicalPaymentReturnInner />
    </Suspense>
  );
}
