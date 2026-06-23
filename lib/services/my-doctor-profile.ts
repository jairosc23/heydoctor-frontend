import { ApiError, getApiErrorMessage, heydoctorApi } from "../heydoctor-api";

export type DoctorProfileCompletenessField =
  | "name"
  | "specialty"
  | "country"
  | "licenseNumber"
  | "licenseAuthority"
  | "professionalEmail"
  | "professionalPhone"
  | "professionalAddress"
  | "signatureUrl";

export interface DoctorProfileCompleteness {
  isComplete: boolean;
  missingFields: DoctorProfileCompletenessField[];
}

export interface MyDoctorProfile {
  id: string;
  userId: string;
  clinicId: string;
  name: string;
  specialty: string;
  bio?: string | null;
  country: string;
  avatarUrl?: string | null;
  licenseNumber: string | null;
  licenseAuthority: string | null;
  professionalEmail: string | null;
  professionalPhone: string | null;
  professionalAddress: string | null;
  signatureUrl: string | null;
  isPublic?: boolean;
}

export interface MyDoctorProfileResponse {
  profile: MyDoctorProfile | null;
  completeness: DoctorProfileCompleteness;
}

export interface UpdateMyDoctorProfileInput {
  name?: string;
  specialty?: string;
  licenseNumber?: string;
  licenseAuthority?: string;
  professionalEmail?: string;
  professionalPhone?: string;
  professionalAddress?: string;
  country?: string;
  signatureUrl?: string;
}

export function getDoctorProfileErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return getApiErrorMessage(error, fallback);
}

export function isDoctorProfileAccessDenied(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export async function fetchMyDoctorProfile(): Promise<MyDoctorProfileResponse> {
  return heydoctorApi.get<MyDoctorProfileResponse>("/doctor-profile/me");
}

export async function fetchMyDoctorProfileCompleteness(): Promise<DoctorProfileCompleteness> {
  return heydoctorApi.get<DoctorProfileCompleteness>(
    "/doctor-profile/me/completeness",
  );
}

export async function updateMyDoctorProfile(
  input: UpdateMyDoctorProfileInput,
): Promise<MyDoctorProfileResponse> {
  return heydoctorApi.fetch<MyDoctorProfileResponse>("/doctor-profile/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
