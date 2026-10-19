/**
 * EPIC-3 UC-03B — Clinical Documentation Quality Assistant (deterministic).
 *
 * Live-phase presence checks over Consultation + Clinical Foundation.
 * Statuses: completed | pending | unavailable.
 * No LLM, no free text, no clinical recommendations, no EMR writes.
 */

import type { NestConsultation } from "@/lib/services/consultations";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export type DocQualityStatus = "completed" | "pending" | "unavailable";

export type DocQualityIndicatorId =
  | "soap"
  | "motivo_consulta"
  | "examen_fisico"
  | "signos_vitales"
  | "diagnostico"
  | "plan_terapeutico"
  | "consentimiento"
  | "firma";

export type DocQualityIndicator = {
  id: DocQualityIndicatorId;
  label: string;
  status: DocQualityStatus;
  /** Observable fact only — never a clinical recommendation. */
  observation: string;
};

export type LiveDocumentationQualityView = {
  title: "Clinical Documentation Quality Assistant";
  phase: "live";
  indicators: DocQualityIndicator[];
  evaluatedAt: string;
  readOnly: true;
  generative: false;
  persistsToEmr: false;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function hasObjectPayload(
  value: Record<string, unknown> | null | undefined,
): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.keys(value).some((key) => {
    const v = value[key];
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return Number.isFinite(v);
    if (typeof v === "boolean") return true;
    if (typeof v === "object") return Object.keys(v as object).length > 0;
    return false;
  });
}

export function labelDocQualityStatus(status: DocQualityStatus): string {
  switch (status) {
    case "completed":
      return "Completado";
    case "pending":
      return "Pendiente";
    default:
      return "No disponible";
  }
}

/**
 * Pure evaluator. Observes fields only; does not invent or recommend.
 */
