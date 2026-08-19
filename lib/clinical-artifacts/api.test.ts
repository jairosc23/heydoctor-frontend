import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalArtifacts, previewPath } from "./api";
import type { ClinicalArtifactPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(artifactType: string, overrides: Record<string, unknown> = {}) {
  return {
    artifactType,
    title:
      artifactType === "encounter_close"
        ? "Artefacto de cierre de encuentro"
        : artifactType,
    supportsPreview: true,
    supportsHistory: true,
    supportsTraceability: true,
    supportsRelationship: true,
    immutable: true as const,
    inRegistryScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  artifactType: string,
  overrides: Record<string, unknown> = {},
): ClinicalArtifactPreviewResponse {
  return {
    data: {
      artifactType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "artifact-1",
          artifactType,
          title: "Artefacto de cierre de encuentro",
          description: "Artefacto de cierre de encuentro",
          status: "recorded",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: { kind: artifactType },
          provenance: { origin: "clinical_authority_spine", hitlSatisfied: true },
          sourceRefs: [],
          relatedArtifactId: null,
          artifactBundleId: null,
          recordedAt: "2026-08-15T21:00:00.000Z",
          registryChannel: "clinical_artifact_registry",
          supportsPreview: true,
          supportsHistory: true,
          supportsTraceability: true,
          supportsRelationship: true,
          immutable: true,
          inRegistryScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(artifactType),
      ...overrides,
    },
  } as ClinicalArtifactPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("encounter_close", CONSULTATION_ID),
    `/clinical-artifacts/encounter_close/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("clinical_document", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-artifacts/clinical_document/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("clinical_order", CONSULTATION_ID).includes("/write"),
    false,
  );
  assert.equal(
    previewPath("clinical_order", CONSULTATION_ID).includes("timeline"),
    false,
  );
});

test("listEnabledClinicalArtifacts hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/clinical_order/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/clinical_document/")) {
      return preview("clinical_document", {
        capability: capability("clinical_document", {
          inRegistryScope: false,
          supportsPreview: false,
        }),
      });
    }
    if (path.includes("/clinical_decision/")) {
      return preview("clinical_decision", {
        capability: capability("clinical_decision", {
          title: "Artefacto de decision clinica",
        }),
      });
    }
    if (path.includes("/authority_event/")) {
      return preview("authority_event", {
        capability: capability("authority_event", {
          title: "Artefacto de evento de autoridad",
        }),
      });
    }
    return preview("encounter_close");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalArtifacts(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.artifactType),
      ["clinical_decision", "encounter_close", "authority_event"],
    );
    assert.equal(items[0]?.capability.title, "Artefacto de decision clinica");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsHistory, true);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalArtifacts throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalArtifacts(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
