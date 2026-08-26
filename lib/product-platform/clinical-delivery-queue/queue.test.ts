import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPendingSnapshot } from "../../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../../clinical-completion/types";
import { projectClinicalOperationsView } from "../../clinical-operations/read-model";
import { deriveContinuityPackage } from "../../patient-care-continuity/package";
import type { ContinuityPackage } from "../../patient-care-continuity/types";
import { PRODUCT_EPIC_CONTRACT_SECTIONS } from "../contract";
import {
  loadClinicalDeliveryQueue,
  projectClinicalDeliveryQueue,
} from "./queue";
import {
  CLINICAL_DELIVERY_QUEUE_CONTRACT,
  ClinicalDeliveryQueueError,
} from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const ENCOUNTER_A = "11111111-1111-4111-8111-111111111111";
const ENCOUNTER_B = "22222222-2222-4222-8222-222222222222";
const ASOF = "2026-08-24T20:00:00.000Z";

function completion(
  encounterId: string,
  overrides: Partial<ClinicalCompletionSnapshot> = {},
): ClinicalCompletionSnapshot {
  return {
    ...createPendingSnapshot(encounterId, "signed"),
    state: "document_ready",
    documentKind: "visit_summary",
    deliveredAt: null,
    updatedAt: ASOF,
    ...overrides,
    consultationId: encounterId,
  };
}

function pkg(
  encounterId: string,
  overrides: Partial<ClinicalCompletionSnapshot> = {},
): ContinuityPackage {
  const view = projectClinicalOperationsView({
    encounterId,
    asOf: ASOF,
    encounter: { id: encounterId, status: "signed", updatedAt: ASOF },
    completion: completion(encounterId, overrides),
    settlement: null,
  });
  return deriveContinuityPackage(view, {
    currentClinicalActId: view.completion.present
      ? view.completion.clinicalActId
      : null,
  });
}

function absentPkg(encounterId: string): ContinuityPackage {
  const view = projectClinicalOperationsView({
    encounterId,
    asOf: ASOF,
    encounter: { id: encounterId, status: "signed", updatedAt: ASOF },
    completion: null,
    settlement: null,
  });
  return deriveContinuityPackage(view);
}

describe("PCC-Q1 One Encounter, current ClinicalActId", () => {
  it("emits one item per EncounterId with the current act", () => {
    const first = pkg(ENCOUNTER_A);
    const queue = projectClinicalDeliveryQueue([first, pkg(ENCOUNTER_B)]);
    assert.equal(queue.items.length, 2);
    assert.equal(queue.items[0]?.encounterId, ENCOUNTER_A);
    assert.equal(
      queue.items[0]?.clinicalActId,
      first.clinicalHandoff.present
        ? first.clinicalHandoff.clinicalActId
        : "",
    );
  });

  it("rejects two different acts for the same Encounter", () => {
    const a = pkg(ENCOUNTER_A);
    const other = pkg(ENCOUNTER_A, {
      clinicalActId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    });
    assert.throws(
      () => projectClinicalDeliveryQueue([a, other]),
      ClinicalDeliveryQueueError,
    );
  });
});

describe("PCC-Q2 Only document_ready and not delivered", () => {
  it("keeps document_ready without deliveredAt and drops the rest", () => {
    const pending = pkg(ENCOUNTER_A);
    const delivered = pkg(ENCOUNTER_B, {
      state: "delivered",
      deliveredAt: ASOF,
    });
    const emitted = pkg("33333333-3333-4333-8333-333333333333", {
      state: "emitted",
      documentKind: null,
    });
    const queue = projectClinicalDeliveryQueue([pending, delivered, emitted]);
    assert.equal(queue.items.length, 1);
    assert.equal(queue.items[0]?.encounterId, ENCOUNTER_A);
    assert.equal(queue.metrics.skippedAlreadyDelivered, 1);
    assert.equal(queue.metrics.skippedOtherState, 1);
  });
});

