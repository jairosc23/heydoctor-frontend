/**
 * T1 — Continuity Hint → ClinicalAssistPrefillDraft (sole Composer hydrate contract).
 *
 * S1: sourceAssetType "therapeutic_asset" is wire-compat ONLY.
 * Authoritative provenance = hint.provenance (HintProvenance).
 *
 * Pure + idempotent: same (hint, ctx) → same draft fields (except none random).
 */

import type { ClinicalAssistPrefillDraft } from "@/lib/composer-intake";
import { emptyAssistanceContext } from "@/lib/composer-intake";
import { sanitizeStructuralPayload } from "./structural-payload";
import type { HintProvenance, PassiveContinuityHint } from "./types";

export type ContinuityHydrationActor = {
  actorDoctorId: string;
  clinicId: string;
  patientId: string;
};

export type ContinuityHydrationDraft = ClinicalAssistPrefillDraft & {
  /** FE-only bag — never sent on POST /prescriptions */
  extensions?: {
    continuityHintProvenance: HintProvenance;
    continuitySourceKind: PassiveContinuityHint["sourceKind"];
    /** S1 documentation flag */
    therapeuticAssetWireCompatOnly: true;
  };
};

function mapSourceIds(hint: PassiveContinuityHint): {
  sourceAssetType: ClinicalAssistPrefillDraft["sourceAssetType"];
  sourceAssetId: string;
  sourceRevisionId: string;
} {
  const p = hint.provenance;
  switch (p.kind) {
    case "protocol_assisted_hint":
      return {
        sourceAssetType: "clinical_protocol",
        sourceAssetId: p.protocolId,
        sourceRevisionId: p.protocolVersionId,
      };
    case "therapeutic_assisted_hint":
      return {
        sourceAssetType: "therapeutic_asset",
        sourceAssetId: p.tkAssetId,
        sourceRevisionId: p.revisionId,
      };
    case "continuity_active_medication":
    case "continuity_timeline_event":
      // S1 — therapeutic_asset wire-compat; authoritative kind in extensions
      return {
        sourceAssetType: "therapeutic_asset",
        sourceAssetId: `continuity:${p.chainId}`,
        sourceRevisionId: p.versionId,
      };
    case "manual_composer_seed":
      return {
        sourceAssetType: "therapeutic_asset",
        sourceAssetId: `manual:${hint.hintId}`,
        sourceRevisionId: hint.hintId,
      };
    default: {
      const _exhaustive: never = p;
      return _exhaustive;
    }
  }
}

function mapAssistanceProvenance(
  hint: PassiveContinuityHint,
  ctx: ContinuityHydrationActor,
): ClinicalAssistPrefillDraft["assistanceProvenance"] {
  const p = hint.provenance;
  if (p.kind === "protocol_assisted_hint") {
    return {
      kind: "protocol_assisted_composition",
      protocolId: p.protocolId,
      protocolVersionId: p.protocolVersionId,
      protocolVersionNumber: 0,
      contentHash: p.contentHash,
      actorDoctorId: ctx.actorDoctorId,
      clinicId: ctx.clinicId,
      occurredAt: p.occurredAt,
      assistanceApiVersion: "pr8-pacp-v1",
    };
  }
  if (p.kind === "therapeutic_assisted_hint") {
    return {
      kind: "therapeutic_assisted_composition",
      assetId: p.tkAssetId,
      revisionId: p.revisionId,
      actorDoctorId: ctx.actorDoctorId,
      clinicId: ctx.clinicId,
      occurredAt: p.occurredAt,
      assistanceApiVersion: "pr8-pacp-v1",
    };
  }
  // Continuity / manual → therapeutic wire shape (S1)
  const ids = mapSourceIds(hint);
  return {
    kind: "therapeutic_assisted_composition",
    assetId: ids.sourceAssetId,
    revisionId: ids.sourceRevisionId,
    actorDoctorId: ctx.actorDoctorId,
    clinicId: ctx.clinicId,
    occurredAt: p.occurredAt,
    assistanceApiVersion: "pr8-pacp-v1",
  };
}

/**
 * Pure adapter — never mutates CompositionState.
 */
export function toClinicalAssistPrefillDraftFromContinuityHint(
  hint: PassiveContinuityHint,
  ctx: ContinuityHydrationActor,
): ContinuityHydrationDraft {
  if (hint.actionableWithoutConfirmation !== false) {
    throw new Error("continuity_hint_invalid");
  }
  if (!hint.provenance) {
    throw new Error("continuity_hint_invalid");
  }

  const payload = sanitizeStructuralPayload(hint.structuralPayload ?? {});
  if (!payload?.medications?.length && !payload?.diagnosis && !payload?.notes) {
    // allow soft-ref-only only if meds/diagnosis/notes absent but refs present — still need clinical fields for hydrate
    if (!payload?.medications?.length) {
      throw new Error("continuity_hydration_draft_invalid");
    }
  }

  const ids = mapSourceIds(hint);
  const medications = (payload?.medications ?? []).map((m) => ({ ...m }));

  const draft: ContinuityHydrationDraft = {
    sourceAssetType: ids.sourceAssetType,
    sourceAssetId: ids.sourceAssetId,
    sourceRevisionId: ids.sourceRevisionId,
    cie10CodeId: null,
    diagnosis: payload?.diagnosis ?? null,
    medications,
    notes: payload?.notes ?? null,
    therapeuticIntent: null,
    tags: [],
    assistanceProvenance: mapAssistanceProvenance(hint, ctx),
    assistanceContext: emptyAssistanceContext(),
    extensions: {
      continuityHintProvenance: hint.provenance,
      continuitySourceKind: hint.sourceKind,
      therapeuticAssetWireCompatOnly: true,
    },
  };

  return draft;
}
