import { heydoctorApi } from "../heydoctor-api";
import { paymentIdFromHash, requirePaymentRecord, type PaymentRecord } from "../payments/return-contract";

export interface PaymentSession {
  paymentId: string;
  paymentUrl: string;
}

export async function createPaymentSession(
  consultationId: string
): Promise<PaymentSession> {
  return heydoctorApi.post<PaymentSession>("/payments/create-payment-session", {
    consultationId,
  });
}

export type ConsultationPaymentStatus = {
  isPaid: boolean;
  hasPending: boolean;
  hasFailed: boolean;
};

/** Verificación post-redirect: estado real en BD (no confiar solo en ?payment=). */
export async function fetchConsultationPaymentStatus(
  consultationId: string
): Promise<ConsultationPaymentStatus> {
  return heydoctorApi.get<ConsultationPaymentStatus>(
    `/payments/consultation/${consultationId}/payment-status`
  );
}

/** Existing authenticated backend lookup; reads the persisted row, not Stripe URL parameters. */
export async function fetchPaymentRecord(paymentId: string): Promise<PaymentRecord> {
  const id = paymentIdFromHash(`#${paymentId}`);
  if (!id) throw new Error("Invalid payment reference");
  const record = await heydoctorApi.get<unknown>(`/payments/intents/${id}`);
  return requirePaymentRecord(record, id);
}
