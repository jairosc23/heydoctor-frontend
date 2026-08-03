"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalActivationPackageReadAdapter,
  type GovernedClinicalActivationPackageReadAdapter,
} from "./governed-clinical-activation-package-adapter";
import type { GovernedClinicalActivationPackageResult } from "./governed-clinical-activation-package";

export type UseGovernedClinicalActivationPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalActivationPackageReadAdapter;
};

export type UseGovernedClinicalActivationPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalActivationPackageResult | null;
  refresh: () => void;
};

export function useGovernedClinicalActivationPackage(
  options: UseGovernedClinicalActivationPackageOptions,
): UseGovernedClinicalActivationPackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalActivationPackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActivationPackageResult | null>(null);
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
      .getGovernedClinicalActivationPackage(sessionId)
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
