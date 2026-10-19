import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCT_EPIC_CONTRACT_SECTIONS } from "../contract";
import type { ClinicalDeliveryQueue } from "../clinical-delivery-queue/types";
import type { RevenueIntegrityDashboard } from "../revenue-integrity";
import type { PreVisitClinicalBrief } from "../pre-visit-clinical-brief";
import {
  loadOperationalPulse,
  OPERATIONAL_PULSE_CONTRACT,
  projectOperationalPulse,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function delivery(
  pendingDeliveryCount: number,
): ClinicalDeliveryQueue {
  return {
    kind: "clinical_delivery_queue",
    items: pendingDeliveryCount
      ? [
          {
            encounterId: "enc-queued",
            clinicalActId: "act-queued",
            documentKind: "prescription",
            asOf: "2026-08-24T10:00:00.000Z",
          },
        ]
      : [],
    metrics: {
      encountersScanned: 1,
      pendingDeliveryCount,
      skippedAbsentCompletion: 0,
      skippedAlreadyDelivered: 0,
      skippedOtherState: 0,
      skippedIncoherent: 0,
      pendingPrescriptionCount: pendingDeliveryCount,
      pendingVisitSummaryCount: 0,
    },
  };
}

function revenue(input: {
  signedUnpaidCount?: number;
  lockAnomalyCount?: number;
  commerciallyLockedCount?: number;
  verifiedWithoutInvoiceCount?: number;
}): RevenueIntegrityDashboard {
  return {
    kind: "revenue_integrity_dashboard",
    items: [],
    metrics: {
      signedUnpaidCount: input.signedUnpaidCount ?? 0,
      verifiedWithoutInvoiceCount: input.verifiedWithoutInvoiceCount ?? 0,
      invoicedUnlockedCount: 0,
      lockAnomalyCount: input.lockAnomalyCount ?? 0,
      commerciallyLockedCount: input.commerciallyLockedCount ?? 0,
      encountersScanned: 0,
      settlementAbsentCount: 0,
      unclassifiedCount: 0,
    },
  };
}

function brief(input: {
  patientId: string;
  available: boolean;
  handoff?: "present" | "absent";
}): PreVisitClinicalBrief {
  const available = input.available;
  return {
    kind: "pre_visit_clinical_brief",
    patientId: input.patientId,
    status: available ? "ready" : "empty",
    origin: available
      ? {
          encounterId: "enc-origin",
          asOf: "2026-08-20T10:00:00.000Z",
          clinicalActId:
            input.handoff === "absent" ? null : "act-origin",
          handoff: input.handoff ?? "present",
          completionState:
            input.handoff === "absent" ? null : "document_ready",
          documentKind:
            input.handoff === "absent" ? null : "visit_summary",
          deliveredAt: null,
          encounterStatus: null,
          settlementContext: null,
        }
      : null,
    metrics: {
      briefAvailable: available ? 1 : 0,
      briefEmpty: available ? 0 : 1,
      sourceEncounterId: available ? 1 : 0,
      sourceClinicalActPresent:
        available && input.handoff !== "absent" ? 1 : 0,
      sourceDocumentKind: available && input.handoff !== "absent" ? 2 : 0,
      sourceDelivered: 0,
      sourceAsOf: available ? 1 : 0,
    },
  };
}

describe("OPD-1 Pulse is not a worklist", () => {
  it("does not expose queue, revenue, line, or brief items", () => {
    const pulse = projectOperationalPulse({
      delivery: delivery(1),
      revenue: revenue({ signedUnpaidCount: 1 }),
      briefs: [brief({ patientId: "p1", available: true })],
    });
    assert.equal("items" in pulse, false);
    assert.equal("origin" in pulse, false);
    assert.equal(pulse.kind, "operational_pulse_dashboard");
  });
});

describe("OPD-2 Delivery backlog copies v1.0 count", () => {
  it("equals pendingDeliveryCount and ignores queue items", () => {
    const queue = delivery(4);
    queue.items = [];
    const pulse = projectOperationalPulse({
      delivery: queue,
      revenue: revenue({}),
      briefs: [],
    });
    assert.equal(pulse.metrics.pulseDeliveryBacklog, 4);
    assert.equal(pulse.metrics.pulseDeliveryBacklog, queue.metrics.pendingDeliveryCount);
  });
});

describe("OPD-3 Commercial at-risk sums v2.0 metrics", () => {
  it("adds signed unpaid and lock anomaly, not commercially locked", () => {
    const pulse = projectOperationalPulse({
      delivery: delivery(0),
      revenue: revenue({
        signedUnpaidCount: 2,
        lockAnomalyCount: 1,
        commerciallyLockedCount: 5,
      }),
      briefs: [],
    });
    assert.equal(pulse.metrics.pulseCommercialAtRisk, 3);
    assert.equal(pulse.metrics.pulseCommercialClosed, 5);
    assert.equal(pulse.pulseStatus, "commercial_pressure");
  });
});

describe("OPD-4 Continuity via v4.0 briefs", () => {
  it("aggregates ready, empty, and last absent without look-back", () => {
    const pulse = projectOperationalPulse({
      delivery: delivery(0),
      revenue: revenue({}),
      briefs: [
        brief({ patientId: "p1", available: true, handoff: "present" }),
        brief({ patientId: "p2", available: true, handoff: "absent" }),
        brief({ patientId: "p3", available: false }),
      ],
    });
    assert.equal(pulse.metrics.pulsePatientsScanned, 3);
    assert.equal(pulse.metrics.pulseBriefReady, 2);
    assert.equal(pulse.metrics.pulseBriefEmpty, 1);
    assert.equal(pulse.metrics.pulseLastHandoffAbsent, 1);
    assert.ok(
      pulse.metrics.pulseLastHandoffAbsent <= pulse.metrics.pulseBriefReady,
    );
  });
});

describe("OPD-5 Unpaid does not change clinical pulse", () => {
  it("keeps delivery and brief counts when revenue is unpaid", () => {
    const briefs = [
      brief({ patientId: "p1", available: true, handoff: "present" }),
    ];
    const unpaid = projectOperationalPulse({
      delivery: delivery(1),
      revenue: revenue({ signedUnpaidCount: 9 }),
      briefs,
    });
    const paid = projectOperationalPulse({
      delivery: delivery(1),
      revenue: revenue({ commerciallyLockedCount: 9 }),
      briefs,
    });
    assert.equal(unpaid.metrics.pulseDeliveryBacklog, paid.metrics.pulseDeliveryBacklog);
    assert.equal(unpaid.metrics.pulseBriefReady, paid.metrics.pulseBriefReady);
    assert.equal(unpaid.metrics.pulseLastHandoffAbsent, paid.metrics.pulseLastHandoffAbsent);
  });
});

describe("OPD-6 No clinic asOf", () => {
  it("does not publish or merge asOf", () => {
    const pulse = projectOperationalPulse({
      delivery: delivery(0),
      revenue: revenue({}),
      briefs: [brief({ patientId: "p1", available: true })],
    });
    assert.equal("asOf" in pulse, false);
    assert.equal("asOf" in pulse.metrics, false);
  });
});

describe("OPD-7 / OPD-10 / OPD-11 Freeze boundary", () => {
  it("does not import writes, Date, PCC, COD, projectors, or frozen chrome", () => {
    const files = [
      "lib/product-platform/operational-pulse/pulse.ts",
      "lib/product-platform/operational-pulse/types.ts",
      "app/panel/pulso-operativo/page.tsx",
    ];
    const forbidden = [
      "runClinicalCompletion",
      "ensureSettlement",
      "observeCommercialSettlement",
      "initiateCommercialPayment",
      "persistSettlementAtomic",
      "saveClinicalCompletionSnapshot",
      "deriveContinuityPackage",
      "loadContinuityPackage",
      "loadClinicalOperationsView",
      "projectClinicalOperationsView",
      "projectClinicalDeliveryQueue",
      "classifyRevenueIntegrity",
      "projectRevenueIntegrityDashboard",
      "projectLongitudinalContinuity",
      "loadLongitudinalContinuity",
      "projectPreVisitBrief",
      "ContinuityPanelShell",
      "CommercialSettlementSection",
      "ClinicalCompletionSection",
      "PanelLayout",
      "localStorage",
      "sessionStorage",
      "Date.now",
      "new Date",
    ];
    for (const file of files) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of forbidden) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }
    const projection = readFileSync(
      join(ROOT, "lib/product-platform/operational-pulse/pulse.ts"),
      "utf8",
    );
    assert.equal(projection.includes("entrega-clinica"), false);
    assert.equal(projection.includes("integridad-ingresos"), false);
    assert.equal(projection.includes("continuidad-longitudinal"), false);
    assert.equal(projection.includes("brief-previsita"), false);
    const v1Barrel = readFileSync(
      join(ROOT, "lib/product-platform/index.ts"),
      "utf8",
    );
    assert.equal(v1Barrel.includes("operational-pulse"), false);
  });
});

