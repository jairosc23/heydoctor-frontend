export const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  in_progress: "En progreso",
  completed: "Completada",
  signed: "Firmada",
  locked: "Bloqueada",
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  draft: "bg-slate-400",
  in_progress: "bg-sky-600",
  completed: "bg-green-600",
  signed: "bg-violet-600",
  locked: "bg-red-600",
};

export const NEXT_STATUS: Record<string, string> = {
  draft: "in_progress",
  in_progress: "completed",
};

export const NEXT_STATUS_LABELS: Record<string, string> = {
  draft: "Iniciar consulta",
  in_progress: "Marcar como completada",
};
