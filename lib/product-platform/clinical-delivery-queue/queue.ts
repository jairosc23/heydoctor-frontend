/**
 * Epic 1 — Clinical Delivery Queue.
 * Product Platform. Consumes Core. Does not write Core.
 */

import type { ClinicalOperationsReadPorts } from "../../clinical-operations/read-model";
import { loadContinuityPackage } from "../../patient-care-continuity/package";
import type { ContinuityPackage } from "../../patient-care-continuity/types";
import { ContinuityHandoffError } from "../../patient-care-continuity/types";
import { fetchConsultations } from "../../services/consultations";
import {
  ClinicalDeliveryQueueError,
  type ClinicalDeliveryQueue,
  type ClinicalDeliveryQueueItem,
  type ClinicalDeliveryQueueMetrics,
} from "./types";

export type ClinicalDeliveryQueuePorts = ClinicalOperationsReadPorts & {
  listEncounterIds: () => Promise<string[]>;
};

function emptyMetrics(): ClinicalDeliveryQueueMetrics {
  return {
    encountersScanned: 0,
    pendingDeliveryCount: 0,
    skippedAbsentCompletion: 0,
    skippedAlreadyDelivered: 0,
    skippedOtherState: 0,
    skippedIncoherent: 0,
    pendingPrescriptionCount: 0,
    pendingVisitSummaryCount: 0,
  };
}

function isPendingDelivery(pkg: ContinuityPackage): boolean {
  return (
    pkg.clinicalHandoff.present &&
    pkg.clinicalHandoff.state === "document_ready" &&
    pkg.clinicalHandoff.deliveredAt == null
  );
}

function dedupeCurrentActs(
  packages: ContinuityPackage[],
): ContinuityPackage[] {
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
    if (priorAct && nextAct && priorAct !== nextAct) {
      throw new ClinicalDeliveryQueueError(
        "Clinical Delivery Queue cannot mix clinical acts",
      );
    }
  }
  return [...byEncounter.values()];
}

/**
 * Pure read model. Same ContinuityPackages yield the same queue and metrics.
 */
export function projectClinicalDeliveryQueue(
  packages: ContinuityPackage[],
  extras: { skippedIncoherent?: number } = {},
): ClinicalDeliveryQueue {
  const unique = dedupeCurrentActs(packages);
  const metrics = emptyMetrics();
  metrics.encountersScanned = unique.length;
  metrics.skippedIncoherent = extras.skippedIncoherent ?? 0;

  const items: ClinicalDeliveryQueueItem[] = [];
  for (const pkg of unique) {
    if (!pkg.clinicalHandoff.present) {
      metrics.skippedAbsentCompletion += 1;
      continue;
    }
    if (pkg.clinicalHandoff.deliveredAt != null) {
      metrics.skippedAlreadyDelivered += 1;
      continue;
    }
    if (pkg.clinicalHandoff.state !== "document_ready") {
      metrics.skippedOtherState += 1;
      continue;
    }
    items.push({
      encounterId: pkg.encounterId,
      clinicalActId: pkg.clinicalHandoff.clinicalActId,
      documentKind: pkg.clinicalHandoff.documentKind,
      asOf: pkg.asOf,
    });
    if (pkg.clinicalHandoff.documentKind === "prescription") {
      metrics.pendingPrescriptionCount += 1;
    } else if (pkg.clinicalHandoff.documentKind === "visit_summary") {
      metrics.pendingVisitSummaryCount += 1;
    }
  }
  metrics.pendingDeliveryCount = items.length;
  return { kind: "clinical_delivery_queue", items, metrics };
}

async function defaultListEncounterIds(): Promise<string[]> {
  const [signed, locked] = await Promise.all([
    fetchConsultations({ status: "signed", limit: 100 }),
    fetchConsultations({ status: "locked", limit: 100 }),
  ]);
  return [
    ...new Set(
      [...signed.data, ...locked.data]
        .map((row) => row.id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}

export async function loadClinicalDeliveryQueue(input: {
  ports?: Partial<ClinicalDeliveryQueuePorts>;
  asOf?: string;
} = {}): Promise<ClinicalDeliveryQueue> {
  const listEncounterIds =
    input.ports?.listEncounterIds ?? defaultListEncounterIds;
  const ids = await listEncounterIds();
  const packages: ContinuityPackage[] = [];
  let skippedIncoherent = 0;
  for (const encounterId of ids) {
    try {
      packages.push(
        await loadContinuityPackage({
          encounterId,
          asOf: input.asOf,
          ports: input.ports,
        }),
      );
    } catch (error) {
      if (error instanceof ContinuityHandoffError) {
        skippedIncoherent += 1;
        continue;
      }
      throw error;
    }
  }
  return projectClinicalDeliveryQueue(packages, { skippedIncoherent });
}
