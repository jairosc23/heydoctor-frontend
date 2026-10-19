import type {
  ClinicalAssistPrefillDraft,
  TherapeuticPrefillDraftLike,
} from "./types";
import { emptyAssistanceContext } from "./types";

/**
 * Multi-origin adapter — produces ClinicalAssistPrefillDraft only.
 * Never mutates CompositionState (Ownership Principle).
 */
export function toClinicalAssistPrefillDraftFromTk(
  tk: TherapeuticPrefillDraftLike,
  actor: { doctorId: string; clinicId: string },
): ClinicalAssistPrefillDraft {
  return {
    sourceAssetType: "therapeutic_asset",
    sourceAssetId: tk.sourceAssetId,
    sourceRevisionId: tk.sourceRevisionId,
    cie10CodeId: tk.cie10CodeId ?? null,
    diagnosis: tk.diagnosis ?? null,
    medications: (tk.medications ?? []).map((m) => ({ ...m })),
    notes: tk.notes ?? null,
    therapeuticIntent: tk.therapeuticIntent ?? null,
    tags: [...(tk.tags ?? [])],
    assistanceProvenance: {
      kind: "therapeutic_assisted_composition",
      assetId: tk.sourceAssetId,
      revisionId: tk.sourceRevisionId,
      actorDoctorId: actor.doctorId,
      clinicId: actor.clinicId,
      occurredAt: new Date().toISOString(),
      assistanceApiVersion: "pr8-pacp-v1",
    },
    assistanceContext: emptyAssistanceContext(),
  };
}

/** Identity adapter for M1 protocol drafts already canonical. */
export function protocolDraftAsCanonical(
  draft: ClinicalAssistPrefillDraft,
): ClinicalAssistPrefillDraft {
  if (draft.sourceAssetType !== "clinical_protocol") {
    throw new Error("protocolDraftAsCanonical requires clinical_protocol");
  }
  return draft;
}
