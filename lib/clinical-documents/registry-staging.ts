import { getBackendOrigin } from "../api-base";
import { ApiError, heydoctorApi } from "../heydoctor-api";

export const QA_REGISTRY_HOST = "qa-api.heydoctor.health";

const RECORD_PATH = "/v1/clinical-documents/registry";
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StagingRegistryMetadata = {
  id: string;
  category: string;
  title: string;
  status: string;
  currentVersion: number;
  consultationId: string | null;
  publishedAt: string | null;
  signatureStatus: string;
};

export type StagingRegistryRead =
  | { outcome: "metadata"; record: StagingRegistryMetadata }
  | { outcome: "not_found" };

export function isQaRegistryStaging(
  origin = safeOrigin(),
): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).host === QA_REGISTRY_HOST;
  } catch {
    return false;
  }
}

export function registryRecordPath(id: string): string {
  if (!UUID_V4.test(id)) {
    throw new ApiError("Identificador de documento inválido", 400);
  }
  return `${RECORD_PATH}/${id}`;
}

export function toRegistryMetadata(raw: unknown): StagingRegistryMetadata | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || !UUID_V4.test(row.id)) return null;
  if (typeof row.title !== "string" || typeof row.status !== "string") return null;
  if (typeof row.category !== "string" || typeof row.signatureStatus !== "string") {
    return null;
  }
  if (typeof row.currentVersion !== "number") return null;
  const consultationId =
    typeof row.consultationId === "string" ? row.consultationId : null;
  const publishedAt = typeof row.publishedAt === "string" ? row.publishedAt : null;
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    status: row.status,
    currentVersion: row.currentVersion,
    consultationId,
    publishedAt,
    signatureStatus: row.signatureStatus,
  };
}

export async function readStagingRegistry(
  id: string,
): Promise<StagingRegistryRead> {
  assertStagingHost();
  try {
    const body = await heydoctorApi.get<unknown>(registryRecordPath(id));
    const record = toRegistryMetadata(body);
    if (!record) throw new ApiError("Respuesta de registry incompleta", 502);
    return { outcome: "metadata", record };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { outcome: "not_found" };
    }
    throw error;
  }
}

export async function listStagingRegistryForConsultation(
  consultationId: string,
): Promise<StagingRegistryMetadata[]> {
  assertStagingHost();
  if (!UUID_V4.test(consultationId)) {
    throw new ApiError("Identificador de consulta inválido", 400);
  }
  const body = await heydoctorApi.get<unknown>(RECORD_PATH);
  const rows = Array.isArray(body) ? body : [];
  return rows
    .map(toRegistryMetadata)
    .filter((row): row is StagingRegistryMetadata => row !== null)
    .filter((row) => row.consultationId === consultationId);
}

function assertStagingHost(): void {
  if (!isQaRegistryStaging()) {
    throw new ApiError("Registry QA no está habilitado para este host", 403);
  }
}

function safeOrigin(): string | null {
  try {
    return getBackendOrigin();
  } catch {
    return null;
  }
}
