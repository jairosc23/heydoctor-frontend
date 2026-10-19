import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPendingSnapshot } from "../../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../../clinical-completion/types";
import { projectClinicalOperationsView } from "../../clinical-operations/read-model";
import type { ClinicalOperationsView } from "../../clinical-operations/types";
import { createPendingSettlement } from "../../commercial-settlement/types";
import type { CommercialSettlementSnapshot } from "../../commercial-settlement/types";
import { PRODUCT_EPIC_CONTRACT_SECTIONS } from "../contract";
import {
  classifyRevenueIntegrity,
  loadRevenueIntegrityDashboard,
  projectRevenueIntegrityDashboard,
} from "./dashboard";
import {
  REVENUE_INTEGRITY_CONTRACT,
  RevenueIntegrityError,
} from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const ENCOUNTER_A = "11111111-1111-4111-8111-111111111111";
const ENCOUNTER_B = "22222222-2222-4222-8222-222222222222";
const ASOF = "2026-08-24T21:00:00.000Z";

function settlement(
  encounterId: string,
  overrides: Partial<CommercialSettlementSnapshot> = {},
): CommercialSettlementSnapshot {
  return {
    ...createPendingSettlement(encounterId, {
      encounterStatus: "signed",
      updatedAt: ASOF,
    }),
    ...overrides,
    encounterId,
  };
}

function view(input: {
  encounterId?: string;
  encounterStatus?: string;
  settlement?: CommercialSettlementSnapshot | null;
  completion?: ClinicalCompletionSnapshot | null;
}): ClinicalOperationsView {
  const encounterId = input.encounterId ?? ENCOUNTER_A;
  return projectClinicalOperationsView({
    encounterId,
    asOf: ASOF,
    encounter: {
      id: encounterId,
      status: input.encounterStatus ?? "signed",
      updatedAt: ASOF,
    },
    completion: input.completion === undefined ? null : input.completion,
    settlement: input.settlement === undefined ? null : input.settlement,
  });
}

describe("REV-1 signed unpaid", () => {
  it("maps signed + !isPaid to signed_unpaid, not commercially_locked", () => {
    const item = classifyRevenueIntegrity(
      view({
        encounterStatus: "signed",
        settlement: settlement(ENCOUNTER_A, {
          isPaid: false,
          state: "payment_initiated",
        }),
      }),
    );
    assert.equal(item.bucket, "signed_unpaid");
    assert.notEqual(item.bucket, "commercially_locked");
    const absent = classifyRevenueIntegrity(
      view({ encounterStatus: "signed", settlement: null }),
    );
    assert.equal(absent.bucket, "signed_unpaid");
    assert.equal(absent.settlementId, null);
  });
});

describe("REV-2 lock anomaly is not repaired", () => {
  it("maps locked Encounter without payment to lock_anomaly", () => {
    const item = classifyRevenueIntegrity(
      view({
        encounterStatus: "locked",
        settlement: settlement(ENCOUNTER_A, {
          isPaid: false,
          lockAnomaly: true,
          encounterStatus: "locked",
          state: "pending",
        }),
      }),
    );
    assert.equal(item.bucket, "lock_anomaly");
    assert.equal(item.lockAnomaly, true);
    assert.equal(item.isPaid, false);
  });
});

describe("REV-3 lock anomaly does not count as commercially locked", () => {
  it("does not increment commerciallyLockedCount", () => {
    const dashboard = projectRevenueIntegrityDashboard([
      view({
        encounterStatus: "locked",
        settlement: settlement(ENCOUNTER_A, {
          isPaid: false,
          lockAnomaly: true,
          encounterStatus: "locked",
        }),
      }),
    ]);
    assert.equal(dashboard.metrics.lockAnomalyCount, 1);
    assert.equal(dashboard.metrics.commerciallyLockedCount, 0);
  });
});

describe("REV-4 payment_verified, invoiced, commercially_locked", () => {
  it("classifies the three paid stages", () => {
    const verified = classifyRevenueIntegrity(
      view({
        settlement: settlement(ENCOUNTER_A, {
          isPaid: true,
          state: "payment_verified",
          invoiceId: null,
          paymentVerifiedAt: ASOF,
        }),
      }),
    );
    assert.equal(verified.bucket, "payment_verified");

    const invoiced = classifyRevenueIntegrity(
      view({
        encounterId: ENCOUNTER_B,
        settlement: settlement(ENCOUNTER_B, {
          isPaid: true,
          state: "invoiced",
          invoiceId: "inv-1",
          paymentVerifiedAt: ASOF,
        }),
      }),
    );
    assert.equal(invoiced.bucket, "invoiced");

    const closed = classifyRevenueIntegrity(
      view({
        encounterId: "33333333-3333-4333-8333-333333333333",
        encounterStatus: "locked",
        settlement: settlement("33333333-3333-4333-8333-333333333333", {
          isPaid: true,
          state: "locked",
          invoiceId: "inv-2",
          lockAnomaly: false,
          encounterStatus: "locked",
          paymentVerifiedAt: ASOF,
        }),
      }),
    );
    assert.equal(closed.bucket, "commercially_locked");
  });
});

