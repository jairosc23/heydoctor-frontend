"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchClinicalFlowSuggestions,
  type ClinicalFlowSuggestionsParams,
} from "@/lib/services/clinical-flow";
import type { ClinicalFlowSuggestionsResponse } from "@/lib/types/clinical-intelligence-flow";

const EMPTY_FLOW: ClinicalFlowSuggestionsResponse = {
  diagnosis: { cie10CodeId: "", code: "", description: "" },
  jurisdiction: "CL",
  medications: [],
  labs: [],
  education: [],
  followUp: [],
};

export function useClinicalFlowSuggestions(
  params: ClinicalFlowSuggestionsParams & { enabled?: boolean; refreshKey?: number },
) {
  const [data, setData] = useState<ClinicalFlowSuggestionsResponse>(EMPTY_FLOW);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled =
    params.enabled !== false && Boolean(params.cie10CodeId || params.cie10Code);

  const load = useCallback(async () => {
    if (!enabled) {
      setData(EMPTY_FLOW);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchClinicalFlowSuggestions(params);
      setData(result);
    } catch (e) {
      setData(EMPTY_FLOW);
      setError(e instanceof Error ? e.message : "Error al cargar sugerencias");
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    params.cie10CodeId,
    params.cie10Code,
    params.countryCode,
    params.medicationLimit,
    params.labLimit,
    params.educationLimit,
    params.followUpLimit,
  ]);

  useEffect(() => {
    void load();
  }, [load, params.refreshKey]);

  return { data, loading, error, reload: load };
}
