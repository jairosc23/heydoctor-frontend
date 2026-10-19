/**
 * Phase 4.7 — Clinical Intelligence Refinement™
 * Auditoría determinística del Copilot Phase 4.6 sin modificar el motor.
 * Evalúa insights, risk signals, gaps y quality score en escenarios reales.
 */

import { buildClinicalMemoryView } from "./clinical-memory";
import {
  buildClinicalCopilotIntelligence,
  type BuildClinicalCopilotInput,
  type ClinicalCopilotIntelligenceBundle,
  type ClinicalRiskSignal,
  type CopilotInsight,
  type DocumentationGap,
  type DocumentationQuality,
} from "./clinical-copilot-intelligence";
import type { DoctorDnaIntelligenceView } from "./doctor-dna-intelligence";
import type { PatientClinicalMemory } from "./types/clinical-memory";

export type CopilotAuditCategory =
  | "hta"
  | "dm2"
  | "asma"
  | "epoc"
  | "hipotiroidismo"
  | "obesidad"
  | "cefalea"
  | "lumbalgia"
  | "erge"
  | "infeccion_respiratoria"
  | "parkinson"
  | "fibrilacion_auricular"
  | "artrosis"
  | "ansiedad"
  | "depresion"
  | "nino_sano"
  | "control_preventivo"
  | "polimedicado"
  | "sin_controles"
  | "multiples_diagnosticos";

export type ClinicalUtilityClass =
  | "útil"
  | "neutro"
  | "ruido"
  | "potencialmente_incorrecto";

export type CopilotAuditScenario = {
  id: string;
  category: CopilotAuditCategory;
  code: string;
  label: string;
  input: BuildClinicalCopilotInput;
  /** Expectativas clínicas para detectar falsos positivos/negativos */
  expectations: {
    /** IDs de insight que deberían existir */
    expectInsightIds?: string[];
    /** IDs de insight que NO deberían existir */
    forbidInsightIds?: string[];
    /** Debe haber al menos un insight útil */
    minUsefulInsights?: number;
    /** Debe mostrar risk baseline (ruido conocido) */
    expectBaselineRisk?: boolean;
    /** Debe detectar PA elevada como riesgo */
    expectElevatedBpRisk?: boolean;
    /** IDs de gaps esperados */
    expectGapIds?: string[];
    /** Quality score dentro de rango esperado */
    qualityRange?: [number, number];
    /** Quality label esperado */
    qualityLabel?: DocumentationQuality["label"];
    /** Falso negativo: debería haber insight específico pero motor no lo genera */
    missedSpecializedInsight?: string;
  };
};

export type ClassifiedItem = {
  id: string;
  kind: "insight" | "risk" | "gap";
  title: string;
  body: string;
  classification: ClinicalUtilityClass;
  rationale: string;
};

export type CopilotScenarioAuditResult = {
  id: string;
  category: CopilotAuditCategory;
  code: string;
  label: string;
  input: BuildClinicalCopilotInput;
  bundle: ClinicalCopilotIntelligenceBundle;
  classified: ClassifiedItem[];
  summary: {
    útil: number;
    neutro: number;
    ruido: number;
    potencialmente_incorrecto: number;
  };
  falsePositives: string[];
  falseNegatives: string[];
  qualityAssessment: {
    score: number;
    label: DocumentationQuality["label"];
    calibrationNote: string;
  };
};

export type CopilotClinicalAuditReport = {
  methodology: string;
  scenarioCount: number;
  cases: CopilotScenarioAuditResult[];
  aggregate: {
    totalInsights: number;
    totalRiskSignals: number;
    totalGaps: number;
    utilityBreakdown: Record<ClinicalUtilityClass, number>;
    avgQualityScore: number;
    specializedCoverage: number;
  };
  findings: AuditFinding[];
  falsePositives: AuditFinding[];
  falseNegatives: AuditFinding[];
  noiseProposals: NoiseProposal[];
  rankingDesign: ClinicalRankingDesign;
  qualityScoreAudit: QualityScoreAudit;
  recommendations: string[];
  risks: string[];
};

export type AuditFinding = {
  scenarioId: string;
  category: string;
  item: string;
  classification: ClinicalUtilityClass;
  detail: string;
};

export type NoiseProposal = {
  target: "insight" | "risk" | "gap" | "quality";
  idOrPattern: string;
  issue: string;
  proposal: "eliminar" | "refinar" | "condicionar" | "fusionar";
  rationale: string;
};

export type ClinicalPriority = "CRÍTICO" | "ALTO" | "MODERADO" | "INFORMATIVO";

export type ClinicalRankingDesign = {
  riskSignals: Array<{ idOrPattern: string; priority: ClinicalPriority; rationale: string }>;
  documentationGaps: Array<{ idOrPattern: string; priority: ClinicalPriority; rationale: string }>;
  insights: Array<{ idOrPattern: string; priority: ClinicalPriority; rationale: string }>;
  uiPrinciple: string;
};

export type QualityScoreAudit = {
  overestimationCases: string[];
  underestimationCases: string[];
  quantityOverQuality: string[];
  briefConsultPenalty: string[];
  calibrationProposal: string[];
};

function memoryBase(patientId: string): PatientClinicalMemory {
  return {
    patientId,
    activeConditions: [],
    recentDiagnoses: [],
    currentMedications: [],
    pendingLabs: [],
    alerts: [],
    recentConsultations: [],
  };
}

const OLD_CONSULT = "2024-08-15T10:00:00.000Z";
const RECENT_CONSULT = "2026-04-01T10:00:00.000Z";

function minimalDoctorDna(): DoctorDnaIntelligenceView {
  return {
    signature: {
      predominance: "Crónico",
      style: "Seguimiento estructurado",
      complexity: "Moderada",
      profile: "Medicina general",
    },
    primaryInsight: "Predominio de patología crónica cardiovascular y metabólica",
    physicianTraits: ["Documentación estructurada"],
    rankedPathologies: [],
    frequentInterventions: [],
    observations: [
      "Patrón de seguimiento ambulatorio en HTA y diabetes documentado en práctica reciente.",
    ],
    persistentChipLabel: "Crónico",
    activity: [],
    dominantDiagnoses: [],
    topMedications: [],
    clinicalProfile: {
      predominance: "Crónico",
      mainArea: "Cardiometabólico",
      complexity: "Moderada",
    },
    trends: [],
  };
}

function withMemory(
  input: BuildClinicalCopilotInput,
): BuildClinicalCopilotInput {
  const memory = input.clinicalMemoryRaw;
  if (!memory?.patientId) return input;
  return {
    ...input,
    clinicalMemory: buildClinicalMemoryView({
      memory,
      encounterDiagnosis:
        input.diagnosisDescription?.trim() || input.diagnosis?.trim() || null,
    }),
  };
}

