"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedMedicalCertificateDraftReadAdapter,
  type GovernedMedicalCertificateDraftReadAdapter,
} from "./governed-medical-certificate-draft-adapter";
import type { GovernedMedicalCertificateDraftResult } from "./governed-medical-certificate-draft";

export type UseGovernedMedicalCertificateDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedMedicalCertificateDraftReadAdapter;
};

export type UseGovernedMedicalCertificateDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedMedicalCertificateDraftResult | null;
  refresh: () => void;
};

export function useGovernedMedicalCertificateDraft(
  options: UseGovernedMedicalCertificateDraftOptions,
): UseGovernedMedicalCertificateDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedMedicalCertificateDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedMedicalCertificateDraftResult | null>(null);
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
      .getGovernedMedicalCertificateDraft(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
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
