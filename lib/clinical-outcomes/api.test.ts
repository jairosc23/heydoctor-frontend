import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalOutcomeTypes, previewPath } from "./api";
import type { ClinicalOutcomePreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(
  outcomeType: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    outcomeType,
    title:
      outcomeType === "therapeutic_outcome"
        ? "Resultado terapéutico"
        : outcomeType,
    supportsPreview: true,
    supportsOutcome: true,
    supportsDiagnosis: false as const,
    supportsAuthorization: false as const,
    supportsLearning: false as const,
    immutable: true as const,
    inClinicalOutcomesScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  outcomeType: string,
  overrides: Record<string, unknown> = {},
): ClinicalOutcomePreviewResponse {
  return {
    data: {
      outcomeType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "outcome-1",
          outcomeType,
          title: "Resultado terapéutico",
          description: "Resultado terapéutico",
          status: "observed",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: outcomeType,
            records: [{ recordId: "record-1" }],
          },
          provenance: {
            origin: "longitudinal_clinical_record",
            recordComposed: true,
          },
          sourceRefs: {
            records: [{ recordId: "record-1" }],
          },
          outcomeSetId: null,
          observedAt: "2026-08-16T21:00:00.000Z",
          outcomeChannel: "clinical_outcomes",
          supportsPreview: true,
          supportsOutcome: true,
          supportsDiagnosis: false,
          supportsAuthorization: false,
          supportsLearning: false,
          immutable: true,
          inClinicalOutcomesScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(outcomeType),
      ...overrides,
    },
  } as ClinicalOutcomePreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("therapeutic_outcome", CONSULTATION_ID),
    `/clinical-outcomes/therapeutic_outcome/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("investigation_outcome", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-outcomes/investigation_outcome/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("therapeutic_outcome", CONSULTATION_ID).includes("/write"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_outcome", CONSULTATION_ID).includes("/post"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_outcome", CONSULTATION_ID).includes("/learn"),
    false,
  );
});

test("listEnabledClinicalOutcomeTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/investigation_outcome/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/precaution_outcome/")) {
      return preview("precaution_outcome", {
        capability: capability("precaution_outcome", {
          title: "Resultado de precaución",
        }),
      });
    }
    return preview("therapeutic_outcome");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalOutcomeTypes(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.outcomeType),
      ["therapeutic_outcome", "precaution_outcome"],
    );
    assert.equal(items[0]?.capability.title, "Resultado terapéutico");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsOutcome, true);
    assert.equal(items[0]?.capability.supportsDiagnosis, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsLearning, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalOutcomeTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalOutcomeTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