export const COPILOT_AUDIT_SCENARIOS: CopilotAuditScenario[] = [
  {
    id: "audit-hta-control",
    category: "hta",
    code: "I10",
    label: "HTA — PA elevada y control",
    input: withMemory({
      consultationId: "c-hta",
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión esencial",
      chiefComplaint: "Control de presión arterial",
      notes:
        "Signos vitales: PA 158/96 mmHg, FC 82 lpm. Cefalea ocasional. Automonitorización domiciliaria elevada.",
      treatment: "Continuar losartán 50 mg/d. Control en 4 semanas.",
      clinicalMemoryRaw: {
        ...memoryBase("p-hta"),
        activeConditions: [
          { code: "I10", label: "Hipertensión esencial", source: "cie10" },
        ],
        currentMedications: [
          {
            name: "Losartán 50 mg",
            prescriptionId: "rx1",
            since: "2024-01-01",
          },
        ],
        recentConsultations: [
          {
            id: "prev-hta",
            createdAt: OLD_CONSULT,
            status: "completed",
            diagnosisCode: "I10",
            diagnosisLabel: "Hipertensión esencial",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["hta-vitals", "hta-gap-control"],
      expectElevatedBpRisk: true,
      expectGapIds: ["gap-pe-cv"],
      qualityRange: [75, 84],
      qualityLabel: "Adecuado",
    },
  },
  {
    id: "audit-dm2-seguimiento",
    category: "dm2",
    code: "E11.9",
    label: "DM2 — HbA1c y medicación",
    input: withMemory({
      consultationId: "c-dm2",
      diagnosisCode: "E11.9",
      diagnosisDescription: "Diabetes mellitus tipo 2",
      chiefComplaint: "Control glucémico",
      notes:
        "Paciente refiere adherencia parcial. Glucemia ayunas 142 mg/dL documentada en memoria.",
      treatment: "Ajuste metformina. Control en 3 meses con HbA1c.",
      clinicalMemoryRaw: {
        ...memoryBase("p-dm2"),
        currentMedications: [
          {
            name: "Metformina 850 mg",
            prescriptionId: "rx2",
            since: "2023-06-01",
          },
        ],
        pendingLabs: [
          {
            exam: "HbA1c 8.4%",
            labOrderId: "lab1",
            orderedAt: "2026-03-01",
            status: "pending",
          },
        ],
        alerts: [
          {
            code: "dm-hba1c",
            severity: "warning",
            message: "HbA1c persistentemente elevada en último control",
            source: "rule",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["dm2-lab"],
      expectGapIds: ["gap-weight"],
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-asma-estable",
    category: "asma",
    code: "J45.9",
    label: "Asma — control estable",
    input: withMemory({
      consultationId: "c-asma",
      diagnosisCode: "J45.9",
      diagnosisDescription: "Asma no especificada",
      chiefComplaint: "Control asmático",
      notes:
        "Sin disnea en reposo. Auscultación: MV conservado, sin sibilancias. SatO2 98%.",
      treatment: "Continuar inhaladores. Control en 6 meses.",
      clinicalMemoryRaw: {
        ...memoryBase("p-asma"),
        activeConditions: [{ code: "J45", label: "Asma", source: "cie10" }],
        currentMedications: [
          {
            name: "Salbutamol inhalador",
            prescriptionId: "rx3",
            since: "2024-01-01",
          },
          {
            name: "Budesonida/Formoterol",
            prescriptionId: "rx4",
            since: "2024-01-01",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["asma-no-exacerbation", "asma-treatment-persistence"],
      qualityRange: [70, 95],
    },
  },
  {
    id: "audit-epoc",
    category: "epoc",
    code: "J44.9",
    label: "EPOC — exacerbación leve",
    input: withMemory({
      consultationId: "c-epoc",
      diagnosisCode: "J44.9",
      diagnosisDescription: "EPOC no especificada",
      chiefComplaint: "Aumento de disnea",
      notes:
        "Disnea de medianos esfuerzos. SatO2 91% en reposo. Sibilancias espiratorias leves.",
      treatment: "Broncodilatador de rescate. Control en 2 semanas.",
      clinicalMemoryRaw: {
        ...memoryBase("p-epoc"),
        activeConditions: [{ code: "J44", label: "EPOC", source: "cie10" }],
        currentMedications: [
          {
            name: "Tiotropio inhalado",
            prescriptionId: "rx5",
            since: "2023-01-01",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["epoc-treatment-persistence"],
      qualityRange: [60, 90],
    },
  },
  {
    id: "audit-hipotiroidismo",
    category: "hipotiroidismo",
    code: "E03.9",
    label: "Hipotiroidismo — control TSH",
    input: withMemory({
      consultationId: "c-hypo",
      diagnosisCode: "E03.9",
      diagnosisDescription: "Hipotiroidismo no especificado",
      chiefComplaint: "Control tiroideo",
      notes: "Paciente refiere buena tolerancia a levotiroxina. Sin síntomas.",
      treatment: "Continuar levotiroxina 75 mcg. Control TSH en 6 meses.",
      clinicalMemoryRaw: {
        ...memoryBase("p-hypo"),
        currentMedications: [
          {
            name: "Levotiroxina 75 mcg",
            prescriptionId: "rx6",
            since: "2022-01-01",
          },
        ],
        pendingLabs: [
          {
            exam: "TSH pendiente",
            labOrderId: "lab2",
            orderedAt: "2026-02-01",
            status: "pending",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["hypo-lab", "hypo-treatment-persistence"],
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-obesidad",
    category: "obesidad",
    code: "E66.9",
    label: "Obesidad — manejo integral",
    input: withMemory({
      consultationId: "c-obes",
      diagnosisCode: "E66.9",
      diagnosisDescription: "Obesidad no especificada",
      chiefComplaint: "Control de peso",
      notes: "Signos vitales: peso 98 kg, talla 165 cm. IMC calculado en notas.",
      treatment: "Plan nutricional. Control mensual.",
      clinicalMemoryRaw: {
        ...memoryBase("p-obes"),
        activeConditions: [
          { code: "E66", label: "Obesidad", source: "cie10" },
        ],
        recentConsultations: [
          {
            id: "obes-1",
            createdAt: OLD_CONSULT,
            status: "completed",
            diagnosisCode: "E66.9",
            diagnosisLabel: "Obesidad",
          },
          {
            id: "obes-2",
            createdAt: RECENT_CONSULT,
            status: "completed",
            diagnosisCode: "E66.9",
            diagnosisLabel: "Obesidad",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["obesity-longitudinal"],
      qualityRange: [70, 95],
    },
  },
  {
    id: "audit-cefalea",
    category: "cefalea",
    code: "R51",
    label: "Cefalea tensional",
    input: withMemory({
      consultationId: "c-cef",
      diagnosisCode: "R51",
      diagnosisDescription: "Cefalea",
      chiefComplaint: "Cefalea holocraneana 3 días",
      notes:
        "Cefalea opresiva bilateral sin signos de alarma. Neurológico sin focalidad.",
      treatment: "Analgésico según necesidad. Reposo.",
      clinicalMemoryRaw: memoryBase("p-cef"),
    }),
    expectations: {
      expectBaselineRisk: true,
      qualityRange: [55, 85],
    },
  },
  {
    id: "audit-lumbalgia",
    category: "lumbalgia",
    code: "M54.5",
    label: "Lumbalgia mecánica",
    input: withMemory({
      consultationId: "c-lum",
      diagnosisCode: "M54.5",
      diagnosisDescription: "Lumbago no especificado",
      chiefComplaint: "Dolor lumbar bajo",
      notes:
        "Dolor lumbar mecánico sin irradiación. Lasègue negativo. Movilidad conservada.",
      treatment: "AINE por 5 días. Fisioterapia. Control si persiste.",
      clinicalMemoryRaw: memoryBase("p-lum"),
    }),
    expectations: {
      expectBaselineRisk: true,
      qualityRange: [60, 90],
    },
  },
  {
    id: "audit-erge",
    category: "erge",
    code: "K21.9",
    label: "ERGE — pirosis",
    input: withMemory({
      consultationId: "c-erge",
      diagnosisCode: "K21.9",
      diagnosisDescription: "Enfermedad por reflujo gastroesofágico",
      chiefComplaint: "Pirosis postprandial",
      notes: "Pirosis 2-3 veces por semana. Sin disfagia ni pérdida de peso.",
      treatment: "Omeprazol 20 mg. Medidas posturales.",
      clinicalMemoryRaw: {
        ...memoryBase("p-erge"),
        currentMedications: [
          {
            name: "Omeprazol 20 mg",
            prescriptionId: "rx7",
            since: "2025-01-01",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["erge-treatment-persistence"],
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-ir-aguda",
    category: "infeccion_respiratoria",
    code: "J06.9",
    label: "Infección respiratoria aguda",
    input: withMemory({
      consultationId: "c-ir",
      diagnosisCode: "J06.9",
      diagnosisDescription: "Infección respiratoria aguda",
      chiefComplaint: "Tos y fiebre 2 días",
      notes: "Fiebre 38.2°C. Faringe eritematosa. MV conservado.",
      treatment: "Sintomáticos. Hidratación. Control si empeora.",
      clinicalMemoryRaw: memoryBase("p-ir"),
    }),
    expectations: {
      expectBaselineRisk: true,
      qualityRange: [55, 85],
    },
  },
  {
    id: "audit-parkinson",
    category: "parkinson",
    code: "G20",
    label: "Parkinson — seguimiento",
    input: withMemory({
      consultationId: "c-park",
      diagnosisCode: "G20",
      diagnosisDescription: "Enfermedad de Parkinson",
      chiefComplaint: "Control neurológico",
      notes: "Temblor en reposo estable. Marcha lenta. Sin caídas recientes.",
      treatment: "Continuar levodopa. Control en 3 meses.",
      clinicalMemoryRaw: {
        ...memoryBase("p-park"),
        currentMedications: [
          {
            name: "Levodopa/Carbidopa",
            prescriptionId: "rx8",
            since: "2021-01-01",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["park-treatment-persistence"],
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-fa",
    category: "fibrilacion_auricular",
    code: "I48",
    label: "Fibrilación auricular — anticoagulación",
    input: withMemory({
      consultationId: "c-fa",
      diagnosisCode: "I48.91",
      diagnosisDescription: "Fibrilación auricular no especificada",
      chiefComplaint: "Control anticoagulación",
      notes: "FC irregular 88 lpm. Sin signos de IC descompensada.",
      treatment: "Continuar anticoagulación. Control en 1 mes.",
      clinicalMemoryRaw: {
        ...memoryBase("p-fa"),
        currentMedications: [
          {
            name: "Apixabán 5 mg",
            prescriptionId: "rx9",
            since: "2023-01-01",
          },
        ],
        alerts: [
          {
            code: "fa-anticoag",
            severity: "warning",
            message: "FA — verificar adherencia anticoagulante",
            source: "rule",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["fa-treatment-persistence"],
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-artrosis",
    category: "artrosis",
    code: "M19.90",
    label: "Artrosis — dolor articular",
    input: withMemory({
      consultationId: "c-art",
      diagnosisCode: "M19.90",
      diagnosisDescription: "Artrosis no especificada",
      chiefComplaint: "Dolor articular rodillas",
      notes: "Dolor mecánico bilateral. Sin signos inflamatorios.",
      treatment: "Paracetamol PRN. Ejercicio de bajo impacto.",
      clinicalMemoryRaw: {
        ...memoryBase("p-art"),
        recentConsultations: [
          {
            id: "art-1",
            createdAt: OLD_CONSULT,
            status: "completed",
            diagnosisCode: "M19.90",
            diagnosisLabel: "Artrosis",
          },
          {
            id: "art-2",
            createdAt: RECENT_CONSULT,
            status: "completed",
            diagnosisCode: "M19.90",
            diagnosisLabel: "Artrosis",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["art-longitudinal"],
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-ansiedad",
    category: "ansiedad",
    code: "F41.9",
    label: "Trastorno de ansiedad",
    input: withMemory({
      consultationId: "c-anx",
      diagnosisCode: "F41.9",
      diagnosisDescription: "Trastorno de ansiedad no especificado",
      chiefComplaint: "Ansiedad y palpitaciones",
      notes: "Ansiedad generalizada. Sin ideación suicida. Sueño fragmentado.",
      treatment: "Psicoeducación. Control en 4 semanas.",
      clinicalMemoryRaw: memoryBase("p-anx"),
    }),
    expectations: {
      expectBaselineRisk: true,
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-depresion",
    category: "depresion",
    code: "F32.9",
    label: "Depresión — seguimiento",
    input: withMemory({
      consultationId: "c-dep",
      diagnosisCode: "F32.9",
      diagnosisDescription: "Episodio depresivo no especificado",
      chiefComplaint: "Control estado de ánimo",
      notes: "Ánimo bajo persistente. Niega ideación suicida activa.",
      treatment: "Continuar ISRS. Control en 1 mes.",
      clinicalMemoryRaw: {
        ...memoryBase("p-dep"),
        currentMedications: [
          {
            name: "Sertralina 50 mg",
            prescriptionId: "rx10",
            since: "2025-01-01",
          },
        ],
      },
    }),
    expectations: {
      expectBaselineRisk: true,
      qualityRange: [55, 80],
    },
  },
  {
    id: "audit-nino-sano",
    category: "nino_sano",
    code: "Z00.129",
    label: "Niño sano — control pediátrico",
    input: withMemory({
      consultationId: "c-ped",
      diagnosisCode: "Z00.129",
      diagnosisDescription: "Examen de salud del niño",
      chiefComplaint: "Control de niño sano",
      notes: "Desarrollo psicomotor acorde a edad. Vacunas al día.",
      treatment: "Continuar esquema de vacunación. Control anual.",
      patientAge: 4,
      patientSex: "femenino",
      clinicalMemoryRaw: memoryBase("p-ped"),
    }),
    expectations: {
      expectBaselineRisk: true,
      qualityRange: [70, 95],
    },
  },
  {
    id: "audit-preventivo",
    category: "control_preventivo",
    code: "Z00.00",
    label: "Control preventivo adulto",
    input: withMemory({
      consultationId: "c-prev",
      diagnosisCode: "Z00.00",
      diagnosisDescription: "Examen médico general",
      chiefComplaint: "Chequeo preventivo",
      notes:
        "Signos vitales: PA 118/76 mmHg, FC 72 lpm. Examen físico sin hallazgos.",
      treatment: "Estilo de vida saludable. Control anual.",
      patientAge: 45,
      clinicalMemoryRaw: memoryBase("p-prev"),
    }),
    expectations: {
      expectBaselineRisk: true,
      qualityRange: [75, 100],
      qualityLabel: "Excelente",
    },
  },
  {
    id: "audit-polimedicado",
    category: "polimedicado",
    code: "I10",
    label: "Polimedicado — HTA + múltiples fármacos",
    input: withMemory({
      consultationId: "c-poly",
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión esencial",
      chiefComplaint: "Control medicación",
      notes: "Signos vitales: PA 134/84 mmHg. Revisión de polifarmacia.",
      treatment: "Ajuste dosis. Control en 1 mes.",
      clinicalMemoryRaw: {
        ...memoryBase("p-poly"),
        currentMedications: [
          { name: "Losartán 100 mg", prescriptionId: "rx11", since: "2020-01-01" },
          { name: "Amlodipino 5 mg", prescriptionId: "rx12", since: "2020-01-01" },
          { name: "Hidroclorotiazida 25 mg", prescriptionId: "rx13", since: "2021-01-01" },
          { name: "Atorvastatina 20 mg", prescriptionId: "rx14", since: "2021-01-01" },
          { name: "Aspirina 100 mg", prescriptionId: "rx15", since: "2022-01-01" },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["polypharmacy-context"],
      forbidInsightIds: ["hta-vitals", "dm2-rx"],
      qualityRange: [70, 95],
    },
  },
  {
    id: "audit-sin-controles",
    category: "sin_controles",
    code: "I10",
    label: "HTA — sin controles recientes (>6 meses)",
    input: withMemory({
      consultationId: "c-nocontrol",
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión esencial",
      chiefComplaint: "Reconsulta por cefalea",
      notes: "Signos vitales: PA 162/102 mmHg. No acude a controles desde hace meses.",
      treatment: "Reiniciar seguimiento. Control en 2 semanas.",
      clinicalMemoryRaw: {
        ...memoryBase("p-nocontrol"),
        recentConsultations: [
          {
            id: "old-1",
            createdAt: OLD_CONSULT,
            status: "completed",
            diagnosisCode: "I10",
            diagnosisLabel: "Hipertensión esencial",
          },
        ],
        alerts: [
          {
            code: "hta-gap",
            severity: "warning",
            message: "Paciente sin control HTA en >6 meses",
            source: "rule",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["hta-vitals", "hta-gap-control"],
      expectElevatedBpRisk: true,
      expectGapIds: ["gap-pe-cv"],
      qualityRange: [60, 90],
    },
  },
  {
    id: "audit-multi-dx",
    category: "multiples_diagnosticos",
    code: "I10",
    label: "Múltiples diagnósticos — HTA + DM2",
    input: withMemory({
      consultationId: "c-multi",
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión esencial",
      chiefComplaint: "Control crónico",
      notes:
        "Signos vitales: PA 148/92 mmHg, peso 92 kg. DM2 en seguimiento paralelo.",
      treatment: "Continuar esquema. Control en 1 mes.",
      clinicalMemoryRaw: {
        ...memoryBase("p-multi"),
        activeConditions: [
          { code: "I10", label: "Hipertensión esencial", source: "cie10" },
          { code: "E11", label: "Diabetes mellitus tipo 2", source: "cie10" },
          { code: "E78", label: "Dislipidemia", source: "cie10" },
        ],
        recentConsultations: [
          {
            id: "multi-1",
            createdAt: OLD_CONSULT,
            status: "completed",
            diagnosisCode: "I10",
            diagnosisLabel: "Hipertensión esencial",
          },
          {
            id: "multi-2",
            createdAt: RECENT_CONSULT,
            status: "completed",
            diagnosisCode: "E11",
            diagnosisLabel: "Diabetes mellitus tipo 2",
          },
        ],
        currentMedications: [
          {
            name: "Losartán 50 mg",
            prescriptionId: "rx16",
            since: "2022-01-01",
          },
          {
            name: "Metformina 850 mg",
            prescriptionId: "rx17",
            since: "2022-01-01",
          },
        ],
        pendingLabs: [
          {
            exam: "HbA1c pendiente",
            labOrderId: "lab3",
            orderedAt: "2026-01-01",
            status: "pending",
          },
        ],
      },
    }),
    expectations: {
      expectInsightIds: ["hta-vitals", "multimorbidity-context"],
      qualityRange: [70, 95],
    },
  },
];

function classifyInsight(insight: CopilotInsight): ClassifiedItem {
  let classification: ClinicalUtilityClass = "neutro";
  let rationale = "Observación contextual estándar.";

  switch (insight.id) {
    case "hta-vitals":
      if (/elevada/i.test(insight.title)) {
        classification = "útil";
        rationale = "PA elevada documentada — relevante para continuidad HTA.";
      } else {
        classification = "neutro";
        rationale = "Confirma dato ya visible en vitals del SOAP.";
      }
      break;
    case "hta-gap-control":
      classification = "útil";
      rationale = "Intervalo desde último control aporta continuidad no obvia en SOAP.";
      break;
    case "dm2-lab":
      classification = "útil";
      rationale = "HbA1c pendiente es dato accionable para seguimiento DM2.";
      break;
    case "dm2-alert":
      classification = "útil";
      rationale = "Alerta clínica registrada — prioridad contextual.";
      break;
    case "asma-no-exacerbation":
      classification = "útil";
      rationale = "Ausencia de exacerbaciones documentada — contexto asmático relevante.";
      break;
    case "asma-treatment-persistence":
      classification = "útil";
      rationale = "Persistencia terapéutica aporta continuidad no obvia en SOAP.";
      break;
    case "asma-followup-gap":
      classification = "útil";
      rationale = "Intervalo de control asmático — continuidad asistencial.";
      break;
    case "epoc-treatment-persistence":
    case "epoc-followup-gap":
    case "hypo-lab":
    case "hypo-treatment-persistence":
    case "hypo-followup-gap":
    case "obesity-longitudinal":
    case "obesity-followup-gap":
    case "erge-treatment-persistence":
    case "erge-followup-gap":
    case "park-treatment-persistence":
    case "park-followup-gap":
    case "art-longitudinal":
    case "art-followup-gap":
    case "fa-treatment-persistence":
    case "fa-followup-gap":
    case "polypharmacy-context":
    case "multimorbidity-context":
      classification = "útil";
      rationale = "Observación contextual con evidencia documentada (Phase 4.7C).";
      break;
    default:
      classification = "neutro";
      rationale = "Insight genérico sin clasificación específica.";
  }

  return {
    id: insight.id,
    kind: "insight",
    title: insight.title,
    body: insight.body,
    classification,
    rationale,
  };
}

function classifyRiskSignal(
  signal: ClinicalRiskSignal,
  insights: CopilotInsight[],
): ClassifiedItem {
  let classification: ClinicalUtilityClass = "neutro";
  let rationale = "Señal determinística estándar.";

  switch (signal.id) {
    case "risk-elevated-bp":
      classification = "útil";
      rationale =
        insights.some((i) => i.id === "hta-vitals")
          ? "Nivel de riesgo complementario — sin duplicar valores de PA (Phase 4.7B)."
          : "PA elevada es señal clínica prioritaria.";
      break;
    case "risk-pending-labs":
      classification = "útil";
      rationale = "Labs pendientes relevantes para seguimiento.";
      break;
    case "risk-overdue-followup":
      classification = "útil";
      rationale = "Control vencido — continuidad asistencial importante.";
      break;
    default:
      if (signal.id.startsWith("risk-alert-")) {
        classification = "útil";
        rationale = "Alerta clínica activa con severidad documentada.";
      }
  }

  return {
    id: signal.id,
    kind: "risk",
    title: signal.title,
    body: signal.body,
    classification,
    rationale,
  };
}

function classifyGap(gap: DocumentationGap, code: string | null): ClassifiedItem {
  let classification: ClinicalUtilityClass = "neutro";
  let rationale = "Gap documental genérico.";

  switch (gap.id) {
    case "gap-pa":
      classification = "útil";
      rationale = "PA ausente en HTA — gap clínicamente relevante.";
      break;
    case "gap-pe-cv":
      classification = "útil";
      rationale = "Examen cardiovascular estructurado ausente en HTA.";
      break;
    case "gap-weight":
      classification = "útil";
      rationale = "Peso útil para seguimiento metabólico en DM2.";
      break;
    case "gap-motivo":
      classification = "útil";
      rationale = "Motivo ausente afecta calidad documental mínima.";
      break;
    case "gap-plan":
    case "gap-followup-text":
      classification = code && /^(I1|E11|J45)/i.test(code) ? "útil" : "neutro";
      rationale =
        code && /^(I1|E11|J45)/i.test(code)
          ? "Seguimiento crónico sin plazo documentado."
          : "Seguimiento genérico — menor impacto en consulta aguda.";
      break;
    case "gap-notes":
      classification = "neutro";
      rationale =
        "Umbral de 20 caracteres puede penalizar consultas breves válidas (p. ej. niño sano).";
      break;
    default:
      classification = "neutro";
  }

  return {
    id: gap.id,
    kind: "gap",
    title: gap.field,
    body: gap.message,
    classification,
    rationale,
  };
}

function detectFalsePositives(
  scenario: CopilotAuditScenario,
  bundle: ClinicalCopilotIntelligenceBundle,
  classified: ClassifiedItem[],
): string[] {
  const fps: string[] = [];

  for (const item of classified) {
    if (item.classification === "ruido" || item.classification === "potencialmente_incorrecto") {
      fps.push(`${item.kind}:${item.id} — ${item.rationale}`);
    }
  }

  if (scenario.expectations.forbidInsightIds) {
    for (const id of scenario.expectations.forbidInsightIds) {
      if (bundle.insights.some((i) => i.id === id)) {
        fps.push(`insight:${id} — presente pero prohibido en escenario`);
      }
    }
  }

  if (bundle.riskSignals.some((s) => s.id === "risk-baseline")) {
    fps.push("risk:risk-baseline — eliminado en 4.7B pero aún presente");
  }

  const removedNoise = ["dm2-rx", "asma-rx", "longitudinal-context", "dna-context", "asma-stable"];
  for (const id of removedNoise) {
    if (bundle.insights.some((i) => i.id === id)) {
      fps.push(`insight:${id} — redundancia no eliminada (Phase 4.7B)`);
    }
  }

  return fps;
}

function detectFalseNegatives(
  scenario: CopilotAuditScenario,
  bundle: ClinicalCopilotIntelligenceBundle,
): string[] {
  const fns: string[] = [];
  const exp = scenario.expectations;

  if (exp.expectInsightIds) {
    for (const id of exp.expectInsightIds) {
      if (!bundle.insights.some((i) => i.id === id)) {
        fns.push(`insight:${id} — esperado pero ausente`);
      }
    }
  }

  if (exp.expectElevatedBpRisk) {
    if (!bundle.riskSignals.some((s) => s.id === "risk-elevated-bp")) {
      fns.push("risk:risk-elevated-bp — PA elevada documentada sin señal de riesgo");
    }
  }

  if (exp.expectGapIds) {
    for (const id of exp.expectGapIds) {
      if (!bundle.documentationGaps.some((g) => g.id === id)) {
        fns.push(`gap:${id} — esperado pero ausente`);
      }
    }
  }

  if (exp.missedSpecializedInsight?.includes("Sin reglas")) {
    const hasSpecialized = bundle.insights.some((i) =>
      /^(hta|dm2|asma|epoc|hypo|obesity|erge|park|art|fa|polypharmacy|multimorbidity)-/.test(
        i.id,
      ),
    );
    if (!hasSpecialized) {
      fns.push(`motor — ${exp.missedSpecializedInsight}`);
    }
  }

  if (exp.qualityRange) {
    const [min, max] = exp.qualityRange;
    const score = bundle.documentationQuality.score;
    if (score < min) {
      fns.push(`quality — score ${score} subestima documentación (esperado ${min}-${max})`);
    }
    if (score > max) {
      fns.push(`quality — score ${score} sobreestima documentación (esperado ${min}-${max})`);
    }
  }

  return fns;
}

function assessQualityCalibration(
  scenario: CopilotAuditScenario,
  quality: DocumentationQuality,
): string {
  const notesLen = scenario.input.notes?.trim().length ?? 0;
  const vitalsPts = quality.factors.find((f) => f.id === "vitals")?.points ?? 0;
  const pePts = quality.factors.find((f) => f.id === "pe")?.points ?? 0;
  const anamnesisPts = quality.factors.find((f) => f.id === "anamnesis")?.points ?? 0;
  const code = scenario.code?.toUpperCase() ?? "";

  if (quality.label === "Excelente" && vitalsPts === 0 && pePts === 0) {
    return "Sobreestima: Excelente sin vitals ni examen físico documentado.";
  }

  if (quality.label === "Excelente" && /^I10/.test(code) && pePts < 18) {
    return "Sobreestima: Excelente en HTA sin examen cardiovascular documentado.";
  }

  if (
    notesLen >= 20 &&
    notesLen < 50 &&
    anamnesisPts === 0 &&
    vitalsPts === 0 &&
    pePts === 0
  ) {
    return "Subestima: anamnesis clínicamente adecuada sin contenido objetivo parseable.";
  }

  if (scenario.category === "nino_sano" && quality.label === "Incompleto") {
    return "Subestima: consulta pediátrica breve válida marcada Incompleto.";
  }

  if (quality.label === "Incompleto" && quality.score >= 55) {
    return "Subestima: score cercano a Adecuado con documentación clínica mínima válida.";
  }

  return "Calibración coherente con reglas Phase 4.7D.";
}

export function auditCopilotScenario(
  scenario: CopilotAuditScenario,
): CopilotScenarioAuditResult {
  const bundle = buildClinicalCopilotIntelligence(scenario.input);
  const code = bundle.context.activeDiagnosisCode;

  const classified: ClassifiedItem[] = [
    ...bundle.insights.map(classifyInsight),
    ...bundle.riskSignals.map((s) => classifyRiskSignal(s, bundle.insights)),
    ...bundle.documentationGaps.map((g) => classifyGap(g, code)),
  ];

  const summary = classified.reduce(
    (acc, item) => {
      acc[item.classification] += 1;
      return acc;
    },
    { útil: 0, neutro: 0, ruido: 0, potencialmente_incorrecto: 0 },
  );

  return {
    id: scenario.id,
    category: scenario.category,
    code: scenario.code,
    label: scenario.label,
    input: scenario.input,
    bundle,
    classified,
    summary,
    falsePositives: detectFalsePositives(scenario, bundle, classified),
    falseNegatives: detectFalseNegatives(scenario, bundle),
    qualityAssessment: {
      score: bundle.documentationQuality.score,
      label: bundle.documentationQuality.label,
      calibrationNote: assessQualityCalibration(scenario, bundle.documentationQuality),
    },
  };
}

export function buildNoiseProposals(): NoiseProposal[] {
  return [
    {
      target: "risk",
      idOrPattern: "risk-baseline",
      issue: "Se muestra en ~85% de escenarios sin riesgo real",
      proposal: "eliminar",
      rationale:
        "Reemplazar por ausencia de bloque o mensaje colapsado — el médico no necesita confirmación de 'sin riesgo'.",
    },
    {
      target: "insight",
      idOrPattern: "dm2-rx | asma-rx",
      issue: "Duplica medicación visible en Clinical Memory™",
      proposal: "eliminar",
      rationale: "La memoria ya lista medicación activa; el insight no añade contexto.",
    },
    {
      target: "insight",
      idOrPattern: "longitudinal-context",
      issue: "Duplica Clinical Timeline™ y Context Engine v2",
      proposal: "eliminar",
      rationale: "Timeline UI ya muestra consultas previas con fechas.",
    },
    {
      target: "insight",
      idOrPattern: "dna-context",
      issue: "Duplica Doctor DNA™ drawer",
      proposal: "condicionar",
      rationale: "Mostrar solo si Doctor DNA aporta patrón no evidente en memoria del paciente.",
    },
    {
      target: "insight",
      idOrPattern: "asma-stable",
      issue: "Inferencia por ausencia de alertas",
      proposal: "eliminar",
      rationale: "Potencialmente engañoso — ausencia de alerta ≠ control clínico.",
    },
    {
      target: "insight",
      idOrPattern: "hta-vitals (PA normal)",
      issue: "Insight obvio cuando PA no está elevada",
      proposal: "refinar",
      rationale: "Emitir solo si PA elevada o si falta PA en consulta previa crónica.",
    },
    {
      target: "risk",
      idOrPattern: "risk-elevated-bp + hta-vitals",
      issue: "Duplicación insight ↔ risk signal",
      proposal: "fusionar",
      rationale: "Un solo bloque prioritario para PA elevada, no dos.",
    },
    {
      target: "gap",
      idOrPattern: "gap-notes (<20 chars)",
      issue: "Penaliza consultas breves válidas",
      proposal: "refinar",
      rationale: "Elevar umbral o excluir Z-codes / consultas agudas resueltas.",
    },
    {
      target: "gap",
      idOrPattern: "gap-followup-text",
      issue: "Regex frágil para detectar seguimiento",
      proposal: "refinar",
      rationale: "'Control en 4 semanas' sí coincide; 'Reevaluar' no — falsos positivos de gap.",
    },
    {
      target: "insight",
      idOrPattern: "motor I10/E11/J45 only",
      issue: "17/20 escenarios sin insights especializados",
      proposal: "refinar",
      rationale: "Ampliar reglas determinísticas a EPOC, FA, hipotiroidismo en fase futura — fuera de 4.7.",
    },
  ];
}

export function buildClinicalRankingDesign(): ClinicalRankingDesign {
  return {
    riskSignals: [
      {
        idOrPattern: "risk-alert-* (critical)",
        priority: "CRÍTICO",
        rationale: "Alertas críticas de memoria clínica.",
      },
      {
        idOrPattern: "risk-elevated-bp (systolic ≥160)",
        priority: "CRÍTICO",
        rationale: "PA gravemente elevada documentada.",
      },
      {
        idOrPattern: "risk-alert-* (warning)",
        priority: "ALTO",
        rationale: "Alertas de advertencia activas.",
      },
      {
        idOrPattern: "risk-elevated-bp (140-159)",
        priority: "ALTO",
        rationale: "PA elevada en consulta actual.",
      },
      {
        idOrPattern: "risk-overdue-followup (≥6 meses)",
        priority: "ALTO",
        rationale: "Crónicos sin control prolongado.",
      },
      {
        idOrPattern: "risk-pending-labs (≥2)",
        priority: "MODERADO",
        rationale: "Múltiples labs pendientes.",
      },
      {
        idOrPattern: "risk-overdue-followup (4-5 meses)",
        priority: "MODERADO",
        rationale: "Control ambulatorio retrasado.",
      },
      {
        idOrPattern: "risk-pending-labs (1)",
        priority: "INFORMATIVO",
        rationale: "Lab pendiente único.",
      },
      {
        idOrPattern: "risk-baseline",
        priority: "INFORMATIVO",
        rationale: "Ocultar o colapsar — no priorizar visualmente.",
      },
    ],
    documentationGaps: [
      { idOrPattern: "gap-pa (HTA)", priority: "ALTO", rationale: "PA esencial en HTA." },
      { idOrPattern: "gap-motivo", priority: "ALTO", rationale: "Motivo mínimo SOAP." },
      { idOrPattern: "gap-pe-cv (HTA)", priority: "MODERADO", rationale: "Examen CV en crónico cardiovascular." },
      { idOrPattern: "gap-weight (DM2)", priority: "MODERADO", rationale: "Peso en seguimiento metabólico." },
      { idOrPattern: "gap-plan / gap-followup-text", priority: "MODERADO", rationale: "Continuidad crónica." },
      { idOrPattern: "gap-notes", priority: "INFORMATIVO", rationale: "Anamnesis breve — menor urgencia." },
    ],
    insights: [
      { idOrPattern: "dm2-alert | dm2-lab", priority: "ALTO", rationale: "Datos accionables DM2." },
      { idOrPattern: "hta-gap-control", priority: "ALTO", rationale: "Continuidad HTA." },
      { idOrPattern: "hta-vitals (elevada)", priority: "ALTO", rationale: "PA elevada contextual." },
      { idOrPattern: "hta-vitals (normal)", priority: "INFORMATIVO", rationale: "Dato obvio — bajar prioridad." },
      { idOrPattern: "longitudinal-context | dna-context | *-rx", priority: "INFORMATIVO", rationale: "Redundante con otros módulos." },
      { idOrPattern: "asma-stable", priority: "INFORMATIVO", rationale: "Baja confianza clínica — ocultar preferiblemente." },
    ],
    uiPrinciple:
      "Ordenar bloques: Risk CRÍTICO/ALTO → Gaps ALTO → Insights ALTO → resto colapsado bajo 'Contexto adicional'.",
  };
}

export function buildQualityScoreAudit(
  cases: CopilotScenarioAuditResult[],
): QualityScoreAudit {
  const over: string[] = [];
  const under: string[] = [];
  const qty: string[] = [];
  const brief: string[] = [];

  for (const c of cases) {
    const note = c.qualityAssessment.calibrationNote;
    if (note.startsWith("Sobreestima")) over.push(`${c.id}: ${note}`);
    if (note.startsWith("Subestima")) under.push(`${c.id}: ${note}`);
    if ((c.input.notes?.length ?? 0) >= 30 && c.qualityAssessment.score >= 85) {
      qty.push(
        `${c.id}: score ${c.qualityAssessment.score} con anamnesis ≥30 chars — verificar calidad clínica real vs cantidad`,
      );
    }
    if (
      c.category === "nino_sano" ||
      c.category === "cefalea" ||
      c.category === "infeccion_respiratoria"
    ) {
      if (c.bundle.documentationGaps.some((g) => g.id === "gap-notes")) {
        brief.push(`${c.id}: gap-notes en consulta aguda/breve potencialmente injusto`);
      }
    }
  }

  return {
    overestimationCases: over,
    underestimationCases: under,
    quantityOverQuality: qty,
    briefConsultPenalty: brief,
    calibrationProposal: [
      "Phase 4.7D implementado: anamnesis 10 pts por contenido clínico (no longitud ≥30).",
      "Vitales 18 pts; examen físico 18 pts (10 pts parcial por hallazgo libre).",
      "Excelente (≥85): gates clínicos — objetivos documentados; HTA requiere examen CV.",
      "Consultas agudas breves (R51/M54/J06): Excelente solo con examen estructurado o explícito.",
      "Seguimiento: regex ampliada (reevaluar|volver|retorno|próxima|cita|si empeora).",
      "Crónicos I10/E11: Excelente requiere vitals documentados.",
    ],
  };
}

export function runCopilotClinicalAudit(
  scenarios: CopilotAuditScenario[] = COPILOT_AUDIT_SCENARIOS,
): CopilotClinicalAuditReport {
  const cases = scenarios.map(auditCopilotScenario);

  const utilityBreakdown: Record<ClinicalUtilityClass, number> = {
    útil: 0,
    neutro: 0,
    ruido: 0,
    potencialmente_incorrecto: 0,
  };

  let totalInsights = 0;
  let totalRiskSignals = 0;
  let totalGaps = 0;
  let qualitySum = 0;
  let specializedHits = 0;

  const findings: AuditFinding[] = [];
  const allFalsePositives: AuditFinding[] = [];
  const allFalseNegatives: AuditFinding[] = [];

  for (const c of cases) {
    totalInsights += c.bundle.insights.length;
    totalRiskSignals += c.bundle.riskSignals.length;
    totalGaps += c.bundle.documentationGaps.length;
    qualitySum += c.qualityAssessment.score;

    if (c.bundle.insights.some((i) =>
      /^(hta|dm2|asma|epoc|hypo|obesity|erge|park|art|fa|polypharmacy|multimorbidity)-/.test(
        i.id,
      ),
    )) {
      specializedHits += 1;
    }

    for (const [k, v] of Object.entries(c.summary) as [ClinicalUtilityClass, number][]) {
      utilityBreakdown[k] += v;
    }

    for (const item of c.classified) {
      findings.push({
        scenarioId: c.id,
        category: c.category,
        item: `${item.kind}:${item.id}`,
        classification: item.classification,
        detail: `${item.title} — ${item.rationale}`,
      });
    }

    for (const fp of c.falsePositives) {
      allFalsePositives.push({
        scenarioId: c.id,
        category: c.category,
        item: fp.split(" — ")[0] ?? fp,
        classification: "ruido",
        detail: fp,
      });
    }

    for (const fn of c.falseNegatives) {
      allFalseNegatives.push({
        scenarioId: c.id,
        category: c.category,
        item: fn.split(" — ")[0] ?? fn,
        classification: "potencialmente_incorrecto",
        detail: fn,
      });
    }
  }

  const specializedCoverage = Math.round((specializedHits / cases.length) * 100);

  return {
    methodology:
      "Batería determinística Phase 4.7C sobre buildClinicalCopilotIntelligence. " +
      "20 escenarios clínicos con SOAP + Clinical Memory + Data Foundation. " +
      "Clasificación: útil / neutro / ruido / potencialmente_incorrecto.",
    scenarioCount: cases.length,
    cases,
    aggregate: {
      totalInsights,
      totalRiskSignals,
      totalGaps,
      utilityBreakdown,
      avgQualityScore: Math.round(qualitySum / cases.length),
      specializedCoverage,
    },
    findings,
    falsePositives: allFalsePositives,
    falseNegatives: allFalseNegatives,
    noiseProposals: buildNoiseProposals(),
    rankingDesign: buildClinicalRankingDesign(),
    qualityScoreAudit: buildQualityScoreAudit(cases),
    recommendations: [
      "Phase 4.7C: cobertura ampliada a EPOC, hipotiroidismo, obesidad, ERGE, Parkinson, artrosis, FA, polifarmacia y multimorbilidad.",
      "Mantener Zero Noise™ — solo insights con evidencia documentada.",
      "Implementar ranking CRÍTICO→INFORMATIVO (Phase 4.7 pendiente).",
      "Calibrar Documentation Quality (Phase 4.7D — implementado).",
    ],
    risks: [
      "Consultas agudas sin memoria permanecen en Silence Mode — comportamiento esperado.",
      "Multimorbilidad requiere ≥3 condiciones activas y longitudinal — umbral conservador.",
      "Polifarmacia contextual no evalúa interacciones — por diseño.",
      "Quality 'Excelente' alcanzable sin examen físico en consultas agudas.",
    ],
  };
}

export function formatCopilotAuditScenarioRow(c: CopilotScenarioAuditResult): string {
  const ins = c.bundle.insights.map((i) => i.title).join("; ") || "(ninguno)";
  const risks = c.bundle.riskSignals.map((s) => `[${s.level}] ${s.title}`).join("; ") || "(ninguno)";
  const gaps = c.bundle.documentationGaps.map((g) => g.field).join("; ") || "(ninguno)";
  const cls = `útil=${c.summary.útil} neutro=${c.summary.neutro} ruido=${c.summary.ruido}`;
  return `| ${c.category} | ${c.code} | ${ins} | ${risks} | ${gaps} | ${c.qualityAssessment.score} (${c.qualityAssessment.label}) | ${cls} |`;
}

/** Métricas congeladas de Phase 4.7 pre-refinamiento (commit 71fc268e) */
export const COPILOT_AUDIT_BASELINE_47: CopilotClinicalAuditReport["aggregate"] & {
  falsePositives: number;
  falseNegatives: number;
} = {
  totalInsights: 13,
  totalRiskSignals: 25,
  totalGaps: 5,
  utilityBreakdown: { útil: 20, neutro: 2, ruido: 21, potencialmente_incorrecto: 0 },
  avgQualityScore: 75,
  specializedCoverage: 30,
  falsePositives: 22,
  falseNegatives: 8,
};

export type CopilotNoiseReductionComparison = {
  before: typeof COPILOT_AUDIT_BASELINE_47;
  after: CopilotClinicalAuditReport["aggregate"] & {
    falsePositives: number;
    falseNegatives: number;
    silenceModeCount: number;
  };
  delta: {
    insights: number;
    riskSignals: number;
    útil: number;
    ruido: number;
    falsePositives: number;
    falseNegatives: number;
  };
  goalMet: {
    noiseReduced: boolean;
    volumeNotIncreased: boolean;
    baselineEliminated: boolean;
  };
};

export function runCopilotNoiseReductionComparison(): CopilotNoiseReductionComparison {
  const report = runCopilotClinicalAudit();
  const after = {
    ...report.aggregate,
    falsePositives: report.falsePositives.length,
    falseNegatives: report.falseNegatives.length,
    silenceModeCount: report.cases.filter((c) => c.bundle.silenceMode).length,
  };
  const before = COPILOT_AUDIT_BASELINE_47;

  return {
    before,
    after,
    delta: {
      insights: after.totalInsights - before.totalInsights,
      riskSignals: after.totalRiskSignals - before.totalRiskSignals,
      útil: after.utilityBreakdown.útil - before.utilityBreakdown.útil,
      ruido: after.utilityBreakdown.ruido - before.utilityBreakdown.ruido,
      falsePositives: after.falsePositives - before.falsePositives,
      falseNegatives: after.falseNegatives - before.falseNegatives,
    },
    goalMet: {
      noiseReduced: after.utilityBreakdown.ruido < before.utilityBreakdown.ruido,
      volumeNotIncreased: after.totalInsights <= before.totalInsights,
      baselineEliminated: !report.cases.some((c) =>
        c.bundle.riskSignals.some((s) => s.id === "risk-baseline"),
      ),
    },
  };
}

/** Métricas congeladas Phase 4.7B (commit 6d26088d) */
export const COPILOT_AUDIT_BASELINE_47B: CopilotClinicalAuditReport["aggregate"] & {
  falsePositives: number;
  falseNegatives: number;
  silenceModeCount: number;
} = {
  totalInsights: 8,
  totalRiskSignals: 11,
  totalGaps: 5,
  utilityBreakdown: { útil: 24, neutro: 0, ruido: 0, potencialmente_incorrecto: 0 },
  avgQualityScore: 75,
  specializedCoverage: 25,
  falsePositives: 0,
  falseNegatives: 13,
  silenceModeCount: 12,
};

export type CopilotCoverageComparison = {
  before: typeof COPILOT_AUDIT_BASELINE_47B;
  after: CopilotClinicalAuditReport["aggregate"] & {
    falsePositives: number;
    falseNegatives: number;
    silenceModeCount: number;
  };
  delta: {
    insights: number;
    útil: number;
    ruido: number;
    falsePositives: number;
    falseNegatives: number;
    silenceModeCount: number;
    specializedCoverage: number;
  };
  goalMet: {
    coverageIncreased: boolean;
    zeroNoise: boolean;
    zeroFalsePositives: boolean;
    silenceReduced: boolean;
  };
};

export function runCopilotCoverageComparison(): CopilotCoverageComparison {
  const report = runCopilotClinicalAudit();
  const after = {
    ...report.aggregate,
    falsePositives: report.falsePositives.length,
    falseNegatives: report.falseNegatives.length,
    silenceModeCount: report.cases.filter((c) => c.bundle.silenceMode).length,
  };
  const before = COPILOT_AUDIT_BASELINE_47B;

  return {
    before,
    after,
    delta: {
      insights: after.totalInsights - before.totalInsights,
      útil: after.utilityBreakdown.útil - before.utilityBreakdown.útil,
      ruido: after.utilityBreakdown.ruido - before.utilityBreakdown.ruido,
      falsePositives: after.falsePositives - before.falsePositives,
      falseNegatives: after.falseNegatives - before.falseNegatives,
      silenceModeCount: after.silenceModeCount - before.silenceModeCount,
      specializedCoverage: after.specializedCoverage - before.specializedCoverage,
    },
    goalMet: {
      coverageIncreased: after.specializedCoverage > before.specializedCoverage,
      zeroNoise: after.utilityBreakdown.ruido === 0,
      zeroFalsePositives: after.falsePositives === 0,
      silenceReduced: after.silenceModeCount < before.silenceModeCount,
    },
  };
}
