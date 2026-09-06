"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { reducePaymentFlow, resolvePublishableKey } from "@/lib/payments/flow-state";
import type {
  CreatePaymentIntentInput,
  PaymentFlowStatus,
  PaymentIntentResponse,
} from "@/lib/payments/types";
import { toPaymentUserMessage } from "@/lib/payment-user-errors";
import {
  cancelPaymentIntent,
  createPaymentIntent,
  fetchPaymentsConfig,
} from "@/lib/services/payment-intents";

export type UsePaymentElementResult = {
  status: PaymentFlowStatus;
  intent: PaymentIntentResponse | null;
  publishableKey: string | null;
  error: string | null;
  retry: () => void;
  cancel: () => Promise<void>;
  markProcessing: () => void;
  markSuccess: () => void;
  markFailed: (error?: unknown) => void;
};

export function usePaymentElement(
  input: CreatePaymentIntentInput,
): UsePaymentElementResult {
  const [status, setStatus] = useState<PaymentFlowStatus>("idle");
  const [intent, setIntent] = useState<PaymentIntentResponse | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const canLoad = Boolean(input.consultationId || input.appointmentId);

  useEffect(() => {
    if (!canLoad) {
      setStatus("failed");
      setError("Falta el identificador de la consulta o la cita.");
      return;
    }

    let cancelled = false;
    setStatus((current) => reducePaymentFlow(current, { type: "load" }));
    setError(null);

    void (async () => {
      try {
        const [config, created] = await Promise.all([
          fetchPaymentsConfig(),
          createPaymentIntent(input),
        ]);
        const key = resolvePublishableKey(
          created.publishableKey || config.publishableKey,
        );
        if (!key) {
          throw new Error("missing_publishable_key");
        }
        if (cancelled) return;
        setPublishableKey(key);
        setIntent(created);
        setStatus((current) => reducePaymentFlow(current, { type: "ready" }));
      } catch (err) {
        if (cancelled) return;
        setError(toPaymentUserMessage(err));
        setStatus((current) => reducePaymentFlow(current, { type: "fail" }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canLoad, input.appointmentId, input.consultationId, reloadToken]);

  const retry = useCallback(() => {
    setIntent(null);
    setPublishableKey(null);
    setError(null);
    setStatus((current) => reducePaymentFlow(current, { type: "retry" }));
    setReloadToken((value) => value + 1);
  }, []);

  const cancel = useCallback(async () => {
    if (intent?.paymentId) {
      try {
        await cancelPaymentIntent(intent.paymentId);
      } catch (err) {
        setError(toPaymentUserMessage(err));
        setStatus((current) => reducePaymentFlow(current, { type: "fail" }));
        return;
      }
    }
    setStatus((current) => reducePaymentFlow(current, { type: "cancel" }));
  }, [intent?.paymentId]);

  const markProcessing = useCallback(() => {
    setStatus((current) => reducePaymentFlow(current, { type: "submit" }));
  }, []);

  const markSuccess = useCallback(() => {
    setError(null);
    setStatus((current) => reducePaymentFlow(current, { type: "success" }));
  }, []);

  const markFailed = useCallback((err?: unknown) => {
    setError(toPaymentUserMessage(err));
    setStatus((current) => reducePaymentFlow(current, { type: "fail" }));
  }, []);

  return useMemo(
    () => ({
      status,
      intent,
      publishableKey,
      error,
      retry,
      cancel,
      markProcessing,
      markSuccess,
      markFailed,
    }),
    [
      status,
      intent,
      publishableKey,
      error,
      retry,
      cancel,
      markProcessing,
      markSuccess,
      markFailed,
    ],
  );
}
