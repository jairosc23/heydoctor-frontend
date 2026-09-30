/**
 * Contratos públicos de discovery (EPIC 1).
 * `/api/public/*` — sin JWT ni CSRF (credentials: omit).
 */

import { getApiBase } from "@/lib/api-base";

export type PublicDoctorCard = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  country: string;
  bio: string;
  avatarUrl: string | null;
  rating: number;
  ratingCount: number;
};

export type PublicSpecialty = {
  name: string;
  doctorCount: number;
};

export type PublicAvailabilityDoctor = PublicDoctorCard & {
  clinicTimezone: string | null;
  nextSlot: { startsAt: string; endsAt: string } | null;
  openSlotCount: number;
};

export type PublicAvailabilitySearch = {
  from: string;
  to: string;
  results: PublicAvailabilityDoctor[];
};

export class PublicDiscoveryError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "PublicDiscoveryError";
  }
}

async function publicGet<T>(path: string): Promise<T> {
  const url = `${getApiBase()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new PublicDiscoveryError("No se pudo contactar al servidor.", 0);
  }
  if (!res.ok) {
    throw new PublicDiscoveryError(
      "No se pudo cargar el directorio de médicos.",
      res.status,
    );
  }
  return (await res.json()) as T;
}

function queryString(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const trimmed = value?.trim();
    if (trimmed) qs.set(key, trimmed);
  }
  const encoded = qs.toString();
  return encoded ? `?${encoded}` : "";
}

export function publicDoctorsPath(filters?: {
  q?: string;
  specialty?: string;
}): string {
  return `/public/doctors${queryString({
    q: filters?.q,
    specialty: filters?.specialty,
  })}`;
}

export function publicAvailabilityPath(filters?: {
  q?: string;
  specialty?: string;
  from?: string;
  to?: string;
}): string {
  return `/public/availability${queryString({
    q: filters?.q,
    specialty: filters?.specialty,
    from: filters?.from,
    to: filters?.to,
  })}`;
}

export function fetchPublicSpecialties(): Promise<PublicSpecialty[]> {
  return publicGet<PublicSpecialty[]>("/public/specialties");
}

export function fetchPublicDoctorDirectory(filters?: {
  q?: string;
  specialty?: string;
}): Promise<PublicDoctorCard[]> {
  return publicGet<PublicDoctorCard[]>(publicDoctorsPath(filters));
}

export function fetchPublicAvailability(filters?: {
  q?: string;
  specialty?: string;
  from?: string;
  to?: string;
}): Promise<PublicAvailabilitySearch> {
  return publicGet<PublicAvailabilitySearch>(publicAvailabilityPath(filters));
}