describe("OPD-8 PRODUCT-1, status, alerts, composition", () => {
  it("exposes metrics, contract, and derived snapshot fields", () => {
    const pulse = projectOperationalPulse({
      delivery: delivery(2),
      revenue: revenue({
        signedUnpaidCount: 1,
        lockAnomalyCount: 1,
        commerciallyLockedCount: 2,
      }),
      briefs: [
        brief({ patientId: "p1", available: true, handoff: "absent" }),
        brief({ patientId: "p2", available: false }),
      ],
    });
    assert.equal(
      pulse.metrics.pulseBriefReady + pulse.metrics.pulseBriefEmpty,
      pulse.metrics.pulsePatientsScanned,
    );
    assert.equal(pulse.pulseStatus, "mixed");
    assert.equal(pulse.alerts.alertDeliveryBacklog, 1);
    assert.equal(pulse.alerts.alertCommercialAtRisk, 1);
    assert.equal(pulse.alerts.alertLastHandoffAbsent, 1);
    assert.equal(pulse.alerts.alertBriefEmpty, 1);
    assert.equal(pulse.composition.briefReadyShare, 50);
    assert.equal(pulse.composition.briefEmptyShare, 50);
    assert.equal(pulse.composition.commercialAtRiskShare, 50);
    assert.deepEqual(
      Object.keys(OPERATIONAL_PULSE_CONTRACT),
      [...PRODUCT_EPIC_CONTRACT_SECTIONS],
    );
    for (const name of OPERATIONAL_PULSE_CONTRACT.Metrics) {
      assert.equal(typeof pulse.metrics[name], "number");
    }
  });

  it("maps a single pressure to an exclusive pulseStatus", () => {
    assert.equal(
      projectOperationalPulse({
        delivery: delivery(0),
        revenue: revenue({}),
        briefs: [],
      }).pulseStatus,
      "clear",
    );
    assert.equal(
      projectOperationalPulse({
        delivery: delivery(1),
        revenue: revenue({}),
        briefs: [],
      }).pulseStatus,
      "delivery_pressure",
    );
    assert.equal(
      projectOperationalPulse({
        delivery: delivery(0),
        revenue: revenue({}),
        briefs: [brief({ patientId: "p1", available: false })],
      }).pulseStatus,
      "continuity_pressure",
    );
  });
});

