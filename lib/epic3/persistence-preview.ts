/**
 * EPIC-3 UC-04C — Persistence Preview (Close Flow, preview_only).
 *
 * Builds the structured payload that would be sent to H3 persistence
 * using only UC-04B accepted/edited blocks. Never executes H3, never
 * writes EMR, never mutates Consultation, never calls AI assist.
 *
 * Naming avoids Daily Hub forbidden API token "governed-" in surfaces;
 * this module is the local preview composer (not a Lab depth engine).
 */

import type { ClinicalFoundationProvenance } from "@/lib/types/clinical-foundation";
import { EPIC3_HITL_ACTS } from "./architecture-contract";
import {
  itemReadyForPersistence,
  summarizeReviewSelection,
  type ReviewDecision,
  type ReviewH1Status,
  type ReviewSelectableItem,
  type ReviewSelectableKind,
  type ReviewSelectionState,
} from "./review-selection";

export const PERSISTENCE_PREVIEW_SCHEMA_VERSION = "1.0.0" as const;

export type PersistencePreviewProvenance = {
  origin: "epic3_session";
  sourceUc: ReviewSelectableItem["sourceUc"];
  sectionId: ReviewSelectableItem["sectionId"];
  kind: ReviewSelectableKind;
  decision: ReviewDecision;
  label: string;
  /** Foundation provenance ids when relevant (snapshot / memory). */
  foundationProvenanceIds: string[];
};

export type PersistencePreviewBlock = {
  id: string;
  kind: ReviewSelectableKind;
  sourceUc: ReviewSelectableItem["sourceUc"];
  sectionId: ReviewSelectableItem["sectionId"];
  label: string;
  decision: ReviewDecision;
  text: string;
  sourceText: string;
  aiRunId: string | null;
  /** Present for schema compatibility; null when assist did not emit it. */
  promptVersion: string | null;
  h1Status: ReviewH1Status;
  provenance: PersistencePreviewProvenance;
  /** Only accepted|edited (+ H1 ready) enter the candidate payload. */
  includedInPersistencePayload: boolean;
};

export type PersistencePreviewCandidateItem = {
  id: string;
  kind: ReviewSelectableKind;
  sourceUc: ReviewSelectableItem["sourceUc"];
  decision: "accepted" | "edited";
  text: string;
  sourceText: string;
  aiRunId: string | null;
  promptVersion: string | null;
  h1Status: ReviewH1Status;
  provenance: PersistencePreviewProvenance;
};

/**
 * Structured preview of the payload that would be sent at H3.
 * requestedAction is always preview_only — never persist.
 */
export type PersistencePreviewPayload = {
  schemaVersion: typeof PERSISTENCE_PREVIEW_SCHEMA_VERSION;
  previewId: string;
  sessionId: string | null;
  consultationId: string | null;
  requestedAction: "preview_only";
  hitl: {
    /** UC-04B decisions feeding this preview. */
    h1ReviewAi: typeof EPIC3_HITL_ACTS.H1_REVIEW_AI;
    /** Next human gate before H3 (not executed in UC-04C). */
    h2ApproveAction: typeof EPIC3_HITL_ACTS.H2_APPROVE_ACTION;
    h2Status: "not_executed";
    /** Writer act — preview only; execution deferred. */
    h3Persistence: typeof EPIC3_HITL_ACTS.H3_GOVERNED_PERSISTENCE;
    h3Status: "preview_only_not_executed";
  };
  /** All review blocks for physician visibility (incl. discarded/pending). */
  blocks: PersistencePreviewBlock[];
  /** Subset that would be sent to H3 after H2. */
  persistenceCandidate: {
    itemCount: number;
    items: PersistencePreviewCandidateItem[];
  };
  summary: {
    accepted: number;
    edited: number;
    discarded: number;
    pending: number;
    total: number;
    selectedForPersistence: number;
  };
  governance: {
    requiresPhysicianReview: true;
    executesAction: false;
    autoPersistedToEmr: false;
    draftApproved: false;
    runsGovernedPersistence: false;
    persistsToEmr: false;
    writeAttempted: false;
    writeExecuted: false;
  };
  readOnly: true;
  generatedAt: string;
};

