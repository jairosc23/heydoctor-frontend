import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearClinicalCompletionSnapshots,
  loadClinicalCompletionSnapshot,
  saveClinicalCompletionSnapshot,
} from "../clinical-completion/store";
import { createPendingSnapshot } from "../clinical-completion/types";
import {
  OFFICIAL_IDENTITIES,
  OFFICIAL_IDENTITY_NAMES,
} from "./identities";
import {
  clearCommercialSettlements,
  encounterIndexKey,
  loadSettlementByEncounterId,
  loadSettlementById,
  persistSettlementAtomic,
  snapshotStorageKey,
  useSettlementStorageForTests,
  type SettlementStorage,
} from "./store";
import {
  createPendingSettlement,
  reconstructCommercialSettlement,
  SettlementGateError,
  SettlementIntegrityError,
} from "./types";
import {
  ensureSettlement,
  getSettlementAudit,
  initiateCommercialPayment,
  observeCommercialSettlement,
  type CommercialSettlementPorts,
} from "./workflow";
import type { ClinicalInvoice } from "../services/invoices";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const ENCOUNTER_A = "11111111-1111-4111-8111-111111111111";
const ENCOUNTER_B = "22222222-2222-4222-8222-222222222222";
const SESSION_ID = "pay-session-1";
const INVOICE_ID = "inv-1";

type World = {
  encounter: { id: string; status: string };
  payment: { isPaid: boolean; hasPending: boolean; hasFailed: boolean };
  invoices: ClinicalInvoice[];
  sessions: number;
  invoicesCreated: number;
};

function invoice(id = INVOICE_ID): ClinicalInvoice {
  return {
    id,
    consultationId: ENCOUNTER_A,
    amountClp: 15000,
    documentNumber: "INV-1",
    status: "paid",
  };
}

function createWorld(overrides: Partial<World> = {}): World {
  return {
    encounter: { id: ENCOUNTER_A, status: "signed" },
    payment: { isPaid: false, hasPending: false, hasFailed: false },
    invoices: [],
    sessions: 0,
    invoicesCreated: 0,
    ...overrides,
  };
}

function portsFor(
  world: World,
  overrides: Partial<CommercialSettlementPorts> = {},
): CommercialSettlementPorts {
  const base: CommercialSettlementPorts = {
    fetchEncounter: async (id) => {
      if (id !== world.encounter.id) {
        throw new Error("Encounter not found");
      }
      return world.encounter;
    },
    fetchPaymentStatus: async () => world.payment,
    createPaymentSession: async () => {
      world.sessions += 1;
      return { paymentId: SESSION_ID, paymentUrl: "https://payku.test/pay" };
    },
    findInvoice: async () => world.invoices[0] ?? null,
    createInvoice: async () => {
      world.invoicesCreated += 1;
      const created = invoice(`inv-${world.invoicesCreated}`);
      world.invoices.push(created);
      return created;
    },
    fetchInvoiceAmount: async () => 15000,
    loadByEncounterId: loadSettlementByEncounterId,
    loadById: loadSettlementById,
    persist: persistSettlementAtomic,
  };
  return { ...base, ...overrides };
}

function memoryStorage(): SettlementStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    keys: () => [...map.keys()],
  };
}

function failOnWrite(
  n: number,
): SettlementStorage & { map: Map<string, string> } {
  const inner = memoryStorage();
  let writes = 0;
  return {
    map: inner.map,
    getItem: inner.getItem,
    setItem: (key, value) => {
      writes += 1;
      if (writes === n) throw new Error("storage quota");
      inner.setItem(key, value);
    },
    removeItem: inner.removeItem,
    keys: inner.keys,
  };
}

beforeEach(() => {
  useSettlementStorageForTests(null);
  clearCommercialSettlements();
  clearClinicalCompletionSnapshots();
});

describe("CS-1 SettlementId independent of ClinicalActId", () => {
  it("mints a SettlementId distinct from ClinicalActId", async () => {
    const clinical = saveClinicalCompletionSnapshot(
      createPendingSnapshot(ENCOUNTER_A, "signed"),
    );
    const world = createWorld();
    const snapshot = await ensureSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.ok(snapshot.settlementId);
    assert.notEqual(snapshot.settlementId, clinical.clinicalActId);
    assert.equal(snapshot.encounterId, ENCOUNTER_A);
  });
});

describe("CS-2 Lock only after payment_verified", () => {
  it("does not treat locked Encounter without isPaid as commercial lock", async () => {
    const world = createWorld({
      encounter: { id: ENCOUNTER_A, status: "locked" },
      payment: { isPaid: false, hasPending: false, hasFailed: false },
    });
    const snapshot = await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.equal(snapshot.isPaid, false);
    assert.equal(snapshot.lockAnomaly, true);
    assert.notEqual(snapshot.state, "locked");
  });

  it("stays invoiced when paid but Encounter is still signed", async () => {
    const world = createWorld({
      payment: { isPaid: true, hasPending: false, hasFailed: false },
    });
    const snapshot = await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.equal(snapshot.isPaid, true);
    assert.equal(snapshot.state, "invoiced");
    assert.equal(snapshot.lockAnomaly, false);
  });

  it("reaches commercial locked only when isPaid and Encounter is locked", async () => {
    const world = createWorld({
      encounter: { id: ENCOUNTER_A, status: "locked" },
      payment: { isPaid: true, hasPending: false, hasFailed: false },
    });
    const snapshot = await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.equal(snapshot.isPaid, true);
    assert.equal(snapshot.state, "locked");
    assert.equal(snapshot.lockAnomaly, false);
  });
});