export function evaluateLiveDocumentationQuality(input: {
  consultation: NestConsultation | null;
  foundation: ClinicalFoundationBundle | null;
  evaluatedAt?: string;
}): LiveDocumentationQualityView {
  const evaluatedAt = input.evaluatedAt ?? new Date().toISOString();
  const foundation = input.foundation;
  const consultation = input.consultation;

  if (!foundation && !consultation) {
    const unavailable = (
      id: DocQualityIndicatorId,
      label: string,
    ): DocQualityIndicator => ({
      id,
      label,
      status: "unavailable",
      observation: "Consultation y Clinical Foundation no cargados",
    });
    return {
      title: "Clinical Documentation Quality Assistant",
      phase: "live",
      indicators: [
        unavailable("soap", "SOAP"),
        unavailable("motivo_consulta", "Motivo de consulta"),
        unavailable("examen_fisico", "Examen físico"),
        unavailable("signos_vitales", "Signos vitales"),
        unavailable("diagnostico", "Diagnóstico"),
        unavailable("plan_terapeutico", "Plan terapéutico"),
        unavailable("consentimiento", "Consentimiento"),
        unavailable("firma", "Firma de consulta"),
      ],
      evaluatedAt,
      readOnly: true,
      generative: false,
      persistsToEmr: false,
    };
  }

  const encounter = foundation?.encounter;
  const soapParts = {
    S: hasText(encounter?.subjective) || hasText(foundation?.consultation.notes) || hasText(consultation?.notes),
    O:
      hasText(encounter?.objective) ||
      hasObjectPayload(encounter?.physicalExam) ||
      hasObjectPayload(encounter?.vitalSigns),
    A:
      hasText(encounter?.assessment) ||
      hasText(foundation?.consultation.diagnosisText) ||
      hasText(consultation?.diagnosis) ||
      Boolean(foundation?.consultation.cie10?.code) ||
      Boolean(consultation?.cie10Code?.code),
    P:
      hasText(encounter?.plan) ||
      hasText(foundation?.consultation.treatment) ||
      hasText(consultation?.treatmentPlan) ||
      hasText(consultation?.treatment),
  };

  let soapStatus: DocQualityStatus;
  let soapObservation: string;
  if (!foundation && !consultation) {
    soapStatus = "unavailable";
    soapObservation = "Sin fuentes clínicas";
  } else {
    const present = (["S", "O", "A", "P"] as const).filter((k) => soapParts[k]);
    const missing = (["S", "O", "A", "P"] as const).filter((k) => !soapParts[k]);
    if (present.length === 4) {
      soapStatus = "completed";
      soapObservation = "S, O, A y P con contenido observable";
    } else if (present.length === 0 && !foundation) {
      soapStatus = "unavailable";
      soapObservation = "Clinical Foundation no cargado para SOAP estructurado";
    } else {
      soapStatus = "pending";
      soapObservation = `SOAP incompleto — faltan: ${missing.join(", ")}`;
    }
  }

  const motivoPresent =
    hasText(foundation?.consultation.reason) ||
    hasText(foundation?.encounter.chiefComplaint) ||
    hasText(consultation?.chiefComplaint) ||
    hasText(consultation?.reason);

  const examPresent = hasObjectPayload(encounter?.physicalExam);
  const examStatus: DocQualityStatus = !foundation
    ? "unavailable"
    : examPresent
      ? "completed"
      : "pending";

  const vitalsPresent = hasObjectPayload(encounter?.vitalSigns);
  const vitalsStatus: DocQualityStatus = !foundation
    ? "unavailable"
    : vitalsPresent
      ? "completed"
      : "pending";

  const diagnosisPresent =
    hasText(foundation?.consultation.diagnosisText) ||
    Boolean(foundation?.consultation.cie10?.code) ||
    hasText(consultation?.diagnosis) ||
    Boolean(consultation?.cie10Code?.code) ||
    hasText(encounter?.assessment);

  const planPresent =
    hasText(foundation?.consultation.treatment) ||
    hasText(encounter?.plan) ||
    hasText(consultation?.treatmentPlan) ||
    hasText(consultation?.treatment);

  let consentStatus: DocQualityStatus;
  let consentObservation: string;
  if (!consultation) {
    consentStatus = "unavailable";
    consentObservation = "Consultation no cargada";
  } else if (hasText(consultation.consentGivenAt)) {
    consentStatus = "completed";
    consentObservation = `consentGivenAt presente${
      consultation.consentVersion ? ` · ${consultation.consentVersion}` : ""
    }`;
  } else {
    consentStatus = "pending";
    consentObservation = "consentGivenAt ausente";
  }

  const signed =
    Boolean(foundation?.consultation.isSigned) ||
    hasText(foundation?.consultation.signedAt) ||
    hasText(consultation?.signedAt) ||
    hasText(consultation?.doctorSignature);

  return {
    title: "Clinical Documentation Quality Assistant",
    phase: "live",
    indicators: [
      {
        id: "soap",
        label: "SOAP",
        status: soapStatus,
        observation: soapObservation,
      },
      {
        id: "motivo_consulta",
        label: "Motivo de consulta",
        status: motivoPresent ? "completed" : "pending",
        observation: motivoPresent
          ? "reason / chiefComplaint con texto"
          : "Motivo ausente en Consultation/Foundation",
      },
      {
        id: "examen_fisico",
        label: "Examen físico",
        status: examStatus,
        observation:
          examStatus === "unavailable"
            ? "Foundation no cargado"
            : examPresent
              ? "encounter.physicalExam con datos"
              : "encounter.physicalExam ausente o vacío",
      },
      {
        id: "signos_vitales",
        label: "Signos vitales",
        status: vitalsStatus,
        observation:
          vitalsStatus === "unavailable"
            ? "Foundation no cargado"
            : vitalsPresent
              ? "encounter.vitalSigns con datos"
              : "encounter.vitalSigns ausente o vacío",
      },
      {
        id: "diagnostico",
        label: "Diagnóstico",
        status: diagnosisPresent ? "completed" : "pending",
        observation: diagnosisPresent
          ? "Diagnóstico / CIE-10 / assessment observable"
          : "Diagnóstico no documentado",
      },
      {
        id: "plan_terapeutico",
        label: "Plan terapéutico",
        status: planPresent ? "completed" : "pending",
        observation: planPresent
          ? "Plan / treatment con texto"
          : "Plan terapéutico ausente",
      },
      {
        id: "consentimiento",
        label: "Consentimiento",
        status: consentStatus,
        observation: consentObservation,
      },
      {
        id: "firma",
        label: "Firma de consulta",
        status: signed ? "completed" : "pending",
        observation: signed
          ? "Firma / signedAt presente"
          : "Consulta aún sin firmar",
      },
    ],
    evaluatedAt,
    readOnly: true,
    generative: false,
    persistsToEmr: false,
  };
}
