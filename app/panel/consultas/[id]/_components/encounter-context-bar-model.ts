import {
  collectProfileAlerts,
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import {
  formatPatientDisplayName,
  type PatientProfile,
  type PatientRow,
} from "@/lib/services/patients";
import type {
  ClinicalMemoryAlert,
  PatientClinicalMemory,
} from "@/lib/types/clinical-memory";

export type EncounterContextSeverity = "critical" | "warning" | "info";
export type EncounterContextStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "SIGNED"
  | "LOCKED"
  | "CANCELLED";

export interface EncounterContextChip {
  id: string;
  label: string;
  severity?: EncounterContextSeverity;
  sourceCount?: number;
  lastUpdatedAt?: string;
}

export interface EncounterContextChipGroup {
  visible: EncounterContextChip[];
  hiddenCount: number;
  totalCount: number;
}

export interface EncounterContextBarModel {
  identity: {
    name: string;
    age: string;
    compactAge: string;
    sex: string;
    documentLabel: string;
    status: EncounterContextStatus;
    statusLabel: string;
  };
  risk: {
    allergies: EncounterContextChip[];
    criticalAlerts: EncounterContextChip[];
    warningAlerts: EncounterContextChip[];
    infoAlerts: EncounterContextChip[];
    diagnosis: string;
  };
  continuity: {
    activeProblems: EncounterContextChipGroup;
    activeMedications: EncounterContextChipGroup;
  };
}

export interface BuildEncounterContextBarModelInput {
  patient: PatientRow | null;
  profile: PatientProfile | null;
  fallbackName: string;
  status: string;
  diagnosis?: string | null;
  memory?: PatientClinicalMemory | null;
  maxVisibleProblems?: number;
  maxVisibleMedications?: number;
}

const DEFAULT_VISIBLE_PROBLEMS = 3;
const DEFAULT_VISIBLE_MEDICATIONS = 3;

const STATUS_LABELS: Record<EncounterContextStatus, string> = {
  DRAFT: "Borrador",
  IN_PROGRESS: "En consulta",
  SIGNED: "Firmado",
  LOCKED: "Bloqueado",
  CANCELLED: "Cancelado",
};

export function normalizeEncounterContextStatus(
  status: string,
): EncounterContextStatus {
  const normalized = status.trim().toLowerCase();
  if (normalized === "in_progress") return "IN_PROGRESS";
  if (normalized === "signed" || normalized === "completed") return "SIGNED";
  if (normalized === "locked") return "LOCKED";
  if (normalized === "cancelled" || normalized === "canceled") return "CANCELLED";
  return "DRAFT";
}

export function compactAge(ageLabel: string): string {
  const match = ageLabel.match(/(\d+)/);
  return match ? `${match[1]}a` : ageLabel;
}

function toChip(
  label: string,
  index: number,
  prefix: string,
  severity?: EncounterContextSeverity,
): EncounterContextChip {
  return {
    id: `${prefix}-${index}-${label}`,
    label,
    severity,
    sourceCount: 1,
  };
}

function normalizeAlertSeverity(
  severity: ClinicalMemoryAlert["severity"],
): EncounterContextSeverity {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "warning";
  return "info";
}

function buildChipGroup(
  chips: EncounterContextChip[],
  limit: number,
): EncounterContextChipGroup {
  const visible = chips.slice(0, limit);
  return {
    visible,
    hiddenCount: Math.max(0, chips.length - visible.length),
    totalCount: chips.length,
  };
}

function dedupeByLabel(chips: EncounterContextChip[]): EncounterContextChip[] {
  const seen = new Set<string>();
  const result: EncounterContextChip[] = [];
  for (const chip of chips) {
    const key = chip.label.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(chip);
  }
  return result;
}

export function buildEncounterContextBarModel({
  patient,
  profile,
  fallbackName,
  status,
  diagnosis,
  memory,
  maxVisibleProblems = DEFAULT_VISIBLE_PROBLEMS,
  maxVisibleMedications = DEFAULT_VISIBLE_MEDICATIONS,
}: BuildEncounterContextBarModelInput): EncounterContextBarModel {
  const age = patient ? resolvePatientAge(patient) : "—";
  const normalizedStatus = normalizeEncounterContextStatus(status);
  const allergyChips = jsonLinesToList(profile?.allergies).map((line, index) =>
    toChip(line, index, "allergy", "critical"),
  );
  const profileAlertChips = collectProfileAlerts(profile).map((line, index) =>
    toChip(line, index, "profile-alert", "warning"),
  );
  const memoryAlertChips = (memory?.alerts ?? []).map((alert, index) =>
    toChip(
      alert.message,
      index,
      `memory-alert-${alert.code}`,
      normalizeAlertSeverity(alert.severity),
    ),
  );
  const allAlerts = dedupeByLabel([...memoryAlertChips, ...profileAlertChips]);

  return {
    identity: {
      name: patient ? formatPatientDisplayName(patient) : fallbackName,
      age,
      compactAge: compactAge(age),
      sex: patient ? formatPatientSex(patient.sex) : "—",
      documentLabel: patient ? formatPatientDocument(patient) : "—",
      status: normalizedStatus,
      statusLabel: STATUS_LABELS[normalizedStatus],
    },
    risk: {
      allergies: allergyChips,
      criticalAlerts: allAlerts.filter((alert) => alert.severity === "critical"),
      warningAlerts: allAlerts.filter((alert) => alert.severity === "warning"),
      infoAlerts: allAlerts.filter((alert) => alert.severity === "info"),
      diagnosis: diagnosis?.trim() || "Sin diagnóstico",
    },
    continuity: {
      activeProblems: buildChipGroup(
        (memory?.activeConditions ?? []).map((condition, index) => ({
          id: `problem-${condition.code ?? index}-${condition.label}`,
          label: condition.label,
          severity: "info",
          sourceCount: 1,
          lastUpdatedAt: condition.lastSeenAt,
        })),
        maxVisibleProblems,
      ),
      activeMedications: buildChipGroup(
        (memory?.currentMedications ?? []).map((medication, index) => ({
          id: `medication-${medication.prescriptionId ?? index}-${medication.name}`,
          label: medication.name,
          severity: "info",
          sourceCount: 1,
          lastUpdatedAt: medication.since,
        })),
        maxVisibleMedications,
      ),
    },
  };
}
