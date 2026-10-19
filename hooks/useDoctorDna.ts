"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDoctorDnaProfile } from "@/lib/services/doctor-dna";
import type { DoctorDnaProfile } from "@/lib/types/doctor-dna";

const EMPTY: DoctorDnaProfile = {
  doctorId: "",
  topDiagnoses: [],
  topMedications: [],
  topLabs: [],
  topFollowUps: [],
  practiceMetrics: {
    consultations30d: 0,
    prescriptions30d: 0,
    labOrders30d: 0,
    uniquePatients30d: 0,
    generatedAt: "",
  },
};

export function useDoctorDna() {
  const [data, setData] = useState<DoctorDnaProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDoctorDnaProfile();
      setData(result);
    } catch (e) {
      setData(EMPTY);
      setError(e instanceof Error ? e.message : "Error al cargar Doctor DNA");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
