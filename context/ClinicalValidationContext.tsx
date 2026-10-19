"use client";

/**
 * CB-3 — ClinicalValidationProvider.
 * Voluntary anonymous UX feedback — does not alter Copilot clinical behavior.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createClinicalValidationService,
  type ClinicalValidationService,
  type ValidationIncidentCategory,
  type ValidationLikert,
  type ValidationMetrics,
  type ValidationMetricsExport,
  type ValidationQuestionId,
  type ValidationQuestionnaire,
  type ValidationSession,
} from "@/lib/medical-copilot/validation";
import { postMedicalCopilotFeedback } from "@/lib/medical-copilot/api";

export type ClinicalValidationContextValue = {
  session: ValidationSession;
  questionnaire: ValidationQuestionnaire;
  metrics: ValidationMetrics;
  open: () => void;
  dismiss: () => void;
  submit: () => void;
  reset: () => void;
  setLikert: (
    questionId: ValidationQuestionId,
    value: ValidationLikert | null,
  ) => void;
  setIncidentCategory: (category: ValidationIncidentCategory) => void;
  setOptionalComment: (comment: string | null) => void;
  exportMetrics: () => ValidationMetricsExport;
  service: ClinicalValidationService;
};

const ClinicalValidationContext =
  createContext<ClinicalValidationContextValue | null>(null);

export type ClinicalValidationProviderProps = {
  children: ReactNode;
  /** Optional anonymous cohort tag (never a clinical identifier). */
  cohortTag?: string | null;
  service?: ClinicalValidationService;
};

export function ClinicalValidationProvider({
  children,
  cohortTag = "clinical_beta",
  service: injected,
}: ClinicalValidationProviderProps) {
  const serviceRef = useRef(injected ?? createClinicalValidationService());
  const service = serviceRef.current;

  const [session, setSession] = useState<ValidationSession>(() =>
    service.getSession(),
  );
  const [metrics, setMetrics] = useState<ValidationMetrics>(() =>
    service.getMetrics(),
  );

  useEffect(() => {
    return service.subscribe((next) => {
      setSession(next);
      setMetrics(service.getMetrics());
    });
  }, [service]);

  const open = useCallback(() => {
    service.openSession({ cohortTag });
  }, [cohortTag, service]);

  const dismiss = useCallback(() => {
    service.dismiss();
  }, [service]);

  const submit = useCallback(() => {
    const next = service.submit();
    void postMedicalCopilotFeedback({
      questionnaireVersion: next.questionnaireVersion,
      incidentCategory: next.answers.incidentCategory,
      cohortTag: next.cohortTag ?? undefined,
      likert: {
        perceived_utility: next.answers.perceived_utility,
        suggestion_clarity: next.answers.suggestion_clarity,
        dictation_ease: next.answers.dictation_ease,
        copilot_trust: next.answers.copilot_trust,
        overall_satisfaction: next.answers.overall_satisfaction,
        perceived_response_time: next.answers.perceived_response_time,
        willingness_to_reuse: next.answers.willingness_to_reuse,
      },
    }).catch(() => {
      /* never block clinical UX on feedback transport */
    });
  }, [service]);

  const reset = useCallback(() => {
    service.reset();
  }, [service]);

  const setLikert = useCallback(
    (questionId: ValidationQuestionId, value: ValidationLikert | null) => {
      service.updateLikert(questionId, value);
    },
    [service],
  );

  const setIncidentCategory = useCallback(
    (category: ValidationIncidentCategory) => {
      service.setIncidentCategory(category);
    },
    [service],
  );

  const setOptionalComment = useCallback(
    (comment: string | null) => {
      service.setOptionalComment(comment);
    },
    [service],
  );

  const exportMetrics = useCallback(
    () => service.exportMetrics(),
    [service],
  );

  const value = useMemo<ClinicalValidationContextValue>(
    () => ({
      session,
      questionnaire: service.getQuestionnaire(),
      metrics,
      open,
      dismiss,
      submit,
      reset,
      setLikert,
      setIncidentCategory,
      setOptionalComment,
      exportMetrics,
      service,
    }),
    [
      dismiss,
      exportMetrics,
      metrics,
      open,
      reset,
      service,
      session,
      setIncidentCategory,
      setLikert,
      setOptionalComment,
      submit,
    ],
  );

  return (
    <ClinicalValidationContext.Provider value={value}>
      {children}
    </ClinicalValidationContext.Provider>
  );
}

function useClinicalValidationContext(): ClinicalValidationContextValue {
  const ctx = useContext(ClinicalValidationContext);
  if (!ctx) {
    throw new Error(
      "useClinicalValidation must be used within ClinicalValidationProvider",
    );
  }
  return ctx;
}

export function useClinicalValidation(): ClinicalValidationContextValue {
  return useClinicalValidationContext();
}

export function useClinicalValidationSession(): ValidationSession {
  return useClinicalValidationContext().session;
}

export function useClinicalValidationMetrics(): ValidationMetrics {
  return useClinicalValidationContext().metrics;
}

export function useClinicalValidationQuestionnaire(): ValidationQuestionnaire {
  return useClinicalValidationContext().questionnaire;
}

export function useClinicalValidationExport(): () => ValidationMetricsExport {
  return useClinicalValidationContext().exportMetrics;
}
