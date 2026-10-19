import { ApiError, fetchWithAuth, heydoctorApi } from "../heydoctor-api";
import {
  CLINICAL_DOCUMENT_ENGINE_TYPES,
  type ClinicalDocumentEngineType,
  type ClinicalDocumentPdfDisposition,
  type ClinicalDocumentPreviewResponse,
} from "./types";
import {
  documentCapabilityFromPreview,
  type PreviewDocumentCapability,
} from "./capability";

export type ClinicalDocumentListItem = {
  type: ClinicalDocumentEngineType;
  preview: ClinicalDocumentPreviewResponse;
  capability: PreviewDocumentCapability;
};

export type ClinicalDocumentPdfResult = {
  blob: Blob;
  fileName: string;
  objectUrl: string;
};

function previewPath(
  type: ClinicalDocumentEngineType,
  consultationId: string,
): string {
  const query = new URLSearchParams({ consultationId });
  return `/clinical-documents/${type}/preview?${query.toString()}`;
}

function pdfPath(
  type: ClinicalDocumentEngineType,
  consultationId: string,
  disposition: ClinicalDocumentPdfDisposition,
): string {
  const query = new URLSearchParams({ consultationId, disposition });
  return `/clinical-documents/${type}/pdf?${query.toString()}`;
}

function fileNameFromDisposition(
  header: string | null,
  type: ClinicalDocumentEngineType,
  consultationId: string,
): string {
  const match = header?.match(/filename="([^"]+)"/i);
  if (match?.[1]) return match[1];
  return `${type.replace(/_/g, "-")}-${consultationId}.pdf`;
}

export async function previewClinicalDocument(
  type: ClinicalDocumentEngineType,
  consultationId: string,
): Promise<ClinicalDocumentPreviewResponse> {
  return heydoctorApi.get<ClinicalDocumentPreviewResponse>(
    previewPath(type, consultationId),
  );
}

export async function fetchClinicalDocumentPdf(
  type: ClinicalDocumentEngineType,
  consultationId: string,
  disposition: ClinicalDocumentPdfDisposition,
): Promise<ClinicalDocumentPdfResult> {
  const res = await fetchWithAuth(pdfPath(type, consultationId, disposition), {
    method: "GET",
    headers: { Accept: "application/pdf" },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => null);
    }
    throw new ApiError(
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `Error ${res.status}`,
      res.status,
      body,
    );
  }

  const blob = await res.blob();
  const fileName = fileNameFromDisposition(
    res.headers.get("content-disposition"),
    type,
    consultationId,
  );
  return {
    blob,
    fileName,
    objectUrl: URL.createObjectURL(blob),
  };
}

export async function listEnabledClinicalDocuments(
  consultationId: string,
): Promise<ClinicalDocumentListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_DOCUMENT_ENGINE_TYPES.map(async (type) => {
      const preview = await previewClinicalDocument(type, consultationId);
      const capability = documentCapabilityFromPreview(preview);
      if (!capability.enabledForCountry) {
        return null;
      }
      return { type, preview, capability } satisfies ClinicalDocumentListItem;
    }),
  );

  const items: ClinicalDocumentListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      if (outcome.value) items.push(outcome.value);
      continue;
    }
    const error = outcome.reason;
    if (error instanceof ApiError && error.status === 403) {
      continue;
    }
    if (error instanceof ApiError && error.status === 404) {
      missingConsultation = true;
      continue;
    }
    errors.push(error instanceof Error ? error : new Error(String(error)));
  }

  if (missingConsultation && items.length === 0) {
    throw new ApiError("Consulta no encontrada", 404);
  }
  if (items.length === 0 && errors.length > 0) {
    throw errors[0];
  }
  return items;
}

export { previewPath, pdfPath, fileNameFromDisposition };
