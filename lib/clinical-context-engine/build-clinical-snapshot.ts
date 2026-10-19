/**
 * Clinical Context Engine — deterministic snapshot builder (Sprint 1).
 * Pure function · no I/O · no UI · no generative AI.
 */

import {
  CLINICAL_CONTEXT_ENGINE_GOVERNANCE,
  CLINICAL_CONTEXT_ENGINE_VERSION,
  type ClinicalContextEngineInput,
  type ClinicalContextGap,
  type ClinicalContextPriority,
  type ClinicalSnapshot,
} from "./types";

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function buildEncounterSummary(input: {
  name: string | null;
  problems: string[];
  reason: string | null;
  phase: string | null;
  status: string | null;
}): string {
  const who = input.name?.trim() || "Paciente";
  const status = input.status?.trim() || "sin estado";
  const phase = input.phase?.trim() || "fase no definida";
  const reason = input.reason?.trim();
  const problems =
    input.problems.length > 0
      ? input.problems.slice(0, 3).join(", ")
      : "sin problemas activos registrados";
  const reasonPart = reason ? ` Motivo: ${reason}.` : "";
  return `${who} · encuentro ${status} · ${phase} · problemas: ${problems}.${reasonPart}`;
}

function buildPriorities(input: {
  pendingCount: number;
  gaps: ClinicalContextGap[];
  dictationActive: boolean;
  dictationDraftLength: number;
  problemsCount: number;
}): ClinicalContextPriority[] {
  const priorities: ClinicalContextPriority[] = [];

  const criticalGaps = input.gaps.filter((g) => g.severity === "critical");
  if (criticalGaps.length > 0) {
    priorities.push({
      id: "priority-critical-gaps",
      label: "Completar información crítica",
      reason: criticalGaps.map((g) => g.message).join(" · "),
      urgency: "critical",
    });
  }

  if (input.pendingCount > 0) {
    priorities.push({
      id: "priority-pending-actions",
      label: "Revisar acciones pendientes",
      reason: `${input.pendingCount} acción(es) pendiente(s) de decisión médica (HITL).`,
      urgency: "attention",
    });
  }

  if (input.dictationActive || input.dictationDraftLength > 0) {
    priorities.push({
      id: "priority-dictation-buffer",
      label: "Revisar buffer de dictado",
      reason:
        input.dictationDraftLength > 0
          ? `Hay ${input.dictationDraftLength} caracteres en el buffer (no escrito en EMR).`
          : "Dictado activo — revisar antes de cerrar.",
      urgency: "attention",
    });
  }

  if (input.problemsCount === 0 && criticalGaps.length === 0) {
    priorities.push({
      id: "priority-document-problems",
      label: "Registrar problemas activos",
      reason: "Sin problemas activos en Encounter Memory para este encuentro.",
      urgency: "routine",
    });
  }

  return priorities;
}

function buildGaps(input: {
  problems: string[];
  reason: string | null;
  vitals: string | null;
  allergies: string[];
  encounterStatus: string | null;
}): ClinicalContextGap[] {
  const gaps: ClinicalContextGap[] = [];

  if (input.problems.length === 0) {
    gaps.push({
      id: "gap-active-problems",
      field: "active_problems",
      message: "Faltan problemas activos en el contexto del encuentro.",
      severity: "warning",
    });
  }

  if (!input.reason?.trim()) {
    gaps.push({
      id: "gap-consultation-reason",
      field: "consultation_reason",
      message: "Motivo de consulta no disponible en el contexto.",
      severity: "warning",
    });
  }

  if (!input.vitals?.trim()) {
    gaps.push({
      id: "gap-vitals",
      field: "vital_signs",
      message: "Signos vitales no resumidos en el contexto actual.",
      severity: "info",
    });
  }

  if (input.allergies.length === 0) {
    gaps.push({
      id: "gap-allergies",
      field: "allergies",
      message: "Alergias no aportadas al contexto (puede ser vacío real).",
      severity: "info",
    });
  }

  if (!input.encounterStatus?.trim()) {
    gaps.push({
      id: "gap-encounter-status",
      field: "encounter_status",
      message: "Estado del encuentro no definido en Encounter Memory.",
      severity: "critical",
    });
  }

  return gaps;
}

/**
 * Builds the shared Clinical Snapshot from Encounter Memory + optional supplements.
 * Fail-closed: never invents diagnoses or clinical authority.
 */
export function buildClinicalSnapshot(
  input: ClinicalContextEngineInput,
): ClinicalSnapshot {
  const { memory } = input;
  const supplement = input.supplement ?? {};

  const activeProblems = uniqueNonEmpty(memory.activeProblems);
  const medications = uniqueNonEmpty(supplement.medications ?? []);
  const allergies = uniqueNonEmpty(supplement.allergies ?? []);
  const consultationReason =
    supplement.consultationReason?.trim() || null;
  const vitalSignsSummary =
    supplement.vitalSignsSummary?.trim() || null;

  const sources: ClinicalSnapshot["sources"] = ["encounter-memory"];
  if (allergies.length > 0) sources.push("allergies");
  if (medications.length > 0) sources.push("medications");
  if (vitalSignsSummary) sources.push("vitals");
  if (consultationReason) sources.push("consultation-reason");

  const missingCritical = buildGaps({
    problems: activeProblems,
    reason: consultationReason,
    vitals: vitalSignsSummary,
    allergies,
    encounterStatus: memory.encounterStatus,
  });

  const priorities = buildPriorities({
    pendingCount: memory.pendingActions.length,
    gaps: missingCritical,
    dictationActive: Boolean(memory.dictationBufferRef?.active),
    dictationDraftLength: memory.dictationBufferRef?.draftLength ?? 0,
    problemsCount: activeProblems.length,
  });

  return {
    version: CLINICAL_CONTEXT_ENGINE_VERSION,
    authorityClass: CLINICAL_CONTEXT_ENGINE_GOVERNANCE.authorityClass,
    generatedAt: memory.updatedAt,
    consultationId: memory.consultationId,
    patientId: memory.patientId,
    encounterSummary: buildEncounterSummary({
      name: memory.patientContext.name,
      problems: activeProblems,
      reason: consultationReason,
      phase: memory.workflowPhase,
      status: memory.encounterStatus,
    }),
    patientContext: {
      name: memory.patientContext.name,
      age: memory.patientContext.age,
      sex: memory.patientContext.sex,
      encounterStatus: memory.encounterStatus,
    },
    activeProblems,
    medications,
    allergies,
    vitalSignsSummary,
    consultationReason,
    workflowPhase: memory.workflowPhase,
    priorities,
    pendingActions: memory.pendingActions.map((a) => ({
      id: a.id,
      status: a.status,
    })),
    missingCritical,
    encounterDecisions: memory.encounterDecisions.map((d) => ({
      id: d.id,
      summary: d.summary,
      status: d.status,
    })),
    sources,
  };
}
