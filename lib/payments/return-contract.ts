/** The fragment identifies a row; it never carries payment or clinical authority. */
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function paymentIdFromHash(hash: string): string | null {
  const id = hash.startsWith("#") ? hash.slice(1) : "";
  return UUID_V4.test(id) ? id.toLowerCase() : null;
}

export type PaymentRecordStatus = "pending" | "paid" | "failed" | "cancelled" | "expired";
export type PaymentRecord = { paymentId: string; status: PaymentRecordStatus };
const STATUSES = new Set<unknown>(["pending", "paid", "failed", "cancelled", "expired"]);

export function requirePaymentRecord(value: unknown, expectedId: string): PaymentRecord {
  if (!value || typeof value !== "object") throw new Error("Invalid payment record");
  const record = value as Record<string, unknown>;
  if (
    typeof record.paymentId !== "string" ||
    paymentIdFromHash(`#${record.paymentId}`) !== expectedId.toLowerCase() ||
    !STATUSES.has(record.status)
  ) throw new Error("Invalid payment record");
  return { paymentId: expectedId.toLowerCase(), status: record.status as PaymentRecordStatus };
}

export function paymentPresentation(status: PaymentRecordStatus) {
  switch (status) {
    case "paid": return { state: "approved", title: "Pago aprobado", description: "El pago figura aprobado en tu cuenta. Puedes volver a tus consultas." };
    case "pending": return { state: "pending", title: "Pago pendiente", description: "Aún esperamos la confirmación del pago. Puedes actualizar su estado sin iniciar otro cobro." };
    case "failed": return { state: "declined", title: "Pago rechazado", description: "El pago no pudo completarse. Revisa tus consultas antes de intentar un nuevo pago." };
    case "cancelled": return { state: "declined", title: "Pago cancelado", description: "Este pago fue cancelado. No se ha confirmado un pago aprobado." };
    case "expired": return { state: "declined", title: "Pago vencido", description: "El plazo de este pago terminó. Revisa tus consultas antes de iniciar otro pago." };
  }
}