describe("PCC-Q3 No Core writes and no frozen chrome", () => {
  it("does not import write workflows or frozen surfaces", () => {
    const files = [
      "lib/product-platform/clinical-delivery-queue/queue.ts",
      "lib/product-platform/clinical-delivery-queue/types.ts",
    ];
    const forbidden = [
      "runClinicalCompletion",
      "supersedeClinicalAct",
      "markClinicalCompletionDelivered",
      "ensureSettlement",
      "observeCommercialSettlement",
      "persistSettlementAtomic",
      "saveClinicalCompletionSnapshot",
      "ContinuityPanelShell",
      "EncounterClosureSection",
      "ClinicalCompletionSection",
      "PanelLayout",
      "app/panel/consultas/page",
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

describe("PCC-Q4 Absent completion is not queued", () => {
  it("skips Encounters without a clinical handoff", () => {
    const queue = projectClinicalDeliveryQueue([
      absentPkg(ENCOUNTER_A),
      pkg(ENCOUNTER_B),
    ]);
    assert.equal(queue.items.length, 1);
    assert.equal(queue.items[0]?.encounterId, ENCOUNTER_B);
    assert.equal(queue.metrics.skippedAbsentCompletion, 1);
  });
});

describe("PRODUCT-1 Metrics", () => {
  it("exposes clinical and operational impact metrics", () => {
    const queue = projectClinicalDeliveryQueue([
      pkg(ENCOUNTER_A, { documentKind: "prescription" }),
      pkg(ENCOUNTER_B, { documentKind: "visit_summary" }),
      absentPkg("44444444-4444-4444-8444-444444444444"),
    ]);
    assert.equal(queue.metrics.encountersScanned, 3);
    assert.equal(queue.metrics.pendingDeliveryCount, 2);
    assert.equal(queue.metrics.pendingPrescriptionCount, 1);
    assert.equal(queue.metrics.pendingVisitSummaryCount, 1);
    assert.equal(queue.metrics.skippedAbsentCompletion, 1);
    for (const name of CLINICAL_DELIVERY_QUEUE_CONTRACT.Metrics) {
      assert.equal(typeof queue.metrics[name], "number");
    }
  });

  it("does not drop unpaid Encounters from the clinical queue", () => {
    const pending = pkg(ENCOUNTER_A);
    if (pending.operationalContext.present) {
      pending.operationalContext.isPaid = false;
    }
    const queue = projectClinicalDeliveryQueue([pending]);
    assert.equal(queue.metrics.pendingDeliveryCount, 1);
  });
});

describe("PRODUCT-2 Epic contract", () => {
  it("declares Objective, Dependencies, Read Model, No Writes, PASS, Metrics", () => {
    assert.deepEqual(
      Object.keys(CLINICAL_DELIVERY_QUEUE_CONTRACT),
      [...PRODUCT_EPIC_CONTRACT_SECTIONS],
    );
    assert.ok(CLINICAL_DELIVERY_QUEUE_CONTRACT.Objective.length > 0);
    assert.match(CLINICAL_DELIVERY_QUEUE_CONTRACT.Dependencies, /Read-only/);
    assert.match(CLINICAL_DELIVERY_QUEUE_CONTRACT["No Writes"], /Does not call/);
    assert.ok(CLINICAL_DELIVERY_QUEUE_CONTRACT.PASS.includes("PCC-Q1"));
    assert.ok(CLINICAL_DELIVERY_QUEUE_CONTRACT.PASS.includes("PRODUCT-1"));
  });
});

describe("loadClinicalDeliveryQueue", () => {
  it("loads from Continuity packages via ports", async () => {
    const clinical = completion(ENCOUNTER_A);
    const queue = await loadClinicalDeliveryQueue({
      asOf: ASOF,
      ports: {
        listEncounterIds: async () => [ENCOUNTER_A, ENCOUNTER_B],
        fetchEncounter: async (id) => ({
          id,
          status: "signed",
          updatedAt: ASOF,
        }),
        loadCompletion: (id) =>
          id === ENCOUNTER_A ? clinical : null,
        loadSettlement: () => null,
      },
    });
    assert.equal(queue.kind, "clinical_delivery_queue");
    assert.equal(queue.items.length, 1);
    assert.equal(queue.items[0]?.clinicalActId, clinical.clinicalActId);
    assert.equal(queue.metrics.skippedAbsentCompletion, 1);
  });
});