describe("REV-5 Completion does not change the bucket", () => {
  it("ignores deliveredAt and document_ready when classifying", () => {
    const commercial = settlement(ENCOUNTER_A, {
      isPaid: false,
      state: "pending",
    });
    const without = classifyRevenueIntegrity(
      view({ settlement: commercial, completion: null }),
    );
    const withAct = classifyRevenueIntegrity(
      view({
        settlement: commercial,
        completion: {
          ...createPendingSnapshot(ENCOUNTER_A, "signed"),
          state: "document_ready",
          documentKind: "visit_summary",
          deliveredAt: ASOF,
          updatedAt: ASOF,
        },
      }),
    );
    assert.equal(without.bucket, withAct.bucket);
    assert.equal(without.bucket, "signed_unpaid");
  });
});

describe("REV-6 / REV-10 / REV-11 No writes and freeze boundary", () => {
  it("does not import workflows, persistence, Delivery Queue, or frozen chrome", () => {
    const files = [
      "lib/product-platform/revenue-integrity/dashboard.ts",
      "lib/product-platform/revenue-integrity/types.ts",
      "app/panel/integridad-ingresos/page.tsx",
    ];
    const forbidden = [
      "runClinicalCompletion",
      "ensureSettlement",
      "observeCommercialSettlement",
      "initiateCommercialPayment",
      "persistSettlementAtomic",
      "saveClinicalCompletionSnapshot",
      "projectClinicalDeliveryQueue",
      "loadClinicalDeliveryQueue",
      "clinical-delivery-queue",
      "ContinuityPanelShell",
      "CommercialSettlementSection",
      "ClinicalCompletionSection",
      "EncounterClosureSection",
      "PanelLayout",
      "fetchInvoiceDashboard",
      "facturacion",
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
  });
});

describe("REV-7 No new identity", () => {
  it("reuses EncounterId and SettlementId from COD only", () => {
    const snap = settlement(ENCOUNTER_A, { isPaid: true, invoiceId: "inv-9" });
    const item = classifyRevenueIntegrity(view({ settlement: snap }));
    assert.equal(item.encounterId, ENCOUNTER_A);
    assert.equal(item.settlementId, snap.settlementId);
  });
});

describe("REV-8 PRODUCT-1 and PRODUCT-2", () => {
  it("exposes required metrics and the epic contract", () => {
    const dashboard = projectRevenueIntegrityDashboard([
      view({ settlement: null }),
      view({
        encounterId: ENCOUNTER_B,
        settlement: settlement(ENCOUNTER_B, {
          isPaid: true,
          invoiceId: null,
          state: "payment_verified",
          paymentVerifiedAt: ASOF,
        }),
      }),
    ]);
    assert.equal(dashboard.metrics.signedUnpaidCount, 1);
    assert.equal(dashboard.metrics.verifiedWithoutInvoiceCount, 1);
    assert.equal(typeof dashboard.metrics.invoicedUnlockedCount, "number");
    assert.equal(typeof dashboard.metrics.lockAnomalyCount, "number");
    assert.equal(typeof dashboard.metrics.commerciallyLockedCount, "number");
    assert.deepEqual(
      Object.keys(REVENUE_INTEGRITY_CONTRACT),
      [...PRODUCT_EPIC_CONTRACT_SECTIONS],
    );
    for (const name of REVENUE_INTEGRITY_CONTRACT.Metrics) {
      assert.equal(typeof dashboard.metrics[name], "number");
    }
  });
});

describe("REV-9 Determinism", () => {
  it("projects the same dashboard from the same COD views", () => {
    const views = [
      view({ settlement: null }),
      view({
        encounterId: ENCOUNTER_B,
        encounterStatus: "locked",
        settlement: settlement(ENCOUNTER_B, {
          isPaid: false,
          lockAnomaly: true,
          encounterStatus: "locked",
        }),
      }),
    ];
    assert.deepEqual(
      projectRevenueIntegrityDashboard(views),
      projectRevenueIntegrityDashboard(views),
    );
  });
});

describe("REV-12 product surface and mix guard", () => {
  it("rejects mixed Settlement identities for one Encounter", () => {
    const first = view({
      settlement: settlement(ENCOUNTER_A, { isPaid: false }),
    });
    const second = view({
      settlement: settlement(ENCOUNTER_A, {
        settlementId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        isPaid: true,
        invoiceId: "inv-x",
        state: "invoiced",
      }),
    });
    assert.throws(
      () => projectRevenueIntegrityDashboard([first, second]),
      RevenueIntegrityError,
    );
  });
});

describe("loadRevenueIntegrityDashboard", () => {
  it("loads only from ClinicalOperationsView ports", async () => {
    const dashboard = await loadRevenueIntegrityDashboard({
      asOf: ASOF,
      ports: {
        listEncounterIds: async () => [ENCOUNTER_A],
        fetchEncounter: async () => ({
          id: ENCOUNTER_A,
          status: "signed",
          updatedAt: ASOF,
        }),
        loadCompletion: () => null,
        loadSettlement: () =>
          settlement(ENCOUNTER_A, {
            isPaid: true,
            invoiceId: "inv-load",
            state: "invoiced",
            paymentVerifiedAt: ASOF,
          }),
      },
    });
    assert.equal(dashboard.kind, "revenue_integrity_dashboard");
    assert.equal(dashboard.items[0]?.bucket, "invoiced");
    assert.equal(dashboard.metrics.invoicedUnlockedCount, 1);
  });
});
