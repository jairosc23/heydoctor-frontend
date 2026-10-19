/**
 * Clinical Operations Projection.
 *
 * Pure composition of Encounter + Clinical Completion + Commercial Settlement.
 * Not a write domain: no persist, no workflow, no clock, no browser state.
 */

import { reconstructClinicalAct } from "../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../clinical-completion/types";
import { loadClinicalCompletionSnapshot } from "../clinical-completion/store";
import { reconstructCommercialSettlement } from "../commercial-settlement/types";
import type { CommercialSettlementSnapshot } from "../commercial-settlement/types";
import { loadSettlementByEncounterId } from "../commercial-settlement/store";
import { fetchConsultation } from "../services/consultations";
import {
  ClinicalOperationsConsistencyError,
  type ClinicalOperationsView,
} from "./types";

export type ClinicalOperationsEncounterRecord = {
  id: string;
  status?: string | null;
  updatedAt?: string | null;
};

export type ClinicalOperationsReadPorts = {
  fetchEncounter: (
    encounterId: string,
  ) => Promise<ClinicalOperationsEncounterRecord | null>;
  loadCompletion: (encounterId: string) => ClinicalCompletionSnapshot | null;
  loadSettlement: (encounterId: string) => CommercialSettlementSnapshot | null;
};

export const defaultClinicalOperationsReadPorts: ClinicalOperationsReadPorts = {
  fetchEncounter: async (encounterId) => {
    try {
      return await fetchConsultation(encounterId);
    } catch {
      return null;
    }
  },
  loadCompletion: loadClinicalCompletionSnapshot,
  loadSettlement: loadSettlementByEncounterId,
};

function mergePorts(
  overrides?: Partial<ClinicalOperationsReadPorts>,
): ClinicalOperationsReadPorts {
  return { ...defaultClinicalOperationsReadPorts, ...overrides };
}

function maxIso(times: Array<string | null | undefined>): string | null {
  const present = times.filter((value): value is string => Boolean(value?.trim()));
  if (present.length === 0) return null;
  return present.reduce((latest, current) =>
    current > latest ? current : latest,
  );
}

/** Logical instant derived only from source records. Never uses the clock. */
export function deriveLogicalAsOf(input: {
  encounter?: ClinicalOperationsEncounterRecord | null;
  completion?: ClinicalCompletionSnapshot | null;
  settlement?: CommercialSettlementSnapshot | null;
}): string | null {
  return maxIso([
    input.encounter?.updatedAt,
    input.completion?.updatedAt,
    input.settlement?.updatedAt,
  ]);
}

function requireAsOf(asOf: string): string {
  const trimmed = asOf.trim();
  if (!trimmed) {
    throw new ClinicalOperationsConsistencyError(
      "ClinicalOperationsView requires a single logical asOf",
    );
  }
  return trimmed;
}

/**
 * Pure projection. Same inputs always yield the same view (COD-10).
 * One asOf stamps the whole view (COD-9).
 */
export function projectClinicalOperationsView(input: {
  encounterId: string;
  asOf: string;
  encounter: ClinicalOperationsEncounterRecord | null;
  completion: ClinicalCompletionSnapshot | null;
  settlement: CommercialSettlementSnapshot | null;
}): ClinicalOperationsView {
  const asOf = requireAsOf(input.asOf);
  const encounterId = input.encounterId.trim();
  if (!encounterId) {
    throw new ClinicalOperationsConsistencyError("encounterId is required");
  }

  const encounterRecord =
    input.encounter && input.encounter.id === encounterId
      ? input.encounter
      : null;
  const completion =
    input.completion && input.completion.consultationId === encounterId
      ? input.completion
      : null;
  const settlement =
    input.settlement && input.settlement.encounterId === encounterId
      ? input.settlement
      : null;

  return {
    kind: "clinical_operations_projection",
    encounterId,
    asOf,
    encounter: encounterRecord
      ? {
          present: true,
          encounterId,
          status: encounterRecord.status ?? "",
          updatedAt: encounterRecord.updatedAt ?? null,
        }
      : { present: false },
    completion: completion
      ? {
          present: true,
          clinicalActId: completion.clinicalActId,
          state: completion.state,
          documentKind: completion.documentKind,
          deliveredAt: completion.deliveredAt,
          audit: reconstructClinicalAct(completion),
        }
      : { present: false },
    settlement: settlement
      ? {
          present: true,
          settlementId: settlement.settlementId,
          state: settlement.state,
          isPaid: settlement.isPaid,
          invoiceId: settlement.invoiceId,
          lockAnomaly: settlement.lockAnomaly,
          audit: reconstructCommercialSettlement(settlement),
        }
      : { present: false },
  };
}

/**
 * Read the three certified domains, then project once at a single asOf.
 * Does not write. Does not mint ClinicalActId or SettlementId.
 */
export async function loadClinicalOperationsView(input: {
  encounterId: string;
  asOf?: string;
  ports?: Partial<ClinicalOperationsReadPorts>;
}): Promise<ClinicalOperationsView> {
  const ports = mergePorts(input.ports);
  const encounter = await ports.fetchEncounter(input.encounterId);
  const completion = ports.loadCompletion(input.encounterId);
  const settlement = ports.loadSettlement(input.encounterId);
  const asOf =
    input.asOf?.trim() ||
    deriveLogicalAsOf({ encounter, completion, settlement });
  if (!asOf) {
    throw new ClinicalOperationsConsistencyError(
      "ClinicalOperationsView requires a single logical asOf",
    );
  }
  return projectClinicalOperationsView({
    encounterId: input.encounterId,
    asOf,
    encounter,
    completion,
    settlement,
  });
}
