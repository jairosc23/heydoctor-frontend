import { heydoctorApi } from "../heydoctor-api";

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  slug: string;
  specialty: string;
  country: string;
  bio: string;
  avatarUrl: string | null;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
}

export interface DoctorRating {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RatingsResponse {
  ratings: DoctorRating[];
  average: number;
  count: number;
}

async function publicGet<T>(path: string): Promise<T> {
  try {
    return await heydoctorApi.get<T>(path);
  } catch {
    throw new Error("Error al cargar datos");
  }
}

export async function fetchPublicDoctors(): Promise<DoctorProfile[]> {
  return publicGet<DoctorProfile[]>("/doctors");
}

export async function fetchDoctorBySlug(
  slug: string
): Promise<DoctorProfile> {
  return publicGet<DoctorProfile>(`/doctors/${slug}`);
}

export async function fetchDoctorRatings(
  slug: string
): Promise<RatingsResponse> {
  return publicGet<RatingsResponse>(`/doctors/${slug}/ratings`);
}

export async function submitDoctorRating(
  slug: string,
  data: { patientName: string; rating: number; comment?: string; consultationId?: string }
): Promise<DoctorRating> {
  return heydoctorApi.post<DoctorRating>(`/doctors/${slug}/ratings`, data);
}
