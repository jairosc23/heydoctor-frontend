import { heydoctorApi } from "../heydoctor-api";
import type {
  CreatePaymentIntentInput,
  PaymentIntentResponse,
  PaymentIntentStatusResponse,
  PaymentsConfig,
} from "../payments/types";

export const PAYMENTS_CONFIG_PATH = "/payments/config";
export const PAYMENTS_INTENTS_PATH = "/payments/intents";

export function paymentIntentPath(paymentId: string): string {
  return `/payments/intents/${paymentId}`;
}

export function paymentIntentCancelPath(paymentId: string): string {
  return `/payments/intents/${paymentId}/cancel`;
}

export async function fetchPaymentsConfig(): Promise<PaymentsConfig> {
  return heydoctorApi.get<PaymentsConfig>(PAYMENTS_CONFIG_PATH);
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<PaymentIntentResponse> {
  return heydoctorApi.post<PaymentIntentResponse>(PAYMENTS_INTENTS_PATH, input);
}

export async function fetchPaymentIntentStatus(
  paymentId: string,
): Promise<PaymentIntentStatusResponse> {
  return heydoctorApi.get<PaymentIntentStatusResponse>(
    paymentIntentPath(paymentId),
  );
}

export async function cancelPaymentIntent(
  paymentId: string,
): Promise<PaymentIntentStatusResponse> {
  return heydoctorApi.post<PaymentIntentStatusResponse>(
    paymentIntentCancelPath(paymentId),
    {},
  );
}
