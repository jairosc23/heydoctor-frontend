"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import { PaymentErrorBoundary } from "@/components/payments/PaymentErrorBoundary";
import { PaymentElementCheckout } from "@/components/payments/PaymentElementCheckout";
import Card from "@/components/ui/Card";
import { usePaymentElement } from "@/lib/hooks/use-payment-element";
import type { CreatePaymentIntentInput } from "@/lib/payments/types";

const stripePromises = new Map<string, Promise<Stripe | null>>();

function stripePromiseFor(publishableKey: string): Promise<Stripe | null> {
  const cached = stripePromises.get(publishableKey);
  if (cached) return cached;
  const promise = loadStripe(publishableKey);
  stripePromises.set(publishableKey, promise);
  return promise;
}

type Props = CreatePaymentIntentInput & {
  returnPath?: string;
};

export function PaymentFlow({
  consultationId,
  appointmentId,
  returnPath,
}: Props) {
  const flow = usePaymentElement({ consultationId, appointmentId });
  const returnUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return returnPath ?? "/panel/pagos/intent";
    }
    const url = new URL(
      returnPath ?? window.location.pathname,
      window.location.origin,
    );
    if (consultationId) url.searchParams.set("consultationId", consultationId);
    if (appointmentId) url.searchParams.set("appointmentId", appointmentId);
    return url.toString();
  }, [appointmentId, consultationId, returnPath]);

  return (
    <PaymentErrorBoundary continueHref="/panel" continueLabel="Volver al panel">
      <Card className="mx-auto max-w-xl space-y-4">
        <h1 className="text-xl font-semibold">Pago de consulta</h1>
        {flow.status === "loading" || flow.status === "idle" ? (
          <p role="status">Preparando el pago…</p>
        ) : null}
        {flow.status === "success" ? (
          <p role="status">El pago se completó correctamente.</p>
        ) : null}
        {flow.status === "cancelled" ? (
          <div className="space-y-3">
            <p role="status">El pago fue cancelado.</p>
            <button
              type="button"
              onClick={flow.retry}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Reintentar
            </button>
          </div>
        ) : null}
        {flow.status === "failed" ? (
          <div className="space-y-3">
            <p role="alert">{flow.error ?? "No se pudo completar el pago."}</p>
            <button
              type="button"
              onClick={flow.retry}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Reintentar
            </button>
          </div>
        ) : null}
        {flow.status === "ready" || flow.status === "processing" ? (
          flow.publishableKey && flow.intent ? (
            <Elements
              stripe={stripePromiseFor(flow.publishableKey)}
              options={{
                clientSecret: flow.intent.clientSecret,
                locale: "es",
              }}
            >
              <PaymentElementCheckout
                returnUrl={returnUrl}
                disabled={flow.status === "processing"}
                onProcessing={flow.markProcessing}
                onSuccess={flow.markSuccess}
                onFailed={flow.markFailed}
                onCancel={() => {
                  void flow.cancel();
                }}
              />
            </Elements>
          ) : (
            <p role="alert">No se pudo inicializar Stripe.</p>
          )
        ) : null}
      </Card>
    </PaymentErrorBoundary>
  );
}
