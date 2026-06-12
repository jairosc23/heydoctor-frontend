import type { OrderDisplayStatus } from "@/lib/orders-command-center";
import { cn } from "@/lib/utils";

export type ClinicalStatusKey =
  | "active"
  | "pending"
  | "completed"
  | "critical"
  | "draft"
  | "unexecuted";

export type ClinicalStatusPresentation = {
  key: ClinicalStatusKey;
  label: string;
  dot: string;
  badgeClass: string;
  accentClass: string;
};

export const CLINICAL_STATUS: Record<
  ClinicalStatusKey,
  ClinicalStatusPresentation
> = {
  active: {
    key: "active",
    label: "Activo",
    dot: "🟢",
    badgeClass:
      "clinical-status clinical-status--active border-emerald-200/80 bg-emerald-50 text-emerald-800",
    accentClass: "border-l-emerald-500/70",
  },
  pending: {
    key: "pending",
    label: "Pendiente",
    dot: "🟡",
    badgeClass:
      "clinical-status clinical-status--pending border-amber-200/80 bg-amber-50 text-amber-900",
    accentClass: "border-l-amber-500/70",
  },
  completed: {
    key: "completed",
    label: "Completado",
    dot: "🔵",
    badgeClass:
      "clinical-status clinical-status--completed border-sky-200/80 bg-sky-50 text-sky-900",
    accentClass: "border-l-sky-500/60",
  },
  critical: {
    key: "critical",
    label: "Crítico",
    dot: "🔴",
    badgeClass:
      "clinical-status clinical-status--critical border-red-200/80 bg-red-50 text-red-900",
    accentClass: "border-l-red-500/70",
  },
  draft: {
    key: "draft",
    label: "Borrador",
    dot: "⚪",
    badgeClass:
      "clinical-status clinical-status--draft border-slate-200 bg-slate-50 text-slate-600",
    accentClass: "border-l-slate-400/60",
  },
  unexecuted: {
    key: "unexecuted",
    label: "Sin ejecutar",
    dot: "⚪",
    badgeClass:
      "clinical-status clinical-status--unexecuted border-slate-200 bg-slate-50/90 text-slate-500",
    accentClass: "border-l-slate-300",
  },
};

export function getClinicalStatus(
  key: ClinicalStatusKey,
): ClinicalStatusPresentation {
  return CLINICAL_STATUS[key];
}

export function clinicalStatusBadgeClass(
  key: ClinicalStatusKey,
  className?: string,
): string {
  return cn(CLINICAL_STATUS[key].badgeClass, className);
}

export function orderStatusToClinical(
  status: OrderDisplayStatus,
): ClinicalStatusKey {
  if (status === "unexecuted") return "unexecuted";
  return status;
}

export function consultationStatusToClinical(
  status: string,
): ClinicalStatusKey {
  switch (status) {
    case "draft":
      return "draft";
    case "in_progress":
      return "active";
    case "completed":
    case "signed":
      return "completed";
    case "locked":
      return "critical";
    default:
      return "draft";
  }
}

export function autosaveStatusToClinical(
  status: "idle" | "pending" | "saving" | "saved" | "error",
): ClinicalStatusKey {
  if (status === "error") return "critical";
  if (status === "saving" || status === "pending") return "pending";
  if (status === "saved") return "completed";
  return "draft";
}

export function orderPriorityAccentClass(status: OrderDisplayStatus): string {
  return CLINICAL_STATUS[orderStatusToClinical(status)].accentClass;
}
