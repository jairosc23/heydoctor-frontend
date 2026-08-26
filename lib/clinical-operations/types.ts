/**
 * Clinical Operations Projection — read model only.
 *
 * COD is not a write domain. It does not own Encounter, ClinicalAct, or
 * Settlement identity. The view is keyed by EncounterId and stamped with one
 * logical instant (asOf).
 */

import type { ClinicalActAuditChain } from "../clinical-completion/types";
import type { CommercialSettlementAuditChain } from "../commercial-settlement/types";

export type ClinicalOperationsEncounterSlice =
  | { present: false }
  | {
      present: true;
      encounterId: string;
      status: string;
      updatedAt: string | null;
    };

export type ClinicalOperationsCompletionSlice =
  | { present: false }
  | {
      present: true;
      clinicalActId: string;
      state: string;
      documentKind: string | null;
      deliveredAt: string | null;
      audit: ClinicalActAuditChain;
    };

export type ClinicalOperationsSettlementSlice =
  | { present: false }
  | {
      present: true;
      settlementId: string;
      state: string;
      isPaid: boolean;
      invoiceId: string | null;
      lockAnomaly: boolean;
      audit: CommercialSettlementAuditChain;
    };

export type ClinicalOperationsView = {
  kind: "clinical_operations_projection";
  encounterId: string;
  /** Single logical instant for the entire view (COD-9). */
  asOf: string;
  encounter: ClinicalOperationsEncounterSlice;
  completion: ClinicalOperationsCompletionSlice;
  settlement: ClinicalOperationsSettlementSlice;
};

export class ClinicalOperationsConsistencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClinicalOperationsConsistencyError";
  }
}
