"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchClinicalFoundation } from "@/lib/api-clinical-foundation";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation.types";

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
      const result = await fetchClinicalFoundation(consultationId);
      setData(result);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Error al cargar Foundation");
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
