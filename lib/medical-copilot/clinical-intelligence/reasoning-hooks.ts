/**
 * CI-5 — Hook for Governed Clinical Reasoning (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  clinicalReasoningReadAdapter,
  type ClinicalReasoningReadAdapter,
} from "./reasoning-adapter";
import type { ClinicalReasoningResult } from "./reasoning";
import { assertMedicalCopilotSessionId } from "../session-id";

export type UseClinicalReasoningOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReasoningReadAdapter;
};

export type UseClinicalReasoningResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReasoningResult | null;
  refresh: () => void;
};

export function useClinicalReasoning(
  options: UseClinicalReasoningOptions,
): UseClinicalReasoningResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalReasoningReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningResult | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const resolvedSessionId = assertMedicalCopilotSessionId(sessionId);
    if (!enabled || !resolvedSessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getGovernedClinicalReasoning(resolvedSessionId)
      .then((next) => {
        if (cancelled) return;
        setResult(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(toAiClinicalUserMessage(err));
        setResult(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
