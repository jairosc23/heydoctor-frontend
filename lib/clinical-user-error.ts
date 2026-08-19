import { ApiError, getApiErrorMessage } from "./heydoctor-api";

const CODE_MESSAGES: Record<string, string> = {
  HAB_CONFIRM_REQUIRED:
    "Se requiere confirmación de autoridad (HAB) para persistir.",
  HAB_CONFIRM_ALREADY_CONSUMED:
    "La confirmación de autoridad ya fue utilizada. Confirme de nuevo para persistir.",
  HAB_CONFIRM_MISMATCH:
    "La confirmación de autoridad no corresponde a este acto.",
  EMISSION_HAB_REQUIRED:
    "Se requiere confirmación de autoridad (HAB) para emitir.",
  EMISSION_INVALID_STATE:
    "La emisión no está lista. Complete la autorización e inténtelo de nuevo.",
  EMISSION_ILLEGAL_SOURCE:
    "La fuente no puede emitir. Use el motor de prescripción autorizado.",
  EMISSION_PE_ADAPTER_GATED: "La emisión no está disponible en este momento.",
};

function extractCode(error: unknown): string | null {
  if (
    error instanceof ApiError &&
    error.body &&
    typeof error.body === "object"
  ) {
    const code = (error.body as { code?: unknown }).code;
    if (typeof code === "string" && code.trim()) return code.trim();
  }
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as { response?: { data?: { code?: unknown } } })
      .response?.data;
    if (typeof data?.code === "string" && data.code.trim())
      return data.code.trim();
  }
  return null;
}

/** Physician-facing message. Maps known fail-closed codes; never changes HAB/PE. */
export function toClinicalUserError(
  error: unknown,
  fallback = "Ha ocurrido un error",
): string {
  const code = extractCode(error);
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  return getApiErrorMessage(error, fallback);
}
