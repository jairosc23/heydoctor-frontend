import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalRuleTypes, previewPath } from "./api";
import type { ClinicalRuleEvaluationPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(ruleType: string, overrides: Record<string, unknown> = {}) {
  return {
    ruleType,
    title:
      ruleType === "medication_rule" ? "Regla de medicación" : ruleType,
    supportsPreview: true,
    supportsEvaluation: true,
    supportsExplanation: false as const,
    supportsExecution: false as const,
    immutable: true as const,
    inClinicalRulesScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  ruleType: string,
  overrides: Record<string, unknown> = {},
): ClinicalRuleEvaluationPreviewResponse {
  return {
    data: {
      ruleType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "evaluation-1",
          ruleType,
          title: "Regla de medicación",
          description: "Regla de medicación",
          status: "evaluated",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: ruleType,
            facts: [{ artifactId: "artifact-1" }],
          },
          provenance: {
            origin: "clinical_artifact_registry",
            factsRegistered: true,
          },
          sourceRefs: {
            facts: [{ artifactId: "artifact-1" }],
            recordRefs: [],
          },
          ruleSetId: null,
          evaluatedAt: "2026-08-16T12:00:00.000Z",
          evaluationChannel: "clinical_rules_evaluator",
          supportsPreview: true,
          supportsEvaluation: true,
          supportsExplanation: false,
          supportsExecution: false,
          immutable: true,
          inClinicalRulesScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(ruleType),
      ...overrides,
    },
  } as ClinicalRuleEvaluationPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("medication_rule", CONSULTATION_ID),
    `/clinical-rules/medication_rule/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("allergy_rule", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-rules/allergy_rule/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("medication_rule", CONSULTATION_ID).includes("/write"),
    false,
  );
  assert.equal(
    previewPath("medication_rule", CONSULTATION_ID).includes("/post"),
    false,
  );
});

test("listEnabledClinicalRuleTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/allergy_rule/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/laboratory_rule/")) {
      return preview("laboratory_rule", {
        capability: capability("laboratory_rule", {
          inClinicalRulesScope: false,
          supportsPreview: false,
        }),
      });
    }
    if (path.includes("/preventive_rule/")) {
      return preview("preventive_rule", {
        capability: capability("preventive_rule", {
          title: "Regla preventiva",
        }),
      });
    }
    if (path.includes("/longitudinal_rule/")) {
      return preview("longitudinal_rule", {
        capability: capability("longitudinal_rule", {
          title: "Regla longitudinal",
        }),
      });
    }
    return preview("medication_rule");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalRuleTypes(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.ruleType),
      ["medication_rule", "preventive_rule", "longitudinal_rule"],
    );
    assert.equal(items[0]?.capability.title, "Regla de medicación");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsEvaluation, true);
    assert.equal(items[0]?.capability.supportsExecution, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalRuleTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalRuleTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
