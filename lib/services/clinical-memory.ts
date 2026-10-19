import { heydoctorApi } from "../heydoctor-api";
import type { PatientClinicalMemory } from "../types/clinical-memory";

export async function fetchPatientClinicalMemory(
  patientId: string,
): Promise<PatientClinicalMemory> {
  const res = await heydoctorApi.get<{ data: PatientClinicalMemory }>(
    `/clinical-memory/patient/${patientId}`,
  );
  return res.data ?? (res as unknown as PatientClinicalMemory);
}
