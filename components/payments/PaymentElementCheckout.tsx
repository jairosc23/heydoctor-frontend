"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState, type FormEvent } from "react";
import { toPaymentUserMessage } from "@/lib/payment-user-errors";

type Props = {
  returnUrl: string;
  onProcessing: () => void;
  onSuccess: () => void;
  onFailed: (error?: unknown) => void;
  onCancel: () => void;
  disabled?: boolean;
};

export function PaymentElementCheckout({
  returnUrl,
  onProcessing,
  onSuccess,
  onFailed,
  onCancel,
  disabled = false,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements || submitting || disabled) return;

    setSubmitting(true);
    onProcessing();
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (result.error) {
      setSubmitting(false);
      onFailed(result.error.message ?? result.error);
      return;
    }

    const intentStatus = result.paymentIntent?.status;
    if (intentStatus === "succeeded") {
      onSuccess();
      return;
    }
    if (intentStatus === "processing") {
      onSuccess();
      return;
    }
    setSubmitting(false);
    onFailed(toPaymentUserMessage(new Error("payment_not_confirmed")));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!stripe || !elements || submitting || disabled}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Procesando…" : "Pagar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
