import { apiGet } from "../api-client";

export interface CurrentUserResponse {
  id: string;
  email: string;
  role: string;
  clinicId: string;
  plan: "free" | "pro";
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return apiGet<CurrentUserResponse>("/auth/me");
}
