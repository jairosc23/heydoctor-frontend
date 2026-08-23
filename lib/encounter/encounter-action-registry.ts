/**
 * Encounter Header Action Registry — SSOT for toolbar + overflow.
 * Teleconsulta has one action: share-consultation (camera and "Compartir consulta").
 */

export type EncounterActionId =
  | "toggle-edit"
  | "copilot"
  | "doctor-dna"
  | "share-consultation"
  | "prescription"
  | "lab"
  | "pay"
  | "analyze-copilot"
  | "continuity"
  | "transition"
  | "invoice"
  | "pdf"
  | "delete";

export type EncounterActionPlacement = "toolbar" | "overflow";

export type EncounterActionContext = {
  isLocked: boolean;
  canPay: boolean;
  canToggleEdit: boolean;
  isEditing: boolean;
  hideModuleShortcuts: boolean;
  hideDocumentActions: boolean;
  hasPatientId: boolean;
  hasTransition: boolean;
  paymentStep: "idle" | "confirm";
  creatingPayment: boolean;
};

export type EncounterActionDef = {
  id: EncounterActionId;
  icon: string;
  placements: readonly EncounterActionPlacement[];
  testId?: string;
  label: string | ((ctx: EncounterActionContext) => string);
  visible: (ctx: EncounterActionContext) => boolean;
  disabled: (ctx: EncounterActionContext) => boolean;
};

export const SHARE_CONSULTATION_ACTION_ID = "share-consultation" as const;

export const ENCOUNTER_ACTIONS: readonly EncounterActionDef[] = [
  {
    id: "toggle-edit",
    icon: "✏️",
    placements: ["toolbar", "overflow"],
    testId: "encounter-header-toggle-edit",
    label: (ctx) => (ctx.isEditing ? "Cerrar edición" : "Editar consulta"),
    visible: (ctx) => ctx.canToggleEdit,
    disabled: (ctx) => ctx.isLocked,
  },
  {
    id: "copilot",
    icon: "✨",
    placements: ["toolbar"],
    label: "HeyDoctor Copilot",
    visible: () => true,
    disabled: () => false,
  },
  {
    id: "doctor-dna",
    icon: "🧠",
    placements: ["toolbar"],
    label: "Doctor DNA",
    visible: () => true,
    disabled: () => false,
  },
  {
    id: SHARE_CONSULTATION_ACTION_ID,
    icon: "📹",
    placements: ["toolbar", "overflow"],
    testId: "encounter-share-consultation",
    label: "Compartir consulta",
    visible: () => true,
    disabled: () => false,
  },
  {
    id: "prescription",
    icon: "💊",
    placements: ["toolbar"],
    label: "Recetas",
    visible: (ctx) => !ctx.hideModuleShortcuts,
    disabled: (ctx) => ctx.isLocked,
  },
  {
    id: "lab",
    icon: "🧪",
    placements: ["toolbar"],
    label: "Laboratorios",
    visible: (ctx) => !ctx.hideModuleShortcuts,
    disabled: (ctx) => ctx.isLocked,
  },
  {
    id: "pay",
    icon: "💳",
    placements: ["toolbar"],
    testId: "encounter-pay-trigger",
    label: "Pagar consulta",
    visible: (ctx) => ctx.canPay && !ctx.isLocked,
    disabled: (ctx) => ctx.creatingPayment,
  },
  {
    id: "analyze-copilot",
    icon: "✨",
    placements: ["overflow"],
    label: "Analizar con HeyDoctor Copilot",
    visible: () => true,
    disabled: (ctx) => ctx.isLocked,
  },
  {
    id: "continuity",
    icon: "🔁",
    placements: ["overflow"],
    testId: "encounter-open-continuity",
    label: "Continuity",
    visible: (ctx) => ctx.hasPatientId,
    disabled: () => false,
  },
  {
    id: "transition",
    icon: "▶",
    placements: ["overflow"],
    label: "Cambiar estado",
    visible: (ctx) => ctx.hasTransition,
    disabled: () => false,
  },
  {
    id: "invoice",
    icon: "🧾",
    placements: ["overflow"],
    label: "Generar factura",
    visible: (ctx) => !ctx.hideDocumentActions,
    disabled: (ctx) => ctx.isLocked,
  },
  {
    id: "pdf",
    icon: "📄",
    placements: ["overflow"],
    label: "Descargar PDF",
    visible: (ctx) => !ctx.hideDocumentActions,
    disabled: (ctx) => ctx.isLocked,
  },
  {
    id: "delete",
    icon: "🗑️",
    placements: ["overflow"],
    label: "Eliminar consulta…",
    visible: () => true,
    disabled: (ctx) => ctx.isLocked,
  },
];

export function resolveEncounterActions(
  ctx: EncounterActionContext,
  placement: EncounterActionPlacement,
): EncounterActionDef[] {
  return ENCOUNTER_ACTIONS.filter(
    (action) => action.placements.includes(placement) && action.visible(ctx),
  );
}

export function encounterActionLabel(
  action: EncounterActionDef,
  ctx: EncounterActionContext,
): string {
  return typeof action.label === "function" ? action.label(ctx) : action.label;
}

export function isShareConsultationAction(id: EncounterActionId): boolean {
  return id === SHARE_CONSULTATION_ACTION_ID;
}
