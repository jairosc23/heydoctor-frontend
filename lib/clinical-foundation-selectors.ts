import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
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
} from "@/lib/types/clinical-foundation";

/** Bundle clínico opcional aceptado por todos los selectores. */
export type MaybeClinicalFoundationBundle =
  | ClinicalFoundationBundle
  | null
  | undefined;

/**
 * Devuelve el paciente del bundle o `null` si el bundle no está cargado.
 * No transforma ni enriquece datos; solo accede a `foundation.patient`.
 */
export function selectFoundationPatient(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationPatient | null {
  return foundation?.patient ?? null;
}

/**
 * Devuelve la consulta asociada al bundle o `null` si no hay bundle.
 * Slice directo de `foundation.consultation` sin reglas de negocio adicionales.
 */
export function selectFoundationConsultation(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationConsultation | null {
  return foundation?.consultation ?? null;
}

/**
 * Devuelve el encounter clínico (SOAP, vitales, examen) del bundle.
 * Retorna `null` cuando el bundle no está disponible.
 */
export function selectFoundationEncounter(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationEncounter | null {
  return foundation?.encounter ?? null;
}

/**
 * Resuelve la memoria clínica longitudinal del paciente.
 * Prioriza `foundation.memory` y cae a `foundation.intelligence.memory`
 * cuando el slice raíz no está presente.
 */
export function selectFoundationMemory(
  foundation: MaybeClinicalFoundationBundle,
): PatientClinicalMemory | null {
  return (
    foundation?.memory ?? foundation?.intelligence?.memory ?? null
  );
}

/**
 * Devuelve el sub-slice de inteligencia clínica del bundle (`intelligence.clinical`).
 * El tipo es `unknown` en SSOT hasta que exista un contrato tipado dedicado.
 */
export function selectFoundationClinicalIntelligence(
  foundation: MaybeClinicalFoundationBundle,
): unknown | null {
  return foundation?.intelligence?.clinical ?? null;
}

/**
 * Devuelve el contenedor completo de inteligencia (`memory` + `clinical`)
 * o `null` si el bundle o el slice no existen.
 */
export function selectFoundationIntelligence(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationIntelligence | null {
  return foundation?.intelligence ?? null;
}

/**
 * Devuelve órdenes clínicas agregadas (prescripciones, labs, referencias).
 * Retorna `null` si el bundle no está cargado.
 */
export function selectFoundationOrders(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationOrders | null {
  return foundation?.orders ?? null;
}

/**
 * Devuelve la trazabilidad de procedencia del bundle.
 * Sin bundle devuelve arreglo vacío (nunca `null`).
 */
export function selectFoundationProvenance(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationProvenance[] {
  return foundation?.provenance ?? [];
}

/**
 * Devuelve borradores generados por Foundation (certificado, referral, etc.)
 * o `null` si el bundle no está disponible.
 */
export function selectFoundationDrafts(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationDrafts | null {
  return foundation?.drafts ?? null;
}

/**
 * Indica qué sub-recursos del bundle se cargaron correctamente en backend.
 * Útil para UI de estado parcial sin inspeccionar errores individuales.
 */
export function selectFoundationBundleHealth(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationBundleHealth | null {
  return foundation?.bundleHealth ?? null;
}

/**
 * Devuelve errores de carga por sub-recurso cuando el bundle es parcial.
 * `null` si no hay bundle o si backend no reportó errores granulares.
 */
export function selectFoundationBundleHealthErrors(
  foundation: MaybeClinicalFoundationBundle,
): ClinicalFoundationBundleHealthErrors | null {
  return foundation?.bundleHealthErrors ?? null;
}
