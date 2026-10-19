import { heydoctorApi } from "../heydoctor-api";

export type ProfessionalLicenseStatus = "unverified" | "active" | "revoked";

export type ProfessionalLicense = {
  id: string;
  doctorProfileId: string;
  countryCode: string;
  subdivisionCode: string | null;
  jurisdictionCode: string;
  authority: string;
  licenseNumber: string;
  status: ProfessionalLicenseStatus;
  expiresAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
};

export type UpsertProfessionalLicenseInput = {
  countryCode: string;
  subdivisionCode?: string | null;
  authority: string;
  licenseNumber: string;
  expiresAt?: string | null;
};

export function listMyProfessionalLicenses(): Promise<ProfessionalLicense[]> {
  return heydoctorApi.get<ProfessionalLicense[]>("/doctor-profile/licenses");
}

export function listClinicProfessionalLicenses(): Promise<
  ProfessionalLicense[]
> {
  return heydoctorApi.get<ProfessionalLicense[]>(
    "/doctor-profile/licenses/clinic",
  );
}

export function createProfessionalLicense(
  input: UpsertProfessionalLicenseInput,
): Promise<ProfessionalLicense> {
  return heydoctorApi.post<ProfessionalLicense>(
    "/doctor-profile/licenses",
    input,
  );
}

export function verifyProfessionalLicense(
  id: string,
): Promise<ProfessionalLicense> {
  return heydoctorApi.patch<ProfessionalLicense>(
    `/doctor-profile/licenses/${id}/verify`,
    {},
  );
}

export function revokeProfessionalLicense(
  id: string,
): Promise<ProfessionalLicense> {
  return heydoctorApi.patch<ProfessionalLicense>(
    `/doctor-profile/licenses/${id}/revoke`,
    {},
  );
}
