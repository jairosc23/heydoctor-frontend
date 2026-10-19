/**
 * EPIC-3 UC-02A — Pre-Visit Quality Signals (deterministic).
 *
 * Observes Clinical Foundation / Consultation fields already loaded.
 * Statuses: present | missing | unavailable.
 * No LLM, no inference, no clinical recommendations, no EMR writes.
 */

import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export type QualitySignalStatus = "present" | "missing" | "unavailable";

export type QualitySignalId =
  | "motivo_consulta"
  | "antecedentes"
  | "alergias"
  | "medicamentos_habituales"
  | "signos_vitales"
  | "demografia";

export type PreVisitQualitySignal = {
  id: QualitySignalId;
  label: string;
  status: QualitySignalStatus;
  /** Observable source only — never a clinical recommendation. */
  observation: string;
};

export type PreVisitQualitySignalsView = {
  title: "Pre-Visit Quality Signals";
  signals: PreVisitQualitySignal[];
  evaluatedAt: string;
  readOnly: true;
  generative: false;
};

function hasNonEmptyText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function hasVitalSignsPayload(
  vitalSigns: Record<string, unknown> | null | undefined,
): boolean {
  if (!vitalSigns || typeof vitalSigns !== "object") return false;
  return Object.keys(vitalSigns).some((key) => {
    const value = vitalSigns[key];
    if (value == null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value === "boolean") return true;
    if (typeof value === "object") return Object.keys(value as object).length > 0;
    return false;
  });
}

function statusLabel(status: QualitySignalStatus): string {
  switch (status) {
    case "present":
      return "Presente";
    case "missing":
      return "Faltante";
    default:
      return "No disponible";
  }
}

export function labelQualitySignalStatus(status: QualitySignalStatus): string {
  return statusLabel(status);
}

/**
 * Pure evaluator. When `foundation` is null, every signal is unavailable
 * except those that can be answered from empty observation (still unavailable).
 */
export function evaluatePreVisitQualitySignals(
  foundation: ClinicalFoundationBundle | null,
  options?: { evaluatedAt?: string },
): PreVisitQualitySignalsView {
  const evaluatedAt = options?.evaluatedAt ?? new Date().toISOString();

  if (!foundation) {
    const unavailable = (
      id: QualitySignalId,
      label: string,
    ): PreVisitQualitySignal => ({
      id,
      label,
      status: "unavailable",
      observation: "Clinical Foundation no cargado",
    });
    return {
      title: "Pre-Visit Quality Signals",
      signals: [
        unavailable("motivo_consulta", "Motivo de consulta"),
        unavailable("antecedentes", "Antecedentes"),
        unavailable("alergias", "Alergias"),
        unavailable("medicamentos_habituales", "Medicamentos habituales"),
        unavailable("signos_vitales", "Signos vitales"),
        unavailable("demografia", "Demografía relevante"),
      ],
      evaluatedAt,
      readOnly: true,
      generative: false,
    };
  }

  const reason = foundation.consultation.reason;
  const chief = foundation.encounter.chiefComplaint;
  const motivoPresent = hasNonEmptyText(reason) || hasNonEmptyText(chief);

  const memoryLoaded = foundation.bundleHealth.memoryLoaded;
  const memory = foundation.memory;
  const activeConditions = memory?.activeConditions ?? [];
  const recentDiagnoses = memory?.recentDiagnoses ?? [];
  const antecedentsCount = activeConditions.length + recentDiagnoses.length;

  let antecedentsStatus: QualitySignalStatus;
  let antecedentsObservation: string;
  if (!memoryLoaded || memory == null) {
    antecedentsStatus = "unavailable";
    antecedentsObservation = "Memoria clínica no cargada en Foundation";
  } else if (antecedentsCount === 0) {
    antecedentsStatus = "missing";
    antecedentsObservation =
      "activeConditions y recentDiagnoses vacíos en memoria";
  } else {
    antecedentsStatus = "present";
    antecedentsObservation = `${antecedentsCount} registro(s) en memoria clínica`;
  }

  // Allergies are not exposed on the Clinical Foundation bundle today.
  const allergiesSignal: PreVisitQualitySignal = {
    id: "alergias",
    label: "Alergias",
    status: "unavailable",
    observation:
      "Campo alergias no expuesto en Clinical Foundation (no observable)",
  };

  const prescriptionsLoaded = foundation.bundleHealth.prescriptionsLoaded;
  const memoryMeds = memory?.currentMedications ?? [];
  const orderMeds = (foundation.orders.prescriptions ?? []).flatMap(
    (rx) => rx.medications ?? [],
  );
  const medCount = memoryMeds.length + orderMeds.length;

  let medsStatus: QualitySignalStatus;
  let medsObservation: string;
  if (!memoryLoaded && !prescriptionsLoaded) {
    medsStatus = "unavailable";
    medsObservation = "Memoria y órdenes de Rx no cargadas en Foundation";
  } else if (medCount === 0) {
    medsStatus = "missing";
    medsObservation =
      "Sin medicamentos en memoria ni en órdenes de la consulta";
  } else {
    medsStatus = "present";
    medsObservation = `${medCount} medicamento(s) observable(s)`;
  }

  const vitalsPresent = hasVitalSignsPayload(foundation.encounter.vitalSigns);
  const vitalsSignal: PreVisitQualitySignal = {
    id: "signos_vitales",
    label: "Signos vitales",
    status: vitalsPresent ? "present" : "missing",
    observation: vitalsPresent
      ? "encounter.vitalSigns con al menos un valor"
      : "encounter.vitalSigns ausente o vacío",
  };

  const patient = foundation.patient;
  const hasName = hasNonEmptyText(patient.displayName);
  const hasBirth = hasNonEmptyText(patient.birthDate);
  const hasSex = hasNonEmptyText(patient.sex);
  const hasDoc =
    hasNonEmptyText(patient.documentType) ||
    hasNonEmptyText(patient.documentNumber);

  let demoStatus: QualitySignalStatus;
  let demoObservation: string;
  if (!hasName && !patient.id) {
    demoStatus = "unavailable";
    demoObservation = "Paciente no presente en Foundation";
  } else if (hasBirth && hasSex) {
    demoStatus = "present";
    demoObservation = hasDoc
      ? "Nombre, sexo, fecha de nacimiento y documento presentes"
      : "Nombre, sexo y fecha de nacimiento presentes";
  } else {
    demoStatus = "missing";
    const missing: string[] = [];
    if (!hasBirth) missing.push("birthDate");
    if (!hasSex) missing.push("sex");
    if (!hasName) missing.push("displayName");
    demoObservation = `Faltan campos demográficos: ${missing.join(", ")}`;
  }

  return {
    title: "Pre-Visit Quality Signals",
    signals: [
      {
        id: "motivo_consulta",
        label: "Motivo de consulta",
        status: motivoPresent ? "present" : "missing",
        observation: motivoPresent
          ? "reason o chiefComplaint con texto"
          : "reason y chiefComplaint vacíos",
      },
      {
        id: "antecedentes",
        label: "Antecedentes",
        status: antecedentsStatus,
        observation: antecedentsObservation,
      },
      allergiesSignal,
      {
        id: "medicamentos_habituales",
        label: "Medicamentos habituales",
        status: medsStatus,
        observation: medsObservation,
      },
      vitalsSignal,
      {
        id: "demografia",
        label: "Demografía relevante",
        status: demoStatus,
        observation: demoObservation,
      },
    ],
    evaluatedAt,
    readOnly: true,
    generative: false,
  };
}
