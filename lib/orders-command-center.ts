import type { ClinicalInvoice, ClinicalInvoiceStatus } from "@/lib/services/invoices";
import type { LabOrderRecord } from "@/lib/services/lab-orders";
import type { PrescriptionRecord } from "@/lib/services/prescriptions";
import type { ReferralRecord, ReferralStatus } from "@/lib/services/referrals";

export type OrderDisplayStatus = "pending" | "active" | "completed" | "unexecuted";

export type OrderStatusPresentation = {
  key: OrderDisplayStatus;
  label: string;
  dot: string;
};

export const ORDER_STATUS_PRESENTATION: Record<
  OrderDisplayStatus,
  OrderStatusPresentation
> = {
  pending: { key: "pending", label: "Pendiente", dot: "🟡" },
  active: { key: "active", label: "Activa", dot: "🟢" },
  completed: { key: "completed", label: "Completada", dot: "🔵" },
  unexecuted: { key: "unexecuted", label: "Sin ejecutar", dot: "⚪" },
};

export const ORDER_STATUS_SORT: Record<OrderDisplayStatus, number> = {
  pending: 0,
  unexecuted: 1,
  active: 2,
  completed: 3,
};

export type OrdersSummary = {
  active: number;
  completed: number;
  pending: number;
  total: number;
};

export function inferPrescriptionStatus(status?: string | null): OrderDisplayStatus {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("complet")) return "completed";
  if (normalized.includes("pend")) return "pending";
  return "active";
}

export function inferLabOrderStatus(): OrderDisplayStatus {
  return "unexecuted";
}

export function inferReferralStatus(status: ReferralStatus): OrderDisplayStatus {
  if (status === "COMPLETED") return "completed";
  if (status === "PENDING") return "pending";
  return "active";
}

export function inferInvoiceStatus(status: ClinicalInvoiceStatus): OrderDisplayStatus {
  if (status === "paid") return "completed";
  if (status === "pending") return "pending";
  return "unexecuted";
}

export function getOrderStatusPresentation(
  status: OrderDisplayStatus,
): OrderStatusPresentation {
  return ORDER_STATUS_PRESENTATION[status];
}

export function compareOrderStatus(
  a: OrderDisplayStatus,
  b: OrderDisplayStatus,
): number {
  return ORDER_STATUS_SORT[a] - ORDER_STATUS_SORT[b];
}

export function sortOrdersByStatusThenDate<T>(
  items: T[],
  getStatus: (item: T) => OrderDisplayStatus,
  getDate: (item: T) => string | undefined | null,
): T[] {
  return [...items].sort((a, b) => {
    const statusCmp = compareOrderStatus(getStatus(a), getStatus(b));
    if (statusCmp !== 0) return statusCmp;
    return (
      new Date(getDate(b) ?? 0).getTime() - new Date(getDate(a) ?? 0).getTime()
    );
  });
}

export function buildOrdersSummary(
  statuses: OrderDisplayStatus[],
): OrdersSummary {
  let active = 0;
  let completed = 0;
  let pending = 0;

  for (const status of statuses) {
    if (status === "completed") completed += 1;
    else if (status === "active") active += 1;
    else pending += 1;
  }

  return {
    active,
    completed,
    pending,
    total: statuses.length,
  };
}

export function collectOrderStatuses(input: {
  prescriptions: PrescriptionRecord[];
  labOrders: LabOrderRecord[];
  referrals: ReferralRecord[];
  invoices: ClinicalInvoice[];
}): OrderDisplayStatus[] {
  return [
    ...input.prescriptions.map((item) => inferPrescriptionStatus(item.status)),
    ...input.labOrders.map(() => inferLabOrderStatus()),
    ...input.referrals.map((item) => inferReferralStatus(item.status)),
    ...input.invoices.map((item) => inferInvoiceStatus(item.status)),
  ];
}

export function formatOrderUpdatedAt(
  iso?: string | null,
  ref = new Date(),
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diffDays = Math.round(
    (startOfDay(ref) - startOfDay(date)) / 86_400_000,
  );

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
  });
}

export function formatPrescriptionTitle(prescription: PrescriptionRecord): string {
  const meds = (prescription.medications ?? [])
    .map((med) => {
      const parts = [med.name, med.dosage].filter(Boolean);
      return parts.join(" ");
    })
    .filter(Boolean);

  if (meds.length > 0) return meds.join(", ");
  return prescription.diagnosis?.trim() || "Receta sin medicamentos";
}

export function formatLabOrderTitle(order: LabOrderRecord): string {
  const exams = (order.exams ?? []).map((exam) => exam.exam).filter(Boolean);
  if (exams.length > 0) return exams.join(", ");
  return "Orden de laboratorio";
}

export function formatReferralTitle(referral: ReferralRecord): string {
  return `${referral.specialty} → ${referral.receivingDoctorName}`;
}

export function formatInvoiceTitle(invoice: ClinicalInvoice): string {
  return invoice.documentNumber?.trim() || `Factura ${invoice.id.slice(0, 8)}`;
}
