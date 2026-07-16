import { getAuthMeUrl } from "../api-base";
import { heydoctorApi } from "../heydoctor-api";

export interface CurrentUserResponse {
  id: string;
  email: string;
  role: string;
  clinicId: string;
  plan: "free" | "pro";
  /** IANA clinic timezone SSOT (Agenda Enterprise Phase 7). */
  clinicTimezone?: string;
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return heydoctorApi.get<CurrentUserResponse>(getAuthMeUrl());
}
