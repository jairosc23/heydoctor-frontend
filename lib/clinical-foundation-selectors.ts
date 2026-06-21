import type {
  ClinicalFoundationBundle,
  ClinicalFoundationBundleHealth,
  ClinicalFoundationBundleHealthErrors,
  ClinicalFoundationConsultation,
  ClinicalFoundationDrafts,
  ClinicalFoundationEncounter,
  ClinicalFoundationIntelligence,
  ClinicalFoundationOrders,
  ClinicalFoundationPatient,
  ClinicalFoundationProvenance,
} from "./types/clinical-foundation.types";
import type { PatientClinicalMemory } from "./types/clinical-memory";

type MaybeFoundation = ClinicalFoundationBundle | null | undefined;

export function selectFoundationPatient(
  foundation: MaybeFoundation,
): ClinicalFoundationPatient | null {
  return foundation?.patient ?? null;
}

export function selectFoundationConsultation(
  foundation: MaybeFoundation,
): ClinicalFoundationConsultation | null {
  return foundation?.consultation ?? null;
}

export function selectFoundationEncounter(
  foundation: MaybeFoundation,
): ClinicalFoundationEncounter | null {
  return foundation?.encounter ?? null;
}

export function selectFoundationMemory(
  foundation: MaybeFoundation,
): PatientClinicalMemory | null {
  return foundation?.memory ?? foundation?.intelligence.memory ?? null;
}

export function selectFoundationIntelligence(
  foundation: MaybeFoundation,
): ClinicalFoundationIntelligence | null {
  return foundation?.intelligence ?? null;
}

export function selectFoundationOrders(
  foundation: MaybeFoundation,
): ClinicalFoundationOrders | null {
  return foundation?.orders ?? null;
}

export function selectFoundationProvenance(
  foundation: MaybeFoundation,
): ClinicalFoundationProvenance[] {
  return foundation?.provenance ?? [];
}

export function selectFoundationDrafts(
  foundation: MaybeFoundation,
): ClinicalFoundationDrafts | null {
  return foundation?.drafts ?? null;
}

export function selectFoundationBundleHealth(
  foundation: MaybeFoundation,
): ClinicalFoundationBundleHealth | null {
  return foundation?.bundleHealth ?? null;
}

export function selectFoundationBundleHealthErrors(
  foundation: MaybeFoundation,
): ClinicalFoundationBundleHealthErrors | null {
  return foundation?.bundleHealthErrors ?? null;
}

export function selectFoundationIsDegraded(
  foundation: MaybeFoundation,
): boolean {
  const health = selectFoundationBundleHealth(foundation);
  if (!health) return true;
  return Object.values(health).some((loaded) => !loaded);
}
