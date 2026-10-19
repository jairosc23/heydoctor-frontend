import {
  clinicalStatusBadgeClass,
  consultationStatusToClinical,
} from "@/lib/clinical-status-language";

export const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  in_progress: "En progreso",
  completed: "Completada",
  signed: "Firmada",
  locked: "Bloqueada",
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  draft: clinicalStatusBadgeClass("draft"),
  in_progress: clinicalStatusBadgeClass("active"),
  completed: clinicalStatusBadgeClass("completed"),
  signed: clinicalStatusBadgeClass("completed"),
  locked: clinicalStatusBadgeClass("critical"),
};

export function consultationStatusBadgeClass(status: string): string {
  return clinicalStatusBadgeClass(consultationStatusToClinical(status));
}

export const NEXT_STATUS: Record<string, string> = {
  draft: "in_progress",
  in_progress: "completed",
};

export const NEXT_STATUS_LABELS: Record<string, string> = {
  draft: "Iniciar consulta",
  in_progress: "Marcar como completada",
};
