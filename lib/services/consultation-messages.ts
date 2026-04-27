/**
 * Mensajes de chat de teleconsulta.
 *
 * El backend Nest todavía no expone necesariamente `/consultations/:id/messages`
 * en este punto del producto: usamos `getOrFallback`/`postOrFallback` para que
 * un 404 degrade el ChatPanel a modo local-only sin romper la UI.
 */

import { heydoctorApi } from "@/lib/heydoctor-api";

export interface ConsultationMessageAttachment {
  /** Nombre original del archivo. */
  name: string;
  /** MIME (image/png, application/pdf, …). */
  mimeType: string;
  /** Tamaño en bytes (informativo). */
  size: number;
  /**
   * URL canónica si el backend hospeda el adjunto. Si solo existe `dataUrl`
   * estamos en modo local-only.
   */
  url?: string;
  /** Data URL (base64) cuando el adjunto está embebido. Solo usar para tamaños pequeños. */
  dataUrl?: string;
}

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  body: string;
  /** "doctor" | "patient" | "system" — quién envió el mensaje. */
  sender: "doctor" | "patient" | "system";
  /** Marca temporal en ms epoch. */
  timestamp: number;
  attachment?: ConsultationMessageAttachment | null;
  /** True cuando el mensaje todavía no se sincronizó con el backend. */
  pending?: boolean;
}

export interface CreateConsultationMessageDto {
  body: string;
  attachment?: ConsultationMessageAttachment | null;
  sender?: ConsultationMessage["sender"];
}

interface ListResponse {
  data?: ConsultationMessage[];
  messages?: ConsultationMessage[];
}

/**
 * Lista los mensajes de una consulta. Si el endpoint devuelve 404 o la API no
 * soporta este recurso, retorna `[]` (no rompe).
 */
export async function fetchConsultationMessages(
  consultationId: string,
): Promise<ConsultationMessage[]> {
  const fallback: ListResponse = { data: [] };
  const res = await heydoctorApi.getOrFallback<ListResponse>(
    `/consultations/${consultationId}/messages`,
    fallback,
  );
  const list = res?.data ?? res?.messages ?? [];
  return Array.isArray(list) ? list : [];
}

/**
 * Crea un mensaje en el backend. Si el endpoint no existe (404) devuelve null
 * para que el caller pueda degradar a modo local-only.
 */
export async function postConsultationMessage(
  consultationId: string,
  dto: CreateConsultationMessageDto,
): Promise<ConsultationMessage | null> {
  const fallback = { data: null as ConsultationMessage | null };
  const res = await heydoctorApi.postOrFallback<{ data: ConsultationMessage | null }>(
    `/consultations/${consultationId}/messages`,
    dto,
    fallback,
  );
  return res?.data ?? null;
}
