import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPendingSnapshot } from "../../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../../clinical-completion/types";
import { PRODUCT_EPIC_CONTRACT_SECTIONS } from "../contract";
import type { ContinuityPackage } from "../../patient-care-continuity";
import {
  loadPortalEncounterView,
  PATIENT_PORTAL_CONTRACT,
  PORTAL_DOCUMENT_KIND_NONE,
  PORTAL_DOCUMENT_KIND_PRESCRIPTION,
  PORTAL_DOCUMENT_KIND_VISIT_SUMMARY,
  PortalEncounterViewError,
  projectPortalEncounterView,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const ENCOUNTER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ACT = "11111111-1111-4111-8111-111111111111";
const SETTLEMENT = "22222222-2222-4222-8222-222222222222";
const ASOF = "2026-08-24T10:00:00.000Z";
const DELIVERED_AT = "2026-08-24T11:00:00.000Z";

const EPIC_FILES = [
  "lib/product-platform/patient-portal/projection.ts",
  "lib/product-platform/patient-portal/types.ts",
  "app/portal/(app)/encounter/[encounterId]/page.tsx",
];

const FORBIDDEN = [
  "runClinicalCompletion",
  "ensureSettlement",
  "observeCommercialSettlement",
  "initiateCommercialPayment",
  "persistSettlementAtomic",
  "saveClinicalCompletionSnapshot",
  "loadClinicalOperationsView",
  "projectClinicalOperationsView",
  "projectClinicalDeliveryQueue",
  "loadClinicalDeliveryQueue",
  "clinical-delivery-queue",
  "classifyRevenueIntegrity",
  "loadRevenueIntegrityDashboard",
  "revenue-integrity",
  "projectLongitudinalContinuity",
  "loadLongitudinalContinuity",
  "projectPreVisitBrief",
  "loadPreVisitBrief",
  "projectOperationalPulse",
  "loadOperationalPulse",
  "ContinuityPanelShell",
  "CommercialSettlementSection",
  "ClinicalCompletionSection",
  "PanelLayout",
  "EncounterClosureSection",
  "fetchPortalAppointments",
  "fetchPortalAppointment",
  "cancelPortalAppointment",
  "reschedulePortalAppointment",
  "PatientPortalId",
  "PortalDocumentId",
  "DeliveryId",
  "HistoryId",
  "localStorage",
  "sessionStorage",
  "Date.now",
  "new Date",
];

function pkg(
  overrides: Partial<ContinuityPackage> = {},
): ContinuityPackage {
  return {
    kind: "continuity_package_projection",
    encounterId: ENCOUNTER,
    asOf: ASOF,
    clinicalHandoff: { present: false },
    operationalContext: {
      present: true,
      encounterStatus: "signed",
      settlementId: null,
      isPaid: false,
      lockAnomaly: false,
    },
    ...overrides,
  };
}

function deliveredHandoff(
  kind: "prescription" | "visit_summary" = "visit_summary",
): ContinuityPackage["clinicalHandoff"] {
  return {
    present: true,
    clinicalActId: ACT,
    state: "delivered",
    documentKind: kind,
    deliveredAt: DELIVERED_AT,
  };
}

function pendingHandoff(
  kind: "prescription" | "visit_summary" = "prescription",
): ContinuityPackage["clinicalHandoff"] {
  return {
    present: true,
    clinicalActId: ACT,
    state: "document_ready",
    documentKind: kind,
    deliveredAt: null,
  };
}

describe("PP-1 READ ONLY", () => {
  it("does not call Core or v1–v5 writes from Epic 6 surfaces", () => {
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of [
        "runClinicalCompletion",
        "ensureSettlement",
        "observeCommercialSettlement",
        "initiateCommercialPayment",
        "persistSettlementAtomic",
        "saveClinicalCompletionSnapshot",
      ]) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }
  });
});

describe("PP-2 No workflows", () => {
  it("does not import run/ensure/observe/persist/save workflows", () => {
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of [
        "runClinicalCompletion",
        "ensureSettlement",
        "observeCommercialSettlement",
        "initiateCommercialPayment",
        "persistSettlementAtomic",
        "saveClinicalCompletionSnapshot",
        "ensurePrescriptionPdf",
      ]) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }
  });
});

