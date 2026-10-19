import { heydoctorApi } from "../heydoctor-api";
import { fetchCurrentUser } from "./auth-session";

export type ClinicMe = {
  id: string;
  name: string;
  timezone: string;
};

/**
 * Obtiene info de clínica y doctor desde el backend (`/auth/me`).
 * @deprecated Prefer `fetchClinicProfile` for timezone SSOT.
 */
export async function fetchClinicMe(): Promise<{
  clinic: { id: string; name?: string; timezone?: string } | null;
  doctor: { id: string } | null;
}> {
  try {
    const me = await fetchCurrentUser();
    return {
      clinic: me.clinicId
        ? { id: me.clinicId, timezone: me.clinicTimezone }
        : null,
      doctor: me.id ? { id: me.id } : null,
    };
  } catch {
    return { clinic: null, doctor: null };
  }
}

/** SSOT clinic profile including IANA timezone. */
export async function fetchClinicProfile(): Promise<ClinicMe> {
  return heydoctorApi.get<ClinicMe>("/clinic/me");
}

export async function updateClinicTimezone(
  timezone: string,
): Promise<ClinicMe> {
  return heydoctorApi.patch<ClinicMe>("/clinic/me", { timezone });
}
