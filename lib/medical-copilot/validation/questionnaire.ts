/**
 * CB-3 — Default voluntary validation questionnaire (UX only, versioned).
 */

import type { ValidationQuestionnaire } from "./types";
import {
  CLINICAL_VALIDATION_VERSION,
  VALIDATION_QUESTIONNAIRE_VERSION,
} from "./types";

export const DEFAULT_VALIDATION_QUESTIONNAIRE: ValidationQuestionnaire = {
  questionnaireVersion: VALIDATION_QUESTIONNAIRE_VERSION,
  version: CLINICAL_VALIDATION_VERSION,
  title: "Validación clínica (Beta)",
  description:
    "Cuestionario voluntario y anónimo sobre la experiencia de uso de HeyDoctor Copilot. No registre datos del paciente ni texto clínico.",
  questions: [
    {
      id: "perceived_utility",
      prompt: "¿Qué tan útil le resultó el Copiloto en esta consulta?",
      helpText: "1 = nada útil · 5 = muy útil",
    },
    {
      id: "suggestion_clarity",
      prompt: "¿Las sugerencias fueron claras y fáciles de revisar?",
      helpText: "1 = nada claras · 5 = muy claras",
    },
    {
      id: "dictation_ease",
      prompt: "¿Qué tan fácil fue usar el dictado clínico?",
      helpText: "1 = muy difícil · 5 = muy fácil",
    },
    {
      id: "copilot_trust",
      prompt: "¿Qué nivel de confianza le genera el Copiloto como apoyo HITL?",
      helpText: "1 = ninguna confianza · 5 = alta confianza",
    },
    {
      id: "overall_satisfaction",
      prompt: "Satisfacción general con la experiencia Beta",
      helpText: "1 = muy insatisfecho · 5 = muy satisfecho",
    },
    {
      id: "perceived_response_time",
      prompt: "¿Cómo percibió el tiempo de respuesta del Copiloto?",
      helpText: "1 = muy lento · 5 = muy rápido",
    },
    {
      id: "willingness_to_reuse",
      prompt: "¿Volvería a utilizar HeyDoctor Copilot en próximas consultas?",
      helpText: "1 = definitivamente no · 5 = definitivamente sí",
    },
  ],
  incidentPrompt: "¿Reporta alguna incidencia de uso? (opcional)",
  optionalCommentPrompt:
    "Comentario breve de experiencia (sin datos de paciente ni notas clínicas)",
  maxCommentLength: 200,
};
