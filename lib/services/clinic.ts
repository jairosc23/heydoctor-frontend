import { getSessionUser } from "../auth";
import { fetchCurrentUser } from "./auth-session";

/**
 * Obtiene info de clínica y doctor desde la sesión del backend (`/auth/me`).
 * Fallback a localStorage si la petición falla (ej. offline).
 */
export async function fetchClinicMe(): Promise<{
  clinic: { id: string; name?: string } | null;
  doctor: { id: string } | null;
}> {
  try {
    const me = await fetchCurrentUser();
    return {
      clinic: me.clinicId ? { id: me.clinicId } : null,
      doctor: me.id ? { id: me.id } : null,
    };
  } catch {
    const u = getSessionUser();
    if (!u) return { clinic: null, doctor: null };
    return {
      clinic: u.clinicId ? { id: u.clinicId, name: u.clinicName } : null,
      doctor: u.id ? { id: u.id } : null,
    };
  }
}
