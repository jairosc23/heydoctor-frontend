/**
 * ContinuityPackage — ephemeral projection from a ClinicalOperationsView.
 *
 * Not a source of truth. Ephemeral only. Do not mint identities.
 */

import { loadClinicalOperationsView } from "../clinical-operations/read-model";
import type { ClinicalOperationsReadPorts } from "../clinical-operations/read-model";
import type { ClinicalOperationsView } from "../clinical-operations/types";
import {
  ContinuityHandoffError,
  type ContinuityPackage,
} from "./types";

export type DeriveContinuityPackageOptions = {
  /** Current ClinicalActId of the Encounter. Rejects any other act (PCC-9). */
  currentClinicalActId?: string | null;
};

function assertCurrentAct(
  view: ClinicalOperationsView,
  currentClinicalActId?: string | null,
): void {
  if (!view.completion.present) return;

  const actId = view.completion.clinicalActId;
  const audit = view.completion.audit;

  if (!actId.trim()) {
    throw new ContinuityHandoffError(
      "ContinuityPackage cannot represent an empty ClinicalActId",
    );
  }
  if (audit.clinicalActId !== actId) {
    throw new ContinuityHandoffError(
      "ContinuityPackage cannot mix clinical acts",
    );
  }
  if (audit.encounter.consultationId !== view.encounterId) {
    throw new ContinuityHandoffError(
      "ContinuityPackage cannot mix clinical acts across Encounters",
    );
  }
  if (
    currentClinicalActId != null &&
    currentClinicalActId !== "" &&
    currentClinicalActId !== actId
  ) {
    throw new ContinuityHandoffError(
      "ContinuityPackage can only represent the current ClinicalActId",
    );
  }
}

/**
 * Pure derivation. Same ClinicalOperationsView (+ optional current act guard)
 * always yields the same package. Never writes. Never uses the clock.
 */
export function deriveContinuityPackage(
  view: ClinicalOperationsView,
  options: DeriveContinuityPackageOptions = {},
): ContinuityPackage {
  if (view.kind !== "clinical_operations_projection") {
    throw new ContinuityHandoffError(
      "ContinuityPackage must be derived from a ClinicalOperationsView",
    );
  }
  if (!view.encounterId.trim() || !view.asOf.trim()) {
    throw new ContinuityHandoffError(
      "ContinuityPackage requires encounterId and the view asOf",
    );
  }

  assertCurrentAct(view, options.currentClinicalActId);

  const operationalPresent =
    view.encounter.present || view.settlement.present;

  return {
    kind: "continuity_package_projection",
    encounterId: view.encounterId,
    asOf: view.asOf,
    clinicalHandoff: view.completion.present
      ? {
          present: true,
          clinicalActId: view.completion.clinicalActId,
          state: view.completion.state,
          documentKind: view.completion.documentKind,
          deliveredAt: view.completion.deliveredAt,
        }
      : { present: false },
    operationalContext: operationalPresent
      ? {
          present: true,
          encounterStatus: view.encounter.present
            ? view.encounter.status
            : "",
          settlementId: view.settlement.present
            ? view.settlement.settlementId
            : null,
          isPaid: view.settlement.present ? view.settlement.isPaid : false,
          lockAnomaly: view.settlement.present
            ? view.settlement.lockAnomaly
            : false,
        }
      : { present: false },
  };
}

export async function loadContinuityPackage(input: {
  encounterId: string;
  asOf?: string;
  currentClinicalActId?: string | null;
  ports?: Partial<ClinicalOperationsReadPorts>;
}): Promise<ContinuityPackage> {
  const view = await loadClinicalOperationsView({
    encounterId: input.encounterId,
    asOf: input.asOf,
    ports: input.ports,
  });
  return deriveContinuityPackage(view, {
    currentClinicalActId: input.currentClinicalActId,
  });
}
