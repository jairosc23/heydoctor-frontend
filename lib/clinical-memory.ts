import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";

export type ClinicalMemoryConfidence = "alta" | "media" | "baja";

export type ClinicalMemoryCategories = {
  predominantDiagnosis: string;
  carePattern: string;
  treatment: string;
  recentActivity: string;
  risk: string;
};

export type ClinicalMemoryView = {
  confidence: ClinicalMemoryConfidence;
  categories: ClinicalMemoryCategories;
  highlights: string[];
};

export type BuildClinicalMemoryInput = {
  memory: PatientClinicalMemory;
  encounterDiagnosis?: string | null;
  snapshotConditionLabels?: string[];
};

const METABOLIC_PREFIXES = ["E10", "E11", "E66", "E78"];

function matchesMetabolic(code: string | null | undefined): boolean {
  const c = code?.trim().toUpperCase() ?? "";
  return METABOLIC_PREFIXES.some((p) => c.startsWith(p));
}

function inferPredominantDiagnosis(input: BuildClinicalMemoryInput): string {
  const { memory, encounterDiagnosis, snapshotConditionLabels } = input;
  const top =
    memory.activeConditions[0] ??
    memory.recentDiagnoses[0] ??
    null;

  if (top?.label) {
    const suffix = matchesMetabolic(top.code) ? " predominante" : " predominante";
    return `${top.label}${suffix}`;
  }

  if (snapshotConditionLabels?.[0]) {
    return `${snapshotConditionLabels[0]} predominante`;
  }

  if (encounterDiagnosis?.trim()) {
    return `${encounterDiagnosis.trim()} en consulta actual`;
  }

  return "Sin diagnóstico predominante documentado";
}

function inferCarePattern(memory: PatientClinicalMemory): string {
  const consultCount = memory.recentConsultations.length;
  if (consultCount >= 3) {
    return "Seguimiento longitudinal activo";
  }
  if (consultCount >= 1) {
    return "Seguimiento ambulatorio registrado";
  }
  if (memory.activeConditions.length >= 2) {
    return "Manejo de enfermedad crónica";
  }
  return "Historia clínica en consolidación";
}

function inferTreatment(memory: PatientClinicalMemory): string {
  const meds = memory.currentMedications;
  if (meds.length === 0) {
    return "Sin tratamiento activo documentado";
  }

  const top = meds[0]!;
  const name = top.name.trim();
  if (/metformina/i.test(name)) {
    return "Uso recurrente de metformina";
  }
  if (meds.length >= 2) {
    return "Tratamiento farmacológico recurrente";
  }
  return `Uso recurrente de ${name.toLowerCase()}`;
}

function inferRecentActivity(memory: PatientClinicalMemory): string {
  const count = memory.recentConsultations.length;
  if (count === 0) {
    return "Sin consultas recientes en memoria clínica";
  }
  if (count === 1) {
    return "1 consulta registrada en periodo reciente";
  }
  return `${count} consultas registradas en periodo reciente`;
}

function inferRisk(memory: PatientClinicalMemory): string {
  const critical = memory.alerts.filter((a) => a.severity === "critical");
  if (critical.length > 0) {
    return critical[0]!.message;
  }
  const warnings = memory.alerts.filter((a) => a.severity === "warning");
  if (warnings.length > 0) {
    return `Alerta clínica: ${warnings[0]!.message}`;
  }
  if (memory.pendingLabs.length > 0) {
    return "Laboratorios pendientes sin resultado";
  }
  return "Riesgo crítico no identificado";
}

function inferConfidence(memory: PatientClinicalMemory): ClinicalMemoryConfidence {
  let signals = 0;
  if (memory.activeConditions.length > 0 || memory.recentDiagnoses.length > 0) {
    signals += 1;
  }
  if (memory.recentConsultations.length > 0) {
    signals += 1;
  }
  if (memory.currentMedications.length > 0 || memory.pendingLabs.length > 0) {
    signals += 1;
  }
  if (signals >= 3) return "alta";
  if (signals >= 2) return "media";
  return "baja";
}

export function buildClinicalMemoryView(
  input: BuildClinicalMemoryInput,
): ClinicalMemoryView {
  const categories: ClinicalMemoryCategories = {
    predominantDiagnosis: inferPredominantDiagnosis(input),
    carePattern: inferCarePattern(input.memory),
    treatment: inferTreatment(input.memory),
    recentActivity: inferRecentActivity(input.memory),
    risk: inferRisk(input.memory),
  };

  const highlights = [
    categories.predominantDiagnosis,
    categories.carePattern,
    categories.recentActivity,
    categories.treatment,
    categories.risk,
  ];

  return {
    confidence: inferConfidence(input.memory),
    categories,
    highlights,
  };
}

export function clinicalMemoryConfidenceLabel(
  confidence: ClinicalMemoryConfidence,
): string {
  switch (confidence) {
    case "alta":
      return "Alta";
    case "media":
      return "Media";
    case "baja":
      return "Baja";
  }
}
