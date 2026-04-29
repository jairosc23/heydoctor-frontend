/**
 * Cliente HTTP para los endpoints `/api/public/*` del backend NestJS. Estos
 * endpoints están exentos de JWT y CSRF (ver `CSRF_SKIP_PATH_PREFIXES`), por lo
 * que NO usamos `fetchWithAuth` ni cookies; un `fetch` directo con
 * `credentials: "omit"` evita filtrar la sesión del médico cuando un usuario
 * autenticado abre la home.
 */

import { getApiBase } from "@/lib/api-base";

export interface CreateGuestConsultationDto {
  name: string;
  reason: string;
}

export interface CreateGuestConsultationResult {
  consultationId: string;
  joinUrl: string;
  patientId: string;
}

export interface PublicConsultationStatus {
  id: string;
  status: string;
  isGuest: boolean;
}

/** Respuesta de GET /public/teleconsultation/:token (acceso invitado sin login). */
export interface PublicTeleconsultationInvite {
  consultationId: string;
  roomId: string;
  patientName?: string;
}

export class GuestConsultationError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "GuestConsultationError";
  }
}

export async function createGuestConsultation(
  dto: CreateGuestConsultationDto,
): Promise<CreateGuestConsultationResult> {
  const url = `${getApiBase()}/public/consultations`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  } catch (e) {
    throw new GuestConsultationError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }

  if (!res.ok) {
    let message = `Error del servidor (${res.status}).`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body?.message === "string") {
        message = body.message;
      } else if (Array.isArray(body?.message) && body.message.length > 0) {
        message = body.message.join(" · ");
      }
    } catch {
      /* respuesta no-JSON: usamos message por defecto */
    }
    throw new GuestConsultationError(message, res.status);
  }

  const data = (await res.json()) as Partial<CreateGuestConsultationResult>;
  if (!data.consultationId) {
    throw new GuestConsultationError(
      "Respuesta inválida del servidor (sin consultationId).",
      500,
    );
  }
  return {
    consultationId: data.consultationId,
    joinUrl: data.joinUrl ?? "",
    patientId: data.patientId ?? "",
  };
}

/**
 * Devuelve `null` si la consulta no existe (404). Cualquier otro error de red
 * o servidor lo dejamos burbujear para que el caller decida fallback. No
 * pasamos cookies para que un médico autenticado en otra pestaña no contamine
 * el resultado.
 */
export async function fetchPublicConsultationStatus(
  consultationId: string,
): Promise<PublicConsultationStatus | null> {
  const url = `${getApiBase()}/public/consultations/${encodeURIComponent(
    consultationId,
  )}/status`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new GuestConsultationError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GuestConsultationError(
      `Error consultando estado (${res.status}).`,
      res.status,
    );
  }
  const data = (await res.json()) as Partial<PublicConsultationStatus>;
  if (!data.id) return null;
  return {
    id: data.id,
    status: data.status ?? "unknown",
    isGuest: !!data.isGuest,
  };
}

/**
 * Valida un enlace mágico de teleconsulta. Sin cookies (invitado).
 * Devuelve `null` si el token no existe o expiró (404).
 */
export async function fetchPublicTeleconsultationByToken(
  token: string,
): Promise<PublicTeleconsultationInvite | null> {
  const t = token.trim();
  if (!t) return null;

  const url = `${getApiBase()}/public/teleconsultation/${encodeURIComponent(t)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new GuestConsultationError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GuestConsultationError(
      `Error al validar el enlace (${res.status}).`,
      res.status,
    );
  }

  const data = (await res.json()) as Partial<PublicTeleconsultationInvite>;
  if (!data.consultationId || !data.roomId) return null;
  return {
    consultationId: data.consultationId,
    roomId: data.roomId,
    patientName:
      typeof data.patientName === "string" ? data.patientName : undefined,
  };
}
