"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalEntityMappingReadAdapter,
  type GovernedClinicalEntityMappingReadAdapter,
} from "./governed-clinical-entity-mapping-adapter";
import type { GovernedClinicalEntityMappingResult } from "./governed-clinical-entity-mapping";

export type UseGovernedClinicalEntityMappingOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalEntityMappingReadAdapter;
};

export type UseGovernedClinicalEntityMappingResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalEntityMappingResult | null;
  refresh: () => void;
};

export function useGovernedClinicalEntityMapping(
  options: UseGovernedClinicalEntityMappingOptions,
): UseGovernedClinicalEntityMappingResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalEntityMappingReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalEntityMappingResult | null>(null);
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
      .getGovernedClinicalEntityMapping(sessionId)
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
