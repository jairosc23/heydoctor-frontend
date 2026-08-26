/**
 * Epic 4 — Pre-Visit Clinical Brief.
 * Product Platform. Derives one briefing from the last LongitudinalContinuityItem.
 * Does not write Core. Does not re-enter PCC or COD.
 */

import {
  loadLongitudinalContinuity,
  type LongitudinalContinuityPorts,
} from "../longitudinal-continuity";
import type { LongitudinalContinuityProjection } from "../longitudinal-continuity";
import {
  PreVisitClinicalBriefError,
  SOURCE_DOCUMENT_KIND_NONE,
  SOURCE_DOCUMENT_KIND_PRESCRIPTION,
  SOURCE_DOCUMENT_KIND_VISIT_SUMMARY,
  type PreVisitBriefOrigin,
  type PreVisitClinicalBrief,
  type PreVisitClinicalBriefMetrics,
} from "./types";

function emptyMetrics(): PreVisitClinicalBriefMetrics {
  return {
    briefAvailable: 0,
    briefEmpty: 1,
    sourceEncounterId: 0,
    sourceClinicalActPresent: 0,
    sourceDocumentKind: SOURCE_DOCUMENT_KIND_NONE,
    sourceDelivered: 0,
    sourceAsOf: 0,
  };
}

function documentKindMetric(
  kind: PreVisitBriefOrigin["documentKind"],
): number {
  if (kind === "prescription") return SOURCE_DOCUMENT_KIND_PRESCRIPTION;
  if (kind === "visit_summary") return SOURCE_DOCUMENT_KIND_VISIT_SUMMARY;
  return SOURCE_DOCUMENT_KIND_NONE;
}

function metricsFrom(origin: PreVisitBriefOrigin | null): PreVisitClinicalBriefMetrics {
  if (!origin) return emptyMetrics();
  return {
    briefAvailable: 1,
    briefEmpty: 0,
    sourceEncounterId: 1,
    sourceClinicalActPresent: origin.clinicalActId ? 1 : 0,
    sourceDocumentKind: documentKindMetric(origin.documentKind),
    sourceDelivered: origin.deliveredAt != null ? 1 : 0,
    sourceAsOf: 1,
  };
}

function copyOrigin(
  item: LongitudinalContinuityProjection["items"][number],
): PreVisitBriefOrigin {
  const asOf = item.asOf.trim();
  if (!asOf) {
    throw new PreVisitClinicalBriefError(
      `Pre-visit brief for ${item.encounterId} requires the item asOf`,
    );
  }
  return {
    encounterId: item.encounterId,
    asOf,
    clinicalActId: item.handoff === "present" ? item.clinicalActId : null,
    handoff: item.handoff,
    completionState: item.completionState,
    documentKind: item.documentKind,
    deliveredAt: item.deliveredAt,
    encounterStatus: null,
    settlementContext: null,
  };
}

export function projectPreVisitBrief(
  projection: LongitudinalContinuityProjection,
): PreVisitClinicalBrief {
  if (projection.kind !== "longitudinal_continuity_projection") {
    throw new PreVisitClinicalBriefError(
      "Pre-visit brief must be derived from a LongitudinalContinuityProjection",
    );
  }
  const patientId = projection.patientId.trim();
  if (!patientId) {
    throw new PreVisitClinicalBriefError("patientId is required");
  }
  const lastItem = projection.items[projection.items.length - 1];
  const origin = lastItem ? copyOrigin(lastItem) : null;
  return {
    kind: "pre_visit_clinical_brief",
    patientId,
    status: origin ? "ready" : "empty",
    origin,
    metrics: metricsFrom(origin),
  };
}

export async function loadPreVisitBrief(input: {
  patientId: string;
  asOf?: string;
  ports?: Partial<LongitudinalContinuityPorts>;
}): Promise<PreVisitClinicalBrief> {
  const projection = await loadLongitudinalContinuity({
    patientId: input.patientId,
    asOf: input.asOf,
    ports: input.ports,
  });
  return projectPreVisitBrief(projection);
}