describe("CS-3 Lock never modifies Clinical Completion", () => {
  it("leaves ClinicalActId and completion snapshot unchanged", async () => {
    const before = saveClinicalCompletionSnapshot({
      ...createPendingSnapshot(ENCOUNTER_A, "signed"),
      state: "document_ready",
      documentKind: "visit_summary",
      prescriptionId: null,
    });
    const world = createWorld({
      encounter: { id: ENCOUNTER_A, status: "locked" },
      payment: { isPaid: true, hasPending: false, hasFailed: false },
    });
    await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    const after = loadClinicalCompletionSnapshot(ENCOUNTER_A);
    assert.ok(after);
    assert.equal(after.clinicalActId, before.clinicalActId);
    assert.equal(after.state, before.state);
    assert.equal(after.documentKind, before.documentKind);
    assert.equal(after.prescriptionId, before.prescriptionId);
    assert.equal(after.consultationId, before.consultationId);
  });
});

describe("CS-4 Payment only when Encounter is signed", () => {
  it("does not create a payment session for completed, locked, or draft", async () => {
    for (const status of ["completed", "locked", "draft"] as const) {
      clearCommercialSettlements();
      const world = createWorld({
        encounter: { id: ENCOUNTER_A, status },
      });
      await assert.rejects(
        () =>
          initiateCommercialPayment({
            encounterId: ENCOUNTER_A,
            ports: portsFor(world),
          }),
        SettlementGateError,
      );
      assert.equal(world.sessions, 0);
    }
  });

  it("creates a payment session when Encounter is signed and unpaid", async () => {
    const world = createWorld();
    const result = await initiateCommercialPayment({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.equal(world.sessions, 1);
    assert.equal(result.snapshot.state, "payment_initiated");
    assert.equal(result.paymentUrl, "https://payku.test/pay");
    assert.equal(result.snapshot.paymentSessionId, SESSION_ID);
  });
});

describe("CS-5 Query string is not verification", () => {
  it("ignores payment=success when isPaid is false", async () => {
    const world = createWorld();
    const snapshot = await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      paymentQuery: "success",
      ports: portsFor(world),
    });
    assert.equal(snapshot.isPaid, false);
    assert.notEqual(snapshot.state, "payment_verified");
    assert.notEqual(snapshot.state, "invoiced");
    assert.notEqual(snapshot.state, "locked");
  });
});

