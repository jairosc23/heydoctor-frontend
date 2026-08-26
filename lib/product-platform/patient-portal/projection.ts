/**
 * Epic 6 — Patient Portal.
 * Product Platform. Derives one patient consult from a ContinuityPackage.
 * Does not write Core. Does not re-enter COD, Completion, or Settlement.
 */

import { loadContinuityPackage } from "../../patient-care-continuity";
import type { ContinuityPackage } from "../../patient-care-continuity";
import {
  PORTAL_DOCUMENT_KIND_NONE,
  PORTAL_DOCUMENT_KIND_PRESCRIPTION,
  PORTAL_DOCUMENT_KIND_VISIT_SUMMARY,
  PortalEncounterViewError,
  type PortalDeliveryStatus,
  type PortalDocument,
  type PortalDocumentKind,
  type PortalEncounterMetrics,
  type PortalEncounterView,
} from "./types";

export type PortalEncounterLoadPorts = NonNullable<
  Parameters<typeof loadContinuityPackage>[0]["ports"]
>;

function zeroMetrics(): PortalEncounterMetrics {
  return {
    portalEncounterAvailable: 0,
    portalHandoffPresent: 0,
    portalDocumentDelivered: 0,
    portalDocumentKind: PORTAL_DOCUMENT_KIND_NONE,
    portalCommerciallyPaid: 0,
  };
}

function unavailableView(encounterId: string): PortalEncounterView {
  return {
    kind: "portal_encounter_view",
    encounterId,
    asOf: null,
    availability: "unavailable",
    encounter: { present: false, status: null },
    delivery: { status: "ausente" },
    document: null,
    commercial: {
      settlementPresent: false,
      settlementId: null,
      isPaid: false,
    },
    metrics: zeroMetrics(),
  };
}

function certifiedDocumentKind(
  kind: string | null,
): PortalDocumentKind | null {
  if (kind === "prescription" || kind === "visit_summary") return kind;
  return null;
}

function documentKindMetric(kind: PortalDocumentKind | null): number {
  if (kind === "visit_summary") return PORTAL_DOCUMENT_KIND_VISIT_SUMMARY;
  if (kind === "prescription") return PORTAL_DOCUMENT_KIND_PRESCRIPTION;
  return PORTAL_DOCUMENT_KIND_NONE;
}

function deliveryStatus(pkg: ContinuityPackage): PortalDeliveryStatus {
  if (!pkg.clinicalHandoff.present) return "ausente";
  if (pkg.clinicalHandoff.deliveredAt != null) return "entregado";
  return "pendiente_de_entrega";
}

function documentFrom(pkg: ContinuityPackage): PortalDocument | null {
  if (!pkg.clinicalHandoff.present) return null;
  if (pkg.clinicalHandoff.deliveredAt == null) return null;
  const documentKind = certifiedDocumentKind(
    pkg.clinicalHandoff.documentKind,
  );
  if (!documentKind) return null;
  const clinicalActId = pkg.clinicalHandoff.clinicalActId.trim();
  const deliveredAt = pkg.clinicalHandoff.deliveredAt.trim();
  if (!clinicalActId || !deliveredAt) return null;
  return {
    clinicalActId,
    documentKind,
    deliveredAt,
    completionState: pkg.clinicalHandoff.state,
  };
}

function metricsFrom(pkg: ContinuityPackage): PortalEncounterMetrics {
  const handoffPresent = pkg.clinicalHandoff.present;
  const kind = handoffPresent
    ? certifiedDocumentKind(pkg.clinicalHandoff.documentKind)
    : null;
  const delivered =
    handoffPresent && pkg.clinicalHandoff.deliveredAt != null ? 1 : 0;
  return {
    portalEncounterAvailable: 1,
    portalHandoffPresent: handoffPresent ? 1 : 0,
    portalDocumentDelivered: delivered,
    portalDocumentKind: documentKindMetric(kind),
    portalCommerciallyPaid:
      pkg.operationalContext.present && pkg.operationalContext.isPaid ? 1 : 0,
  };
}

/**
 * Pure derivation. Same ContinuityPackage always yields the same view.
 * Never writes. Never uses the clock.
 */
export function projectPortalEncounterView(
  pkg: ContinuityPackage,
): PortalEncounterView {
  if (pkg.kind !== "continuity_package_projection") {
    throw new PortalEncounterViewError(
      "PortalEncounterView must be derived from a ContinuityPackage",
    );
  }
  const encounterId = pkg.encounterId.trim();
  const asOf = pkg.asOf.trim();
  if (!encounterId || !asOf) {
    throw new PortalEncounterViewError(
      "PortalEncounterView requires encounterId and the package asOf",
    );
  }

  const encounterStatus = pkg.operationalContext.present
    ? pkg.operationalContext.encounterStatus.trim()
    : "";
  const settlementId = pkg.operationalContext.present
    ? pkg.operationalContext.settlementId
    : null;
  const isPaid = pkg.operationalContext.present
    ? pkg.operationalContext.isPaid
    : false;

  return {
    kind: "portal_encounter_view",
    encounterId,
    asOf,
    availability: "available",
    encounter: {
      present: encounterStatus.length > 0,
      status: encounterStatus.length > 0 ? encounterStatus : null,
    },
    delivery: { status: deliveryStatus(pkg) },
    document: documentFrom(pkg),
    commercial: {
      settlementPresent: settlementId != null,
      settlementId,
      isPaid,
    },
    metrics: metricsFrom(pkg),
  };
}

export async function loadPortalEncounterView(input: {
  encounterId: string;
  asOf?: string;
  ports?: PortalEncounterLoadPorts;
}): Promise<PortalEncounterView> {
  const encounterId = input.encounterId.trim();
  if (!encounterId) {
    return unavailableView(input.encounterId.trim());
  }
  try {
    const pkg = await loadContinuityPackage({
      encounterId,
      asOf: input.asOf,
      ports: input.ports,
    });
    return projectPortalEncounterView(pkg);
  } catch {
    return unavailableView(encounterId);
  }
}
