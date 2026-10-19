import { ApiError, getApiErrorMessage } from "./heydoctor-api";

export const CONSULTATION_ACCESS_DENIED_MESSAGE =
  "No tienes permiso para acceder a esta consulta. Solo el médico asignado o un administrador de la clínica pueden verla.";

export const CONSULTATION_NOT_FOUND_MESSAGE =
  "No encontramos esta consulta o no pertenece a tu clínica.";

export function getConsultationAccessErrorMessage(
  error: unknown,
  fallback = "No se pudo cargar la consulta.",
): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return CONSULTATION_ACCESS_DENIED_MESSAGE;
    }
    if (error.status === 404) {
      return CONSULTATION_NOT_FOUND_MESSAGE;
    }
  }
  return getApiErrorMessage(error, fallback);
}

export function isConsultationAccessDenied(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}
