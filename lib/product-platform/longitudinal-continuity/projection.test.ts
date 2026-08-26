import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPendingSnapshot } from "../../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../../clinical-completion/types";
import { projectClinicalOperationsView } from "../../clinical-operations/read-model";
import { createPendingSettlement } from "../../commercial-settlement/types";
import { deriveContinuityPackage } from "../../patient-care-continuity/package";
import type { ContinuityPackage } from "../../patient-care-continuity/types";
import { PRODUCT_EPIC_CONTRACT_SECTIONS } from "../contract";
import {
  loadLongitudinalContinuity,
  projectLongitudinalContinuity,
} from "./projection";
import {
  LONGITUDINAL_CONTINUITY_CONTRACT,
  LongitudinalContinuityError,
} from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const PATIENT = "patient-longitudinal-1";
const ENCOUNTER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ENCOUNTER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ASOF_OLD = "2026-08-20T10:00:00.000Z";
const ASOF_NEW = "2026-08-24T10:00:00.000Z";

function completion(
  encounterId: string,
  overrides: Partial<ClinicalCompletionSnapshot> = {},
): ClinicalCompletionSnapshot {
  return {
    ...createPendingSnapshot(encounterId, "signed"),
    state: "document_ready",
    documentKind: "visit_summary",
    deliveredAt: null,
    updatedAt: ASOF_NEW,
    ...overrides,
    consultationId: encounterId,
  };
}

function pkg(input: {
  encounterId: string;
  asOf: string;
  completion?: ClinicalCompletionSnapshot | null;
  isPaid?: boolean;
}): ContinuityPackage {
  const view = projectClinicalOperationsView({
    encounterId: input.encounterId,
    asOf: input.asOf,
    encounter: {
      id: input.encounterId,
      status: "signed",
      updatedAt: input.asOf,
    },
    completion: input.completion === undefined ? null : input.completion,
    settlement:
      input.isPaid === undefined
        ? null
        : createPendingSettlement(input.encounterId, {
            isPaid: input.isPaid,
            encounterStatus: "signed",
            updatedAt: input.asOf,
          }),
  });
  return deriveContinuityPackage(view);
}

describe("LON-1 One Encounter, current ClinicalActId", () => {
  it("emits one item per EncounterId with the current act or absent", () => {
    const first = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A),
    });
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [
        first,
        pkg({ encounterId: ENCOUNTER_B, asOf: ASOF_NEW, completion: null }),
      ],
    });
    assert.equal(projection.items.length, 2);
    assert.equal(projection.items[0]?.encounterId, ENCOUNTER_A);
    assert.equal(
      projection.items[0]?.clinicalActId,
      first.clinicalHandoff.present ? first.clinicalHandoff.clinicalActId : null,
    );
    assert.equal(projection.items[1]?.handoff, "absent");
    assert.equal(projection.items[1]?.clinicalActId, null);
  });

  it("rejects two different ClinicalActId for one Encounter", () => {
    const a = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A),
    });
    const mixed = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A, {
        clinicalActId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      }),
    });
    assert.throws(
      () =>
        projectLongitudinalContinuity({
          patientId: PATIENT,
          packages: [a, mixed],
        }),
      LongitudinalContinuityError,
    );
  });

  it("keeps one item when the same Encounter repeats the same ClinicalActId", () => {
    const act = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    const first = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A, { clinicalActId: act }),
    });
    const duplicate = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A, { clinicalActId: act }),
    });
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [first, duplicate],
    });
    assert.equal(projection.items.length, 1);
    assert.equal(projection.items[0]?.clinicalActId, act);
  });
});

describe("LON-2 Absent handoff is an item", () => {
  it("keeps visits without a clinical act", () => {
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [
        pkg({ encounterId: ENCOUNTER_A, asOf: ASOF_OLD, completion: null }),
      ],
    });
    assert.equal(projection.items.length, 1);
    assert.equal(projection.items[0]?.handoff, "absent");
    assert.equal(projection.metrics.absentHandOffCount, 1);
    assert.equal(projection.metrics.activeClinicalActs, 0);
  });
});

