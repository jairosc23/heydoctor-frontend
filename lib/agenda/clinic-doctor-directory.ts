export type ClinicDoctor = {
  id: string;
  name: string | null;
};

export type ClinicDoctorOption = { id: string; label: string };

/** Build agenda choices from the authorized staff directory, never from bookings. */
export function toClinicDoctorOptions(doctors: ClinicDoctor[]): ClinicDoctorOption[] {
  return doctors.map((doctor) => ({
    id: doctor.id,
    label: doctor.name?.trim() || `Médico ${doctor.id.slice(0, 8)}`,
  }));
}
