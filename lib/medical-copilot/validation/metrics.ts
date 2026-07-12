/**
 * CB-3 — Aggregate ValidationMetrics from sessions (PHI-safe, exportable).
 */

import type {
  ValidationAnswers,
  ValidationIncidentCategory,
  ValidationLikert,
  ValidationMetrics,
  ValidationMetricsExport,
  ValidationQuestionId,
  ValidationQuestionnaireVersion,
  ValidationSession,
} from "./types";
import {
  CLINICAL_VALIDATION_VERSION,
  EMPTY_TRUST_DISTRIBUTION,
  VALIDATION_QUESTIONNAIRE_VERSION,
} from "./types";

export const VALIDATION_QUESTION_IDS: ValidationQuestionId[] = [
  "perceived_utility",
  "suggestion_clarity",
  "dictation_ease",
  "copilot_trust",
  "overall_satisfaction",
  "perceived_response_time",
  "willingness_to_reuse",
];

const INCIDENT_CATEGORIES: ValidationIncidentCategory[] = [
  "none",
  "ui_bug",
  "voice_issue",
  "performance",
  "unclear_suggestions",
  "other",
];

function emptyIncidents(): Record<ValidationIncidentCategory, number> {
  return {
    none: 0,
    ui_bug: 0,
    voice_issue: 0,
    performance: 0,
    unclear_suggestions: 0,
    other: 0,
  };
}

function emptyAverages(): Partial<
  Record<ValidationQuestionId, number | null>
> {
  const out: Partial<Record<ValidationQuestionId, number | null>> = {};
  for (const id of VALIDATION_QUESTION_IDS) out[id] = null;
  return out;
}

export function createEmptyValidationMetrics(
  questionnaireVersion: ValidationQuestionnaireVersion = VALIDATION_QUESTIONNAIRE_VERSION,
): ValidationMetrics {
  return {
    questionnaireVersion,
    evaluatedSessions: 0,
    sessionsOpened: 0,
    sessionsSubmitted: 0,
    sessionsDismissed: 0,
    questionnaireCompletionRate: 0,
    responseRate: 0,
    averageScores: emptyAverages(),
    netSatisfactionScore: null,
    incidentCounts: emptyIncidents(),
    trustDistribution: { ...EMPTY_TRUST_DISTRIBUTION },
    commentProvidedCount: 0,
  };
}

/**
 * Net Satisfaction Score (−100…100) on overall_satisfaction.
 * Promoters: 4–5 · Detractors: 1–2 · Passives: 3 (excluded from formula numerator).
 */
export function computeNetSatisfactionScore(
  scores: Array<ValidationLikert | null | undefined>,
): number | null {
  const rated = scores.filter(
    (s): s is ValidationLikert => typeof s === "number",
  );
  if (rated.length === 0) return null;
  const promoters = rated.filter((s) => s >= 4).length;
  const detractors = rated.filter((s) => s <= 2).length;
  return Number(
    (((promoters - detractors) / rated.length) * 100).toFixed(2),
  );
}

export function computeValidationMetrics(
  sessions: ValidationSession[],
  questionnaireVersion: ValidationQuestionnaireVersion = VALIDATION_QUESTIONNAIRE_VERSION,
): ValidationMetrics {
  const metrics = createEmptyValidationMetrics(questionnaireVersion);
  const sums: Record<ValidationQuestionId, { total: number; count: number }> =
    Object.fromEntries(
      VALIDATION_QUESTION_IDS.map((id) => [id, { total: 0, count: 0 }]),
    ) as Record<ValidationQuestionId, { total: number; count: number }>;

  const overallScores: Array<ValidationLikert | null> = [];

  for (const session of sessions) {
    if (session.status === "open" || session.startedAt) {
      metrics.sessionsOpened += 1;
    }
    if (session.status === "submitted") {
      metrics.sessionsSubmitted += 1;
      metrics.evaluatedSessions += 1;
      accumulateAnswers(sums, session.answers);
      metrics.incidentCounts[session.answers.incidentCategory] += 1;
      overallScores.push(session.answers.overall_satisfaction);
      const trust = session.answers.copilot_trust;
      if (trust) {
        metrics.trustDistribution[trust] += 1;
      }
      if (session.answers.optionalComment) {
        metrics.commentProvidedCount += 1;
      }
    }
    if (session.status === "dismissed") {
      metrics.sessionsDismissed += 1;
    }
  }

  const completion =
    metrics.sessionsOpened > 0
      ? metrics.sessionsSubmitted / metrics.sessionsOpened
      : 0;
  metrics.questionnaireCompletionRate = Number(completion.toFixed(4));
  metrics.responseRate = metrics.questionnaireCompletionRate;
  metrics.netSatisfactionScore = computeNetSatisfactionScore(overallScores);

  for (const id of VALIDATION_QUESTION_IDS) {
    const bucket = sums[id];
    metrics.averageScores[id] =
      bucket.count > 0 ? Number((bucket.total / bucket.count).toFixed(2)) : null;
  }

  for (const cat of INCIDENT_CATEGORIES) {
    metrics.incidentCounts[cat] = metrics.incidentCounts[cat] ?? 0;
  }

  return metrics;
}

export function exportValidationMetrics(
  metrics: ValidationMetrics,
  exportedAt: string = new Date().toISOString(),
): ValidationMetricsExport {
  return {
    exportedAt,
    foundationVersion: CLINICAL_VALIDATION_VERSION,
    metrics: {
      ...metrics,
      averageScores: { ...metrics.averageScores },
      incidentCounts: { ...metrics.incidentCounts },
      trustDistribution: { ...metrics.trustDistribution },
    },
  };
}

function accumulateAnswers(
  sums: Record<ValidationQuestionId, { total: number; count: number }>,
  answers: ValidationAnswers,
): void {
  for (const id of VALIDATION_QUESTION_IDS) {
    const value = answers[id];
    if (typeof value === "number") {
      sums[id].total += value;
      sums[id].count += 1;
    }
  }
}
