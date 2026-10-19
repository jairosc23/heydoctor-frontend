/**
 * HttpSafetyProvider — Clinical Safety Integration (post PR-4.3).
 * Calls POST /prescriptions/safety-evaluate. No rule logic in FE.
 */

import { heydoctorApi } from "@/lib/heydoctor-api";
import type {
  SafetyEvaluateInput,
  SafetyEvaluation,
  SafetyProvider,
} from "./types";

type SafetyEvaluateApiResponse = {
  data?: {
    evaluation?: SafetyEvaluation;
    auditPackage?: unknown;
  };
};

/** Pure request mapper — unit-tested without network. */
export function buildSafetyEvaluateRequest(input: SafetyEvaluateInput) {
  return {
    patientId: input.patientId,
    consultationId: input.consultationId ?? undefined,
    cie10CodeId: input.cie10CodeId ?? undefined,
    diagnosis: input.diagnosis,
    medications: input.lines.map((line) => ({
      name: (line.displayLabel ?? "").trim() || "Medicamento",
      drugPresentationId: line.drugPresentationId,
      dosage: line.dosage,
      frequency: line.frequency,
      duration: line.duration,
      route: line.route,
      instructions: line.instructions,
    })),
  };
}

export class HttpSafetyProvider implements SafetyProvider {
  readonly id = "http-safety-provider-v1";

  async evaluate(input: SafetyEvaluateInput): Promise<SafetyEvaluation> {
    const res = await heydoctorApi.post<SafetyEvaluateApiResponse>(
      "/prescriptions/safety-evaluate",
      buildSafetyEvaluateRequest(input),
    );

    const evaluation = res.data?.evaluation;
    if (!evaluation || typeof evaluation !== "object") {
      throw new Error("Safety evaluate response missing evaluation");
    }

    return {
      evaluationId: evaluation.evaluationId,
      evaluatedAt: evaluation.evaluatedAt,
      engineVersion: evaluation.engineVersion,
      patientId: evaluation.patientId,
      consultationId: evaluation.consultationId ?? input.consultationId ?? null,
      alerts: Array.isArray(evaluation.alerts) ? evaluation.alerts : [],
      ruleResults: evaluation.ruleResults,
    };
  }
}

export function createHttpSafetyProvider(): SafetyProvider {
  return new HttpSafetyProvider();
}