describe("CS-6 Idempotency", () => {
  it("reuses the same SettlementId and does not open another session after isPaid", async () => {
    const world = createWorld();
    const first = await initiateCommercialPayment({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    world.payment.isPaid = true;
    const second = await initiateCommercialPayment({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.equal(second.snapshot.settlementId, first.snapshot.settlementId);
    assert.equal(second.snapshot.encounterId, first.snapshot.encounterId);
    assert.equal(world.sessions, 1);
    assert.equal(second.paymentUrl, null);
  });
});

describe("CS-7 No clinical writes from commercial ports", () => {
  it("does not import HAB, emission, or Clinical Completion into the workflow", () => {
    const source = readFileSync(
      join(ROOT, "lib/commercial-settlement/workflow.ts"),
      "utf8",
    );
    for (const token of [
      "clinical-completion",
      "runClinicalCompletion",
      "saveClinicalCompletionSnapshot",
      "emission-pipeline",
      "hab-authority",
      "listHabDecisions",
    ]) {
      assert.equal(source.includes(token), false, `must not contain ${token}`);
    }
  });
});

describe("CS-8 Invoice only after payment_verified", () => {
  it("does not create an invoice when unpaid", async () => {
    const world = createWorld();
    const snapshot = await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.equal(world.invoicesCreated, 0);
    assert.equal(snapshot.invoiceId, null);
  });

  it("creates an invoice after isPaid", async () => {
    const world = createWorld({
      payment: { isPaid: true, hasPending: false, hasFailed: false },
    });
    const snapshot = await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.equal(world.invoicesCreated, 1);
    assert.ok(snapshot.invoiceId);
    assert.equal(snapshot.state, "invoiced");
  });
});

describe("CS-9 Referential integrity", () => {
  it("requires encounterId and a real Encounter", async () => {
    assert.throws(
      () => createPendingSettlement(""),
      SettlementIntegrityError,
    );
    await assert.rejects(
      () =>
        ensureSettlement({
          encounterId: ENCOUNTER_B,
          ports: portsFor(createWorld()),
        }),
      /Encounter not found/,
    );
    assert.equal(loadSettlementByEncounterId(ENCOUNTER_B), null);
  });

  it("never reassigns a SettlementId to another Encounter", async () => {
    const world = createWorld();
    const snapshot = await ensureSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.throws(
      () =>
        persistSettlementAtomic({
          ...snapshot,
          encounterId: ENCOUNTER_B,
        }),
      SettlementIntegrityError,
    );
    assert.equal(
      loadSettlementById(snapshot.settlementId)?.encounterId,
      ENCOUNTER_A,
    );
    assert.equal(loadSettlementByEncounterId(ENCOUNTER_B), null);
  });
});

describe("CS-10 Transactional integrity", () => {
  it("births settlementId and encounterId together", async () => {
    const world = createWorld();
    const snapshot = await ensureSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    assert.ok(snapshot.settlementId);
    assert.equal(snapshot.encounterId, ENCOUNTER_A);
    assert.equal(
      loadSettlementById(snapshot.settlementId)?.encounterId,
      snapshot.encounterId,
    );
  });

  it("rolls back completely when the index write fails", () => {
    const storage = failOnWrite(2);
    useSettlementStorageForTests(storage);
    const pending = createPendingSettlement(ENCOUNTER_A);
    assert.throws(() => persistSettlementAtomic(pending));
    assert.equal(loadSettlementById(pending.settlementId), null);
    assert.equal(loadSettlementByEncounterId(ENCOUNTER_A), null);
    assert.equal(storage.getItem(snapshotStorageKey(pending.settlementId)), null);
    assert.equal(storage.getItem(encounterIndexKey(ENCOUNTER_A)), null);
  });

  it("leaves no record when the snapshot write fails", () => {
    const storage = failOnWrite(1);
    useSettlementStorageForTests(storage);
    const pending = createPendingSettlement(ENCOUNTER_A);
    assert.throws(() => persistSettlementAtomic(pending));
    assert.equal(loadSettlementById(pending.settlementId), null);
    assert.equal(loadSettlementByEncounterId(ENCOUNTER_A), null);
    assert.equal(storage.map.size, 0);
  });

  it("treats an encounter index without snapshot as absent", () => {
    const storage = memoryStorage();
    useSettlementStorageForTests(storage);
    storage.setItem(encounterIndexKey(ENCOUNTER_A), "orphan-settlement-id");
    assert.equal(loadSettlementByEncounterId(ENCOUNTER_A), null);
  });
});

describe("CS-11 Commercial auditability", () => {
  it("reconstructs Encounter → Payment Session → Verification → Invoice → Lock", async () => {
    const world = createWorld();
    const initiated = await initiateCommercialPayment({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    world.payment.isPaid = true;
    world.encounter.status = "locked";
    const closed = await observeCommercialSettlement({
      encounterId: ENCOUNTER_A,
      ports: portsFor(world),
    });
    const audit = getSettlementAudit(closed.settlementId);
    assert.ok(audit);
    assert.equal(audit.settlementId, initiated.snapshot.settlementId);
    assert.equal(audit.encounter.encounterId, ENCOUNTER_A);
    assert.equal(audit.encounter.status, "locked");
    assert.equal(audit.paymentSession.paymentSessionId, SESSION_ID);
    assert.equal(audit.paymentVerification.isPaid, true);
    assert.ok(audit.paymentVerification.verifiedAt);
    assert.ok(audit.invoice.invoiceId);
    assert.equal(audit.lock.locked, true);
    assert.equal(audit.lock.anomalous, false);
    const chain = reconstructCommercialSettlement(closed);
    assert.equal(chain.settlementId, audit.settlementId);
  });
});

describe("Official identity table", () => {
  it("names EncounterId, ClinicalActId, SettlementId, and CorrelationId", () => {
    assert.deepEqual(OFFICIAL_IDENTITY_NAMES, [
      "EncounterId",
      "ClinicalActId",
      "SettlementId",
      "CorrelationId",
    ]);
    assert.equal(
      OFFICIAL_IDENTITIES.CorrelationId.domain,
      "Observability",
    );
    assert.match(
      OFFICIAL_IDENTITIES.SettlementId.not,
      /ClinicalActId/,
    );
  });
});

describe("Commercial Settlement freeze", () => {
  it("does not import Copilot, Foundation, portal, overlay, or RC-19A chrome", () => {
    const files = [
      "lib/commercial-settlement/workflow.ts",
      "lib/commercial-settlement/store.ts",
      "lib/commercial-settlement/types.ts",
      "lib/commercial-settlement/api.ts",
      "app/panel/consultas/[id]/_components/chart/CommercialSettlementSection.tsx",
    ];
    const forbidden = [
      "ClinicalCopilotDrawer",
      "clinical-foundation",
      "ShareConsultationDialog",
      "GlobalWhatsAppFab",
      "PanelLayout",
      "/portal/",
      "visual-surfaces",
      "getOrCreateClientCorrelationId",
      "runClinicalCompletion",
      "ClinicalCompletionSection",
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
