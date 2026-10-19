import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalRecommendationTypes, previewPath } from "./api";
import type { ClinicalRecommendationPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(
  recommendationType: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    recommendationType,
    title:
      recommendationType === "therapeutic_recommendation"
        ? "Recomendación terapéutica"
        : recommendationType,
    supportsPreview: true,
    supportsRecommendation: true,
    supportsDiagnosis: false as const,
    supportsAuthorization: false as const,
    supportsDisposition: false as const,
    immutable: true as const,
    inClinicalRecommendationScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  recommendationType: string,
  overrides: Record<string, unknown> = {},
): ClinicalRecommendationPreviewResponse {
  return {
    data: {
      recommendationType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "recommendation-1",
          recommendationType,
          title: "Recomendación terapéutica",
          description: "Recomendación terapéutica",
          status: "offered",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: recommendationType,
            reasonings: [{ reasoningId: "reasoning-1" }],
          },
          provenance: {
            origin: "clinical_reasoning",
            reasoningReasoned: true,
          },
          sourceRefs: {
            reasonings: [{ reasoningId: "reasoning-1" }],
          },
          recommendationSetId: null,
          offeredAt: "2026-08-16T21:00:00.000Z",
          recommendationChannel: "clinical_recommendation",
          supportsPreview: true,
          supportsRecommendation: true,
          supportsDiagnosis: false,
          supportsAuthorization: false,
          supportsDisposition: false,
          immutable: true,
          inClinicalRecommendationScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(recommendationType),
      ...overrides,
    },
  } as ClinicalRecommendationPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("therapeutic_recommendation", CONSULTATION_ID),
    `/clinical-recommendation/therapeutic_recommendation/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("investigation_recommendation", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-recommendation/investigation_recommendation/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("therapeutic_recommendation", CONSULTATION_ID).includes("/write"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_recommendation", CONSULTATION_ID).includes("/post"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_recommendation", CONSULTATION_ID).includes("/accept"),
    false,
  );
});

test("listEnabledClinicalRecommendationTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/investigation_recommendation/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/precaution_recommendation/")) {
      return preview("precaution_recommendation", {
        capability: capability("precaution_recommendation", {
          title: "Recomendación de precaución",
        }),
      });
    }
    return preview("therapeutic_recommendation");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalRecommendationTypes(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.recommendationType),
      ["therapeutic_recommendation", "precaution_recommendation"],
    );
    assert.equal(items[0]?.capability.title, "Recomendación terapéutica");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsRecommendation, true);
    assert.equal(items[0]?.capability.supportsDiagnosis, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsDisposition, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalRecommendationTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalRecommendationTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
