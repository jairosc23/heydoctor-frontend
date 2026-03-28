"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  fetchClinicMe,
  createConsultation,
  fetchConsultations,
} from "@/lib/services";
import { silentCatch } from "@/lib/handle-error";

interface ConsultationContextValue {
  consultationId: string | null;
  patientId: string | null;
  clinicId: string | null;
  doctorId: string | null;
  clinicName: string;
  isLoading: boolean;
  /** Borrador de notas clínicas (UI); la IA puede hacer append inteligente. */
  clinicalNotes: string;
  setClinicalNotes: Dispatch<SetStateAction<string>>;
  appendNotesFromAi: (block: string) => void;
  /** Texto libre de diagnóstico en curso (picker + clics desde IA). */
  clinicalDiagnosisText: string;
  setClinicalDiagnosisText: (value: string) => void;
  appendDiagnosisLineFromAi: (line: string) => void;
  setPatient: (patientId: string | null) => void;
  startConsultation: (patientId: string) => Promise<string | null>;
  endConsultation: () => void;
  refreshConsultation: () => void;
}

const ConsultationContext = createContext<ConsultationContextValue | undefined>(
  undefined
);

const DEFAULT_CONSULTATION_REASON = "Consulta iniciada desde panel HeyDoctor";

export function ConsultationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [clinicalDiagnosisText, setClinicalDiagnosisText] = useState("");

  const appendNotesFromAi = useCallback((block: string) => {
    const t = block.trim();
    if (!t) return;
    setClinicalNotes((prev) => {
      const p = prev.trim();
      if (!p) return t;
      if (p.includes(t)) return prev;
      return `${p}\n\n✦ IA\n${t}`;
    });
  }, []);

  const appendDiagnosisLineFromAi = useCallback((line: string) => {
    const L = line.trim();
    if (!L) return;
    setClinicalDiagnosisText((prev) => {
      const p = prev.trim();
      if (!p) return L;
      if (p.includes(L)) return prev;
      return `${p}\n• ${L}`;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchClinicMe()
      .then(({ clinic, doctor }) => {
        if (cancelled) return;
        setClinicId(clinic?.id ?? null);
        setDoctorId(doctor?.id ?? null);
        setClinicName(clinic?.name ?? "");
      })
      .catch(() => {
        if (!cancelled) {
          setClinicId(null);
          setDoctorId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setPatient = useCallback((id: string | null) => {
    setPatientId(id);
    if (!id) setConsultationId(null);
  }, []);

  const startConsultation = useCallback(
    async (pid: string): Promise<string | null> => {
      if (!doctorId) return null;
      try {
        const res = await createConsultation({
          patientId: pid,
          reason: DEFAULT_CONSULTATION_REASON,
        });
        const cid = res?.id ?? null;
        if (cid) {
          setConsultationId(cid);
          setPatientId(pid);
          setClinicalNotes("");
          setClinicalDiagnosisText("");
          return cid;
        }
        return null;
      } catch {
        return null;
      }
    },
    [doctorId]
  );

  const endConsultation = useCallback(() => {
    setConsultationId(null);
    setPatientId(null);
    setClinicalNotes("");
    setClinicalDiagnosisText("");
  }, []);

  const refreshConsultation = useCallback(() => {
    if (!patientId) return;
    fetchConsultations({ patientId, status: "in_progress" })
      .then(({ data }) => {
        const active = data.find((c) => c.status === "in_progress");
        if (active) setConsultationId(active.id);
      })
      .catch(silentCatch("refreshConsultation"));
  }, [patientId]);

  const value = useMemo(
    () => ({
      consultationId,
      patientId,
      clinicId,
      doctorId,
      clinicName,
      isLoading,
      clinicalNotes,
      setClinicalNotes,
      appendNotesFromAi,
      clinicalDiagnosisText,
      setClinicalDiagnosisText,
      appendDiagnosisLineFromAi,
      setPatient: setPatientId,
      startConsultation,
      endConsultation,
      refreshConsultation,
    }),
    [
      consultationId,
      patientId,
      clinicId,
      doctorId,
      clinicName,
      isLoading,
      clinicalNotes,
      appendNotesFromAi,
      clinicalDiagnosisText,
      appendDiagnosisLineFromAi,
      startConsultation,
      endConsultation,
      refreshConsultation,
    ]
  );

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  const ctx = useContext(ConsultationContext);
  if (ctx === undefined) {
    throw new Error("useConsultation must be used within ConsultationProvider");
  }
  return ctx;
}
