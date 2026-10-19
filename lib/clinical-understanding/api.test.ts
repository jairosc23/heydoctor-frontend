import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalUnderstandingTypes, previewPath } from "./api";
import type { ClinicalUnderstandingPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(
  understandingType: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    understandingType,
    title:
      understandingType === "situation_understanding"
        ? "Comprensión de situación"
        : understandingType,
    supportsPreview: true,
    supportsAssembly: true,
    supportsDiagnosis: false as const,
    supportsReasoning: false as const,
    immutable: true as const,
    inClinicalUnderstandingScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  understandingType: string,
  overrides: Record<string, unknown> = {},
): ClinicalUnderstandingPreviewResponse {
  return {
    data: {
      understandingType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "understanding-1",
          understandingType,
          title: "Comprensión de situación",
          description: "Comprensión de situación",
          status: "assembled",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: understandingType,
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
          understandingSetId: null,
          assembledAt: "2026-08-16T12:00:00.000Z",
          understandingChannel: "clinical_understanding",
          supportsPreview: true,
          supportsAssembly: true,
          supportsDiagnosis: false,
          supportsReasoning: false,
          immutable: true,
          inClinicalUnderstandingScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(understandingType),
      ...overrides,
    },
  } as ClinicalUnderstandingPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("situation_understanding", CONSULTATION_ID),
    `/clinical-understanding/situation_understanding/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("problem_understanding", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-understanding/problem_understanding/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("situation_understanding", CONSULTATION_ID).includes("/write"),
    false,
  );
  assert.equal(
    previewPath("situation_understanding", CONSULTATION_ID).includes("/post"),
    false,
  );
});

test("listEnabledClinicalUnderstandingTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/problem_understanding/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/therapy_understanding/")) {
      return preview("therapy_understanding", {
        capability: capability("therapy_understanding", {
          inClinicalUnderstandingScope: false,
          supportsPreview: false,
        }),
      });
    }
    if (path.includes("/risk_understanding/")) {
      return preview("risk_understanding", {
        capability: capability("risk_understanding", {
          title: "Comprensión de riesgo",
        }),
      });
    }
    if (path.includes("/epistemic_understanding/")) {
      return preview("epistemic_understanding", {
        capability: capability("epistemic_understanding", {
          title: "Comprensión epistémica",
        }),
      });
    }
    return preview("situation_understanding");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalUnderstandingTypes(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.understandingType),
      [
        "situation_understanding",
        "risk_understanding",
        "epistemic_understanding",
      ],
    );
    assert.equal(items[0]?.capability.title, "Comprensión de situación");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsAssembly, true);
    assert.equal(items[0]?.capability.supportsDiagnosis, false);
    assert.equal(items[0]?.capability.supportsReasoning, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalUnderstandingTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalUnderstandingTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