describe("PP-3 ContinuityPackage is the only clinical source", () => {
  it("loads through loadContinuityPackage and does not re-enter COD", () => {
    const projection = readFileSync(
      join(ROOT, "lib/product-platform/patient-portal/projection.ts"),
      "utf8",
    );
    assert.equal(projection.includes("loadContinuityPackage"), true);
    assert.equal(projection.includes("loadClinicalOperationsView"), false);
    assert.equal(projection.includes("projectClinicalOperationsView"), false);
    assert.equal(projection.includes("loadClinicalCompletionSnapshot"), false);
    assert.equal(projection.includes("loadSettlementByEncounterId"), false);
    const view = projectPortalEncounterView(
      pkg({ clinicalHandoff: deliveredHandoff() }),
    );
    assert.equal(view.kind, "portal_encounter_view");
    assert.equal(view.encounterId, ENCOUNTER);
  });
});

describe("PP-4 Does not consume v1.0–v5.0", () => {
  it("does not import Product Platform v1–v5 loaders or modules", () => {
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of [
        "clinical-delivery-queue",
        "loadClinicalDeliveryQueue",
        "projectClinicalDeliveryQueue",
        "revenue-integrity",
        "classifyRevenueIntegrity",
        "loadRevenueIntegrityDashboard",
        "longitudinal-continuity",
        "projectLongitudinalContinuity",
        "loadLongitudinalContinuity",
        "pre-visit-clinical-brief",
        "projectPreVisitBrief",
        "loadPreVisitBrief",
        "operational-pulse",
        "projectOperationalPulse",
        "loadOperationalPulse",
      ]) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }
  });
});

