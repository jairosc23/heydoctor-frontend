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
  fetchTelemedicineConsentStatus,
  isConsentRequiredError,
  recordTelemedicineConsent,
} from "@/lib/services";
import { TelemedicineConsentModal } from "@/components/clinical/TelemedicineConsentModal";
import { silentCatch } from "@/lib/handle-error";
import { trackConsultationStartedDeduped } from "@/lib/analytics";
import { ApiError, getApiErrorMessage } from "@/lib/heydoctor-api";

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
  /** Último error en el flujo de inicio de consulta, para mostrar en UI. */
  startError: string | null;
  clearStartError: () => void;
  /** `true` si el médico ya firmó la versión vigente del consentimiento. */
  hasTelemedicineConsent: boolean | null;
}

const ConsultationContext = createContext<ConsultationContextValue | undefined>(
  undefined,
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
  const [hasTelemedicineConsent, setHasTelemedicineConsent] = useState<
    boolean | null
  >(null);
  const [consentVersion, setConsentVersion] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  // Estado del modal de consentimiento; resolver/rejecter del Promise pendiente
  // que mantiene a `startConsultation` esperando la decisión del usuario.
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [consentResolver, setConsentResolver] = useState<{
    resolve: (accepted: boolean) => void;
  } | null>(null);

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

  // Bootstrap del estado de consentimiento del médico (versión vigente).
  useEffect(() => {
    let cancelled = false;
    fetchTelemedicineConsentStatus()
      .then(({ hasConsent, version }) => {
        if (cancelled) return;
        setHasTelemedicineConsent(Boolean(hasConsent));
        setConsentVersion(version || null);
      })
      .catch(() => {
        if (!cancelled) setHasTelemedicineConsent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const setPatient = useCallback((id: string | null) => {
    setPatientId(id);
    if (!id) setConsultationId(null);
  }, []);

  /**
   * Devuelve un Promise que se resuelve cuando el usuario acepta o cancela el modal.
   * Solo abre uno a la vez (el segundo caller espera al mismo resolver).
   */
  const requestConsentDecision = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConsentResolver({ resolve });
      setConsentModalOpen(true);
    });
  }, []);

  const handleConsentAccept = useCallback(async () => {
    await recordTelemedicineConsent();
    setHasTelemedicineConsent(true);
    setConsentModalOpen(false);
    consentResolver?.resolve(true);
    setConsentResolver(null);
  }, [consentResolver]);

  const handleConsentCancel = useCallback(() => {
    setConsentModalOpen(false);
    consentResolver?.resolve(false);
    setConsentResolver(null);
  }, [consentResolver]);

  const clearStartError = useCallback(() => setStartError(null), []);

  const startConsultation = useCallback(
    async (pid: string): Promise<string | null> => {
      if (!doctorId) return null;
      setStartError(null);

      // Si ya sabemos que falta consentimiento (cache local), pedirlo antes del POST.
      if (hasTelemedicineConsent === false) {
        const accepted = await requestConsentDecision();
        if (!accepted) {
          setStartError(
            "Debes aceptar el consentimiento de telemedicina para iniciar consultas.",
          );
          return null;
        }
      }

      const dto = {
        patientId: pid,
        chiefComplaint: DEFAULT_CONSULTATION_REASON,
      };

      const tryCreate = async () => createConsultation(dto);

      let res;
      try {
        res = await tryCreate();
      } catch (err) {
        // Fallback: el backend nos dice que falta el consentimiento (cache out of sync).
        if (isConsentRequiredError(err)) {
          setHasTelemedicineConsent(false);
          const accepted = await requestConsentDecision();
          if (!accepted) {
            setStartError(
              "Debes aceptar el consentimiento de telemedicina para iniciar consultas.",
            );
            return null;
          }
          try {
            res = await tryCreate();
          } catch (retryErr) {
            const msg = getApiErrorMessage(
              retryErr,
              "No se pudo iniciar la consulta. Inténtalo de nuevo.",
            );
            setStartError(msg);
            return null;
          }
        } else {
          const msg = getApiErrorMessage(
            err,
            "No se pudo iniciar la consulta. Inténtalo de nuevo.",
          );
          setStartError(msg);
          if (err instanceof ApiError && err.status === 401) {
            // Surface explícito si la sesión expiró durante el flujo.
            setStartError(
              `${msg} Vuelve a iniciar sesión para continuar.`,
            );
          }
          return null;
        }
      }

      const cid = res?.id ?? null;
      if (cid) {
        void trackConsultationStartedDeduped(cid, {
          source: "panel_create",
          patientId: pid,
        });
        setConsultationId(cid);
        setPatientId(pid);
        setClinicalNotes("");
        setClinicalDiagnosisText("");
        return cid;
      }
      return null;
    },
    [doctorId, hasTelemedicineConsent, requestConsentDecision],
  );

  const endConsultation = useCallback(() => {
    setConsultationId(null);
    setPatientId(null);
    setClinicalNotes("");
    setClinicalDiagnosisText("");
  }, []);

  const refreshConsultation = useCallback(() => {
    if (!patientId) return;
    fetchConsultations({ patientId, status: "IN_PROGRESS" })
      .then(({ data }) => {
        const active = data.find(
          (c) => c.status === "in_progress" || c.status === "IN_PROGRESS",
        );
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
      startError,
      clearStartError,
      hasTelemedicineConsent,
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
      startError,
      clearStartError,
      hasTelemedicineConsent,
    ],
  );

  return (
    <ConsultationContext.Provider value={value}>
      {children}
      <TelemedicineConsentModal
        open={consentModalOpen}
        version={consentVersion}
        onAccept={handleConsentAccept}
        onCancel={handleConsentCancel}
      />
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
