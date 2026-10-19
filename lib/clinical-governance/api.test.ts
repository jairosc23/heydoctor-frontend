import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalGovernanceTypes, previewPath } from "./api";
import type { ClinicalGovernancePreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(
  governanceType: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    governanceType,
    title:
      governanceType === "therapeutic_governance"
        ? "Gobernanza terapéutica"
        : governanceType,
    supportsPreview: true,
    supportsGovernance: true,
    supportsDiagnosis: false as const,
    supportsAuthorization: false as const,
    supportsDisposition: false as const,
    supportsExecution: false as const,
    immutable: true as const,
    inClinicalGovernanceScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  governanceType: string,
  overrides: Record<string, unknown> = {},
): ClinicalGovernancePreviewResponse {
  return {
    data: {
      governanceType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "governance-1",
          governanceType,
          title: "Gobernanza terapéutica",
          description: "Gobernanza terapéutica",
          status: "governed",
          posture: "constrain",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: governanceType,
            recommendations: [{ recommendationId: "recommendation-1" }],
          },
          provenance: {
            origin: "clinical_recommendation",
            recommendationOffered: true,
          },
          sourceRefs: {
            recommendations: [{ recommendationId: "recommendation-1" }],
          },
          governanceSetId: null,
          governedAt: "2026-08-17T16:00:00.000Z",
          governanceChannel: "clinical_governance",
          supportsPreview: true,
          supportsGovernance: true,
          supportsDiagnosis: false,
          supportsAuthorization: false,
          supportsDisposition: false,
          supportsExecution: false,
          immutable: true,
          inClinicalGovernanceScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(governanceType),
      ...overrides,
    },
  } as ClinicalGovernancePreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("therapeutic_governance", CONSULTATION_ID),
    `/clinical-governance/therapeutic_governance/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("investigation_governance", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-governance/investigation_governance/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("therapeutic_governance", CONSULTATION_ID).includes("/write"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_governance", CONSULTATION_ID).includes("/post"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_governance", CONSULTATION_ID).includes("/accept"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_governance", CONSULTATION_ID).includes("/authorize"),
    false,
  );
  assert.equal(
    previewPath("therapeutic_governance", CONSULTATION_ID).includes("/execute"),
    false,
  );
});

test("listEnabledClinicalGovernanceTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/investigation_governance/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/precaution_governance/")) {
      return preview("precaution_governance", {
        capability: capability("precaution_governance", {
          title: "Gobernanza de precaución",
        }),
      });
    }
    return preview("therapeutic_governance");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalGovernanceTypes(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.governanceType),
      ["therapeutic_governance", "precaution_governance"],
    );
    assert.equal(items[0]?.capability.title, "Gobernanza terapéutica");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsGovernance, true);
    assert.equal(items[0]?.capability.supportsDiagnosis, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsDisposition, false);
    assert.equal(items[0]?.capability.supportsExecution, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalGovernanceTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalGovernanceTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
