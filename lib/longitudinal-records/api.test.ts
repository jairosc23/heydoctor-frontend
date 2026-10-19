import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledLongitudinalRecordTypes, previewPath } from "./api";
import type { LongitudinalClinicalRecordPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(recordType: string, overrides: Record<string, unknown> = {}) {
  return {
    recordType,
    title:
      recordType === "documents"
        ? "Registro longitudinal de documentos"
        : recordType,
    supportsPreview: true,
    supportsLongitudinalView: true,
    supportsHistoryNavigation: true,
    supportsTimeline: false as const,
    immutable: true as const,
    inLongitudinalScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  recordType: string,
  overrides: Record<string, unknown> = {},
): LongitudinalClinicalRecordPreviewResponse {
  return {
    data: {
      recordType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "record-1",
          recordType,
          title: "Registro longitudinal de documentos",
          description: "Registro longitudinal de documentos",
          status: "composed",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: { kind: recordType, facts: [{ artifactId: "artifact-1" }] },
          provenance: {
            origin: "clinical_artifact_registry",
            factsRegistered: true,
          },
          sourceRefs: [{ artifactId: "artifact-1" }],
          timelineGroupId: null,
          composedAt: "2026-08-15T22:00:00.000Z",
          recordChannel: "longitudinal_clinical_record",
          supportsPreview: true,
          supportsLongitudinalView: true,
          supportsHistoryNavigation: true,
          supportsTimeline: false,
          immutable: true,
          inLongitudinalScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(recordType),
      ...overrides,
    },
  } as LongitudinalClinicalRecordPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("documents", CONSULTATION_ID),
    `/longitudinal-records/documents/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("orders", CONSULTATION_ID, PREVIEW_ID),
    `/longitudinal-records/orders/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("orders", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("orders", CONSULTATION_ID).includes("/post"), false);
});

test("listEnabledLongitudinalRecordTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/orders/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/encounters/")) {
      return preview("encounters", {
        capability: capability("encounters", {
          inLongitudinalScope: false,
          supportsPreview: false,
        }),
      });
    }
    if (path.includes("/clinical_decisions/")) {
      return preview("clinical_decisions", {
        capability: capability("clinical_decisions", {
          title: "Registro longitudinal de decisiones clínicas",
        }),
      });
    }
    if (path.includes("/authority_events/")) {
      return preview("authority_events", {
        capability: capability("authority_events", {
          title: "Registro longitudinal de eventos de autoridad",
        }),
      });
    }
    if (path.includes("/artifacts/")) {
      return preview("artifacts", {
        capability: capability("artifacts", {
          title: "Registro longitudinal de artefactos",
        }),
      });
    }
    return preview("documents");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledLongitudinalRecordTypes(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.recordType),
      ["documents", "clinical_decisions", "authority_events", "artifacts"],
    );
    assert.equal(items[0]?.capability.title, "Registro longitudinal de documentos");
    assert.equal(items[0]?.capability.immutable, true);
    assert.equal(items[0]?.capability.supportsLongitudinalView, true);
    assert.equal(items[0]?.capability.supportsTimeline, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledLongitudinalRecordTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledLongitudinalRecordTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
