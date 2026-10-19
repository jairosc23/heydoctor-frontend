import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalReasoningTypes, previewPath } from "./api";
import type { ClinicalReasoningPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(
  reasoningType: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    reasoningType,
    title:
      reasoningType === "hypothesis_reasoning"
        ? "Razonamiento de hipótesis"
        : reasoningType,
    supportsPreview: true,
    supportsReasoning: true,
    supportsDiagnosis: false as const,
    supportsRecommendation: false as const,
    immutable: true as const,
    inClinicalReasoningScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  reasoningType: string,
  overrides: Record<string, unknown> = {},
): ClinicalReasoningPreviewResponse {
  return {
    data: {
      reasoningType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "reasoning-1",
          reasoningType,
          title: "Razonamiento de hipótesis",
          description: "Razonamiento de hipótesis",
          status: "reasoned",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: reasoningType,
            understandings: [{ understandingId: "understanding-1" }],
          },
          provenance: {
            origin: "clinical_understanding",
            understandingAssembled: true,
          },
          sourceRefs: {
            understandings: [{ understandingId: "understanding-1" }],
          },
          reasoningSetId: null,
          reasonedAt: "2026-08-16T12:00:00.000Z",
          reasoningChannel: "clinical_reasoning",
          supportsPreview: true,
          supportsReasoning: true,
          supportsDiagnosis: false,
          supportsRecommendation: false,
          immutable: true,
          inClinicalReasoningScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(reasoningType),
      ...overrides,
    },
  } as ClinicalReasoningPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("hypothesis_reasoning", CONSULTATION_ID),
    `/clinical-reasoning/hypothesis_reasoning/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("evidence_reasoning", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-reasoning/evidence_reasoning/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("hypothesis_reasoning", CONSULTATION_ID).includes("/write"),
    false,
  );
  assert.equal(
    previewPath("hypothesis_reasoning", CONSULTATION_ID).includes("/post"),
    false,
  );
});

test("listEnabledClinicalReasoningTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/evidence_reasoning/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/risk_reasoning/")) {
      return preview("risk_reasoning", {
        capability: capability("risk_reasoning", {
          title: "Razonamiento de riesgo",
        }),
      });
    }
    return preview("hypothesis_reasoning");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalReasoningTypes(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.reasoningType),
      ["hypothesis_reasoning", "risk_reasoning"],
    );
    assert.equal(items[0]?.capability.title, "Razonamiento de hipótesis");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsReasoning, true);
    assert.equal(items[0]?.capability.supportsDiagnosis, false);
    assert.equal(items[0]?.capability.supportsRecommendation, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalReasoningTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalReasoningTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
