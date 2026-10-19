/**
 * CB-3 — ClinicalValidationService (in-memory, PHI-safe, voluntary, anonymous).
 * Does not touch Copilot clinical behavior or EMR.
 */

import { DEFAULT_VALIDATION_QUESTIONNAIRE } from "./questionnaire";
import {
  computeValidationMetrics,
  exportValidationMetrics,
} from "./metrics";
import { scrubValidationComment } from "./phi";
import {
  EMPTY_VALIDATION_ANSWERS,
  CLINICAL_VALIDATION_VERSION,
  VALIDATION_QUESTIONNAIRE_VERSION,
  type ValidationAnswers,
  type ValidationEvent,
  type ValidationIncidentCategory,
  type ValidationLikert,
  type ValidationMetrics,
  type ValidationMetricsExport,
  type ValidationQuestionId,
  type ValidationQuestionnaire,
  type ValidationSession,
} from "./types";

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export type ClinicalValidationService = {
  getQuestionnaire: () => ValidationQuestionnaire;
  getSession: () => ValidationSession;
  getEvents: () => ValidationEvent[];
  getMetrics: () => ValidationMetrics;
  /** Aggregated Beta export — never includes clinical identifiers. */
  exportMetrics: () => ValidationMetricsExport;
  /** Opens anonymous voluntary session (ignores clinical identifiers). */
  openSession: (opts?: { cohortTag?: string | null }) => ValidationSession;
  updateLikert: (
    questionId: ValidationQuestionId,
    value: ValidationLikert | null,
  ) => ValidationSession;
  setIncidentCategory: (
    category: ValidationIncidentCategory,
  ) => ValidationSession;
  setOptionalComment: (comment: string | null) => ValidationSession;
  submit: () => ValidationSession;
  dismiss: () => ValidationSession;
  reset: () => ValidationSession;
  subscribe: (listener: (session: ValidationSession) => void) => () => void;
};

function createEmptySession(
  questionnaireVersion = VALIDATION_QUESTIONNAIRE_VERSION,
): ValidationSession {
  return {
    validationSessionId: createId("val"),
    version: CLINICAL_VALIDATION_VERSION,
    questionnaireVersion,
    cohortTag: null,
    status: "idle",
    startedAt: null,
    submittedAt: null,
    dismissedAt: null,
    answers: { ...EMPTY_VALIDATION_ANSWERS },
  };
}

export function createClinicalValidationService(
  questionnaire: ValidationQuestionnaire = DEFAULT_VALIDATION_QUESTIONNAIRE,
): ClinicalValidationService {
  let session = createEmptySession(questionnaire.questionnaireVersion);
  const events: ValidationEvent[] = [];
  const history: ValidationSession[] = [];
  const listeners = new Set<(s: ValidationSession) => void>();

  const notify = () => {
    listeners.forEach((l) => l(session));
  };

  const pushEvent = (
    type: ValidationEvent["type"],
    detail: ValidationEvent["detail"] = {},
  ) => {
    events.push({
      eventId: createId("ve"),
      type,
      at: nowIso(),
      validationSessionId: session.validationSessionId,
      questionnaireVersion: session.questionnaireVersion,
      detail: { status: session.status, ...detail },
    });
  };

  const mutateAnswers = (patch: Partial<ValidationAnswers>) => {
    session = {
      ...session,
      answers: { ...session.answers, ...patch },
    };
  };

  const metricsOf = () => {
    if (session.status === "open") {
      return computeValidationMetrics(
        [...history, session],
        questionnaire.questionnaireVersion,
      );
    }
    return computeValidationMetrics(
      history,
      questionnaire.questionnaireVersion,
    );
  };

  return {
    getQuestionnaire: () => questionnaire,
    getSession: () => session,
    getEvents: () => [...events],
    getMetrics: metricsOf,
    exportMetrics: () => exportValidationMetrics(metricsOf()),

    openSession: (opts) => {
      if (session.status === "open") {
        return session;
      }
      const cohortTag =
        typeof opts?.cohortTag === "string" && opts.cohortTag.trim()
          ? opts.cohortTag.trim().slice(0, 32)
          : "clinical_beta";
      session = {
        ...createEmptySession(questionnaire.questionnaireVersion),
        status: "open",
        startedAt: nowIso(),
        cohortTag,
      };
      pushEvent("validation_opened");
      notify();
      return session;
    },

    updateLikert: (questionId, value) => {
      if (session.status !== "open") return session;
      mutateAnswers({ [questionId]: value } as Partial<ValidationAnswers>);
      pushEvent("validation_answer_updated", {
        questionId,
        likert: value,
      });
      notify();
      return session;
    },

    setIncidentCategory: (category) => {
      if (session.status !== "open") return session;
      mutateAnswers({ incidentCategory: category });
      if (category !== "none") {
        pushEvent("incident_reported", { incidentCategory: category });
      } else {
        pushEvent("validation_answer_updated", { incidentCategory: category });
      }
      notify();
      return session;
    },

    setOptionalComment: (comment) => {
      if (session.status !== "open") return session;
      const scrubbed = scrubValidationComment(
        comment,
        questionnaire.maxCommentLength,
      );
      mutateAnswers({ optionalComment: scrubbed });
      pushEvent("validation_answer_updated", {
        hasComment: Boolean(scrubbed),
      });
      notify();
      return session;
    },

    submit: () => {
      if (session.status !== "open") return session;
      session = {
        ...session,
        status: "submitted",
        submittedAt: nowIso(),
      };
      pushEvent("validation_submitted", {
        incidentCategory: session.answers.incidentCategory,
        hasComment: Boolean(session.answers.optionalComment),
      });
      history.push({ ...session, answers: { ...session.answers } });
      notify();
      return session;
    },

    dismiss: () => {
      if (session.status !== "open") return session;
      session = {
        ...session,
        status: "dismissed",
        dismissedAt: nowIso(),
      };
      pushEvent("validation_dismissed");
      history.push({ ...session, answers: { ...session.answers } });
      notify();
      return session;
    },

    reset: () => {
      session = createEmptySession(questionnaire.questionnaireVersion);
      pushEvent("validation_reset");
      notify();
      return session;
    },

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
