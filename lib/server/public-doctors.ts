import { getApiBase } from "../api-base";
import type { DoctorProfile, RatingsResponse } from "../services/doctor-profiles";

/**
 * Listado público de doctores — ISR 60s (solo usar desde Server Components / RSC).
 * Datos clínicos siguen yendo por `heydoctor-api` con `cache: "no-store"` en cliente.
 */
export async function fetchPublicDoctorsCached(): Promise<DoctorProfile[]> {
  const res = await fetch(`${getApiBase()}/doctors`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60, tags: ["doctors"] },
  });
  if (!res.ok) {
    throw new Error(`doctors list failed: ${res.status}`);
  }
  return res.json() as Promise<DoctorProfile[]>;
}

export async function fetchDoctorBySlugCached(
  slug: string,
): Promise<DoctorProfile> {
  const res = await fetch(`${getApiBase()}/doctors/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60, tags: ["doctors"] },
  });
  if (!res.ok) {
    throw new Error(`doctor ${slug}: ${res.status}`);
  }
  return res.json() as Promise<DoctorProfile>;
}

export async function fetchDoctorRatingsCached(
  slug: string,
): Promise<RatingsResponse> {
  const res = await fetch(
    `${getApiBase()}/doctors/${encodeURIComponent(slug)}/ratings`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 60, tags: ["doctors"] },
    },
  );
  if (!res.ok) {
    throw new Error(`ratings ${slug}: ${res.status}`);
  }
  return res.json() as Promise<RatingsResponse>;
}
