import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import {
  QA_REGISTRY_HOST,
  isQaRegistryStaging,
  listStagingRegistryForConsultation,
  readStagingRegistry,
  registryRecordPath,
  toRegistryMetadata,
} from "./registry-staging";

const DOC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CONSULT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

test("registry staging host is only the QA API", async () => {
  assert.equal(isQaRegistryStaging(`https://${QA_REGISTRY_HOST}`), true);
  assert.equal(isQaRegistryStaging("https://pro-api.heydoctor.health"), false);
  assert.equal(isQaRegistryStaging("https://app.heydoctor.health"), false);
  assert.equal(isQaRegistryStaging("https://staging-api.heydoctor.health"), false);
  const previous = process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
  process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://pro-api.heydoctor.health";
  const { heydoctorApi } = await import("../heydoctor-api");
  const mutableApi = heydoctorApi as { get: typeof heydoctorApi.get };
  const original = mutableApi.get;
  let calls = 0;
  mutableApi.get = (async () => {
    calls += 1;
    return [];
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => readStagingRegistry("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
      (error: unknown) => error instanceof ApiError && error.status === 403,
    );
    assert.equal(calls, 0);
  } finally {
    mutableApi.get = original;
    if (previous === undefined) delete process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
    else process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = previous;
  }
});

test("registry metadata drops storage keys and identity ids", () => {
  const metadata = toRegistryMetadata({
    id: DOC,
    category: "consultation",
    title: "Nota",
    status: "published",
    currentVersion: 2,
    consultationId: CONSULT,
    publishedAt: "2026-10-19T00:00:00.000Z",
    signatureStatus: "reserved",
    storageKey: "secret/object",
    patientId: "patient",
    doctorId: "doctor",
    versions: [{ storageKey: "secret/version" }],
  });
  assert.deepEqual(metadata, {
    id: DOC,
    category: "consultation",
    title: "Nota",
    status: "published",
    currentVersion: 2,
    consultationId: CONSULT,
    publishedAt: "2026-10-19T00:00:00.000Z",
    signatureStatus: "reserved",
  });
  assert.equal(JSON.stringify(metadata).includes("storageKey"), false);
  assert.equal(registryRecordPath(DOC), `/v1/clinical-documents/registry/${DOC}`);
  assert.equal(registryRecordPath(DOC).includes("preview"), false);
  assert.equal(registryRecordPath(DOC).includes("pdf"), false);
});

test("foreign registry read is not_found and list stays on the consultation", async () => {
  const previous = process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
  process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = `https://${QA_REGISTRY_HOST}`;
  const { heydoctorApi } = await import("../heydoctor-api");
  const mutableApi = heydoctorApi as { get: typeof heydoctorApi.get };
  const original = mutableApi.get;
  const seen: string[] = [];
  mutableApi.get = (async (path: string) => {
    seen.push(path);
    if (path.endsWith(`/${DOC}`)) throw new ApiError("Clinical document not found", 404);
    return [
      {
        id: DOC,
        category: "consultation",
        title: "Nota",
        status: "published",
        currentVersion: 1,
        consultationId: CONSULT,
        publishedAt: null,
        signatureStatus: "reserved",
        storageKey: "hidden",
      },
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        category: "consultation",
        title: "Otra",
        status: "draft",
        currentVersion: 1,
        consultationId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        publishedAt: null,
        signatureStatus: "reserved",
      },
    ];
  }) as typeof heydoctorApi.get;
  try {
    const missing = await readStagingRegistry(DOC);
    const listed = await listStagingRegistryForConsultation(CONSULT);
    assert.deepEqual(missing, { outcome: "not_found" });
    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.consultationId, CONSULT);
    assert.equal(seen.some((path) => path.includes("preview") || path.includes("pdf")), false);
  } finally {
    mutableApi.get = original;
    if (previous === undefined) delete process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
    else process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = previous;
  }
});
