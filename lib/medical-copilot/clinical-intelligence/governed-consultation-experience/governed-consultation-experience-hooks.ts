"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationExperienceReadAdapter,
  type GovernedConsultationExperienceReadAdapter,
} from "./governed-consultation-experience-adapter";
import type { GovernedConsultationExperienceResult } from "./governed-consultation-experience";

export type UseGovernedConsultationExperienceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationExperienceReadAdapter;
};

export type UseGovernedConsultationExperienceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationExperienceResult | null;
  refresh: () => void;
};

export function useGovernedConsultationExperience(
  options: UseGovernedConsultationExperienceOptions,
): UseGovernedConsultationExperienceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationExperienceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationExperienceResult | null>(null);
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
      .getGovernedConsultationExperience(sessionId)
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
