import type { PaymentFlowStatus } from "./types";

export type PaymentFlowEvent =
  | { type: "load" }
  | { type: "ready" }
  | { type: "submit" }
  | { type: "success" }
  | { type: "fail" }
  | { type: "retry" }
  | { type: "cancel" };

const TRANSITIONS: Record<PaymentFlowStatus, Partial<Record<PaymentFlowEvent["type"], PaymentFlowStatus>>> =
  {
    idle: { load: "loading" },
    loading: { ready: "ready", fail: "failed" },
    ready: { submit: "processing", cancel: "cancelled", fail: "failed" },
    processing: { success: "success", fail: "failed" },
    success: {},
    failed: { retry: "loading", cancel: "cancelled" },
    cancelled: { retry: "loading" },
  };

export function reducePaymentFlow(
  status: PaymentFlowStatus,
  event: PaymentFlowEvent,
): PaymentFlowStatus {
  return TRANSITIONS[status][event.type] ?? status;
}

export function readPublicStripePublishableKey(): string | null {
  const value = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return value || null;
}

export function resolvePublishableKey(
  fromApi: string | null | undefined,
): string | null {
  const apiKey = fromApi?.trim();
  if (apiKey) return apiKey;
  return readPublicStripePublishableKey();
}