describe("LON-3 Unpaid does not drop or reorder", () => {
  it("keeps unpaid packages in asOf order", () => {
    const unpaidNew = pkg({
      encounterId: ENCOUNTER_B,
      asOf: ASOF_NEW,
      completion: completion(ENCOUNTER_B),
      isPaid: false,
    });
    const paidOld = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A),
      isPaid: true,
    });
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [unpaidNew, paidOld],
    });
    assert.equal(projection.items.length, 2);
    assert.equal(projection.items[0]?.encounterId, ENCOUNTER_A);
    assert.equal(projection.items[1]?.encounterId, ENCOUNTER_B);
    assert.equal(projection.metrics.totalContinuityPackages, 2);
  });
});

describe("LON-4 Membership includes delivered", () => {
  it("does not exclude delivered documents", () => {
    const delivered = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A, {
        state: "delivered",
        deliveredAt: ASOF_OLD,
        documentKind: "prescription",
      }),
    });
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [delivered],
    });
    assert.equal(projection.items.length, 1);
    assert.equal(projection.items[0]?.deliveredAt, ASOF_OLD);
    assert.equal(projection.metrics.deliveredDocumentCount, 1);
    assert.equal(projection.metrics.prescriptionCount, 1);
  });
});

describe("LON-5 Chronological asOf order", () => {
  it("sorts by asOf ascending then EncounterId", () => {
    const later = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_NEW,
      completion: completion(ENCOUNTER_A),
    });
    const earlier = pkg({
      encounterId: ENCOUNTER_B,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_B),
    });
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [later, earlier],
    });
    assert.equal(projection.items[0]?.asOf, ASOF_OLD);
    assert.equal(projection.items[1]?.asOf, ASOF_NEW);
  });

  it("breaks asOf ties by EncounterId ascending", () => {
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [
        pkg({
          encounterId: ENCOUNTER_B,
          asOf: ASOF_OLD,
          completion: completion(ENCOUNTER_B),
        }),
        pkg({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          completion: completion(ENCOUNTER_A),
        }),
      ],
    });
    assert.equal(projection.items[0]?.encounterId, ENCOUNTER_A);
    assert.equal(projection.items[1]?.encounterId, ENCOUNTER_B);
  });
});

describe("LON-6 asOf is copied from the package", () => {
  it("does not invent a patient-level asOf", () => {
    const first = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A),
    });
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [first],
    });
    assert.equal(projection.items[0]?.asOf, first.asOf);
    assert.equal("asOf" in projection, false);
  });

  it("rejects an empty asOf copied from the package", () => {
    const broken = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A),
    });
    assert.throws(
      () =>
        projectLongitudinalContinuity({
          patientId: PATIENT,
          packages: [{ ...broken, asOf: "   " }],
        }),
      LongitudinalContinuityError,
    );
  });
});

