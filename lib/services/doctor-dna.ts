import { heydoctorApi } from "../heydoctor-api";
import type { DoctorDnaProfile } from "../types/doctor-dna";

export async function fetchDoctorDnaProfile(): Promise<DoctorDnaProfile> {
  const res = await heydoctorApi.get<{ data: DoctorDnaProfile }>(
    "/doctor-dna/profile",
  );
  return res.data ?? (res as unknown as DoctorDnaProfile);
}
