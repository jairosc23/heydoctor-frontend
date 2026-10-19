/**
 * AEC-1 M4 — Liquid Clinical Workspace composition model (pure).
 * ConsultationWorkspace remains the shell of record (ADR-AEC1-001).
 * No clinical authority. No second workspace route.
 */

export type LiquidEncounterPhase =
  | "pre_encounter"
  | "active"
  | "closing"
  | "degraded";

export type LiquidClinicianRole = "doctor" | "steward" | "admin";

export type LiquidRegionId =
  | "context"
  | "work"
  | "assist"
  | "authority"
  | "interrupt";

export type LiquidRegionPlan = Record<
  LiquidRegionId,
  { visible: boolean; emphasis: "primary" | "secondary" | "collapsed" | "hidden" }
>;

/** Map consultation status strings to Liquid encounter phase. */
export function resolveLiquidEncounterPhase(input: {
  status?: string | null;
  degraded?: boolean;
  isSigned?: boolean;
  isLocked?: boolean;
}): LiquidEncounterPhase {
  if (input.degraded) return "degraded";
  const s = (input.status ?? "").toLowerCase();
  if (input.isSigned || input.isLocked || s === "signed" || s === "closed") {
    return "closing";
  }
  if (
    s === "scheduled" ||
    s === "pending" ||
    s === "waiting" ||
    s === "checked_in" ||
    s === "pre_visit"
  ) {
    return "pre_encounter";
  }
  return "active";
}

/**
 * Progressive disclosure / region plan by phase + role.
 * Work surface always remains usable (fail-closed assist never blocks documentation).
 */
export function planLiquidRegions(input: {
  phase: LiquidEncounterPhase;
  role: LiquidClinicianRole;
}): LiquidRegionPlan {
  const { phase, role } = input;
  if (role === "admin") {
    return {
      context: { visible: true, emphasis: "secondary" },
      work: { visible: false, emphasis: "hidden" },
      assist: { visible: false, emphasis: "hidden" },
      authority: { visible: false, emphasis: "hidden" },
      interrupt: { visible: true, emphasis: "secondary" },
    };
  }

  const stewardAssist =
    role === "steward"
      ? ({ visible: true, emphasis: "secondary" } as const)
      : undefined;

  switch (phase) {
    case "pre_encounter":
      return {
        context: { visible: true, emphasis: "primary" },
        work: { visible: true, emphasis: "secondary" },
        assist: stewardAssist ?? { visible: true, emphasis: "collapsed" },
        authority: { visible: false, emphasis: "hidden" },
        interrupt: { visible: true, emphasis: "secondary" },
      };
    case "closing":
      return {
        context: { visible: true, emphasis: "secondary" },
        work: { visible: true, emphasis: "primary" },
        assist: stewardAssist ?? { visible: true, emphasis: "collapsed" },
        authority: { visible: true, emphasis: "primary" },
        interrupt: { visible: true, emphasis: "secondary" },
      };
    case "degraded":
      return {
        context: { visible: true, emphasis: "primary" },
        work: { visible: true, emphasis: "primary" },
        assist: { visible: false, emphasis: "hidden" },
        authority: { visible: true, emphasis: "secondary" },
        interrupt: { visible: true, emphasis: "primary" },
      };
    case "active":
    default:
      return {
        context: { visible: true, emphasis: "secondary" },
        work: { visible: true, emphasis: "primary" },
        assist: stewardAssist ?? { visible: true, emphasis: "secondary" },
        authority: { visible: true, emphasis: "secondary" },
        interrupt: { visible: true, emphasis: "secondary" },
      };
  }
}

/** Urgency hierarchy — higher = earlier in interrupt/authority order. */
export const LIQUID_URGENCY_RANK = {
  safety_hab: 100,
  clinical_alert: 80,
  deterministic_intel: 60,
  model_suggestion: 40,
  ambient_analytics: 20,
} as const;

export type LiquidIntelSourceClass = "MODEL" | "DETERMINISTIC" | "ANALYTICAL";

export const LIQUID_AUTHORITY_ASSERTIONS = {
  singleWorkspaceShell: "ConsultationWorkspace" as const,
  noSecondWorkspaceRoute: true,
  copilotIsModelPlane: true,
  w5IsDeterministicPlane: true,
  habIsConfirmationAuthority: true,
  peCosGovernedMutation: true,
  assistNeverConfirmsOrEmits: true,
  liquidIsNotClinicalAuthority: true,
} as const;

export function liquidAssistDisclosure(
  phase: LiquidEncounterPhase,
): "hidden" | "collapsed" | "expanded" {
  if (phase === "degraded") return "hidden";
  if (phase === "pre_encounter" || phase === "closing") return "collapsed";
  return "expanded";
}
