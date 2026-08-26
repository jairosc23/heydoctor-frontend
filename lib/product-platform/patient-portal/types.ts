import type { ProductEpicContract, ProductEpicMetrics } from "../contract";

export type PortalEncounterAvailability = "available" | "unavailable";

export type PortalDeliveryStatus =
  | "entregado"
  | "pendiente_de_entrega"
  | "ausente";

export type PortalDocumentKind = "prescription" | "visit_summary";

export type PortalEncounterSlice = {
  present: boolean;
  status: string | null;
};

export type PortalDelivery = {
  status: PortalDeliveryStatus;
};

/** Present only when delivery.status === "entregado" and kind is certified. */
export type PortalDocument = {
  clinicalActId: string;
  documentKind: PortalDocumentKind;
  deliveredAt: string;
  completionState: string;
};

export type PortalCommercial = {
  settlementPresent: boolean;
  settlementId: string | null;
  isPaid: boolean;
};

export type PortalEncounterMetrics = ProductEpicMetrics & {
  portalEncounterAvailable: number;
  portalHandoffPresent: number;
  portalDocumentDelivered: number;
  portalDocumentKind: number;
  portalCommerciallyPaid: number;
};

export const PORTAL_DOCUMENT_KIND_NONE = 0;
export const PORTAL_DOCUMENT_KIND_VISIT_SUMMARY = 1;
export const PORTAL_DOCUMENT_KIND_PRESCRIPTION = 2;

export type PortalEncounterView = {
  kind: "portal_encounter_view";
  encounterId: string;
  asOf: string | null;
  availability: PortalEncounterAvailability;
  encounter: PortalEncounterSlice;
  delivery: PortalDelivery;
  document: PortalDocument | null;
  commercial: PortalCommercial;
  metrics: PortalEncounterMetrics;
};

export const PATIENT_PORTAL_CONTRACT: ProductEpicContract = {
  Objective:
    "Consulta READ ONLY de un Encounter clínico certificado, en perspectiva de paciente.",
  Dependencies:
    "READ ONLY: ContinuityPackage (Completion y Settlement ya resueltos como slices).",
  "Read Model":
    "PortalEncounterView; documento solo si deliveredAt != null; comercial informativo; unavailable si PCC no deriva.",
  "No Writes":
    "No workflows Core. No modifica Encounter. No paga. No entrega. No toca portal legado.",
  PASS: [
    "PP-1",
    "PP-2",
    "PP-3",
    "PP-4",
    "PP-5",
    "PP-6",
    "PP-7",
    "PP-8",
    "PP-9",
    "PP-10",
    "PP-11",
    "PP-12",
  ],
  Metrics: [
    "portalEncounterAvailable",
    "portalHandoffPresent",
    "portalDocumentDelivered",
    "portalDocumentKind",
    "portalCommerciallyPaid",
  ],
};

export class PortalEncounterViewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalEncounterViewError";
  }
}