describe("OPD-9 Determinism", () => {
  it("projects the same pulse from the same certified inputs", () => {
    const input = {
      delivery: delivery(1),
      revenue: revenue({ signedUnpaidCount: 1 }),
      briefs: [brief({ patientId: "p1", available: true, handoff: "absent" })],
    };
    assert.deepEqual(
      projectOperationalPulse(input),
      projectOperationalPulse(input),
    );
  });
});

describe("OPD-12 / OPD-13 product surface", () => {
  it("exposes a new surface that opens certified v1.0 and v2.0 boards", () => {
    const page = readFileSync(
      join(ROOT, "app/panel/pulso-operativo/page.tsx"),
      "utf8",
    );
    assert.match(page, /\/panel\/entrega-clinica/);
    assert.match(page, /\/panel\/integridad-ingresos/);
    assert.match(page, /Abrir entrega clínica/);
    assert.match(page, /Abrir integridad de ingresos/);
    assert.equal(page.includes("localStorage"), false);
    assert.equal(page.includes("/panel/consultas/"), false);
  });
});

describe("loadOperationalPulse", () => {
  it("loads only through v1.0, v2.0, and v4.0 ports", async () => {
    const pulse = await loadOperationalPulse({
      ports: {
        loadDelivery: async () => delivery(3),
        loadRevenue: async () =>
          revenue({ signedUnpaidCount: 1, commerciallyLockedCount: 1 }),
        listPatientIds: async () => ["patient-a", "patient-b"],
        loadBrief: async (patientId) =>
          brief({
            patientId,
            available: patientId === "patient-a",
            handoff: "present",
          }),
      },
    });
    assert.equal(pulse.metrics.pulseDeliveryBacklog, 3);
    assert.equal(pulse.metrics.pulseCommercialAtRisk, 1);
    assert.equal(pulse.metrics.pulsePatientsScanned, 2);
    assert.equal(pulse.metrics.pulseBriefReady, 1);
    assert.equal(pulse.metrics.pulseBriefEmpty, 1);
    assert.equal("asOf" in pulse, false);
  });
});
