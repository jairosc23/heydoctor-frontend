import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalLearningTypes, previewPath } from "./api";
import type { ClinicalLearningPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(learningType: string, overrides: Record<string, unknown> = {}) {
  return {
    learningType,
    title: learningType === "therapeutic_learning" ? "Aprendizaje terapéutico" : learningType,
    supportsPreview: true,
    supportsLearning: true,
    supportsDiagnosis: false as const,
    supportsDecision: false as const,
    supportsGovernance: false as const,
    supportsAuthorization: false as const,
    supportsExecution: false as const,
    supportsEmission: false as const,
    immutable: true as const,
    inClinicalLearningScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(learningType: string, overrides: Record<string, unknown> = {}): ClinicalLearningPreviewResponse {
  return {
    data: {
      learningType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "learning-1",
          learningType,
          title: "Aprendizaje terapéutico",
          description: "Aprendizaje terapéutico",
          status: "learned",
          learningReturn: "withhold",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: { kind: learningType, executions: [{ executionId: "execution-1" }] },
          provenance: { origin: "clinical_execution", executionConstituted: true },
          sourceRefs: { executions: [{ executionId: "execution-1" }] },
          learningSetId: null,
          learnedAt: "2026-08-17T20:00:00.000Z",
          learningChannel: "clinical_learning",
          supportsPreview: true,
          supportsLearning: true,
          supportsDiagnosis: false,
          supportsDecision: false,
          supportsGovernance: false,
          supportsAuthorization: false,
          supportsExecution: false,
          supportsEmission: false,
          immutable: true,
          inClinicalLearningScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(learningType),
      ...overrides,
    },
  } as ClinicalLearningPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("therapeutic_learning", CONSULTATION_ID),
    `/clinical-learning/therapeutic_learning/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("investigation_learning", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-learning/investigation_learning/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("therapeutic_learning", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("therapeutic_learning", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("therapeutic_learning", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("therapeutic_learning", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalLearningTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/investigation_learning/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/precaution_learning/")) {
      return preview("precaution_learning", {
        capability: capability("precaution_learning", { title: "Aprendizaje de precaución" }),
      });
    }
    return preview("therapeutic_learning");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalLearningTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.learningType), ["therapeutic_learning", "precaution_learning"]);
    assert.equal(items[0]?.capability.supportsLearning, true);
    assert.equal(items[0]?.capability.supportsDecision, false);
    assert.equal(items[0]?.capability.supportsGovernance, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsExecution, false);
    assert.equal(items[0]?.capability.supportsEmission, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalLearningTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalLearningTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