describe("PP-5 Official identities only", () => {
  it("keys by EncounterId and copies ClinicalActId or leaves document null", () => {
    const present = projectPortalEncounterView(
      pkg({ clinicalHandoff: deliveredHandoff("prescription") }),
    );
    assert.equal(present.encounterId, ENCOUNTER);
    assert.equal(present.document?.clinicalActId, ACT);
    const absent = projectPortalEncounterView(pkg());
    assert.equal(absent.document, null);
    assert.equal(absent.delivery.status, "ausente");
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of [
        "PatientPortalId",
        "PortalDocumentId",
        "DeliveryId",
        "HistoryId",
      ]) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not mint ${token}`,
        );
      }
    }
  });
});

describe("PP-6 Document visible only when delivered", () => {
  it("hides the document when deliveredAt is null", () => {
    const view = projectPortalEncounterView(
      pkg({ clinicalHandoff: pendingHandoff("prescription") }),
    );
    assert.equal(view.delivery.status, "pendiente_de_entrega");
    assert.equal(view.document, null);
    assert.equal(view.metrics.portalHandoffPresent, 1);
    assert.equal(view.metrics.portalDocumentDelivered, 0);
    assert.equal(
      view.metrics.portalDocumentKind,
      PORTAL_DOCUMENT_KIND_PRESCRIPTION,
    );
  });

  it("shows the document when deliveredAt is present", () => {
    const view = projectPortalEncounterView(
      pkg({ clinicalHandoff: deliveredHandoff("visit_summary") }),
    );
    assert.equal(view.delivery.status, "entregado");
    assert.ok(view.document);
    assert.equal(view.document.documentKind, "visit_summary");
    assert.equal(view.document.deliveredAt, DELIVERED_AT);
    assert.equal(view.metrics.portalDocumentDelivered, 1);
    assert.equal(
      view.metrics.portalDocumentKind,
      PORTAL_DOCUMENT_KIND_VISIT_SUMMARY,
    );
  });

  it("does not hide a delivered document when unpaid", () => {
    const unpaid = projectPortalEncounterView(
      pkg({
        clinicalHandoff: deliveredHandoff("prescription"),
        operationalContext: {
          present: true,
          encounterStatus: "signed",
          settlementId: SETTLEMENT,
          isPaid: false,
          lockAnomaly: false,
        },
      }),
    );
    const paid = projectPortalEncounterView(
      pkg({
        clinicalHandoff: deliveredHandoff("prescription"),
        operationalContext: {
          present: true,
          encounterStatus: "signed",
          settlementId: SETTLEMENT,
          isPaid: true,
          lockAnomaly: false,
        },
      }),
    );
    assert.equal(unpaid.document?.clinicalActId, paid.document?.clinicalActId);
    assert.equal(unpaid.metrics.portalDocumentDelivered, 1);
    assert.equal(paid.metrics.portalDocumentDelivered, 1);
    assert.equal(unpaid.metrics.portalCommerciallyPaid, 0);
    assert.equal(paid.metrics.portalCommerciallyPaid, 1);
  });
});

describe("PP-7 Commercial is informational", () => {
  it("copies settlement without lockAnomaly or payment CTA", () => {
    const view = projectPortalEncounterView(
      pkg({
        clinicalHandoff: deliveredHandoff(),
        operationalContext: {
          present: true,
          encounterStatus: "locked",
          settlementId: SETTLEMENT,
          isPaid: true,
          lockAnomaly: true,
        },
      }),
    );
    assert.equal(view.commercial.settlementId, SETTLEMENT);
    assert.equal(view.commercial.settlementPresent, true);
    assert.equal(view.commercial.isPaid, true);
    assert.equal("lockAnomaly" in view.commercial, false);
    assert.equal("lockAnomaly" in view, false);
    const page = readFileSync(
      join(ROOT, "app/portal/(app)/encounter/[encounterId]/page.tsx"),
      "utf8",
    );
    assert.equal(page.includes("lockAnomaly"), false);
    assert.equal(page.includes("Pagar"), false);
    assert.equal(page.includes("Reenviar"), false);
    assert.equal(page.includes("Firmar"), false);
    assert.equal(page.includes("/portal/pagos"), false);
  });

  it("does not mint SettlementId when the package has none", () => {
    const view = projectPortalEncounterView(
      pkg({
        clinicalHandoff: deliveredHandoff(),
        operationalContext: {
          present: true,
          encounterStatus: "signed",
          settlementId: null,
          isPaid: false,
          lockAnomaly: false,
        },
      }),
    );
    assert.equal(view.commercial.settlementId, null);
    assert.equal(view.commercial.settlementPresent, false);
    assert.equal(view.document?.deliveredAt, DELIVERED_AT);
  });
});

describe("PP-8 Patient surface only", () => {
  it("exposes /portal/encounter/[encounterId] without panel chrome", () => {
    const page = readFileSync(
      join(ROOT, "app/portal/(app)/encounter/[encounterId]/page.tsx"),
      "utf8",
    );
    assert.match(page, /data-testid="portal-encounter-page"/);
    assert.match(page, /Pendiente de entrega/);
    assert.match(page, /Consulta no disponible/);
    assert.equal(page.includes("PanelLayout"), false);
    assert.equal(page.includes("ContinuityPanelShell"), false);
    assert.equal(page.includes("/panel/"), false);
    assert.equal(page.includes("PortalShell"), false);
    assert.equal(page.includes("{view.document ?"), true);
  });
});

describe("PP-9 Frozen baselines untouched", () => {
  it("does not export from the v1.0 barrel or import legacy portal writes", () => {
    const v1Barrel = readFileSync(
      join(ROOT, "lib/product-platform/index.ts"),
      "utf8",
    );
    assert.equal(v1Barrel.includes("patient-portal"), false);
    const page = readFileSync(
      join(ROOT, "app/portal/(app)/encounter/[encounterId]/page.tsx"),
      "utf8",
    );
    assert.equal(page.includes("lib/services/patient-portal"), false);
    assert.equal(page.includes("components/portal/PortalShell"), false);
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of FORBIDDEN) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }
  });
});

describe("PP-10 Deterministic projection, no browser source", () => {
  it("projects the same view from the same package", () => {
    const input = pkg({
      clinicalHandoff: pendingHandoff(),
      operationalContext: {
        present: true,
        encounterStatus: "signed",
        settlementId: SETTLEMENT,
        isPaid: false,
        lockAnomaly: true,
      },
    });
    assert.deepEqual(
      projectPortalEncounterView(input),
      projectPortalEncounterView(input),
    );
  });

  it("rejects a package without asOf instead of using the clock", () => {
    assert.throws(
      () => projectPortalEncounterView(pkg({ asOf: "   " })),
      PortalEncounterViewError,
    );
  });
});

describe("PP-11 PRODUCT-1 and PRODUCT-2", () => {
  it("exposes authorized metrics, invariants, and the epic contract", () => {
    const delivered = projectPortalEncounterView(
      pkg({
        clinicalHandoff: deliveredHandoff("visit_summary"),
        operationalContext: {
          present: true,
          encounterStatus: "locked",
          settlementId: SETTLEMENT,
          isPaid: true,
          lockAnomaly: false,
        },
      }),
    );
    assert.equal(delivered.metrics.portalEncounterAvailable, 1);
    assert.equal(delivered.metrics.portalHandoffPresent, 1);
    assert.equal(delivered.metrics.portalDocumentDelivered, 1);
    assert.equal(
      delivered.metrics.portalDocumentKind,
      PORTAL_DOCUMENT_KIND_VISIT_SUMMARY,
    );
    assert.equal(delivered.metrics.portalCommerciallyPaid, 1);
    const empty = projectPortalEncounterView(pkg());
    assert.equal(empty.metrics.portalHandoffPresent, 0);
    assert.equal(empty.metrics.portalDocumentKind, PORTAL_DOCUMENT_KIND_NONE);
    assert.ok(
      delivered.metrics.portalDocumentDelivered === 0 ||
        delivered.metrics.portalHandoffPresent === 1,
    );
    assert.deepEqual(
      Object.keys(PATIENT_PORTAL_CONTRACT),
      [...PRODUCT_EPIC_CONTRACT_SECTIONS],
    );
    for (const name of PATIENT_PORTAL_CONTRACT.Metrics) {
      assert.equal(typeof delivered.metrics[name], "number");
      assert.equal(typeof empty.metrics[name], "number");
    }
  });
});

describe("PP-12 Unavailable without minting", () => {
  it("returns unavailable for an empty EncounterId without calling PCC", async () => {
    const view = await loadPortalEncounterView({
      encounterId: "   ",
      ports: {
        fetchEncounter: async () => {
          throw new Error("PCC must not be called for an empty id");
        },
        loadCompletion: () => {
          throw new Error("PCC must not be called for an empty id");
        },
        loadSettlement: () => {
          throw new Error("PCC must not be called for an empty id");
        },
      },
    });
    assert.equal(view.availability, "unavailable");
    assert.equal(view.asOf, null);
    assert.equal(view.document, null);
    assert.equal(view.metrics.portalEncounterAvailable, 0);
    assert.equal(view.metrics.portalHandoffPresent, 0);
    assert.equal(view.metrics.portalDocumentDelivered, 0);
    assert.equal(view.metrics.portalDocumentKind, 0);
    assert.equal(view.metrics.portalCommerciallyPaid, 0);
  });

  it("returns unavailable when PCC cannot derive a package", async () => {
    const view = await loadPortalEncounterView({
      encounterId: ENCOUNTER,
      ports: {
        fetchEncounter: async () => null,
        loadCompletion: () => null,
        loadSettlement: () => null,
      },
    });
    assert.equal(view.availability, "unavailable");
    assert.equal(view.encounterId, ENCOUNTER);
    assert.equal(view.asOf, null);
    assert.equal(view.document, null);
  });

  it("loads a delivered package through ContinuityPackage ports", async () => {
    const clinical: ClinicalCompletionSnapshot = {
      ...createPendingSnapshot(ENCOUNTER, "signed"),
      clinicalActId: ACT,
      state: "delivered",
      documentKind: "visit_summary",
      deliveredAt: DELIVERED_AT,
      updatedAt: ASOF,
      consultationId: ENCOUNTER,
    };
    const view = await loadPortalEncounterView({
      encounterId: ENCOUNTER,
      asOf: ASOF,
      ports: {
        fetchEncounter: async (id) => ({
          id,
          status: "signed",
          updatedAt: ASOF,
        }),
        loadCompletion: () => clinical,
        loadSettlement: () => null,
      },
    });
    assert.equal(view.availability, "available");
    assert.equal(view.asOf, ASOF);
    assert.equal(view.delivery.status, "entregado");
    assert.equal(view.document?.documentKind, "visit_summary");
    assert.equal(view.commercial.settlementId, null);
  });
});
