"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { fetchClinicalFoundationBundle } from "@/lib/services/clinical-foundation";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export function useClinicalFoundation(consultationId?: string | null) {
  const [data, setData] = useState<ClinicalFoundationBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!consultationId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchClinicalFoundationBundle(consultationId);
      setData(result);
    } catch (err) {
      setData(null);
      setError(
        getApiErrorMessage(
          err,
          "No se pudo cargar Clinical Foundation para esta consulta.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
