import { apiPost } from "../api-client";

export interface PaymentSession {
  paymentId: string;
  paymentUrl: string;
}

export async function createPaymentSession(
  consultationId: string
): Promise<PaymentSession> {
  return apiPost<PaymentSession>("/payku/create-payment-session", {
    consultationId,
  });
}
