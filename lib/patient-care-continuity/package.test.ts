import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPendingSnapshot } from "../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../clinical-completion/types";
import { reconstructClinicalAct } from "../clinical-completion/types";
import { createPendingSettlement } from "../commercial-settlement/types";
import type { CommercialSettlementSnapshot } from "../commercial-settlement/types";
import { projectClinicalOperationsView } from "../clinical-operations/read-model";
import type { ClinicalOperationsView } from "../clinical-operations/types";
import {
  ContinuityHandoffError,
  deriveContinuityPackage,
  loadContinuityPackage,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const ENCOUNTER_A = "11111111-1111-4111-8111-111111111111";
const ENCOUNTER_B = "22222222-2222-4222-8222-222222222222";
const ASOF = "2026-08-24T20:00:00.000Z";
const OTHER_ACT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

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

function view(input: {
  completion?: ClinicalCompletionSnapshot | null;
  settlement?: CommercialSettlementSnapshot | null;
  encounterStatus?: string;
}): ClinicalOperationsView {
  return projectClinicalOperationsView({
    encounterId: ENCOUNTER_A,
    asOf: ASOF,
    encounter: {
      id: ENCOUNTER_A,
      status: input.encounterStatus ?? "signed",
      updatedAt: ASOF,
    },
    completion: input.completion === undefined ? null : input.completion,
    settlement: input.settlement === undefined ? null : input.settlement,
  });
}

describe("PCC-1 Derived only from ClinicalOperationsView", () => {
  it("keeps the view encounterId and asOf", () => {
    const clinical = completion();
    const pkg = deriveContinuityPackage(view({ completion: clinical }));
    assert.equal(pkg.kind, "continuity_package_projection");
    assert.equal(pkg.encounterId, ENCOUNTER_A);
    assert.equal(pkg.asOf, ASOF);
    assert.equal(pkg.clinicalHandoff.present, true);
  });
});

describe("PCC-2 Join by EncounterId", () => {
  it("does not use CorrelationId as a key", () => {
    const source = readFileSync(
      join(ROOT, "lib/patient-care-continuity/package.ts"),
      "utf8",
    );
    assert.equal(source.includes("CorrelationId"), false);
    assert.equal(source.includes("getOrCreateClientCorrelationId"), false);
    const pkg = deriveContinuityPackage(view({}));
    assert.equal(pkg.encounterId, ENCOUNTER_A);
  });
});

describe("PCC-3 Official identities stay distinct", () => {
  it("keeps ClinicalActId ≠ SettlementId", () => {
    const clinical = completion();
    const commercial = settlement();
    const pkg = deriveContinuityPackage(
      view({ completion: clinical, settlement: commercial }),
    );
    assert.equal(pkg.clinicalHandoff.present, true);
    assert.equal(pkg.operationalContext.present, true);
    if (!pkg.clinicalHandoff.present || !pkg.operationalContext.present) return;
    assert.notEqual(
      pkg.clinicalHandoff.clinicalActId,
      pkg.operationalContext.settlementId,
    );
  });
});

describe("PCC-4 Absent completion is not minted", () => {
  it("leaves clinical handoff absent without inventing a ClinicalActId", () => {
    const pkg = deriveContinuityPackage(view({ completion: null }));
    assert.equal(pkg.clinicalHandoff.present, false);
    assert.equal("clinicalActId" in pkg.clinicalHandoff, false);
  });
});

describe("PCC-5 Clinical handoff does not require payment", () => {
  it("returns the act when Settlement is absent or unpaid", () => {
    const clinical = completion();
    const unpaid = deriveContinuityPackage(view({ completion: clinical }));
    assert.equal(unpaid.clinicalHandoff.present, true);
    const pendingPay = deriveContinuityPackage(
      view({
        completion: clinical,
        settlement: settlement({ isPaid: false }),
      }),
    );
    assert.equal(pendingPay.clinicalHandoff.present, true);
    if (!pendingPay.operationalContext.present) return;
    assert.equal(pendingPay.operationalContext.isPaid, false);
  });
});

describe("PCC-6 Lock anomaly is copied, not repaired", () => {
  it("surfaces lockAnomaly from the view", () => {
    const pkg = deriveContinuityPackage(
      view({
        encounterStatus: "locked",
        settlement: settlement({
          isPaid: false,
          lockAnomaly: true,
          encounterStatus: "locked",
        }),
      }),
    );
    assert.equal(pkg.operationalContext.present, true);
    if (!pkg.operationalContext.present) return;
    assert.equal(pkg.operationalContext.lockAnomaly, true);
    assert.equal(pkg.operationalContext.isPaid, false);
  });
});

describe("PCC-7 Determinism", () => {
  it("is a pure function of the ClinicalOperationsView", () => {
    const operations = view({
      completion: completion(),
      settlement: settlement(),
    });
    assert.deepEqual(
      deriveContinuityPackage(operations),
      deriveContinuityPackage(operations),
    );
  });
});

describe("PCC-8 Freeze boundary", () => {
  it("does not write or import frozen chrome", () => {
    const files = [
      "lib/patient-care-continuity/package.ts",
      "lib/patient-care-continuity/types.ts",
    ];
    const forbidden = [
      "runClinicalCompletion",
      "supersedeClinicalAct",
      "ensureSettlement",
      "observeCommercialSettlement",
      "persistSettlementAtomic",
      "saveClinicalCompletionSnapshot",
      "ContinuityPanelShell",
      "continuity-medication-dedupe",
      "ClinicalCopilotDrawer",
      "GlobalWhatsAppFab",
      "PanelLayout",
      "ShareConsultationDialog",
      "/portal/",
      "EncounterClosureSection",
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

describe("PCC-9 Handoff coherence", () => {
  it("represents only the current ClinicalActId of the Encounter", () => {
    const clinical = completion();
    const pkg = deriveContinuityPackage(view({ completion: clinical }), {
      currentClinicalActId: clinical.clinicalActId,
    });
    assert.equal(pkg.clinicalHandoff.present, true);
    if (!pkg.clinicalHandoff.present) return;
    assert.equal(pkg.clinicalHandoff.clinicalActId, clinical.clinicalActId);
  });

  it("rejects a package that would mix a stale ClinicalActId", () => {
    const clinical = completion();
    assert.throws(
      () =>
        deriveContinuityPackage(view({ completion: clinical }), {
          currentClinicalActId: OTHER_ACT,
        }),
      ContinuityHandoffError,
    );
  });

  it("rejects a view whose audit points to another act or Encounter", () => {
    const clinical = completion();
    const coherent = view({ completion: clinical });
    if (!coherent.completion.present) {
      assert.fail("expected completion");
    }
    const mixedAct: ClinicalOperationsView = {
      ...coherent,
      completion: {
        ...coherent.completion,
        audit: {
          ...coherent.completion.audit,
          clinicalActId: OTHER_ACT,
        },
      },
    };
    assert.throws(
      () => deriveContinuityPackage(mixedAct),
      ContinuityHandoffError,
    );

    const mixedEncounter: ClinicalOperationsView = {
      ...coherent,
      completion: {
        ...coherent.completion,
        audit: {
          ...reconstructClinicalAct(clinical),
          encounter: { consultationId: ENCOUNTER_B, status: "signed" },
        },
      },
    };
    assert.throws(
      () => deriveContinuityPackage(mixedEncounter),
      ContinuityHandoffError,
    );
  });
});

describe("PCC-10 Package immutability", () => {
  it("is ephemeral: no persist, store, or source-of-truth write", () => {
    const source = readFileSync(
      join(ROOT, "lib/patient-care-continuity/package.ts"),
      "utf8",
    );
    for (const token of [
      "localStorage",
      "sessionStorage",
      "persistSettlement",
      "persistAtomic",
      "saveSnapshot",
      "writeStorage",
      "Date.now",
      "new Date",
    ]) {
      assert.equal(source.includes(token), false, `must not contain ${token}`);
    }
  });

  it("loadContinuityPackage still only derives from the view", async () => {
    const clinical = completion();
    const pkg = await loadContinuityPackage({
      encounterId: ENCOUNTER_A,
      asOf: ASOF,
      currentClinicalActId: clinical.clinicalActId,
      ports: {
        fetchEncounter: async () => ({
          id: ENCOUNTER_A,
          status: "signed",
          updatedAt: ASOF,
        }),
        loadCompletion: () => clinical,
        loadSettlement: () => null,
      },
    });
    assert.equal(pkg.kind, "continuity_package_projection");
    assert.equal(pkg.clinicalHandoff.present, true);
    if (!pkg.clinicalHandoff.present) return;
    assert.equal(pkg.clinicalHandoff.clinicalActId, clinical.clinicalActId);
  });
});