function foundationIdsForItem(
  item: ReviewSelectableItem,
  foundationProvenance: ClinicalFoundationProvenance[] | null | undefined,
): string[] {
  if (!foundationProvenance?.length) return [];
  if (item.kind !== "snapshot_section") return [];
  const sectionKey = item.id.replace(/^snap:/, "");
  return foundationProvenance
    .filter((p) => {
      const hay = `${p.kind} ${p.field ?? ""} ${p.label}`.toLowerCase();
      if (sectionKey.includes("medic") && hay.includes("medic")) return true;
      if (sectionKey.includes("problema") || sectionKey.includes("diagnost")) {
        return (
          hay.includes("memory") ||
          hay.includes("condition") ||
          hay.includes("diagnos")
        );
      }
      if (sectionKey.includes("vital")) return hay.includes("vital");
      if (sectionKey.includes("alerg")) return hay.includes("allerg");
      return p.kind === "clinical_memory" || p.kind === "consultation";
    })
    .map((p) => p.id)
    .slice(0, 8);
}

function toBlock(
  item: ReviewSelectableItem,
  foundationProvenance: ClinicalFoundationProvenance[] | null | undefined,
  promptVersionByAiRunId: Record<string, string | null> | null | undefined,
): PersistencePreviewBlock {
  const promptVersion =
    item.promptVersion ??
    (item.aiRunId ? promptVersionByAiRunId?.[item.aiRunId] : null) ??
    null;
  const withPrompt = { ...item, promptVersion };
  const included = itemReadyForPersistence(withPrompt);
  const provenance: PersistencePreviewProvenance = {
    origin: "epic3_session",
    sourceUc: item.sourceUc,
    sectionId: item.sectionId,
    kind: item.kind,
    decision: item.decision,
    label: item.label,
    foundationProvenanceIds: foundationIdsForItem(item, foundationProvenance),
  };
  return {
    id: item.id,
    kind: item.kind,
    sourceUc: item.sourceUc,
    sectionId: item.sectionId,
    label: item.label,
    decision: item.decision,
    text: item.displayText,
    sourceText: item.sourceText,
    aiRunId: item.aiRunId,
    promptVersion,
    h1Status: item.h1Status,
    provenance,
    includedInPersistencePayload: included,
  };
}

export function buildPersistencePreview(input: {
  reviewState: ReviewSelectionState | null;
  consultationId?: string | null;
  foundationProvenance?: ClinicalFoundationProvenance[] | null;
  /** Optional map from existing AI governance metadata (no new AI calls). */
  promptVersionByAiRunId?: Record<string, string | null> | null;
  generatedAt?: string;
}): PersistencePreviewPayload {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const sessionId = input.reviewState?.sessionId ?? null;
  const summary = summarizeReviewSelection(input.reviewState);
  const blocks = (input.reviewState?.items ?? []).map((item) =>
    toBlock(
      item,
      input.foundationProvenance,
      input.promptVersionByAiRunId,
    ),
  );
  const candidateItems: PersistencePreviewCandidateItem[] = blocks
    .filter((b) => b.includedInPersistencePayload)
    .map((b) => ({
      id: b.id,
      kind: b.kind,
      sourceUc: b.sourceUc,
      decision: b.decision as "accepted" | "edited",
      text: b.text,
      sourceText: b.sourceText,
      aiRunId: b.aiRunId,
      promptVersion: b.promptVersion,
      h1Status: b.h1Status,
      provenance: b.provenance,
    }));

  const previewId = sessionId
    ? `pp_${sessionId}_${generatedAt.replace(/[:.]/g, "")}`
    : `pp_nosession_${generatedAt.replace(/[:.]/g, "")}`;

  return {
    schemaVersion: PERSISTENCE_PREVIEW_SCHEMA_VERSION,
    previewId,
    sessionId,
    consultationId: input.consultationId ?? null,
    requestedAction: "preview_only",
    hitl: {
      h1ReviewAi: EPIC3_HITL_ACTS.H1_REVIEW_AI,
      h2ApproveAction: EPIC3_HITL_ACTS.H2_APPROVE_ACTION,
      h2Status: "not_executed",
      h3Persistence: EPIC3_HITL_ACTS.H3_GOVERNED_PERSISTENCE,
      h3Status: "preview_only_not_executed",
    },
    blocks,
    persistenceCandidate: {
      itemCount: candidateItems.length,
      items: candidateItems,
    },
    summary: {
      ...summary,
      selectedForPersistence: candidateItems.length,
    },
    governance: {
      requiresPhysicianReview: true,
      executesAction: false,
      autoPersistedToEmr: false,
      draftApproved: false,
      runsGovernedPersistence: false,
      persistsToEmr: false,
      writeAttempted: false,
      writeExecuted: false,
    },
    readOnly: true,
    generatedAt,
  };
}
