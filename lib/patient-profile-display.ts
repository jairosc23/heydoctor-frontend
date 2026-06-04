import {
  formatPatientAge,
  type PatientRow,
  type PatientSex,
} from "@/lib/services/patients";

const SEX_LABELS: Record<PatientSex, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
  unknown: "No especificado",
};

/** Convierte entradas JSONB del perfil (alergias, alertas, etc.) a texto multilínea. */
export function jsonLinesToText(items?: Record<string, unknown>[]): string {
  if (!items?.length) return "";
  return items
    .map((item) => {
      const label =
        typeof item.label === "string"
          ? item.label
          : typeof item.name === "string"
            ? item.name
            : typeof item.description === "string"
              ? item.description
              : JSON.stringify(item);
      const detail =
        typeof item.detail === "string"
          ? item.detail
          : typeof item.notes === "string"
            ? item.notes
            : "";
      return detail ? `${label}: ${detail}` : label;
    })
    .join("\n");
}

/** Líneas no vacías para listas compactas (p. ej. rail de consulta). */
export function jsonLinesToList(items?: Record<string, unknown>[]): string[] {
  const text = jsonLinesToText(items);
  if (!text) return [];
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function formatPatientSex(
  sex: PatientSex | string | null | undefined,
): string {
  if (!sex || (typeof sex === "string" && sex.trim() === "")) return "—";
  const key = sex as PatientSex;
  return SEX_LABELS[key] ?? sex;
}

export function formatPatientDocument(
  patient: Pick<
    PatientRow,
    "documentType" | "documentNumber" | "identification"
  >,
): string {
  if (patient.documentType && patient.documentNumber) {
    return `${patient.documentType} ${patient.documentNumber}`;
  }
  if (patient.documentNumber?.trim()) return patient.documentNumber.trim();
  if (patient.identification?.trim()) return patient.identification.trim();
  return "—";
}

export function computeAgeFromBirthDate(
  birthDate: string,
  refDate: Date = new Date(),
): number | null {
  const parsed = new Date(birthDate);
  const t = parsed.getTime();
  if (Number.isNaN(t)) return null;

  let age = refDate.getFullYear() - parsed.getFullYear();
  const monthDelta = refDate.getMonth() - parsed.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && refDate.getDate() < parsed.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

/** Edad para UI: usa `age` del backend o calcula desde `birthDate`. */
export function resolvePatientAge(
  patient: Pick<PatientRow, "age" | "birthDate">,
  refDate?: Date,
): string {
  const { age, birthDate } = patient;
  if (age !== null && age !== undefined && age !== "") {
    return formatPatientAge(age);
  }
  if (birthDate?.trim()) {
    const computed = computeAgeFromBirthDate(birthDate.trim(), refDate);
    if (computed !== null) return formatPatientAge(computed);
  }
  return formatPatientAge(null);
}
