"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPatientClinicalMemory } from "@/lib/services/clinical-memory";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";

export const EMPTY_PATIENT_CLINICAL_MEMORY: PatientClinicalMemory = {
  patientId: "",
  activeConditions: [],
  recentDiagnoses: [],
  currentMedications: [],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [],
};

export interface UsePatientClinicalMemoryOptions {
  enabled?: boolean;
  initialData?: PatientClinicalMemory;
}

export function usePatientClinicalMemory(
  patientId?: string | null,
  options: UsePatientClinicalMemoryOptions = {},
) {
  const { enabled = true, initialData } = options;
  const [data, setData] = useState<PatientClinicalMemory>(
    initialData ?? EMPTY_PATIENT_CLINICAL_MEMORY,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      if (initialData) setData(initialData);
      setError(null);
      setLoading(false);
      return;
    }
    if (!patientId) {
      setData(EMPTY_PATIENT_CLINICAL_MEMORY);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPatientClinicalMemory(patientId);
      setData(result);
    } catch (e) {
      setData(EMPTY_PATIENT_CLINICAL_MEMORY);
      setError(e instanceof Error ? e.message : "Error al cargar memoria clínica");
    } finally {
      setLoading(false);
    }
  }, [enabled, initialData, patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
