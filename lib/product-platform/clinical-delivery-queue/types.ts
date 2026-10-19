import type { ProductEpicContract, ProductEpicMetrics } from "../contract";

export type ClinicalDeliveryQueueItem = {
  encounterId: string;
  clinicalActId: string;
  documentKind: string | null;
  asOf: string;
};

export type ClinicalDeliveryQueueMetrics = ProductEpicMetrics & {
  encountersScanned: number;
  pendingDeliveryCount: number;
  skippedAbsentCompletion: number;
  skippedAlreadyDelivered: number;
  skippedOtherState: number;
  skippedIncoherent: number;
  pendingPrescriptionCount: number;
  pendingVisitSummaryCount: number;
};

export type ClinicalDeliveryQueue = {
  kind: "clinical_delivery_queue";
  items: ClinicalDeliveryQueueItem[];
  metrics: ClinicalDeliveryQueueMetrics;
};

export const CLINICAL_DELIVERY_QUEUE_CONTRACT: ProductEpicContract = {
  Objective:
    "List Encounters whose current clinical act is document_ready and not yet delivered.",
  Dependencies:
    "Read-only ClinicalOperationsView and ContinuityPackage. Encounter list for ids. No Core writes.",
  "Read Model":
    "One queue item per EncounterId + current ClinicalActId. Membership is document_ready and deliveredAt == null.",
  "No Writes":
    "Does not call run/ensure/observe/initiate/persist/save. Delivery remains on the certified Encounter UI.",
  PASS: ["PCC-Q1", "PCC-Q2", "PCC-Q3", "PCC-Q4", "PRODUCT-1", "PRODUCT-2"],
  Metrics: [
    "encountersScanned",
    "pendingDeliveryCount",
    "skippedAbsentCompletion",
    "skippedAlreadyDelivered",
    "skippedOtherState",
    "skippedIncoherent",
    "pendingPrescriptionCount",
    "pendingVisitSummaryCount",
  ],
};

export class ClinicalDeliveryQueueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClinicalDeliveryQueueError";
  }
}
