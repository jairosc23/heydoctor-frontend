/** E05 CAP-005 — bound clinical context client types (W1). */

export type CareBinding = {
  clinicId: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
};

export type ClinicalContextLifecycleState =
  | "unbound"
  | "bound"
  | "enriched"
  | "disposed";

export type ClinicalContextBindingRecord = {
  bindingId: string;
  binding: CareBinding;
  state: ClinicalContextLifecycleState;
  snapshotSchemaVersion: string | null;
  patientIdFromSnapshot: string | null;
  boundAt: string;
  disposedAt: string | null;
};

export type ClinicalContextStatusResponse = {
  bound: boolean;
  record: ClinicalContextBindingRecord | null;
};
