import type { ContinuityHydrationDraft } from "./adapter";
import {
  sanitizeStructuralPayload,
  structuralPayloadHasForbiddenKeys,
} from "./structural-payload";
import type { PassiveContinuityHint } from "./types";

export class ContinuityHydrationError extends Error {
  constructor(
    readonly reasonCode:
      | "continuity_hydration_draft_invalid"
      | "continuity_payload_forbidden_field"
      | "continuity_hint_invalid",
    message: string,
  ) {
    super(message);
    this.name = "ContinuityHydrationError";
  }
}

/**
 * FE gate for Continuity/manual drafts (S3).
 * Does not replace validate-echo for clinical_protocol.
 */
export function assertContinuityHydrationDraft(
  draft: ContinuityHydrationDraft,
  hint: PassiveContinuityHint,
): ContinuityHydrationDraft {
  if (hint.actionableWithoutConfirmation !== false) {
    throw new ContinuityHydrationError(
      "continuity_hint_invalid",
      "Hints must not be actionable without confirmation",
    );
  }
  if (structuralPayloadHasForbiddenKeys(hint.structuralPayload)) {
    throw new ContinuityHydrationError(
      "continuity_payload_forbidden_field",
      "structuralPayload contains forbidden fields",
    );
  }
  const payload = sanitizeStructuralPayload(hint.structuralPayload ?? {});
  if (!payload?.medications?.length) {
    throw new ContinuityHydrationError(
      "continuity_hydration_draft_invalid",
      "medications required for Continuity hydrate",
    );
  }
  if (draft.cie10CodeId != null) {
    throw new ContinuityHydrationError(
      "continuity_hydration_draft_invalid",
      "cie10CodeId must remain null from Continuity hydrate",
    );
  }
  if (draft.sourceAssetType === "ai_assist") {
    throw new ContinuityHydrationError(
      "continuity_hint_invalid",
      "ai_assist forbidden",
    );
  }
  if (!draft.extensions?.continuityHintProvenance) {
    throw new ContinuityHydrationError(
      "continuity_hint_invalid",
      "authoritative HintProvenance required in extensions (S1)",
    );
  }
  if (draft.extensions.therapeuticAssetWireCompatOnly !== true) {
    throw new ContinuityHydrationError(
      "continuity_hint_invalid",
      "wire-compat flag required for Continuity drafts (S1)",
    );
  }
  return draft;
}
