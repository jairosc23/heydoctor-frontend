import type { ProductEpicContract, ProductEpicMetrics } from "../contract";

export type LongitudinalHandoff = "present" | "absent";

export type LongitudinalContinuityItem = {
  patientId: string;
  encounterId: string;
  asOf: string;
  clinicalActId: string | null;
  handoff: LongitudinalHandoff;
  completionState: string | null;
  documentKind: "prescription" | "visit_summary" | null;
  deliveredAt: string | null;
};

export type LongitudinalContinuityMetrics = ProductEpicMetrics & {
  totalContinuityPackages: number;
  activeClinicalActs: number;
  absentHandOffCount: number;
  deliveredDocumentCount: number;
  visitSummaryCount: number;
  prescriptionCount: number;
};

export type LongitudinalContinuityProjection = {
  kind: "longitudinal_continuity_projection";
  patientId: string;
  items: LongitudinalContinuityItem[];
  metrics: LongitudinalContinuityMetrics;
};

export const LONGITUDINAL_CONTINUITY_CONTRACT: ProductEpicContract = {
  Objective:
    "Secuencia cronológica de actos vigentes de un paciente, en solo lectura.",
  Dependencies:
    "READ ONLY: lista Encounter por patientId + loadContinuityPackage (COD vía PCC).",
  "Read Model":
    "LongitudinalContinuityProjection; un paquete por Encounter; asOf de COD; absent explícito.",
  "No Writes":
    "No workflows Core. Acción = abrir ficha certificada.",
  PASS: [
    "LON-1",
    "LON-2",
    "LON-3",
    "LON-4",
    "LON-5",
    "LON-6",
    "LON-7",
    "LON-8",
    "LON-9",
    "LON-10",
    "LON-11",
    "LON-12",
    "LON-13",
  ],
  Metrics: [
    "totalContinuityPackages",
    "activeClinicalActs",
    "absentHandOffCount",
    "deliveredDocumentCount",
    "visitSummaryCount",
    "prescriptionCount",
  ],
};

export class LongitudinalContinuityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LongitudinalContinuityError";
  }
}
