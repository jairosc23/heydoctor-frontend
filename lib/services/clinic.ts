import { fetchCurrentUser } from "./auth-session";

/**
 * Obtiene info de clínica y doctor desde el backend (`/auth/me`).
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
    return { clinic: null, doctor: null };
  }
}
