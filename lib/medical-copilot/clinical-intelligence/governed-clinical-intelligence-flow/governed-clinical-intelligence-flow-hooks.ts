"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useState } from "react";
import {
  governedClinicalIntelligenceFlowRunAdapter,
  type GovernedClinicalIntelligenceFlowRunAdapter,
} from "./governed-clinical-intelligence-flow-adapter";
import type { GovernedClinicalIntelligenceFlowResult } from "./governed-clinical-intelligence-flow";

export type UseGovernedClinicalIntelligenceFlowOptions = {
  sessionId: string | null | undefined;
  adapter?: GovernedClinicalIntelligenceFlowRunAdapter;
};

export type UseGovernedClinicalIntelligenceFlowResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalIntelligenceFlowResult | null;
  run: () => void;
  reset: () => void;
};

export function useGovernedClinicalIntelligenceFlow(
  options: UseGovernedClinicalIntelligenceFlowOptions,
): UseGovernedClinicalIntelligenceFlowResult {
  const {
    sessionId,
    adapter = governedClinicalIntelligenceFlowRunAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedClinicalIntelligenceFlowResult | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  const run = useCallback(() => {
    if (!sessionId) {
      setError("Sesión HeyDoctor Copilot no disponible");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    void adapter
      .runGovernedClinicalIntelligenceFlow(sessionId)
      .then((next) => {
        setResult(next);
        if (!next) {
          setError("Respuesta de flujo clínico no válida");
        }
      })
      .catch((err) => {
        setError(toAiClinicalUserMessage(err));
        setResult(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adapter, sessionId]);

  return { loading, error, result, run, reset };
}
