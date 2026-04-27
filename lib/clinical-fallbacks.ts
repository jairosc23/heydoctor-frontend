/**
 * Fallbacks clínicos para modo demo / cuando el backend no está disponible.
 * Permite que el médico vea la UX del panel funcional aunque los catálogos
 * (medicamentos sugeridos, exámenes, diagnósticos) devuelvan vacío. Siempre
 * que se muestren al usuario, incluir un badge "demo" para no inducir a
 * confusión clínica.
 */

export const FALLBACK_MEDICATIONS: string[] = [
  "Paracetamol 500 mg",
  "Ibuprofeno 400 mg",
  "Amoxicilina 500 mg",
  "Loratadina 10 mg",
  "Omeprazol 20 mg",
  "Metformina 850 mg",
];

export const FALLBACK_LAB_TESTS: string[] = [
  "Hemograma completo",
  "Glucosa en ayunas",
  "Perfil lipídico",
  "TSH",
  "Examen general de orina",
  "Creatinina",
];

export interface FallbackDiagnosis {
  code: string;
  description: string;
}

export const FALLBACK_DIAGNOSES: FallbackDiagnosis[] = [
  { code: "J00", description: "Rinofaringitis aguda (resfriado común)" },
  { code: "J06.9", description: "Infección aguda vías respiratorias superiores" },
  { code: "K30", description: "Dispepsia funcional" },
  { code: "M54.5", description: "Lumbago no especificado" },
  { code: "R51", description: "Cefalea" },
  { code: "I10", description: "Hipertensión esencial (primaria)" },
  { code: "E11.9", description: "Diabetes mellitus tipo 2 sin complicaciones" },
  { code: "J45.9", description: "Asma no especificada" },
];

/**
 * Filtra los diagnósticos mock por una query de texto (substring sobre código
 * o descripción, case-insensitive).
 */
export function filterFallbackDiagnoses(
  query: string,
  limit = 8,
): FallbackDiagnosis[] {
  const q = query.trim().toLowerCase();
  if (!q) return FALLBACK_DIAGNOSES.slice(0, limit);
  return FALLBACK_DIAGNOSES
    .filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    )
    .slice(0, limit);
}
