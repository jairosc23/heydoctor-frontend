/**
 * Acciones de consulta orientadas a documentos firmados, facturaci\u00f3n y
 * exportaci\u00f3n. Cada acci\u00f3n hace fallback **gracioso** si el endpoint a\u00fan no
 * existe en el backend, para que la UI nunca quede rota mientras el equipo
 * de backend sigue iterando.
 *
 * Las funciones devuelven `ActionResult` con un `status`:
 *   - "ok"          \u2192 acci\u00f3n completada
 *   - "unavailable" \u2192 endpoint a\u00fan no existe (404). Mostrar aviso en UI.
 *   - "forbidden"   \u2192 sin permisos / sesi\u00f3n vencida.
 *   - "error"       \u2192 fallo gen\u00e9rico (red, 500, etc.).
 */

import { ApiError, getApiBase, heydoctorApi } from "../heydoctor-api";
import { createClinicalLogger } from "../clinical-logger";

const log = createClinicalLogger("consultation");

export type ActionStatus = "ok" | "unavailable" | "forbidden" | "error";

export interface ActionResult<T = unknown> {
  status: ActionStatus;
  data?: T;
  message?: string;
  /** URL pblica devuelta por el backend (PDF, recibo, etc.). */
  url?: string;
}

interface DocumentResponse {
  url?: string;
  pdfUrl?: string;
  documentUrl?: string;
  signedUrl?: string;
}

function pickUrl(res: DocumentResponse | null | undefined): string | undefined {
  if (!res) return undefined;
  return res.signedUrl || res.url || res.pdfUrl || res.documentUrl;
}

function classifyError<T>(e: unknown): ActionResult<T> {
  if (e instanceof ApiError) {
    if (e.status === 404) {
      return {
        status: "unavailable",
        message: "Esta acci\u00f3n a\u00fan no est\u00e1 habilitada en tu plan o servidor.",
      };
    }
    if (e.status === 401 || e.status === 403) {
      return {
        status: "forbidden",
        message:
          e.status === 401
            ? "Tu sesi\u00f3n expir\u00f3. Vuelve a iniciar sesi\u00f3n."
            : "No tienes permisos para esta acci\u00f3n.",
      };
    }
    return { status: "error", message: e.message || "Error del servidor." };
  }
  return {
    status: "error",
    message: e instanceof Error ? e.message : "Error inesperado.",
  };
}

async function tryPostDocument(
  path: string,
  body: Record<string, unknown> = {},
): Promise<ActionResult<DocumentResponse>> {
  try {
    const res = await heydoctorApi.post<DocumentResponse>(path, body);
    const url = pickUrl(res);
    log.event("document_generated", { path, hasUrl: Boolean(url) });
    return { status: "ok", data: res, url };
  } catch (e) {
    log.warn(`tryPostDocument failed ${path}`, e);
    return classifyError<DocumentResponse>(e);
  }
}

/* ───────────────────────── PDF & factura ───────────────────────── */

/**
 * Descarga el PDF clínico vía streaming (`application/pdf`).
 * Backend: `GET /consultations/:id/pdf` (alias de `/legal/consultation/:id/pdf`).
 */
export async function downloadConsultationPdf(consultationId: string): Promise<ActionResult> {
  const directUrl = `${getApiBase()}/consultations/${consultationId}/pdf`;
  window.open(directUrl, "_blank", "noopener,noreferrer");
  return {
    status: "ok",
    url: directUrl,
    message:
      "Se abrió la descarga del PDF clínico. Si tu navegador la bloquea, permite descargas para HeyDoctor.",
  };
}

export async function generateConsultationInvoice(
  consultationId: string,
): Promise<ActionResult<DocumentResponse>> {
  return tryPostDocument(`/consultations/${consultationId}/invoice`);
}

/* ───────────────────────── Eliminar ───────────────────────── */

export async function deleteConsultation(consultationId: string): Promise<ActionResult> {
  try {
    await heydoctorApi.delete(`/consultations/${consultationId}`);
    log.event("consultation_deleted", { consultationId });
    return { status: "ok" };
  } catch (e) {
    log.warn("deleteConsultation failed", e);
    return classifyError(e);
  }
}

/* ─────────────── Documentos firmados / premium ─────────────── */

export async function generateSignedPrescription(
  consultationId: string,
): Promise<ActionResult<DocumentResponse>> {
  return tryPostDocument(`/consultations/${consultationId}/signed-prescription`);
}

export async function generateSignedMedicalCertificate(
  consultationId: string,
): Promise<ActionResult<DocumentResponse>> {
  return tryPostDocument(`/consultations/${consultationId}/signed-certificate`);
}

export async function generateSignedReferral(
  consultationId: string,
): Promise<ActionResult<DocumentResponse>> {
  return tryPostDocument(`/consultations/${consultationId}/signed-referral`);
}

export async function generatePremiumDocument(
  consultationId: string,
): Promise<ActionResult<DocumentResponse>> {
  return tryPostDocument(`/consultations/${consultationId}/premium-document`);
}
