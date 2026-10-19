/**
 * Epic 2 — Revenue Integrity Dashboard.
 * Product Platform. Consumes COD (Settlement via COD). Does not write Core.
 */

import {
  loadClinicalOperationsView,
  type ClinicalOperationsReadPorts,
} from "../../clinical-operations/read-model";
import type { ClinicalOperationsView } from "../../clinical-operations/types";
import { fetchConsultations } from "../../services/consultations";
import {
  RevenueIntegrityError,
  type RevenueIntegrityBucket,
  type RevenueIntegrityDashboard,
  type RevenueIntegrityItem,
  type RevenueIntegrityMetrics,
} from "./types";

export type RevenueIntegrityPorts = ClinicalOperationsReadPorts & {
  listEncounterIds: () => Promise<string[]>;
};

function emptyMetrics(): RevenueIntegrityMetrics {
  return {
    signedUnpaidCount: 0,
    verifiedWithoutInvoiceCount: 0,
    invoicedUnlockedCount: 0,
    lockAnomalyCount: 0,
    commerciallyLockedCount: 0,
    encountersScanned: 0,
    settlementAbsentCount: 0,
    unclassifiedCount: 0,
  };
}

export function classifyRevenueIntegrity(
  view: ClinicalOperationsView,
): RevenueIntegrityItem {
  const encounterStatus = view.encounter.present ? view.encounter.status : "";
  const isPaid = view.settlement.present ? view.settlement.isPaid : false;
  const settlementState = view.settlement.present ? view.settlement.state : null;
  const invoiceId = view.settlement.present ? view.settlement.invoiceId : null;
  const lockAnomalyFlag = view.settlement.present
    ? view.settlement.lockAnomaly
    : encounterStatus === "locked" && !isPaid;
  const settlementId = view.settlement.present
    ? view.settlement.settlementId
    : null;

  let bucket: RevenueIntegrityBucket = "unclassified";
  if (encounterStatus === "locked" && !isPaid) {
    bucket = "lock_anomaly";
  } else if (
    isPaid &&
    encounterStatus === "locked" &&
    settlementState === "locked" &&
    !lockAnomalyFlag
  ) {
    bucket = "commercially_locked";
  } else if (isPaid && invoiceId != null && settlementState !== "locked") {
    bucket = "invoiced";
  } else if (isPaid && invoiceId == null) {
    bucket = "payment_verified";
  } else if (encounterStatus === "signed" && !isPaid) {
    bucket = "signed_unpaid";
  }

  return {
    encounterId: view.encounterId,
    settlementId,
    asOf: view.asOf,
    encounterStatus,
    settlementState,
    isPaid,
    invoiceId,
    lockAnomaly: lockAnomalyFlag,
    bucket,
  };
}

function addMetric(
  metrics: RevenueIntegrityMetrics,
  item: RevenueIntegrityItem,
): void {
  if (item.bucket === "signed_unpaid") metrics.signedUnpaidCount += 1;
  if (item.bucket === "payment_verified") metrics.verifiedWithoutInvoiceCount += 1;
  if (item.bucket === "invoiced") metrics.invoicedUnlockedCount += 1;
  if (item.bucket === "lock_anomaly") metrics.lockAnomalyCount += 1;
  if (item.bucket === "commercially_locked") metrics.commerciallyLockedCount += 1;
  if (item.bucket === "unclassified") metrics.unclassifiedCount += 1;
  if (item.bucket === "signed_unpaid" && item.settlementId == null) {
    metrics.settlementAbsentCount += 1;
  }
}

export function projectRevenueIntegrityDashboard(
  views: ClinicalOperationsView[],
): RevenueIntegrityDashboard {
  const byEncounter = new Map<string, RevenueIntegrityItem>();
  const items: RevenueIntegrityItem[] = [];
  const metrics = emptyMetrics();
  metrics.encountersScanned = 0;

  for (const view of views) {
    const item = classifyRevenueIntegrity(view);
    const prior = byEncounter.get(item.encounterId);
    if (prior) {
      if (
        prior.settlementId !== item.settlementId ||
        prior.bucket !== item.bucket
      ) {
        throw new RevenueIntegrityError(
          "Revenue Integrity cannot mix Settlement identities or buckets for one Encounter",
        );
      }
      continue;
    }
    byEncounter.set(item.encounterId, item);
    items.push(item);
    metrics.encountersScanned += 1;
    addMetric(metrics, item);
  }

  return { kind: "revenue_integrity_dashboard", items, metrics };
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

export async function loadRevenueIntegrityDashboard(input: {
  ports?: Partial<RevenueIntegrityPorts>;
  asOf?: string;
} = {}): Promise<RevenueIntegrityDashboard> {
  const listEncounterIds =
    input.ports?.listEncounterIds ?? defaultListEncounterIds;
  const ids = await listEncounterIds();
  const views: ClinicalOperationsView[] = [];
  for (const encounterId of ids) {
    views.push(
      await loadClinicalOperationsView({
        encounterId,
        asOf: input.asOf,
        ports: input.ports,
      }),
    );
  }
  return projectRevenueIntegrityDashboard(views);
}
