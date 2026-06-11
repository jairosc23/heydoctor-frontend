"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPatientClinicalMemory } from "@/lib/services/clinical-memory";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";

const EMPTY: PatientClinicalMemory = {
  patientId: "",
  activeConditions: [],
  recentDiagnoses: [],
  currentMedications: [],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [],
};

export function usePatientClinicalMemory(patientId?: string | null) {
  const [data, setData] = useState<PatientClinicalMemory>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!patientId) {
      setData(EMPTY);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPatientClinicalMemory(patientId);
      setData(result);
    } catch (e) {
      setData(EMPTY);
      setError(e instanceof Error ? e.message : "Error al cargar memoria clínica");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
