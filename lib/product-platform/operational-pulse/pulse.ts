/**
 * Epic 5 — Operational Pulse Dashboard.
 * Product Platform. Composes certified v1–v4 projections. Does not write Core.
 * Does not re-enter PCC, COD, Completion, or Settlement.
 */

import { fetchConsultations } from "../../services/consultations";
import { loadClinicalDeliveryQueue } from "../clinical-delivery-queue/queue";
import type { ClinicalDeliveryQueue } from "../clinical-delivery-queue/types";
import { loadRevenueIntegrityDashboard } from "../revenue-integrity";
import type { RevenueIntegrityDashboard } from "../revenue-integrity";
import { loadPreVisitBrief } from "../pre-visit-clinical-brief";
import type { PreVisitClinicalBrief } from "../pre-visit-clinical-brief";
import {
  OperationalPulseError,
  type OperationalPulseAlerts,
  type OperationalPulseComposition,
  type OperationalPulseDashboard,
  type OperationalPulseMetrics,
  type OperationalPulseStatus,
} from "./types";

export type OperationalPulseLoadPorts = {
  loadDelivery: () => Promise<ClinicalDeliveryQueue>;
  loadRevenue: () => Promise<RevenueIntegrityDashboard>;
  loadBrief: (patientId: string) => Promise<PreVisitClinicalBrief>;
  listPatientIds: () => Promise<string[]>;
};

function share(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.floor((part * 100) / whole);
}

function metricsFrom(input: {
  delivery: ClinicalDeliveryQueue;
  revenue: RevenueIntegrityDashboard;
  briefs: PreVisitClinicalBrief[];
}): OperationalPulseMetrics {
  let pulseBriefReady = 0;
  let pulseBriefEmpty = 0;
  let pulseLastHandoffAbsent = 0;
  for (const brief of input.briefs) {
    if (brief.metrics.briefAvailable === 1) pulseBriefReady += 1;
    if (brief.metrics.briefEmpty === 1) pulseBriefEmpty += 1;
    if (brief.origin?.handoff === "absent") pulseLastHandoffAbsent += 1;
  }
  return {
    pulseDeliveryBacklog: input.delivery.metrics.pendingDeliveryCount,
    pulseCommercialAtRisk:
      input.revenue.metrics.signedUnpaidCount +
      input.revenue.metrics.lockAnomalyCount,
    pulseCommercialClosed: input.revenue.metrics.commerciallyLockedCount,
    pulsePatientsScanned: input.briefs.length,
    pulseBriefReady,
    pulseBriefEmpty,
    pulseLastHandoffAbsent,
  };
}

function alertsFrom(metrics: OperationalPulseMetrics): OperationalPulseAlerts {
  return {
    alertDeliveryBacklog: metrics.pulseDeliveryBacklog > 0 ? 1 : 0,
    alertCommercialAtRisk: metrics.pulseCommercialAtRisk > 0 ? 1 : 0,
    alertLastHandoffAbsent: metrics.pulseLastHandoffAbsent > 0 ? 1 : 0,
    alertBriefEmpty: metrics.pulseBriefEmpty > 0 ? 1 : 0,
  };
}

function compositionFrom(
  metrics: OperationalPulseMetrics,
): OperationalPulseComposition {
  const commercialWhole =
    metrics.pulseCommercialAtRisk + metrics.pulseCommercialClosed;
  return {
    briefReadyShare: share(
      metrics.pulseBriefReady,
      metrics.pulsePatientsScanned,
    ),
    briefEmptyShare: share(
      metrics.pulseBriefEmpty,
      metrics.pulsePatientsScanned,
    ),
    commercialAtRiskShare: share(
      metrics.pulseCommercialAtRisk,
      commercialWhole,
    ),
  };
}

function pulseStatusFrom(
  metrics: OperationalPulseMetrics,
): OperationalPulseStatus {
  const delivery = metrics.pulseDeliveryBacklog > 0;
  const commercial = metrics.pulseCommercialAtRisk > 0;
  const continuity =
    metrics.pulseLastHandoffAbsent > 0 || metrics.pulseBriefEmpty > 0;
  const count = Number(delivery) + Number(commercial) + Number(continuity);
  if (count === 0) return "clear";
  if (count > 1) return "mixed";
  if (delivery) return "delivery_pressure";
  if (commercial) return "commercial_pressure";
  return "continuity_pressure";
}

export function projectOperationalPulse(input: {
  delivery: ClinicalDeliveryQueue;
  revenue: RevenueIntegrityDashboard;
  briefs: PreVisitClinicalBrief[];
}): OperationalPulseDashboard {
  if (input.delivery.kind !== "clinical_delivery_queue") {
    throw new OperationalPulseError(
      "Operational pulse requires a ClinicalDeliveryQueue",
    );
  }
  if (input.revenue.kind !== "revenue_integrity_dashboard") {
    throw new OperationalPulseError(
      "Operational pulse requires a RevenueIntegrityDashboard",
    );
  }
  const metrics = metricsFrom(input);
  return {
    kind: "operational_pulse_dashboard",
    pulseStatus: pulseStatusFrom(metrics),
    metrics,
    alerts: alertsFrom(metrics),
    composition: compositionFrom(metrics),
  };
}

async function defaultListPatientIds(): Promise<string[]> {
  const [signed, locked] = await Promise.all([
    fetchConsultations({ status: "signed", limit: 100 }),
    fetchConsultations({ status: "locked", limit: 100 }),
  ]);
  return [
    ...new Set(
      [...signed.data, ...locked.data]
        .map((row) => row.patientId?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}

const defaultPorts: OperationalPulseLoadPorts = {
  loadDelivery: () => loadClinicalDeliveryQueue(),
  loadRevenue: () => loadRevenueIntegrityDashboard(),
  loadBrief: (patientId) => loadPreVisitBrief({ patientId }),
  listPatientIds: defaultListPatientIds,
};

export async function loadOperationalPulse(input: {
  ports?: Partial<OperationalPulseLoadPorts>;
} = {}): Promise<OperationalPulseDashboard> {
  const ports: OperationalPulseLoadPorts = {
    ...defaultPorts,
    ...input.ports,
  };
  const [delivery, revenue, patientIds] = await Promise.all([
    ports.loadDelivery(),
    ports.loadRevenue(),
    ports.listPatientIds(),
  ]);
  const briefs: PreVisitClinicalBrief[] = [];
  for (const patientId of patientIds) {
    briefs.push(await ports.loadBrief(patientId));
  }
  return projectOperationalPulse({ delivery, revenue, briefs });
}
