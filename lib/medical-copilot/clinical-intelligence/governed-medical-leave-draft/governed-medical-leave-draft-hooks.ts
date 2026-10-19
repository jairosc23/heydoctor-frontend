"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedMedicalLeaveDraftReadAdapter,
  type GovernedMedicalLeaveDraftReadAdapter,
} from "./governed-medical-leave-draft-adapter";
import type { GovernedMedicalLeaveDraftResult } from "./governed-medical-leave-draft";

export type UseGovernedMedicalLeaveDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedMedicalLeaveDraftReadAdapter;
};

export type UseGovernedMedicalLeaveDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedMedicalLeaveDraftResult | null;
  refresh: () => void;
};

export function useGovernedMedicalLeaveDraft(
  options: UseGovernedMedicalLeaveDraftOptions,
): UseGovernedMedicalLeaveDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedMedicalLeaveDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMedicalLeaveDraftResult | null>(
    null,
  );
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getGovernedMedicalLeaveDraft(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
          setResult(null);
        }
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
