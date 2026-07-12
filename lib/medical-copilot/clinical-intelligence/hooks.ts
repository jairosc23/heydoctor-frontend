"use client";

/**
 * CP-33 — Public hooks for Clinical Intelligence Adapter.
 * UI-facing execution state only; does not store clinical results in EMR/Store.
 */

import { useCallback, useRef, useState } from "react";
import {
  clinicalIntelligenceAdapter,
  type ClinicalIntelligenceAdapter,
} from "./adapter";
import type {
  ClinicalAnalysisError,
  ClinicalAnalysisRequest,
  ClinicalAnalysisResponse,
  ClinicalAnalysisStatus,
} from "./types";

export type UseClinicalIntelligenceAnalysisOptions = {
  adapter?: ClinicalIntelligenceAdapter;
};

export type UseClinicalIntelligenceAnalysisResult = {
  status: ClinicalAnalysisStatus;
  data: ClinicalAnalysisResponse | null;
  error: ClinicalAnalysisError | null;
  isLoading: boolean;
  analyze: (request: ClinicalAnalysisRequest) => Promise<ClinicalAnalysisResponse | null>;
  reset: () => void;
};

export function useClinicalIntelligenceAnalysis(
  options: UseClinicalIntelligenceAnalysisOptions = {},
): UseClinicalIntelligenceAnalysisResult {
  const adapterRef = useRef(options.adapter ?? clinicalIntelligenceAdapter);
  const [status, setStatus] = useState<ClinicalAnalysisStatus>("idle");
  const [data, setData] = useState<ClinicalAnalysisResponse | null>(null);
  const [error, setError] = useState<ClinicalAnalysisError | null>(null);
  const requestSeq = useRef(0);

  const reset = useCallback(() => {
    requestSeq.current += 1;
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  const analyze = useCallback(
    async (
      request: ClinicalAnalysisRequest,
    ): Promise<ClinicalAnalysisResponse | null> => {
      const seq = ++requestSeq.current;
      setStatus("loading");
      setError(null);

      const result = await adapterRef.current.analyze(request);

      if (seq !== requestSeq.current) {
        return null;
      }

      if (!result.ok) {
        setData(null);
        setError(result.error);
        setStatus(result.error.code === "timeout" ? "timeout" : "error");
        return null;
      }

      setData(result.data);
      setError(null);
      setStatus("success");
      return result.data;
    },
    [],
  );

  return {
    status,
    data,
    error,
    isLoading: status === "loading",
    analyze,
    reset,
  };
}
