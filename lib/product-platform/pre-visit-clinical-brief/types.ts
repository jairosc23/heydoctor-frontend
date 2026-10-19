import type { ProductEpicContract, ProductEpicMetrics } from "../contract";
import type { LongitudinalHandoff } from "../longitudinal-continuity/types";

export type PreVisitBriefStatus = "empty" | "ready";

/**
 * encounterStatus and settlementContext are listed in the authorized copy
 * set. LongitudinalContinuityItem does not carry them; they stay null.
 * They are not re-fetched from PCC or COD.
 */
export type PreVisitBriefOrigin = {
  encounterId: string;
  asOf: string;
  clinicalActId: string | null;
  handoff: LongitudinalHandoff;
  completionState: string | null;
  documentKind: "prescription" | "visit_summary" | null;
  deliveredAt: string | null;
  encounterStatus: string | null;
  settlementContext: null;
};

/** PRODUCT-1: numeric flags only. Identifiers live on origin. */
export type PreVisitClinicalBriefMetrics = ProductEpicMetrics & {
  briefAvailable: number;
  briefEmpty: number;
  sourceEncounterId: number;
  sourceClinicalActPresent: number;
  sourceDocumentKind: number;
  sourceDelivered: number;
  sourceAsOf: number;
};

export const SOURCE_DOCUMENT_KIND_NONE = 0;
export const SOURCE_DOCUMENT_KIND_PRESCRIPTION = 1;
export const SOURCE_DOCUMENT_KIND_VISIT_SUMMARY = 2;

export type PreVisitClinicalBrief = {
  kind: "pre_visit_clinical_brief";
  patientId: string;
  status: PreVisitBriefStatus;
  origin: PreVisitBriefOrigin | null;
  metrics: PreVisitClinicalBriefMetrics;
};

export const PRE_VISIT_CLINICAL_BRIEF_CONTRACT: ProductEpicContract = {
  Objective:
    "Punto de partida clínico de la próxima consulta, en solo lectura.",
  Dependencies:
    "READ ONLY: LongitudinalContinuityProjection (PCC y COD ya resueltos en cada ítem).",
  "Read Model":
    "PreVisitClinicalBrief; último ítem de la línea; asOf copiado; empty explícito.",
  "No Writes":
    "No workflows Core. No modifica Encounter. Acción = abrir ficha certificada del origen.",
  PASS: [
    "PVB-1",
    "PVB-2",
    "PVB-3",
    "PVB-4",
    "PVB-5",
    "PVB-6",
    "PVB-7",
    "PVB-8",
    "PVB-9",
    "PVB-10",
    "PVB-11",
    "PVB-12",
    "PVB-13",
  ],
  Metrics: [
    "briefAvailable",
    "briefEmpty",
    "sourceEncounterId",
    "sourceClinicalActPresent",
    "sourceDocumentKind",
    "sourceDelivered",
    "sourceAsOf",
  ],
};

export class PreVisitClinicalBriefError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreVisitClinicalBriefError";
  }
}
