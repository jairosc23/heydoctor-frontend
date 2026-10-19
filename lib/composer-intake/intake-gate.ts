import type {
  AssistanceProvenance,
  ClinicalAssistPrefillDraft,
  ClinicalAssistSourceAssetType,
} from "./types";
import { emptyAssistanceContext } from "./types";

export type IntakeGateErrorCode =
  | "intake_draft_invalid"
  | "ai_assist_reserved"
  | "assistance_evaluated_forbidden"
  | "provenance_kind_mismatch";

export class IntakeGateError extends Error {
  constructor(
    readonly reasonCode: IntakeGateErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "IntakeGateError";
  }
}

/**
 * Intake Gate — structural only. No clinical inference.
 * Adapters never call this against CompositionState.
 */
export function assertIntakeDraft(
  draft: ClinicalAssistPrefillDraft,
): ClinicalAssistPrefillDraft {
  if (!draft || typeof draft !== "object") {
    throw new IntakeGateError("intake_draft_invalid", "Invalid assist draft");
  }
  if (draft.sourceAssetType === "ai_assist") {
    throw new IntakeGateError(
      "ai_assist_reserved",
      "ai_assist is reserved — no M2 runtime",
    );
  }
  if (
    draft.sourceAssetType !== "clinical_protocol" &&
    draft.sourceAssetType !== "therapeutic_asset"
  ) {
    throw new IntakeGateError(
      "intake_draft_invalid",
      "Unknown sourceAssetType",
    );
  }
  if (!draft.sourceAssetId?.trim() || !draft.sourceRevisionId?.trim()) {
    throw new IntakeGateError(
      "intake_draft_invalid",
      "source ids required",
    );
  }
  if (!Array.isArray(draft.medications)) {
    throw new IntakeGateError(
      "intake_draft_invalid",
      "medications must be an array",
    );
  }

  const provenance = draft.assistanceProvenance;
  if (!provenance?.kind) {
    throw new IntakeGateError(
      "intake_draft_invalid",
      "assistanceProvenance required",
    );
  }
  assertProvenanceKindMatch(draft.sourceAssetType, provenance);

  const ctx = draft.assistanceContext ?? emptyAssistanceContext();
  if (ctx.evaluated !== false) {
    throw new IntakeGateError(
      "assistance_evaluated_forbidden",
      "assistanceContext.evaluated must be false",
    );
  }

  return {
    ...draft,
    assistanceContext: { ...ctx, evaluated: false },
  };
}

function assertProvenanceKindMatch(
  sourceAssetType: ClinicalAssistSourceAssetType,
  provenance: AssistanceProvenance,
): void {
  const expected = {
    clinical_protocol: "protocol_assisted_composition",
    therapeutic_asset: "therapeutic_assisted_composition",
  } as const;
  if (sourceAssetType === "ai_assist") {
    throw new IntakeGateError("ai_assist_reserved", "ai_assist reserved");
  }
  if (provenance.kind !== expected[sourceAssetType]) {
    throw new IntakeGateError(
      "provenance_kind_mismatch",
      "provenance kind mismatch",
    );
  }
}
