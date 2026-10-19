import type { ProductEpicContract, ProductEpicMetrics } from "../contract";

export type OperationalPulseStatus =
  | "clear"
  | "delivery_pressure"
  | "commercial_pressure"
  | "continuity_pressure"
  | "mixed";

export type OperationalPulseMetrics = ProductEpicMetrics & {
  pulseDeliveryBacklog: number;
  pulseCommercialAtRisk: number;
  pulseCommercialClosed: number;
  pulsePatientsScanned: number;
  pulseBriefReady: number;
  pulseBriefEmpty: number;
  pulseLastHandoffAbsent: number;
};

export type OperationalPulseAlerts = {
  alertDeliveryBacklog: number;
  alertCommercialAtRisk: number;
  alertLastHandoffAbsent: number;
  alertBriefEmpty: number;
};

export type OperationalPulseComposition = {
  briefReadyShare: number;
  briefEmptyShare: number;
  commercialAtRiskShare: number;
};

export type OperationalPulseDashboard = {
  kind: "operational_pulse_dashboard";
  pulseStatus: OperationalPulseStatus;
  metrics: OperationalPulseMetrics;
  alerts: OperationalPulseAlerts;
  composition: OperationalPulseComposition;
};

export const OPERATIONAL_PULSE_CONTRACT: ProductEpicContract = {
  Objective: "Fotografía operacional del centro, en solo lectura.",
  Dependencies:
    "READ ONLY: v1.0 cola, v2.0 dashboard, v4.0 briefs (v3.0 vía v4.0); población patientId por lectura Encounter signed/locked.",
  "Read Model":
    "OperationalPulseDashboard; KPIs + pulseStatus + alertas + composición; sin asOf de clínica.",
  "No Writes":
    "No workflows Core. No modifica Encounter. Acción = abrir tableros certificados v1.0 / v2.0.",
  PASS: [
    "OPD-1",
    "OPD-2",
    "OPD-3",
    "OPD-4",
    "OPD-5",
    "OPD-6",
    "OPD-7",
    "OPD-8",
    "OPD-9",
    "OPD-10",
    "OPD-11",
    "OPD-12",
    "OPD-13",
  ],
  Metrics: [
    "pulseDeliveryBacklog",
    "pulseCommercialAtRisk",
    "pulseCommercialClosed",
    "pulsePatientsScanned",
    "pulseBriefReady",
    "pulseBriefEmpty",
    "pulseLastHandoffAbsent",
  ],
};

export class OperationalPulseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationalPulseError";
  }
}