describe("LON-7 / LON-10 / LON-11 Freeze boundary", () => {
  it("does not import writes, Date, v2.0 queues, or frozen chrome", () => {
    const files = [
      "lib/product-platform/longitudinal-continuity/projection.ts",
      "lib/product-platform/longitudinal-continuity/types.ts",
      "app/panel/continuidad-longitudinal/[patientId]/page.tsx",
    ];
    const forbidden = [
      "runClinicalCompletion",
      "ensureSettlement",
      "observeCommercialSettlement",
      "persistSettlementAtomic",
      "saveClinicalCompletionSnapshot",
      "projectClinicalDeliveryQueue",
      "loadClinicalDeliveryQueue",
      "clinical-delivery-queue",
      "classifyRevenueIntegrity",
      "loadRevenueIntegrityDashboard",
      "revenue-integrity",
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
    const v1Barrel = readFileSync(
      join(ROOT, "lib/product-platform/index.ts"),
      "utf8",
    );
    assert.equal(
      v1Barrel.includes("longitudinal-continuity"),
      false,
      "v1.0 barrel must not export Epic 3",
    );
  });
});

describe("LON-8 PRODUCT-1 and PRODUCT-2", () => {
  it("exposes required metrics and the epic contract", () => {
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [
        pkg({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          completion: completion(ENCOUNTER_A, {
            documentKind: "visit_summary",
            deliveredAt: ASOF_OLD,
            state: "delivered",
          }),
        }),
        pkg({ encounterId: ENCOUNTER_B, asOf: ASOF_NEW, completion: null }),
      ],
    });
    assert.equal(projection.metrics.totalContinuityPackages, 2);
    assert.equal(projection.metrics.activeClinicalActs, 1);
    assert.equal(projection.metrics.absentHandOffCount, 1);
    assert.equal(
      projection.metrics.totalContinuityPackages,
      projection.metrics.activeClinicalActs +
        projection.metrics.absentHandOffCount,
    );
    assert.equal(projection.metrics.deliveredDocumentCount, 1);
    assert.equal(projection.metrics.visitSummaryCount, 1);
    assert.equal(projection.metrics.prescriptionCount, 0);
    assert.deepEqual(
      Object.keys(LONGITUDINAL_CONTINUITY_CONTRACT),
      [...PRODUCT_EPIC_CONTRACT_SECTIONS],
    );
    for (const name of LONGITUDINAL_CONTINUITY_CONTRACT.Metrics) {
      assert.equal(typeof projection.metrics[name], "number");
    }
  });
});

describe("LON-9 Determinism", () => {
  it("projects the same line from the same packages", () => {
    const packages = [
      pkg({
        encounterId: ENCOUNTER_B,
        asOf: ASOF_NEW,
        completion: completion(ENCOUNTER_B),
      }),
      pkg({
        encounterId: ENCOUNTER_A,
        asOf: ASOF_OLD,
        completion: completion(ENCOUNTER_A),
      }),
    ];
    assert.deepEqual(
      projectLongitudinalContinuity({ patientId: PATIENT, packages }),
      projectLongitudinalContinuity({ patientId: PATIENT, packages }),
    );
  });
});

describe("LON-12 / LON-13 product keys", () => {
  it("keys the projection by patientId and items by EncounterId", () => {
    const first = pkg({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_OLD,
      completion: completion(ENCOUNTER_A),
    });
    const projection = projectLongitudinalContinuity({
      patientId: PATIENT,
      packages: [first],
    });
    assert.equal(projection.kind, "longitudinal_continuity_projection");
    assert.equal(projection.patientId, PATIENT);
    assert.equal(projection.items[0]?.encounterId, ENCOUNTER_A);
    assert.ok(projection.items[0]?.clinicalActId);
  });

  it("exposes a new surface that opens the certified Encounter ficha", () => {
    const page = readFileSync(
      join(ROOT, "app/panel/continuidad-longitudinal/[patientId]/page.tsx"),
      "utf8",
    );
    assert.match(page, /\/panel\/consultas\/\$\{item\.encounterId\}/);
    assert.match(page, /Abrir consulta/);
    assert.equal(page.includes("localStorage"), false);
    assert.equal(page.includes("sessionStorage"), false);
  });
});

describe("loadLongitudinalContinuity", () => {
  it("loads ContinuityPackages via PCC/COD ports", async () => {
    const clinical = completion(ENCOUNTER_A);
    const projection = await loadLongitudinalContinuity({
      patientId: PATIENT,
      asOf: ASOF_OLD,
      ports: {
        listEncounterIds: async () => [ENCOUNTER_A, ENCOUNTER_B],
        fetchEncounter: async (id) => ({
          id,
          status: "signed",
          updatedAt: ASOF_OLD,
        }),
        loadCompletion: (id) => (id === ENCOUNTER_A ? clinical : null),
        loadSettlement: () => null,
      },
    });
    assert.equal(projection.items.length, 2);
    assert.equal(projection.items[0]?.clinicalActId, clinical.clinicalActId);
    assert.equal(projection.metrics.absentHandOffCount, 1);
  });
});
