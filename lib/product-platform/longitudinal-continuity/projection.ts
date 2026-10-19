/**
 * Epic 3 — Longitudinal Patient Continuity.
 * Product Platform. Aggregates ContinuityPackage by patientId. Does not write Core.
 */

import type { ClinicalOperationsReadPorts } from "../../clinical-operations/read-model";
import { loadContinuityPackage } from "../../patient-care-continuity/package";
import type { ContinuityPackage } from "../../patient-care-continuity/types";
import { fetchConsultations } from "../../services/consultations";
import {
  LongitudinalContinuityError,
  type LongitudinalContinuityItem,
  type LongitudinalContinuityMetrics,
  type LongitudinalContinuityProjection,
} from "./types";

export type LongitudinalContinuityPorts = ClinicalOperationsReadPorts & {
  listEncounterIds: (patientId: string) => Promise<string[]>;
};

function emptyMetrics(): LongitudinalContinuityMetrics {
  return {
    totalContinuityPackages: 0,
    activeClinicalActs: 0,
    absentHandOffCount: 0,
    deliveredDocumentCount: 0,
    visitSummaryCount: 0,
    prescriptionCount: 0,
  };
}

function requireAsOf(asOf: string, encounterId: string): string {
  const trimmed = asOf.trim();
  if (!trimmed) {
    throw new LongitudinalContinuityError(
      `Longitudinal item for ${encounterId} requires COD asOf`,
    );
  }
  return trimmed;
}

function toItem(
  patientId: string,
  pkg: ContinuityPackage,
): LongitudinalContinuityItem {
  const asOf = requireAsOf(pkg.asOf, pkg.encounterId);
  if (!pkg.clinicalHandoff.present) {
    return {
      patientId,
      encounterId: pkg.encounterId,
      asOf,
      clinicalActId: null,
      handoff: "absent",
      completionState: null,
      documentKind: null,
      deliveredAt: null,
    };
  }
  return {
    patientId,
    encounterId: pkg.encounterId,
    asOf,
    clinicalActId: pkg.clinicalHandoff.clinicalActId,
    handoff: "present",
    completionState: pkg.clinicalHandoff.state,
    documentKind:
      pkg.clinicalHandoff.documentKind === "prescription" ||
      pkg.clinicalHandoff.documentKind === "visit_summary"
        ? pkg.clinicalHandoff.documentKind
        : null,
    deliveredAt: pkg.clinicalHandoff.deliveredAt,
  };
}

function compareItems(
  a: LongitudinalContinuityItem,
  b: LongitudinalContinuityItem,
): number {
  if (a.asOf < b.asOf) return -1;
  if (a.asOf > b.asOf) return 1;
  if (a.encounterId < b.encounterId) return -1;
  if (a.encounterId > b.encounterId) return 1;
  return 0;
}

function dedupePackages(packages: ContinuityPackage[]): ContinuityPackage[] {
  const byEncounter = new Map<string, ContinuityPackage>();
  for (const pkg of packages) {
    const prior = byEncounter.get(pkg.encounterId);
    if (!prior) {
      byEncounter.set(pkg.encounterId, pkg);
      continue;
    }
    const priorAct = prior.clinicalHandoff.present
      ? prior.clinicalHandoff.clinicalActId
      : null;
    const nextAct = pkg.clinicalHandoff.present
      ? pkg.clinicalHandoff.clinicalActId
      : null;
    if (priorAct !== nextAct) {
      throw new LongitudinalContinuityError(
        "Longitudinal continuity cannot mix ClinicalActId for one Encounter",
      );
    }
    if (prior.asOf !== pkg.asOf) {
      throw new LongitudinalContinuityError(
        "Longitudinal continuity cannot mix COD asOf for one Encounter",
      );
    }
  }
  return [...byEncounter.values()];
}

function metricsFrom(
  items: LongitudinalContinuityItem[],
): LongitudinalContinuityMetrics {
  const metrics = emptyMetrics();
  metrics.totalContinuityPackages = items.length;
  for (const item of items) {
    if (item.handoff === "absent") {
      metrics.absentHandOffCount += 1;
      continue;
    }
    metrics.activeClinicalActs += 1;
    if (item.deliveredAt != null) metrics.deliveredDocumentCount += 1;
    if (item.documentKind === "visit_summary") metrics.visitSummaryCount += 1;
    if (item.documentKind === "prescription") metrics.prescriptionCount += 1;
  }
  return metrics;
}

export function projectLongitudinalContinuity(input: {
  patientId: string;
  packages: ContinuityPackage[];
}): LongitudinalContinuityProjection {
  const patientId = input.patientId.trim();
  if (!patientId) {
    throw new LongitudinalContinuityError("patientId is required");
  }
  const unique = dedupePackages(input.packages);
  const items = unique
    .map((pkg) => toItem(patientId, pkg))
    .sort(compareItems);
  return {
    kind: "longitudinal_continuity_projection",
    patientId,
    items,
    metrics: metricsFrom(items),
  };
}

async function defaultListEncounterIds(patientId: string): Promise<string[]> {
  const [signed, locked] = await Promise.all([
    fetchConsultations({ patientId, status: "signed", limit: 100 }),
    fetchConsultations({ patientId, status: "locked", limit: 100 }),
  ]);
  return [
    ...new Set(
      [...signed.data, ...locked.data]
        .map((row) => row.id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}

export async function loadLongitudinalContinuity(input: {
  patientId: string;
  asOf?: string;
  ports?: Partial<LongitudinalContinuityPorts>;
}): Promise<LongitudinalContinuityProjection> {
  const listEncounterIds =
    input.ports?.listEncounterIds ?? defaultListEncounterIds;
  const ids = await listEncounterIds(input.patientId);
  const packages: ContinuityPackage[] = [];
  for (const encounterId of ids) {
    packages.push(
      await loadContinuityPackage({
        encounterId,
        asOf: input.asOf,
        ports: input.ports,
      }),
    );
  }
  return projectLongitudinalContinuity({
    patientId: input.patientId,
    packages,
  });
}
