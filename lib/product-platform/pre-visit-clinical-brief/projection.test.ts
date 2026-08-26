import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPendingSnapshot } from "../../clinical-completion/types";
import type { ClinicalCompletionSnapshot } from "../../clinical-completion/types";
import { PRODUCT_EPIC_CONTRACT_SECTIONS } from "../contract";
import {
  loadLongitudinalContinuity,
  type LongitudinalContinuityItem,
  type LongitudinalContinuityProjection,
} from "../longitudinal-continuity";
import {
  loadPreVisitBrief,
  PRE_VISIT_CLINICAL_BRIEF_CONTRACT,
  PreVisitClinicalBriefError,
  projectPreVisitBrief,
  SOURCE_DOCUMENT_KIND_NONE,
  SOURCE_DOCUMENT_KIND_PRESCRIPTION,
  SOURCE_DOCUMENT_KIND_VISIT_SUMMARY,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const PATIENT = "patient-brief-1";
const ENCOUNTER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ENCOUNTER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ACT_A = "11111111-1111-4111-8111-111111111111";
const ASOF_OLD = "2026-08-20T10:00:00.000Z";
const ASOF_NEW = "2026-08-24T10:00:00.000Z";

function item(
  overrides: Partial<LongitudinalContinuityItem> &
    Pick<LongitudinalContinuityItem, "encounterId" | "asOf" | "handoff">,
): LongitudinalContinuityItem {
  const present = overrides.handoff === "present";
  return {
    patientId: PATIENT,
    clinicalActId: present ? (overrides.clinicalActId ?? ACT_A) : null,
    completionState: present ? (overrides.completionState ?? "document_ready") : null,
    documentKind: present ? (overrides.documentKind ?? "visit_summary") : null,
    deliveredAt: present ? (overrides.deliveredAt ?? null) : null,
    ...overrides,
    patientId: overrides.patientId ?? PATIENT,
    handoff: overrides.handoff,
  };
}

function line(
  items: LongitudinalContinuityItem[],
): LongitudinalContinuityProjection {
  return {
    kind: "longitudinal_continuity_projection",
    patientId: PATIENT,
    items,
    metrics: {
      totalContinuityPackages: items.length,
      activeClinicalActs: items.filter((row) => row.handoff === "present").length,
      absentHandOffCount: items.filter((row) => row.handoff === "absent").length,
      deliveredDocumentCount: 0,
      visitSummaryCount: 0,
      prescriptionCount: 0,
    },
  };
}

describe("PVB-1 Last item only, no look-back", () => {
  it("uses items[n-1] even when an earlier item is present", () => {
    const brief = projectPreVisitBrief(
      line([
        item({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          handoff: "present",
          clinicalActId: ACT_A,
          documentKind: "prescription",
        }),
        item({
          encounterId: ENCOUNTER_B,
          asOf: ASOF_NEW,
          handoff: "absent",
        }),
      ]),
    );
    assert.equal(brief.status, "ready");
    assert.equal(brief.origin?.encounterId, ENCOUNTER_B);
    assert.equal(brief.origin?.handoff, "absent");
    assert.equal(brief.origin?.clinicalActId, null);
    assert.notEqual(brief.origin?.clinicalActId, ACT_A);
  });

  it("does not re-sort by asOf", () => {
    const brief = projectPreVisitBrief(
      line([
        item({
          encounterId: ENCOUNTER_B,
          asOf: ASOF_NEW,
          handoff: "present",
          documentKind: "prescription",
        }),
        item({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          handoff: "absent",
        }),
      ]),
    );
    assert.equal(brief.origin?.encounterId, ENCOUNTER_A);
    assert.equal(brief.origin?.asOf, ASOF_OLD);
  });
});

describe("PVB-2 Current ClinicalActId or absent", () => {
  it("copies the last present ClinicalActId", () => {
    const brief = projectPreVisitBrief(
      line([
        item({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          handoff: "present",
          clinicalActId: ACT_A,
        }),
      ]),
    );
    assert.equal(brief.origin?.clinicalActId, ACT_A);
    assert.equal(brief.origin?.handoff, "present");
    assert.equal(brief.metrics.sourceClinicalActPresent, 1);
  });
});

describe("PVB-3 Empty line is an empty brief", () => {
  it("emits status empty without minting an act", () => {
    const brief = projectPreVisitBrief(line([]));
    assert.equal(brief.status, "empty");
    assert.equal(brief.origin, null);
    assert.equal(brief.metrics.briefEmpty, 1);
    assert.equal(brief.metrics.briefAvailable, 0);
    assert.equal(brief.metrics.sourceClinicalActPresent, 0);
    assert.equal(brief.metrics.sourceEncounterId, 0);
    assert.equal(brief.metrics.sourceAsOf, 0);
  });
});

describe("PVB-4 Unpaid does not hide the origin", () => {
  it("keeps the last item regardless of payment on prior visits", () => {
    const brief = projectPreVisitBrief(
      line([
        item({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_NEW,
          handoff: "present",
          clinicalActId: ACT_A,
        }),
      ]),
    );
    assert.equal(brief.origin?.encounterId, ENCOUNTER_A);
    assert.equal(brief.origin?.settlementContext, null);
  });
});

describe("PVB-5 Delivered last act remains in the brief", () => {
  it("copies deliveredAt and does not drop the origin", () => {
    const brief = projectPreVisitBrief(
      line([
        item({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          handoff: "present",
          documentKind: "prescription",
          deliveredAt: ASOF_OLD,
          completionState: "delivered",
        }),
      ]),
    );
    assert.equal(brief.origin?.deliveredAt, ASOF_OLD);
    assert.equal(brief.metrics.sourceDelivered, 1);
    assert.equal(brief.metrics.sourceDocumentKind, SOURCE_DOCUMENT_KIND_PRESCRIPTION);
  });
});

describe("PVB-6 asOf is copied from the last item", () => {
  it("does not invent a brief-level asOf", () => {
    const last = item({
      encounterId: ENCOUNTER_A,
      asOf: ASOF_NEW,
      handoff: "present",
    });
    const brief = projectPreVisitBrief(line([last]));
    assert.equal(brief.origin?.asOf, last.asOf);
    assert.equal("asOf" in brief, false);
    assert.equal(brief.metrics.sourceAsOf, 1);
  });

  it("rejects an empty asOf on the last item", () => {
    assert.throws(
      () =>
        projectPreVisitBrief(
          line([
            item({
              encounterId: ENCOUNTER_A,
              asOf: "   ",
              handoff: "present",
            }),
          ]),
        ),
      PreVisitClinicalBriefError,
    );
  });
});

describe("PVB-7 / PVB-10 / PVB-11 Freeze boundary", () => {
  it("does not import writes, Date, queues, PCC, COD, or frozen chrome", () => {
    const files = [
      "lib/product-platform/pre-visit-clinical-brief/projection.ts",
      "lib/product-platform/pre-visit-clinical-brief/types.ts",
      "app/panel/brief-previsita/[patientId]/page.tsx",
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
      "loadClinicalDeliveryQueue",
      "clinical-delivery-queue",
      "classifyRevenueIntegrity",
      "loadRevenueIntegrityDashboard",
      "revenue-integrity",
      "ContinuityPanelShell",
      "CommercialSettlementSection",
      "ClinicalCompletionSection",
      "PanelLayout",
      "continuidad-longitudinal",
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
    assert.equal(v1Barrel.includes("pre-visit-clinical-brief"), false);
    const epic3 = readFileSync(
      join(ROOT, "lib/product-platform/longitudinal-continuity/projection.ts"),
      "utf8",
    );
    assert.equal(epic3.includes("pre-visit-clinical-brief"), false);
  });
});

describe("PVB-8 PRODUCT-1 and PRODUCT-2", () => {
  it("exposes authorized metrics and the epic contract", () => {
    const present = projectPreVisitBrief(
      line([
        item({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          handoff: "present",
          documentKind: "visit_summary",
          deliveredAt: null,
        }),
      ]),
    );
    assert.equal(present.metrics.briefAvailable, 1);
    assert.equal(present.metrics.briefEmpty, 0);
    assert.equal(
      present.metrics.briefAvailable + present.metrics.briefEmpty,
      1,
    );
    assert.equal(present.metrics.sourceEncounterId, 1);
    assert.equal(present.metrics.sourceClinicalActPresent, 1);
    assert.equal(
      present.metrics.sourceDocumentKind,
      SOURCE_DOCUMENT_KIND_VISIT_SUMMARY,
    );
    assert.equal(present.metrics.sourceDelivered, 0);
    assert.equal(present.metrics.sourceAsOf, 1);
    const empty = projectPreVisitBrief(line([]));
    assert.equal(empty.metrics.sourceDocumentKind, SOURCE_DOCUMENT_KIND_NONE);
    assert.deepEqual(
      Object.keys(PRE_VISIT_CLINICAL_BRIEF_CONTRACT),
      [...PRODUCT_EPIC_CONTRACT_SECTIONS],
    );
    for (const name of PRE_VISIT_CLINICAL_BRIEF_CONTRACT.Metrics) {
      assert.equal(typeof present.metrics[name], "number");
      assert.equal(typeof empty.metrics[name], "number");
    }
  });
});

describe("PVB-9 Determinism", () => {
  it("projects the same brief from the same line", () => {
    const projection = line([
      item({
        encounterId: ENCOUNTER_A,
        asOf: ASOF_OLD,
        handoff: "absent",
      }),
      item({
        encounterId: ENCOUNTER_B,
        asOf: ASOF_NEW,
        handoff: "present",
        documentKind: "prescription",
      }),
    ]);
    assert.deepEqual(
      projectPreVisitBrief(projection),
      projectPreVisitBrief(projection),
    );
  });
});

describe("PVB-12 / PVB-13 product keys", () => {
  it("keys the brief by patientId and origin EncounterId", () => {
    const brief = projectPreVisitBrief(
      line([
        item({
          encounterId: ENCOUNTER_A,
          asOf: ASOF_OLD,
          handoff: "present",
          clinicalActId: ACT_A,
        }),
      ]),
    );
    assert.equal(brief.kind, "pre_visit_clinical_brief");
    assert.equal(brief.patientId, PATIENT);
    assert.equal(brief.origin?.encounterId, ENCOUNTER_A);
    assert.equal(brief.origin?.clinicalActId, ACT_A);
    assert.equal(brief.origin?.encounterStatus, null);
    assert.equal(brief.origin?.settlementContext, null);
  });

  it("exposes a new surface that opens the certified Encounter ficha", () => {
    const page = readFileSync(
      join(ROOT, "app/panel/brief-previsita/[patientId]/page.tsx"),
      "utf8",
    );
    assert.match(page, /\/panel\/consultas\/\$\{brief\.origin\.encounterId\}/);
    assert.match(page, /Abrir consulta/);
    assert.equal(page.includes("localStorage"), false);
    assert.equal(page.includes("sessionStorage"), false);
  });
});

describe("loadPreVisitBrief", () => {
  it("loads only through Longitudinal Patient Continuity", async () => {
    const clinical: ClinicalCompletionSnapshot = {
      ...createPendingSnapshot(ENCOUNTER_A, "signed"),
      state: "document_ready",
      documentKind: "visit_summary",
      deliveredAt: null,
      updatedAt: ASOF_OLD,
      consultationId: ENCOUNTER_A,
    };
    const brief = await loadPreVisitBrief({
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
    assert.equal(brief.status, "ready");
    assert.ok(brief.origin);
    assert.equal(brief.origin.asOf, ASOF_OLD);
    assert.equal(
      [ENCOUNTER_A, ENCOUNTER_B].includes(brief.origin.encounterId),
      true,
    );
  });
});

describe("loadLongitudinalContinuity still owns aggregation", () => {
  it("does not require Epic 4 to enumerate Encounter ids", async () => {
    const projection = await loadLongitudinalContinuity({
      patientId: PATIENT,
      asOf: ASOF_OLD,
      ports: {
        listEncounterIds: async () => [],
        fetchEncounter: async () => null,
        loadCompletion: () => null,
        loadSettlement: () => null,
      },
    });
    const brief = projectPreVisitBrief(projection);
    assert.equal(brief.status, "empty");
  });
});
