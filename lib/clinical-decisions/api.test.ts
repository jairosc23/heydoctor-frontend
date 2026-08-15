import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalDecisions, previewPath } from "./api";
import type { ClinicalDecisionPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const DECISION_ID = "22222222-2222-4222-8222-222222222222";

function capability(
  type: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    type,
    title: type === "allergy_conflict" ? "Conflicto de alergia" : type,
    supportsPreview: true,
    supportsAcknowledge: true,
    supportsOverride: true,
    evaluatesRules: false as const,
    aiForbidden: true as const,
    requiresHitl: true as const,
    requiresSourceRef: type !== "guideline_reminder",
    canBelongToDecisionSet: true,
    inClinicalEngineScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  type: string,
  overrides: Record<string, unknown> = {},
): ClinicalDecisionPreviewResponse {
  return {
    data: {
      type,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "cds-1",
          type,
          title: "Conflicto de alergia",
          status: "presented",
          severity: "critical",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          validity: null,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: "allergy_conflict",
            allergen: "Penicilina",
          },
          provenance: { origin: "foundation", hitlRequired: true },
          reviewedBy: null,
          overrideReason: null,
          sourceRefs: [{ domain: "allergies", id: "alg-1" }],
          relatedOrderId: null,
          relatedDocumentId: null,
          decisionSetId: null,
          supportsPreview: true,
          supportsAcknowledge: true,
          supportsOverride: true,
          evaluatesRules: false,
          aiForbidden: true,
          requiresHitl: true,
          requiresSourceRef: true,
          canBelongToDecisionSet: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(type),
      ...overrides,
    },
  } as ClinicalDecisionPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("allergy_conflict", CONSULTATION_ID),
    `/clinical-decisions/allergy_conflict/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("guideline_reminder", CONSULTATION_ID, DECISION_ID),
    `/clinical-decisions/guideline_reminder/preview?consultationId=${CONSULTATION_ID}&decisionId=${DECISION_ID}`,
  );
  assert.equal(
    previewPath("drug_interaction", CONSULTATION_ID).includes("/acknowledge"),
    false,
  );
  assert.equal(
    previewPath("drug_interaction", CONSULTATION_ID).includes("/override"),
    false,
  );
});

test("listEnabledClinicalDecisions hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/drug_interaction/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/duplicate_therapy/")) {
      return preview("duplicate_therapy", {
        capability: capability("duplicate_therapy", {
          inClinicalEngineScope: false,
          supportsPreview: false,
        }),
      });
    }
    if (path.includes("/allergy_conflict/")) {
      return preview("allergy_conflict");
    }
    if (path.includes("/contraindication/")) {
      return preview("contraindication", {
        capability: capability("contraindication", {
          title: "Contraindicación",
        }),
      });
    }
    return preview("guideline_reminder", {
      capability: capability("guideline_reminder", {
        title: "Recordatorio de guía",
      }),
    });
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalDecisions(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.type),
      ["allergy_conflict", "contraindication", "guideline_reminder"],
    );
    assert.equal(items[0]?.capability.title, "Conflicto de alergia");
    assert.equal(items[0]?.capability.evaluatesRules, false);
    assert.equal(items[0]?.capability.aiForbidden, true);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalDecisions throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalDecisions(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
