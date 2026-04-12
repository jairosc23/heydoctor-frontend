import { heydoctorApi } from "../heydoctor-api";

export interface PaymentSession {
  paymentId: string;
  paymentUrl: string;
}

export async function createPaymentSession(
  consultationId: string
): Promise<PaymentSession> {
  return heydoctorApi.post<PaymentSession>("/payku/create-payment-session", {
    consultationId,
  });
}
