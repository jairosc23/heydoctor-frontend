import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPendingSnapshot } from "../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../clinical-completion/types";
import { createPendingSettlement } from "../commercial-settlement/types";
import type { CommercialSettlementSnapshot } from "../commercial-settlement/types";
import {
  ClinicalOperationsConsistencyError,
  deriveLogicalAsOf,
  loadClinicalOperationsView,
  projectClinicalOperationsView,
  type ClinicalOperationsReadPorts,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const ENCOUNTER_A = "11111111-1111-4111-8111-111111111111";
const ENCOUNTER_B = "22222222-2222-4222-8222-222222222222";
const ASOF = "2026-08-24T20:00:00.000Z";
const ASOF_EARLIER = "2026-08-24T18:00:00.000Z";

function completion(
  overrides: Partial<ClinicalCompletionSnapshot> = {},
): ClinicalCompletionSnapshot {
  return {
    ...createPendingSnapshot(ENCOUNTER_A, "signed"),
    state: "document_ready",
    documentKind: "visit_summary",
    updatedAt: "2026-08-24T19:00:00.000Z",
    ...overrides,
    consultationId: overrides.consultationId ?? ENCOUNTER_A,
  };
}

function settlement(
  overrides: Partial<CommercialSettlementSnapshot> = {},
): CommercialSettlementSnapshot {
  return {
    ...createPendingSettlement(ENCOUNTER_A, {
      encounterStatus: "signed",
      updatedAt: "2026-08-24T19:30:00.000Z",
    }),
    ...overrides,
    encounterId: overrides.encounterId ?? ENCOUNTER_A,
  };
}

function ports(input: {
  encounter?: { id: string; status?: string | null; updatedAt?: string | null } | null;
  completion?: ClinicalCompletionSnapshot | null;
  settlement?: CommercialSettlementSnapshot | null;
}): ClinicalOperationsReadPorts {
  return {
    fetchEncounter: async () => input.encounter ?? null,
    loadCompletion: () => input.completion ?? null,
    loadSettlement: () => input.settlement ?? null,
  };
}

function project(overrides: {
  encounter?: { id: string; status?: string | null; updatedAt?: string | null } | null;
  completion?: ClinicalCompletionSnapshot | null;
  settlement?: CommercialSettlementSnapshot | null;
  asOf?: string;
  encounterId?: string;
} = {}) {
  return projectClinicalOperationsView({
    encounterId: overrides.encounterId ?? ENCOUNTER_A,
    asOf: overrides.asOf ?? ASOF,
    encounter:
      overrides.encounter === undefined
        ? { id: ENCOUNTER_A, status: "signed", updatedAt: ASOF_EARLIER }
        : overrides.encounter,
    completion: overrides.completion === undefined ? null : overrides.completion,
    settlement: overrides.settlement === undefined ? null : overrides.settlement,
  });
}

describe("COD-1 Read only", () => {
  it("does not call write workflows from the projection module", () => {
    const source = readFileSync(
      join(ROOT, "lib/clinical-operations/read-model.ts"),
      "utf8",
    );
    for (const token of [
      "runClinicalCompletion",
      "supersedeClinicalAct",
      "markClinicalCompletionDelivered",
      "saveClinicalCompletionSnapshot",
      "ensureSettlement",
      "observeCommercialSettlement",
      "initiateCommercialPayment",
      "persistSettlementAtomic",
      "createPaymentSession",
      "createInvoiceForConsultation",
    ]) {
      assert.equal(source.includes(token), false, `must not contain ${token}`);
    }
  });
});

describe("COD-2 Join by EncounterId", () => {
  it("drops completion or settlement bound to another Encounter", () => {
    const view = project({
      completion: completion({ consultationId: ENCOUNTER_B }),
      settlement: settlement({ encounterId: ENCOUNTER_B }),
    });
    assert.equal(view.encounterId, ENCOUNTER_A);
    assert.equal(view.completion.present, false);
    assert.equal(view.settlement.present, false);
  });
});

describe("COD-3 Official identities stay distinct", () => {
  it("keeps ClinicalActId ≠ SettlementId and neither is CorrelationId", () => {
    const clinical = completion();
    const commercial = settlement();
    const view = project({ completion: clinical, settlement: commercial });
    assert.equal(view.completion.present, true);
    assert.equal(view.settlement.present, true);
    if (!view.completion.present || !view.settlement.present) return;
    assert.notEqual(view.completion.clinicalActId, view.settlement.settlementId);
    assert.notEqual(view.completion.clinicalActId, view.encounterId);
    assert.notEqual(view.settlement.settlementId, view.encounterId);
    assert.notEqual(view.completion.clinicalActId, "CorrelationId");
    assert.notEqual(view.settlement.settlementId, "CorrelationId");
  });
});

describe("COD-4 Absent sources are not minted", () => {
  it("projects absent completion and settlement without inventing ids", () => {
    const view = project({ completion: null, settlement: null });
    assert.equal(view.completion.present, false);
    assert.equal(view.settlement.present, false);
    assert.equal("clinicalActId" in view.completion, false);
    assert.equal("settlementId" in view.settlement, false);
  });
});

describe("COD-5 Encounter status is copied, not written", () => {
  it("mirrors Encounter status on the view", () => {
    const view = project({
      encounter: { id: ENCOUNTER_A, status: "locked", updatedAt: ASOF },
    });
    assert.equal(view.encounter.present, true);
    if (!view.encounter.present) return;
    assert.equal(view.encounter.status, "locked");
  });
});

describe("COD-6 Lock anomaly is projected, not repaired", () => {
  it("surfaces lockAnomaly from the settlement snapshot", () => {
    const view = project({
      encounter: { id: ENCOUNTER_A, status: "locked", updatedAt: ASOF },
      settlement: settlement({
        isPaid: false,
        lockAnomaly: true,
        encounterStatus: "locked",
      }),
    });
    assert.equal(view.settlement.present, true);
    if (!view.settlement.present) return;
    assert.equal(view.settlement.lockAnomaly, true);
    assert.equal(view.settlement.isPaid, false);
    assert.notEqual(view.settlement.state, "locked");
  });

  it("does not invent lockAnomaly when the settlement snapshot is clean", () => {
    const view = project({
      encounter: { id: ENCOUNTER_A, status: "locked", updatedAt: ASOF },
      settlement: settlement({
        isPaid: false,
        lockAnomaly: false,
        encounterStatus: "locked",
      }),
    });
    assert.equal(view.settlement.present, true);
    if (!view.settlement.present) return;
    assert.equal(view.settlement.lockAnomaly, false);
  });
});

describe("COD-7 / COD-8 Freeze boundary", () => {
  it("does not import chrome, portal, or write HAB/emission", () => {
    const files = [
      "lib/clinical-operations/read-model.ts",
      "lib/clinical-operations/types.ts",
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
      "EncounterClosureSection",
      "hab-authority",
      "emission-pipeline",
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

  it("is not mounted on the frozen Encounter closure", () => {
    const closure = readFileSync(
      join(
        ROOT,
        "app/panel/consultas/[id]/_components/chart/EncounterClosureSection.tsx",
      ),
      "utf8",
    );
    assert.equal(closure.includes("clinical-operations"), false);
    assert.equal(closure.includes("ClinicalOperations"), false);
  });
});

describe("COD-9 Temporal consistency", () => {
  it("stamps one asOf on the entire view", () => {
    const view = project({
      completion: completion(),
      settlement: settlement(),
      asOf: ASOF,
    });
    assert.equal(view.asOf, ASOF);
    assert.equal(view.kind, "clinical_operations_projection");
  });

  it("rejects a view without a logical asOf", () => {
    assert.throws(
      () => project({ asOf: "   " }),
      ClinicalOperationsConsistencyError,
    );
  });

  it("load uses one derived asOf from the source records", async () => {
    const clinical = completion({ updatedAt: "2026-08-24T19:00:00.000Z" });
    const commercial = settlement({ updatedAt: "2026-08-24T19:45:00.000Z" });
    const view = await loadClinicalOperationsView({
      encounterId: ENCOUNTER_A,
      ports: ports({
        encounter: {
          id: ENCOUNTER_A,
          status: "signed",
          updatedAt: "2026-08-24T18:00:00.000Z",
        },
        completion: clinical,
        settlement: commercial,
      }),
    });
    assert.equal(view.asOf, "2026-08-24T19:45:00.000Z");
    assert.equal(
      deriveLogicalAsOf({
        encounter: { id: ENCOUNTER_A, updatedAt: "2026-08-24T18:00:00.000Z" },
        completion: clinical,
        settlement: commercial,
      }),
      view.asOf,
    );
  });
});

describe("COD-10 Determinism", () => {
  it("is a pure function of Encounter, Completion, and Settlement", () => {
    const clinical = completion();
    const commercial = settlement();
    const encounter = {
      id: ENCOUNTER_A,
      status: "signed" as const,
      updatedAt: ASOF_EARLIER,
    };
    const first = projectClinicalOperationsView({
      encounterId: ENCOUNTER_A,
      asOf: ASOF,
      encounter,
      completion: clinical,
      settlement: commercial,
    });
    const second = projectClinicalOperationsView({
      encounterId: ENCOUNTER_A,
      asOf: ASOF,
      encounter,
      completion: clinical,
      settlement: commercial,
    });
    assert.deepEqual(first, second);
  });

  it("does not use Browser, Session, LocalStorage, or clock in the projection", () => {
    const source = readFileSync(
      join(ROOT, "lib/clinical-operations/read-model.ts"),
      "utf8",
    );
    for (const token of [
      "localStorage",
      "sessionStorage",
      "window",
      "typeof document",
      "document.",
      "Date.now",
      "new Date",
      "crypto.randomUUID",
    ]) {
      assert.equal(source.includes(token), false, `must not contain ${token}`);
    }
  });

  it("does not change domain slices when only asOf is supplied by the caller", () => {
    const clinical = completion();
    const commercial = settlement();
    const a = project({ completion: clinical, settlement: commercial, asOf: ASOF });
    const b = project({
      completion: clinical,
      settlement: commercial,
      asOf: ASOF_EARLIER,
    });
    assert.notEqual(a.asOf, b.asOf);
    assert.deepEqual(
      { ...a, asOf: undefined },
      { ...b, asOf: undefined },
    );
  });
});
