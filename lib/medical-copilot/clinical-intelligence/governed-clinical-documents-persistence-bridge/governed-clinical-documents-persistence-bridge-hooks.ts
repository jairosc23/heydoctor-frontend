"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalDocumentsPersistenceBridgeReadAdapter,
  type GovernedClinicalDocumentsPersistenceBridgeReadAdapter,
} from "./governed-clinical-documents-persistence-bridge-adapter";
import type { GovernedClinicalDocumentsPersistenceBridgeResult } from "./governed-clinical-documents-persistence-bridge";

export type UseGovernedClinicalDocumentsPersistenceBridgeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalDocumentsPersistenceBridgeReadAdapter;
};

export type UseGovernedClinicalDocumentsPersistenceBridgeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalDocumentsPersistenceBridgeResult | null;
  refresh: () => void;
};

export function useGovernedClinicalDocumentsPersistenceBridge(
  options: UseGovernedClinicalDocumentsPersistenceBridgeOptions,
): UseGovernedClinicalDocumentsPersistenceBridgeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalDocumentsPersistenceBridgeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDocumentsPersistenceBridgeResult | null>(null);
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
      .getGovernedClinicalDocumentsPersistenceBridge(sessionId)
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
