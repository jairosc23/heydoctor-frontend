/**
 * Patient Care Continuity — Epic 1.
 *
 * ContinuityPackage is an ephemeral projection, not a write domain and not a
 * source of truth. It is keyed by EncounterId and may represent only the
 * current ClinicalActId of that Encounter.
 */

export type ContinuityClinicalHandoff =
  | { present: false }
  | {
      present: true;
      clinicalActId: string;
      state: string;
      documentKind: string | null;
      deliveredAt: string | null;
    };

export type ContinuityOperationalContext =
  | { present: false }
  | {
      present: true;
      encounterStatus: string;
      settlementId: string | null;
      isPaid: boolean;
      lockAnomaly: boolean;
    };

export type ContinuityPackage = {
  kind: "continuity_package_projection";
  encounterId: string;
  asOf: string;
  clinicalHandoff: ContinuityClinicalHandoff;
  operationalContext: ContinuityOperationalContext;
};

export class ContinuityHandoffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContinuityHandoffError";
  }
}
