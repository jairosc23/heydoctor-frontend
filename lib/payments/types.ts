export type PaymentFlowStatus =
  | "idle"
  | "loading"
  | "ready"
  | "processing"
  | "success"
  | "failed"
  | "cancelled";

export type PaymentsConfig = {
  publishableKey: string;
  provider: "stripe";
};

export type PaymentIntentResponse = {
  paymentId: string;
  clientSecret: string;
  publishableKey: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "expired";
  amount: number;
  currency: string;
};

export type PaymentIntentStatusResponse = {
  paymentId: string;
  status: PaymentIntentResponse["status"];
  amount: number;
  currency: string;
};

export type CreatePaymentIntentInput = {
  consultationId?: string;
  appointmentId?: string;
};
