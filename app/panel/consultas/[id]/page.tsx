"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  fetchConsultation,
  updateConsultation,
  signConsultation,
  startCall,
  type NestConsultation,
} from "@/lib/services/consultations";
import { adoptConsultationSignatureEcho } from "@/lib/consultation-signature";
import { submitHabDecision } from "@/lib/hab-authority/api";
import {
  buildSoapDraftKey,
  buildSoapPatch,
  diagnosisStateFromDraftItem,
  emptyDiagnosisState,
  hydrateDiagnosisFromConsultation,
  hydrateDiagnosisFromPatchEcho,
  soapPatchFingerprint,
  structuredDiagnosisFromPicker,
  type ConsultationDiagnosisState,
} from "@/lib/services/consultation-diagnosis";
import { useConsultation } from "@/context/ConsultationContext";
import {
  createPaymentSession,
  fetchConsultationPaymentStatus,
} from "@/lib/services/payments";
import {
  trackConsultationCompletedIfNeeded,
  trackConsultationPaid,
  trackConsultationStartedDeduped,
  trackEvent,
} from "@/lib/analytics";
import { useConsultationPrice } from "@/lib/hooks/useConsultationPrice";
import { useConsultationAutosave } from "@/lib/hooks/useConsultationAutosave";
import { useTimeoutRegistry } from "@/lib/hooks/useTimeoutRegistry";
import { ApiError, getApiErrorMessage } from "@/lib/heydoctor-api";
import { toClinicalUserError } from "@/lib/clinical-user-error";
import { createPersistGate } from "@/lib/unsaved-changes-guard/persist-gate";
import { useUnsavedChangesGuard } from "@/lib/unsaved-changes-guard/unsaved-changes-guard-context";
import {
  fetchPatientById,
  fetchPatientProfile,
  type PatientProfile,
  type PatientRow,
} from "@/lib/services/patients";
import {
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import { getConsultationAccessErrorMessage } from "@/lib/consultation-access-errors";
import { toPaymentUserMessage } from "@/lib/payment-user-errors";
import { getWhatsAppUrlWithCustomMessage } from "@/lib/whatsapp-url";
import {
  ConsultationConsentCard,
  ShareConsultationDialog,
} from "@/components/clinical";
import {
  deleteConsultation,
  downloadConsultationPdf,
  generateConsultationInvoice,
  generatePremiumDocument,
  generateSignedMedicalCertificate,
  generateSignedPrescription,
  generateSignedReferral,
  type ActionResult,
} from "@/lib/services/consultation-actions";
import {
  composeEncounterNotes,
  parseEncounterNotes,
} from "@/lib/compose-encounter-notes";
import { useClinicalFoundation } from "@/hooks/useClinicalFoundation";
import { useEncounterNotesDraft } from "@/hooks/useEncounterNotesDraft";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { PatientContextRail } from "./_components/PatientContextRail";
import { EncounterHeader } from "./_components/EncounterHeader";
import { StickyPatientHeader } from "./_components/StickyPatientHeader";
import { ClinicalCopilotDrawer } from "./_components/copilot/ClinicalCopilotDrawer";
import { HeyDoctorCopilotRuntimeProviders } from "@/components/copilot/HeyDoctorCopilotRuntimeProviders";
import { DoctorDnaDrawer } from "./_components/DoctorDnaDrawer";
import type { UnifiedPlanApplyResult } from "@/lib/types/unified-clinical-plan";
import { ConsultationClinicalProviders } from "./_components/ConsultationClinicalProviders";
import { CopilotNavigationProvider } from "@/context/CopilotNavigationContext";
import { ClinicalIntelligenceSync } from "./_components/ClinicalIntelligenceSync";
import type { EncounterLeftPaneTab } from "./_components/EncounterLeftPane";
import type { EncounterRightPaneTab } from "./_components/EncounterRightPane";
import {
  ConsultationWorkspace,
  type WorkspaceTab,
} from "./_components/ConsultationWorkspace";
import type { OrdersSubTab } from "./_components/OrdersTab";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { LiquidClinicalWorkspaceShell } from "@/components/aec1/liquid/LiquidClinicalWorkspaceShell";
import { isClinicalActionWorkspaceEnabled } from "@/lib/clinical-action-workspace";
import { isSmartClinicalWorkspaceEnabled } from "@/lib/smart-clinical-workspace";
import {
  buildConsultationDocumentDisabled,
  resolveCanPay,
} from "@/lib/consultation-production-gates";
import type { ClinicalActionModuleId } from "@/lib/clinical-action-workspace";
import { ClinicalActionBar } from "./_components/action-workspace/ClinicalActionBar";
import { useEncounterFullRecordNavigation } from "@/hooks/useEncounterFullRecordNavigation";
import { useEncounterContextBind } from "@/hooks/useEncounterContextBind";
import { EncounterFullRecordOverlay } from "@/components/encounter/EncounterFullRecordOverlay";
import {
  formatClinicalVitalSignsForContext,
  parseClinicalVitalSignsFromNotes,
} from "@/lib/clinical-vital-signs-context";
import type { ClinicalContextSupplement } from "@/lib/clinical-context-engine";
import {
  ClinicalActionWorkspaceProvider,
  type ClinicalActionWorkspaceContextValue,
} from "./_components/action-workspace/ClinicalActionWorkspaceProvider";
import { ClinicalModuleSheet } from "./_components/action-workspace/ClinicalModuleSheet";
import { ClinicalModuleSheetContent } from "./_components/action-workspace/ClinicalModuleSheetContent";
import { EncounterChromeShell } from "./_components/EncounterChromeShell";
import { buildEncounterContextBarModel } from "./_components/encounter-context-bar-model";

const clinicalActionWorkspaceEnabled = isClinicalActionWorkspaceEnabled();
const smartClinicalWorkspaceEnabled = isSmartClinicalWorkspaceEnabled();

function paymentFailureUserMessage(err: unknown): string {
  return toPaymentUserMessage(
    err,
    "No pudimos iniciar el pago. Revisa tu conexión e inténtalo de nuevo.",
  );
}

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeouts = useTimeoutRegistry();
  const id = params.id as string;
  const consultationPrice = useConsultationPrice();
  const { clinicId: ctxClinicId, attachConsultationSession } =
    useConsultation();

  const [consultation, setConsultation] = useState<NestConsultation | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState("");
  const [diagnosisState, setDiagnosisState] =
    useState<ConsultationDiagnosisState>(emptyDiagnosisState());
  const [treatment, setTreatment] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  /** Signature feedback — never share lifecycle with manual save copy. */
  const [signMsg, setSignMsg] = useState("");
  const [manualSaveStatus, setManualSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [manualLastSavedAt, setManualLastSavedAt] = useState<Date | null>(null);
  const ignoreManualSaveDraftResetRef = useRef(false);

  const [transitioning, setTransitioning] = useState(false);
  const [signing, setSigning] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "confirm">("idle");

  const [chiefComplaintDraft, setChiefComplaintDraft] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("soap");
  const [leftPaneTab, setLeftPaneTab] = useState<EncounterLeftPaneTab>("soap");
  const [rightPaneTab, setRightPaneTab] =
    useState<EncounterRightPaneTab>("orders");
  const [ordersSubTab, setOrdersSubTab] =
    useState<OrdersSubTab>("prescriptions");
  const [ordersHighlight, setOrdersHighlight] = useState(false);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [ordersPanelExpandSignal, setOrdersPanelExpandSignal] = useState(0);
  const clinicalActionWorkspaceNavRef =
    useRef<ClinicalActionWorkspaceContextValue | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  function openClinicalModule(moduleId: ClinicalActionModuleId) {
    clinicalActionWorkspaceNavRef.current?.openModule(moduleId);
  }

  const [actionLoading, setActionLoading] = useState({
    invoice: false,
    pdf: false,
    deleting: false,
    signedPrescription: false,
    signedCertificate: false,
    signedReferral: false,
    premium: false,
  });
  const [actionMsg, setActionMsg] = useState<{
    kind: "info" | "success" | "warning" | "error";
    text: string;
    href?: string;
  } | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [dnaDrawerOpen, setDnaDrawerOpen] = useState(false);
  const [copilotDrawerOpen, setCopilotDrawerOpen] = useState(false);
  const [continuityOpen, setContinuityOpen] = useState(false);
  const {
    fullRecordOpen,
    openFullRecord: openFullRecordNav,
    closeFullRecord,
    dismissFullRecordForExit,
  } = useEncounterFullRecordNavigation();

  /** Tear down every Encounter surface overlay without remounting Runtime. */
  const closeEncounterOverlays = useCallback(() => {
    setContinuityOpen(false);
    setCopilotDrawerOpen(false);
    setDnaDrawerOpen(false);
    setShareOpen(false);
    clinicalActionWorkspaceNavRef.current?.closeSheet();
    dismissFullRecordForExit();
  }, [dismissFullRecordForExit]);

  const openFullRecord = useCallback(() => {
    setContinuityOpen(false);
    setCopilotDrawerOpen(false);
    setDnaDrawerOpen(false);
    clinicalActionWorkspaceNavRef.current?.closeSheet();
    openFullRecordNav();
  }, [openFullRecordNav]);

  const handleContinuityOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setCopilotDrawerOpen(false);
        setDnaDrawerOpen(false);
        clinicalActionWorkspaceNavRef.current?.closeSheet();
        closeFullRecord();
      }
      setContinuityOpen(open);
    },
    [closeFullRecord],
  );

  const [generativeExpandToken, setGenerativeExpandToken] = useState(0);
  /** EPIC-3 UC-01: auto-open Daily Hub once per consultation mount for Prep context. */
  const preVisitAutoOpenedRef = useRef(false);
  const { register, requestNavigation } = useUnsavedChangesGuard();
  const persistGateRef = useRef(createPersistGate());

  const [patientRow, setPatientRow] = useState<PatientRow | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    null,
  );
  const [patientContextLoading, setPatientContextLoading] = useState(false);
  const [patientContextError, setPatientContextError] = useState<string | null>(
    null,
  );
  const [antecedentsDraftKey, setAntecedentsDraftKey] = useState("");
  const [antecedentsDirty, setAntecedentsDirty] = useState(false);
  const antecedentsRef = useRef<{
    flush: () => Promise<boolean>;
    getDraftKey: () => string;
    isDirty: () => boolean;
    abandon: () => void;
  } | null>(null);

  const paymentResult = searchParams.get("payment");
  const prevStatusRef = React.useRef<string | undefined>(undefined);
  const consultationRef = React.useRef<NestConsultation | null>(null);
  const lastPersistedPatchRef = React.useRef<string | null>(null);

  const {
    vitals,
    setVitals,
    physicalExam,
    setPhysicalExam,
    presentIllnessHistory,
    setPresentIllnessHistory,
    composeNotes,
  } = useEncounterNotesDraft(
    consultation?.notes ?? null,
    notes,
    consultation?.id,
  );

  useEffect(() => {
    prevStatusRef.current = undefined;
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const c = await fetchConsultation(id);
      const st = c.status ?? "draft";
      trackConsultationCompletedIfNeeded(prevStatusRef.current, st, id);
      prevStatusRef.current = st;
      void trackConsultationStartedDeduped(id, {
        status: st,
        source: "detail",
      });
      setConsultation(c);
      const parsedNotes = parseEncounterNotes(c.notes);
      setNotes(parsedNotes.clinicalRecord.freeNotes);
      setDiagnosisState(hydrateDiagnosisFromConsultation(c));
      setTreatment(c.treatmentPlan ?? c.treatment ?? "");
      setChiefComplaintDraft(c.chiefComplaint ?? c.reason ?? "");
      const loadedComposed = composeEncounterNotes({
        ...parsedNotes,
        clinicalRecord: {
          ...parsedNotes.clinicalRecord,
          freeNotes: parsedNotes.clinicalRecord.freeNotes.trim(),
        },
      });
      lastPersistedPatchRef.current = soapPatchFingerprint(
        buildSoapPatch({
          notes: loadedComposed.length > 0 ? loadedComposed : undefined,
          treatment: (c.treatmentPlan ?? c.treatment ?? "").trim() || undefined,
          diagnosis: hydrateDiagnosisFromConsultation(c),
        }),
      );
    } catch (err) {
      setError(getConsultationAccessErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    consultationRef.current = consultation;
  }, [consultation]);

  useEffect(() => {
    const cid = consultation?.id;
    const pid = consultation?.patientId;
    if (!cid || !pid) return;
    attachConsultationSession(cid, pid);
  }, [consultation?.id, consultation?.patientId, attachConsultationSession]);

  useEncounterContextBind(consultation?.id ?? null);

  useEffect(() => {
    const patientId = consultation?.patientId;
    if (!patientId) {
      setPatientRow(null);
      setPatientProfile(null);
      setPatientContextLoading(false);
      setPatientContextError(null);
      return;
    }

    let cancelled = false;
    setPatientContextLoading(true);
    setPatientContextError(null);

    void (async () => {
      try {
        const [patient, profileResult] = await Promise.all([
          fetchPatientById(patientId),
          fetchPatientProfile(patientId).then(
            (profile) => ({ ok: true as const, profile }),
            (err) => ({ ok: false as const, err }),
          ),
        ]);
        if (cancelled) return;
        setPatientRow(patient);
        if (profileResult.ok) {
          setPatientProfile(profileResult.profile);
        } else {
          setPatientProfile(null);
          console.warn(
            "[encounter] patient profile load failed",
            profileResult.err,
          );
          setPatientContextError(
            "No se pudo cargar la ficha del paciente. Los antecedentes pueden estar incompletos.",
          );
        }
      } catch (err) {
        if (cancelled) return;
        setPatientRow(null);
        setPatientProfile(null);
        setPatientContextError(
          getApiErrorMessage(
            err,
            "No se pudo cargar el contexto del paciente.",
          ),
        );
      } finally {
        if (!cancelled) setPatientContextLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultation?.patientId]);

  useEffect(() => {
    if (paymentResult !== "success" && paymentResult !== "mock") return;
    let cancelled = false;
    void (async () => {
      try {
        const st = await fetchConsultationPaymentStatus(id);
        if (cancelled) return;
        setPaymentStep("idle");
        if (st.isPaid) {
          setSaveMsg("Pago confirmado.");
          timeouts.set(() => setSaveMsg(""), 5000);
        } else if (st.hasPending) {
          setSaveMsg(
            "Pago en proceso de confirmación. Actualiza en unos segundos o revisa el estado de la consulta.",
          );
          timeouts.set(() => setSaveMsg(""), 8000);
        } else {
          setSaveMsg(
            "No confirmamos un pago completado todavía. Si ya pagaste, espera la confirmación; si no, puedes intentar de nuevo.",
          );
          timeouts.set(() => setSaveMsg(""), 8000);
        }
      } catch {
        if (!cancelled) {
          setSaveMsg(
            "No pudimos verificar el pago. Revisa tu conexión o vuelve a intentar más tarde.",
          );
          timeouts.set(() => setSaveMsg(""), 8000);
        }
      } finally {
        if (!cancelled) {
          router.replace(`/panel/consultas/${id}`, { scroll: false });
          await load();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentResult, id, router, load]);

  useEffect(() => {
    setPaymentStep("idle");
  }, [id]);

  const status = consultation?.status ?? "draft";
  const patientName =
    consultation?.patient?.name || consultation?.patient?.email || "Paciente";
  const encounterDiagnosis =
    diagnosisState.diagnosisDescription || diagnosisState.diagnosis || null;
  const patientClinicalMemoryState = usePatientClinicalMemory(
    consultation?.patientId,
  );
  const clinicalFoundationState = useClinicalFoundation(consultation?.id ?? id);
  const clinicalFoundation = clinicalFoundationState.data;
  const effectiveClinicalMemory =
    clinicalFoundation?.memory ?? patientClinicalMemoryState.data;

  // UC-01: surface Prep context automatically in Daily Hub (read-only). No generative expand.
  useEffect(() => {
    if (preVisitAutoOpenedRef.current) return;
    if (!consultation?.id) return;
    if (clinicalFoundationState.loading) return;
    preVisitAutoOpenedRef.current = true;
    setCopilotDrawerOpen(true);
  }, [consultation?.id, clinicalFoundationState.loading]);
  const effectiveClinicalMemoryLoading =
    clinicalFoundationState.loading && !clinicalFoundation
      ? true
      : patientClinicalMemoryState.loading;
  const effectiveClinicalMemoryError =
    clinicalFoundation?.memory != null
      ? null
      : (clinicalFoundationState.error ?? patientClinicalMemoryState.error);
  const clinicalFoundationOutputs = clinicalFoundation?.outputs ?? null;
  const encounterContextModel = useMemo(
    () =>
      buildEncounterContextBarModel({
        patient: patientRow,
        profile: patientProfile,
        fallbackName: patientName,
        status,
        diagnosis: encounterDiagnosis,
        memory: effectiveClinicalMemory,
      }),
    [
      encounterDiagnosis,
      effectiveClinicalMemory,
      patientName,
      patientProfile,
      patientRow,
      status,
    ],
  );
  const isEditable = status === "draft" || status === "in_progress";
  const canSign = status === "in_progress" || status === "completed";
  const isSigned = status === "signed" || status === "locked";
  const isLocked = status === "locked";
  const canStartCall = status === "draft" || status === "in_progress";
  const canPay = resolveCanPay(status);
  const documentDisabled = buildConsultationDocumentDisabled({
    isSigned,
    isLocked,
  });

  const persistSoapDraft = useCallback(
    async (diagnosisOverride?: ConsultationDiagnosisState) => {
      if (!persistGateRef.current.shouldPersist()) return;
      const currentConsultation = consultationRef.current;
      if (!currentConsultation || !isEditable) return;
      const diagnosis = diagnosisOverride ?? diagnosisState;
      const merged = composeNotes();
      const patch = buildSoapPatch({
        notes: merged.length > 0 ? merged : undefined,
        treatment: treatment.trim() || undefined,
        diagnosis,
      });
      const patchFingerprint = soapPatchFingerprint(patch);
      const soapUnchanged = patchFingerprint === lastPersistedPatchRef.current;
      if (!soapUnchanged) {
        if (!persistGateRef.current.shouldPersist()) return;
        const updated = await updateConsultation(id, patch);
        lastPersistedPatchRef.current = patchFingerprint;
        const adopted = adoptConsultationSignatureEcho(
          consultationRef.current,
          updated,
        );
        setConsultation(adopted);
        consultationRef.current = adopted;
        const nextDiagnosis = hydrateDiagnosisFromPatchEcho(updated, diagnosis);
        setDiagnosisState((prev) => {
          const prevKey = buildSoapDraftKey({
            notes,
            treatment,
            diagnosis: prev,
          });
          const nextKey = buildSoapDraftKey({
            notes,
            treatment,
            diagnosis: nextDiagnosis,
          });
          return prevKey === nextKey ? prev : nextDiagnosis;
        });
      }
      if (!persistGateRef.current.shouldPersist()) return;
      // Patient profile SoT (antecedentes) — independent of SOAP fingerprint.
      const profileSaved = Boolean(await antecedentsRef.current?.flush());
      // Recalculate Documentation Gaps / UC-03B from persisted notes SoT.
      if (!soapUnchanged || profileSaved) {
        await clinicalFoundationState.reload();
      }
    },
    [
      notes,
      treatment,
      diagnosisState,
      id,
      isEditable,
      composeNotes,
      clinicalFoundationState.reload,
    ],
  );

  const soapDraftKey = buildSoapDraftKey({
    notes,
    treatment,
    diagnosis: diagnosisState,
    vitals,
    physicalExam,
    presentIllnessHistory,
    antecedentsDraftKey,
  });

  const {
    lastSavedAt,
    status: autosaveStatus,
    errorMessage: autosaveError,
    flushNow,
    isDraftDirty,
    abandon: abandonAutosave,
  } = useConsultationAutosave({
    enabled: isEditable && Boolean(consultation),
    draftKey: soapDraftKey,
    debounceMs: 900,
    save: persistSoapDraft,
  });

  const effectiveLastSavedAt = (() => {
    if (manualLastSavedAt && lastSavedAt) {
      return manualLastSavedAt.getTime() >= lastSavedAt.getTime()
        ? manualLastSavedAt
        : lastSavedAt;
    }
    return manualLastSavedAt ?? lastSavedAt ?? null;
  })();

  const hasUnsavedClinicalChanges =
    antecedentsDirty ||
    isDraftDirty ||
    autosaveStatus === "pending" ||
    autosaveStatus === "saving" ||
    manualSaveStatus === "saving";

  useEffect(() => {
    // Keep success/error visible after save; ignore the draft-key bump caused by flush itself.
    if (ignoreManualSaveDraftResetRef.current) {
      ignoreManualSaveDraftResetRef.current = false;
      return;
    }
    setManualSaveStatus((status) => {
      if (status === "saving" || status === "error") return status;
      if (status === "saved") return "idle";
      return "idle";
    });
  }, [soapDraftKey]);

  useEffect(() => {
    if (manualSaveStatus !== "saved") return;
    const timer = window.setTimeout(() => {
      setManualSaveStatus((status) => (status === "saved" ? "idle" : status));
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [manualSaveStatus]);

  // Persistencia determinística al ocultar/cerrar pestaña (antes de F5 / navegación).
  useEffect(() => {
    const persistAntecedents = () => {
      if (!persistGateRef.current.shouldPersist()) return;
      if (antecedentsRef.current?.isDirty()) {
        void antecedentsRef.current.flush().catch((err) => {
          console.warn("[antecedents] flush on hide failed", err);
        });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persistAntecedents();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", persistAntecedents);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", persistAntecedents);
    };
  }, []);

  async function persistAntecedentsOrThrow(
    hadDirty: boolean,
  ): Promise<boolean> {
    if (!persistGateRef.current.shouldPersist()) return false;
    const handle = antecedentsRef.current;
    if (hadDirty && !handle) {
      throw new Error(
        "No se pudieron guardar los antecedentes (ficha no disponible). Recargue e intente Guardar.",
      );
    }
    if (!handle) return false;
    const profileSaved = Boolean(await handle.flush());
    if (handle.isDirty()) {
      throw new Error(
        "Los antecedentes no se sincronizaron. Intente Guardar de nuevo.",
      );
    }
    return profileSaved;
  }

  async function handleManualSave() {
    if (!isEditable || !consultation) return;
    if (manualSaveStatus === "saving") return;
    setManualSaveStatus("saving");
    const hadAntecedentsDirty =
      antecedentsDirty || Boolean(antecedentsRef.current?.isDirty());
    const hadSoapDirty = isDraftDirty;
    try {
      const flushResult = await flushNow();
      // Force antecedentes even if SOAP fingerprint was already clean.
      const profileSaved = await persistAntecedentsOrThrow(hadAntecedentsDirty);
      // Foundation reload is advisory — must not flip a verified write to failure.
      try {
        await clinicalFoundationState.reload();
      } catch (foundationErr) {
        console.warn("[encounter] foundation reload after save", foundationErr);
      }
      const verified =
        flushResult.wrote ||
        flushResult.alreadyPersisted ||
        profileSaved ||
        (!hadSoapDirty && !hadAntecedentsDirty);
      if (!verified) {
        throw new Error(
          "No se confirmó la escritura. Intente Guardar de nuevo.",
        );
      }
      ignoreManualSaveDraftResetRef.current = true;
      const savedAt = new Date();
      setManualLastSavedAt(savedAt);
      setManualSaveStatus("saved");
      setAntecedentsDirty(false);
      setSaveMsg(
        profileSaved || hadAntecedentsDirty
          ? "Consulta guardada. Antecedentes del paciente actualizados."
          : "Consulta guardada.",
      );
    } catch (err) {
      setManualSaveStatus("error");
      setSaveMsg(
        err instanceof Error
          ? err.message
          : "No se pudo guardar. Intente de nuevo.",
      );
    }
  }

  useEffect(() => {
    return register({
      isDirty: () =>
        antecedentsDirty ||
        Boolean(antecedentsRef.current?.isDirty()) ||
        isDraftDirty ||
        manualSaveStatus === "saving",
      save: async () => {
        if (!consultation) return;
        const hadAntecedentsDirty =
          antecedentsDirty || Boolean(antecedentsRef.current?.isDirty());
        if (isEditable) {
          const flushResult = await flushNow();
          await persistAntecedentsOrThrow(hadAntecedentsDirty);
          try {
            await clinicalFoundationState.reload();
          } catch (foundationErr) {
            console.warn(
              "[encounter] foundation reload after exit-save",
              foundationErr,
            );
          }
          if (hadAntecedentsDirty && antecedentsRef.current?.isDirty()) {
            throw new Error(
              "Los antecedentes no se sincronizaron. Intente Guardar de nuevo.",
            );
          }
          if (
            isDraftDirty &&
            !flushResult.wrote &&
            !flushResult.alreadyPersisted
          ) {
            throw new Error(
              "No se confirmó la escritura. Intente Guardar de nuevo.",
            );
          }
          return;
        }
        if (hadAntecedentsDirty) {
          await persistAntecedentsOrThrow(true);
        }
      },
      discard: () => {
        persistGateRef.current.discard();
        antecedentsRef.current?.abandon();
        abandonAutosave();
      },
    });
  });

  async function handleTransition() {
    if (!consultation) return;
    const nextStatus: Record<string, string> = {
      draft: "in_progress",
      in_progress: "completed",
    };
    const next = nextStatus[consultation.status ?? ""];
    if (!next) return;
    setTransitioning(true);
    try {
      if (isEditable) {
        await flushNow();
      }
      await persistAntecedentsOrThrow(
        antecedentsDirty || Boolean(antecedentsRef.current?.isDirty()),
      );
      const prev = consultation.status ?? prevStatusRef.current;
      const updated = await updateConsultation(id, { status: next });
      const st = updated.status ?? "";
      trackConsultationCompletedIfNeeded(prev, st, id);
      prevStatusRef.current = st;
      setConsultation(updated);
    } catch (err) {
      setSaveMsg(toClinicalUserError(err, "Error al cambiar estado"));
    } finally {
      setTransitioning(false);
    }
  }

  async function handleSign(base64: string) {
    if (!consultation) return;
    // Unique legal-close writer: POST /consultations/:id/sign only.
    if (status !== "in_progress" && status !== "completed") {
      setSignMsg(
        `No se puede firmar la consulta en estado "${status}". Pásela a En progreso o Completada.`,
      );
      return;
    }
    setSigning(true);
    setSignMsg("");
    try {
      // Always drain dirty drafts before legal close (even if edit session closed).
      if (isEditable || isDraftDirty) {
        await flushNow();
      }
      abandonAutosave();
      await persistAntecedentsOrThrow(
        antecedentsDirty || Boolean(antecedentsRef.current?.isDirty()),
      );
      const prev = consultation.status ?? prevStatusRef.current;
      // W1.1 C2/C5 — HAB Confirm then sign (no HAB bypass).
      const hab = await submitHabDecision({
        consultationId: id,
        kind: "confirm",
        actKind: "documentation_finalize",
        rationale: "Physician confirms consultation legal sign",
      });
      const signed = await signConsultation(id, base64, {
        habDecisionId: hab.decisionId,
      });
      const confirmed = adoptConsultationSignatureEcho(
        signed,
        await fetchConsultation(id),
      );
      const st = confirmed.status ?? "";
      if (st !== "signed" && st !== "locked") {
        throw new Error(
          `El cierre legal no actualizó el estado (recibido: "${st || "vacío"}").`,
        );
      }
      if (!confirmed.doctorSignature) {
        throw new Error(
          "El cierre legal no persistió la firma. Recargue e intente de nuevo.",
        );
      }
      trackConsultationCompletedIfNeeded(prev, st, id);
      prevStatusRef.current = st;
      setConsultation(confirmed);
      consultationRef.current = confirmed;
      setSignMsg(
        confirmed.signedAt
          ? `Consulta firmada el ${new Date(confirmed.signedAt).toLocaleString(
              "es-CL",
              {
                dateStyle: "medium",
                timeStyle: "short",
              },
            )}.`
          : "Consulta firmada correctamente. Cierre legal registrado.",
      );
      void clinicalFoundationState.reload();
    } catch (err) {
      setSignMsg(err instanceof Error ? err.message : "Error al firmar");
      throw err;
    } finally {
      setSigning(false);
    }
  }

  const handlePlanApplied = useCallback((result: UnifiedPlanApplyResult) => {
    if (clinicalActionWorkspaceEnabled) {
      if (result.prescriptionCreated) {
        openClinicalModule("prescriptions");
      } else if (result.labOrderCreated) {
        openClinicalModule("lab");
      } else {
        openClinicalModule("orders");
      }
    } else {
      setRightPaneTab("orders");
      setWorkspaceTab("orders");
      if (result.labOrderCreated && !result.prescriptionCreated) {
        setOrdersSubTab("lab");
      } else if (result.prescriptionCreated) {
        setOrdersSubTab("prescriptions");
      } else if (result.labOrderCreated) {
        setOrdersSubTab("lab");
      }
    }
    setOrdersRefreshKey((k) => k + 1);
    setOrdersHighlight(true);
    timeouts.set(() => setOrdersHighlight(false), 4000);
  }, []);

  const handleStartCall = async () => {
    if (!consultation?.id) return;
    try {
      await startCall(consultation.id);
      if (typeof window !== "undefined" && consultation.publicToken) {
        try {
          const inviteLink = `${window.location.origin}/teleconsulta/invitado/${consultation.publicToken}`;
          const whatsappUrl = getWhatsAppUrlWithCustomMessage(
            `Hola 👋, tu médico ha iniciado la consulta. Ingresa aquí: ${inviteLink}`,
          );
          if (whatsappUrl) window.open(whatsappUrl, "_blank");
        } catch (err) {
          console.warn("[heydoctor] failed to send patient link", err);
        }
      }
    } catch (error) {
      console.warn("[heydoctor] startCall failed, continuing anyway", error);
    }
    router.push(`/panel/consultas/${consultation.id}/teleconsulta`);
  };

  function handleDiagnosisDraftChange(item: {
    code: string;
    description: string;
    cie10CodeId?: string;
  }) {
    if (item.cie10CodeId) return;
    setDiagnosisState(diagnosisStateFromDraftItem(item));
    setDiagnosisError(null);
  }

  async function handleDiagnosisConfirm(item: {
    code: string;
    description: string;
    cie10CodeId?: string;
  }) {
    const nextState = structuredDiagnosisFromPicker(item);
    setDiagnosisState(nextState);
    setDiagnosisError(null);
    try {
      await persistSoapDraft(nextState);
    } catch (e) {
      if (consultation) {
        setDiagnosisState(hydrateDiagnosisFromConsultation(consultation));
      }
      setDiagnosisError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar el diagnóstico. Reintenta.",
      );
    }
  }

  useEffect(() => {
    setChiefComplaintDraft(
      consultation?.chiefComplaint ?? consultation?.reason ?? "",
    );
  }, [consultation?.chiefComplaint, consultation?.reason]);

  function flashAction(
    kind: "info" | "success" | "warning" | "error",
    text: string,
    href?: string,
    ttl = 6000,
  ) {
    setActionMsg({ kind, text, href });
    if (ttl > 0) timeouts.set(() => setActionMsg(null), ttl);
  }

  function handleActionResult(label: string, result: ActionResult) {
    if (result.status === "ok") {
      flashAction(
        "success",
        result.message ?? `${label} generado correctamente.`,
        result.url,
      );
      if (result.url) {
        try {
          window.open(result.url, "_blank", "noopener,noreferrer");
        } catch {
          /* noop */
        }
      }
      return;
    }
    if (result.status === "unavailable") {
      flashAction(
        "warning",
        `${label}: ${result.message ?? "esta acción estará disponible pronto."}`,
        undefined,
        9000,
      );
      return;
    }
    flashAction(
      "error",
      `${label}: ${result.message ?? "no se pudo completar la acción."}`,
      undefined,
      9000,
    );
  }

  function handleOpenPrescription() {
    setOrdersPanelExpandSignal((value) => value + 1);
    if (clinicalActionWorkspaceEnabled) {
      openClinicalModule("prescriptions");
      return;
    }
    setWorkspaceTab("orders");
    setRightPaneTab("orders");
    setOrdersSubTab("prescriptions");
  }

  function handleOpenLabOrders() {
    setOrdersPanelExpandSignal((value) => value + 1);
    if (clinicalActionWorkspaceEnabled) {
      openClinicalModule("lab");
      return;
    }
    setWorkspaceTab("orders");
    setRightPaneTab("orders");
    setOrdersSubTab("lab");
  }

  async function handleGenerateInvoice() {
    setOrdersPanelExpandSignal((value) => value + 1);
    setActionLoading((s) => ({ ...s, invoice: true }));
    const r = await generateConsultationInvoice(id);
    setActionLoading((s) => ({ ...s, invoice: false }));
    handleActionResult("Factura", r);
  }

  async function handleDownloadPdf() {
    setOrdersPanelExpandSignal((value) => value + 1);
    setActionLoading((s) => ({ ...s, pdf: true }));
    const r = await downloadConsultationPdf(id);
    setActionLoading((s) => ({ ...s, pdf: false }));
    handleActionResult("PDF", r);
  }

  async function handleToggleEdit() {
    if (editMode) {
      // Al salir de edición: forzar flush del draft dirty antes de solo-lectura.
      try {
        const saved = Boolean(await antecedentsRef.current?.flush());
        if (saved) {
          setAntecedentsDirty(false);
          await clinicalFoundationState.reload();
        }
      } catch (err) {
        setSaveMsg(
          err instanceof Error
            ? err.message
            : "No se pudieron guardar los antecedentes. Permanece en edición.",
        );
        return;
      }
    }
    setEditMode((v) => !v);
    setWorkspaceTab("soap");
    setLeftPaneTab("soap");
  }

  function handleAnalyzeWithAi() {
    setDnaDrawerOpen(false);
    setCopilotDrawerOpen(true);
    setGenerativeExpandToken((token) => token + 1);
    flashAction(
      "info",
      "Abriendo HeyDoctor Copilot — asistencia generativa lista para analizar.",
      undefined,
      4000,
    );
  }

  async function handleDeleteConsultation() {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "¿Eliminar esta consulta? Esta acción no se puede deshacer.",
      );
      if (!ok) return;
    }
    setActionLoading((s) => ({ ...s, deleting: true }));
    const r = await deleteConsultation(id);
    setActionLoading((s) => ({ ...s, deleting: false }));
    if (r.status === "ok") {
      flashAction("success", "Consulta eliminada.");
      router.push("/panel/consultas");
      return;
    }
    handleActionResult("Eliminar", r);
  }

  async function handleSignedPrescription() {
    setOrdersPanelExpandSignal((value) => value + 1);
    setActionLoading((s) => ({ ...s, signedPrescription: true }));
    const r = await generateSignedPrescription(id);
    setActionLoading((s) => ({ ...s, signedPrescription: false }));
    handleActionResult("Receta firmada", r);
  }

  async function handleSignedCertificate() {
    setOrdersPanelExpandSignal((value) => value + 1);
    setActionLoading((s) => ({ ...s, signedCertificate: true }));
    const r = await generateSignedMedicalCertificate(id);
    setActionLoading((s) => ({ ...s, signedCertificate: false }));
    handleActionResult("Certificado médico firmado", r);
  }

  async function handleSignedReferral() {
    setOrdersPanelExpandSignal((value) => value + 1);
    setActionLoading((s) => ({ ...s, signedReferral: true }));
    const r = await generateSignedReferral(id);
    setActionLoading((s) => ({ ...s, signedReferral: false }));
    handleActionResult("Interconsulta firmada", r);
  }

  async function handlePremiumDocument() {
    setOrdersPanelExpandSignal((value) => value + 1);
    setActionLoading((s) => ({ ...s, premium: true }));
    const r = await generatePremiumDocument(id);
    setActionLoading((s) => ({ ...s, premium: false }));
    handleActionResult("Documento premium", r);
  }

  function handlePaymentAbandoned(reason: string) {
    void trackEvent({
      event: "payment_abandoned",
      consultationId: id,
      properties: { reason },
    });
    setPaymentStep("idle");
    setSaveMsg("");
  }

  async function executePaymentToProvider() {
    setCreatingPayment(true);
    setSaveMsg("");
    const amount = consultationPrice.amount;
    const currency = consultationPrice.currency;
    void trackEvent({
      event: "payment_initiated",
      consultationId: id,
      properties: { currency, amount },
    });
    try {
      const session = await createPaymentSession(id);
      void trackConsultationPaid(id, {
        paymentId: session.paymentId,
        amount,
        currency,
      });
      window.location.href = session.paymentUrl;
    } catch (err) {
      const msg = paymentFailureUserMessage(err);
      void trackEvent({
        event: "payment_failed",
        consultationId: id,
        properties: {
          message: msg,
          ...(err instanceof ApiError ? { httpStatus: err.status } : {}),
        },
      });
      setSaveMsg(msg);
      setCreatingPayment(false);
    }
  }

  /** One Clinical Snapshot supplement for the entire Encounter Shell. */
  // Rules of Hooks: must run before any early return (loading / error / null).
  const clinicalSnapshotSupplement = useMemo((): ClinicalContextSupplement => {
    const vitalsCtx = parseClinicalVitalSignsFromNotes(notes);
    const medications = (effectiveClinicalMemory?.currentMedications ?? [])
      .map((m) => m.name)
      .filter(Boolean);
    const allergiesFromProfile = jsonLinesToList(patientProfile?.allergies);
    const allergiesFromFoundation = (
      clinicalFoundationOutputs?.clinicalFindings ?? []
    )
      .filter((f) => /alerg/i.test(`${f.category} ${f.label}`))
      .map((f) => f.value || f.label)
      .filter(Boolean);
    return {
      allergies:
        allergiesFromProfile.length > 0
          ? allergiesFromProfile
          : allergiesFromFoundation,
      medications,
      vitalSignsSummary: formatClinicalVitalSignsForContext(vitalsCtx),
      consultationReason: chiefComplaintDraft.trim() || null,
    };
  }, [
    chiefComplaintDraft,
    clinicalFoundationOutputs,
    effectiveClinicalMemory,
    notes,
    patientProfile?.allergies,
  ]);

  const encounterActiveProblems = useMemo(
    () =>
      encounterContextModel.continuity.activeProblems.visible.map(
        (item) => item.label,
      ),
    [encounterContextModel.continuity.activeProblems.visible],
  );

  if (loading) {
    return <div className="p-6 text-slate-500">Cargando consulta...</div>;
  }

  if (error || !consultation) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-600">{error || "Consulta no encontrada"}</p>
        <Button
          variant="secondary"
          onClick={() => router.push("/panel/consultas")}
        >
          Volver a consultas
        </Button>
      </div>
    );
  }

  const soapPatientAge = patientRow ? resolvePatientAge(patientRow) : undefined;
  const soapPatientSex = patientRow
    ? formatPatientSex(patientRow.sex)
    : undefined;

  const actionMsgClass =
    actionMsg?.kind === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : actionMsg?.kind === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : actionMsg?.kind === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-blue-200 bg-blue-50 text-blue-900";

  return (
    <ClinicalActionWorkspaceProvider
      enabled={clinicalActionWorkspaceEnabled}
      navigationRef={clinicalActionWorkspaceNavRef}
    >
      <CopilotNavigationProvider
        open={copilotDrawerOpen}
        onOpenChange={setCopilotDrawerOpen}
        generativeExpandToken={generativeExpandToken}
        onRequestGenerativeExpand={() =>
          setGenerativeExpandToken((token) => token + 1)
        }
      >
        <HeyDoctorCopilotRuntimeProviders
          consultationId={id}
          patientId={consultation.patientId}
          appointmentId={null}
          workspaceOpen={copilotDrawerOpen}
          encounterStatus={status}
          patientName={patientName}
          patientAge={soapPatientAge}
          patientSex={soapPatientSex}
          activeProblems={encounterActiveProblems}
          clinicalSnapshotSupplement={clinicalSnapshotSupplement}
        >
          <div
            ref={workspaceRef}
            className="clinical-workspace mx-auto max-w-5xl space-y-hd-2 p-hd-3 md:p-hd-4 lg:p-hd-5 xl:max-w-none 2xl:mx-auto 2xl:max-w-[1600px]"
          >
            {/*
        AEC-1 M4: EncounterChromeShell stays OUTSIDE LiquidClinicalWorkspaceShell
        intentionally. Chrome is route-level encounter identity (sticky header /
        actions); Liquid WRAP/ADAPTs ConsultationWorkspace composition only.
        Full chrome-in-Liquid is deferred (not an M4 composition defect).
      */}
            <EncounterChromeShell
              workspaceRef={workspaceRef}
              className="clinical-encounter-chrome clinical-overlay-chrome clinical-depth-1 sticky top-0 -mx-3 border-b border-hd-border-subtle bg-hd-surface-chrome/95 shadow-hd-2 backdrop-blur md:-mx-4 lg:-mx-5"
            >
              <div className="clinical-depth-2 px-3 md:px-4 lg:px-5">
                <EncounterHeader
                  key={id}
                  status={status}
                  transitioning={transitioning}
                  onBack={() => {
                    requestNavigation(() => {
                      closeEncounterOverlays();
                      router.push("/panel/consultas");
                    });
                  }}
                  onShare={() => setShareOpen(true)}
                  onTransition={
                    status === "draft" || status === "in_progress"
                      ? () => void handleTransition()
                      : undefined
                  }
                  canStartCall={canStartCall}
                  onStartTeleconsultation={() => void handleStartCall()}
                  onOpenPrescription={handleOpenPrescription}
                  onOpenLabOrders={handleOpenLabOrders}
                  medicalCopilotHref={`/panel/consultas/${id}/medical-copilot`}
                  hideModuleShortcuts={
                    clinicalActionWorkspaceEnabled && !!consultation.patientId
                  }
                  canPay={canPay}
                  isLocked={isLocked}
                  paymentStep={paymentStep}
                  creatingPayment={creatingPayment}
                  onPayClick={() => {
                    setSaveMsg("");
                    setPaymentStep("confirm");
                  }}
                  onPaymentConfirm={() => void executePaymentToProvider()}
                  onPaymentCancel={() =>
                    handlePaymentAbandoned("user_cancelled_confirm")
                  }
                  paymentAmount={consultationPrice.amount}
                  paymentCurrency={consultationPrice.currency}
                  paymentLoading={consultationPrice.loading}
                  saveMsg={
                    saveMsg && paymentStep === "confirm" ? saveMsg : undefined
                  }
                  isEditing={editMode}
                  canToggleEdit={isEditable}
                  onToggleEdit={handleToggleEdit}
                  actionHandlers={{
                    onStartTeleconsultation: () => void handleStartCall(),
                    onOpenPrescription: handleOpenPrescription,
                    onGenerateInvoice: () => void handleGenerateInvoice(),
                    onDownloadPdf: () => void handleDownloadPdf(),
                    onToggleEdit: handleToggleEdit,
                    onAnalyzeWithAi: handleAnalyzeWithAi,
                    onDelete: () => void handleDeleteConsultation(),
                    onGenerateSignedPrescription: () =>
                      void handleSignedPrescription(),
                    onGenerateSignedCertificate: () =>
                      void handleSignedCertificate(),
                    onGenerateSignedReferral: () => void handleSignedReferral(),
                    onGeneratePremiumDocument: () =>
                      void handlePremiumDocument(),
                  }}
                  actionLoading={{
                    invoice: actionLoading.invoice,
                    pdf: actionLoading.pdf,
                    deleting: actionLoading.deleting,
                    ai: false,
                  }}
                  actionDisabled={{
                    prescription: isLocked,
                    edit: isLocked,
                    ai: isLocked,
                    delete: isLocked,
                  }}
                  dnaDrawerOpen={dnaDrawerOpen}
                  onOpenDoctorDna={() => {
                    setCopilotDrawerOpen(false);
                    setDnaDrawerOpen(true);
                  }}
                  copilotDrawerOpen={copilotDrawerOpen}
                  onOpenCopilot={() => {
                    setDnaDrawerOpen(false);
                    setCopilotDrawerOpen(true);
                  }}
                />
                <div className="clinical-depth-2 space-y-hd-2 pb-hd-2">
                  <StickyPatientHeader
                    model={encounterContextModel}
                    loading={
                      patientContextLoading || effectiveClinicalMemoryLoading
                    }
                  />
                  {clinicalActionWorkspaceEnabled && consultation.patientId ? (
                    <ClinicalActionBar
                      patientId={consultation.patientId}
                      consultationId={id}
                      clinicId={consultation.clinicId ?? ctxClinicId ?? null}
                      ordersRefreshKey={ordersRefreshKey}
                      continuityOpen={continuityOpen}
                      onContinuityOpenChange={handleContinuityOpenChange}
                    />
                  ) : null}
                </div>
              </div>
            </EncounterChromeShell>

            <ClinicalModuleSheet>
              <ClinicalModuleSheetContent
                patientId={consultation.patientId}
                consultationId={id}
                diagnosisCode={
                  diagnosisState.diagnosisCode ||
                  diagnosisState.diagnosis ||
                  undefined
                }
                refreshKey={ordersRefreshKey}
                ordersHighlight={ordersHighlight}
                ordersSubTab={ordersSubTab}
                onOrdersSubTabChange={setOrdersSubTab}
                documentHandlers={{
                  onStartTeleconsultation: () => void handleStartCall(),
                  onOpenPrescription: handleOpenPrescription,
                  onGenerateInvoice: () => void handleGenerateInvoice(),
                  onDownloadPdf: () => void handleDownloadPdf(),
                  onToggleEdit: handleToggleEdit,
                  onAnalyzeWithAi: handleAnalyzeWithAi,
                  onDelete: () => void handleDeleteConsultation(),
                  onGenerateSignedPrescription: () =>
                    void handleSignedPrescription(),
                  onGenerateSignedCertificate: () =>
                    void handleSignedCertificate(),
                  onGenerateSignedReferral: () => void handleSignedReferral(),
                  onGeneratePremiumDocument: () => void handlePremiumDocument(),
                }}
                documentLoading={actionLoading}
                documentDisabled={documentDisabled}
                onLegacyInvoiceResult={handleActionResult}
              />
            </ClinicalModuleSheet>

            <ClinicalCopilotDrawer
              open={copilotDrawerOpen}
              onClose={() => setCopilotDrawerOpen(false)}
              onOpenContinuity={() => handleContinuityOpenChange(true)}
              runtimeEnabled={Boolean(consultation.patientId)}
              generativeExpandToken={generativeExpandToken}
              consultation={consultation}
              consultationId={id}
              patientId={consultation.patientId}
              diagnosis={diagnosisState.diagnosis}
              diagnosisCode={diagnosisState.diagnosisCode}
              diagnosisDescription={diagnosisState.diagnosisDescription}
              chiefComplaint={chiefComplaintDraft}
              treatment={treatment}
              notes={notes}
              patientName={patientName}
              patientAge={soapPatientAge}
              patientSex={soapPatientSex}
              clinicalMemory={effectiveClinicalMemory}
              clinicalFoundation={clinicalFoundation}
              clinicalFoundationLoading={clinicalFoundationState.loading}
              clinicalFoundationError={clinicalFoundationState.error}
              foundationOutputs={clinicalFoundationOutputs}
              hasUnsavedClinicalChanges={hasUnsavedClinicalChanges}
              onSignConsultation={async (signatureBase64) => {
                await handleSign(signatureBase64);
              }}
              onClosePersisted={() => {
                void load();
              }}
            />

            <DoctorDnaDrawer
              open={dnaDrawerOpen}
              onClose={() => setDnaDrawerOpen(false)}
            />

            <ShareConsultationDialog
              consultationId={id}
              open={shareOpen}
              patientName={patientName}
              onClose={() => setShareOpen(false)}
            />

            {actionMsg ? (
              <div
                role="status"
                className={`rounded-xl border px-4 py-3 text-sm ${actionMsgClass}`}
              >
                {actionMsg.text}
                {actionMsg.href ? (
                  <>
                    {" "}
                    <a
                      href={actionMsg.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      Abrir documento →
                    </a>
                  </>
                ) : null}
              </div>
            ) : null}

            {consultation.patientId ? (
              <ConsultationClinicalProviders
                consultationId={id}
                patientId={consultation.patientId}
                clinicalFoundation={clinicalFoundation}
                onPlanApplied={handlePlanApplied}
              >
                <ClinicalIntelligenceSync
                  consultationId={id}
                  patientId={consultation.patientId}
                  diagnosisState={diagnosisState}
                />

                <div className="xl:hidden">
                  <PatientContextRail
                    patientId={consultation.patientId}
                    patient={patientRow}
                    profile={patientProfile}
                    loading={patientContextLoading}
                    error={patientContextError}
                    fallbackName={patientName}
                    currentConsultationId={id}
                    encounterDiagnosis={encounterDiagnosis}
                    clinicalMemory={effectiveClinicalMemory}
                    clinicalMemoryLoading={effectiveClinicalMemoryLoading}
                    clinicalMemoryError={effectiveClinicalMemoryError}
                    clinicalFoundationOutputs={clinicalFoundationOutputs}
                    clinicalFoundationLoading={clinicalFoundationState.loading}
                    clinicalFoundationError={clinicalFoundationState.error}
                    onOpenFullRecord={openFullRecord}
                  />
                </div>

                <LiquidClinicalWorkspaceShell
                  consultationId={id}
                  encounterStatus={status}
                  isSigned={isSigned}
                  isLocked={isLocked}
                  role="doctor"
                  copilotOpen={copilotDrawerOpen}
                  onOpenCopilot={() => {
                    setDnaDrawerOpen(false);
                    setCopilotDrawerOpen(true);
                  }}
                >
                  <ConsultationWorkspace
                    actionWorkspaceEnabled={clinicalActionWorkspaceEnabled}
                    smartWorkspaceEnabled={smartClinicalWorkspaceEnabled}
                    consultation={consultation}
                    consultationId={id}
                    clinicId={consultation.clinicId ?? ctxClinicId ?? null}
                    activeTab={workspaceTab}
                    onTabChange={setWorkspaceTab}
                    leftPaneTab={leftPaneTab}
                    onLeftPaneTabChange={setLeftPaneTab}
                    rightPaneTab={rightPaneTab}
                    onRightPaneTabChange={setRightPaneTab}
                    patientContext={{
                      patientId: consultation.patientId,
                      patient: patientRow,
                      profile: patientProfile,
                      loading: patientContextLoading,
                      error: patientContextError,
                      fallbackName: patientName,
                      currentConsultationId: id,
                      encounterDiagnosis,
                      clinicalMemory: effectiveClinicalMemory,
                      clinicalMemoryLoading: effectiveClinicalMemoryLoading,
                      clinicalMemoryError: effectiveClinicalMemoryError,
                      clinicalFoundationOutputs,
                      clinicalFoundationLoading:
                        clinicalFoundationState.loading,
                      clinicalFoundationError: clinicalFoundationState.error,
                      onOpenFullRecord: openFullRecord,
                    }}
                    ordersSubTab={ordersSubTab}
                    onOrdersSubTabChange={setOrdersSubTab}
                    documentHandlers={{
                      onStartTeleconsultation: () => void handleStartCall(),
                      onOpenPrescription: handleOpenPrescription,
                      onGenerateInvoice: () => void handleGenerateInvoice(),
                      onDownloadPdf: () => void handleDownloadPdf(),
                      onToggleEdit: handleToggleEdit,
                      onAnalyzeWithAi: handleAnalyzeWithAi,
                      onDelete: () => void handleDeleteConsultation(),
                      onGenerateSignedPrescription: () =>
                        void handleSignedPrescription(),
                      onGenerateSignedCertificate: () =>
                        void handleSignedCertificate(),
                      onGenerateSignedReferral: () =>
                        void handleSignedReferral(),
                      onGeneratePremiumDocument: () =>
                        void handlePremiumDocument(),
                    }}
                    documentLoading={actionLoading}
                    documentDisabled={documentDisabled}
                    onLegacyInvoiceResult={handleActionResult}
                    ordersHighlight={ordersHighlight}
                    ordersRefreshKey={ordersRefreshKey}
                    ordersPanelExpandSignal={ordersPanelExpandSignal}
                    encounterChart={{
                      onOpenFullRecord: openFullRecord,
                      consultationId: consultation.id,
                      vitals,
                      onVitalsChange: setVitals,
                      physicalExam,
                      onPhysicalExamChange: setPhysicalExam,
                      presentIllnessHistory,
                      onPresentIllnessHistoryChange: setPresentIllnessHistory,
                      treatment,
                      onTreatmentChange: setTreatment,
                      clinicId: consultation.clinicId ?? ctxClinicId ?? null,
                      diagnosis: diagnosisState.diagnosis,
                      diagnosisCode: diagnosisState.diagnosisCode || null,
                      diagnosisDescription:
                        diagnosisState.diagnosisDescription || null,
                      diagnosisSource: diagnosisState.source,
                      diagnosisError,
                      onDiagnosisChange: handleDiagnosisDraftChange,
                      onDiagnosisConfirm: handleDiagnosisConfirm,
                      patientId: consultation.patientId,
                      encounterDiagnosis,
                      allergyLines: jsonLinesToList(patientProfile?.allergies),
                      clinicalMemory: effectiveClinicalMemory,
                      clinicalMemoryLoading: effectiveClinicalMemoryLoading,
                      clinicalMemoryError: effectiveClinicalMemoryError,
                      editable: isEditable && editMode,
                      canToggleEdit: isEditable,
                      isEditing: editMode,
                      onToggleEdit: handleToggleEdit,
                      antecedentsDirty,
                      autosaveStatus,
                      lastSavedAt: effectiveLastSavedAt,
                      autosaveError,
                      manualSaveStatus,
                      onManualSave: handleManualSave,
                      saveFeedbackMessage:
                        saveMsg && paymentStep !== "confirm" ? saveMsg : null,
                      closure: {
                        status,
                        isSigned,
                        isLocked,
                        canSign,
                        signing,
                        onSign: handleSign,
                        signedAt: consultation.signedAt,
                        doctorSignature: consultation.doctorSignature,
                        documentHandlers: {
                          onStartTeleconsultation: () => void handleStartCall(),
                          onOpenPrescription: handleOpenPrescription,
                          onGenerateInvoice: () => void handleGenerateInvoice(),
                          onDownloadPdf: () => void handleDownloadPdf(),
                          onToggleEdit: handleToggleEdit,
                          onAnalyzeWithAi: handleAnalyzeWithAi,
                          onDelete: () => void handleDeleteConsultation(),
                          onGenerateSignedPrescription: () =>
                            void handleSignedPrescription(),
                          onGenerateSignedCertificate: () =>
                            void handleSignedCertificate(),
                          onGenerateSignedReferral: () =>
                            void handleSignedReferral(),
                          onGeneratePremiumDocument: () =>
                            void handlePremiumDocument(),
                        },
                        documentLoading: actionLoading,
                        documentDisabled,
                        signMessage: signMsg || undefined,
                      },
                      longitudinal: {
                        patient: patientRow,
                        profile: patientProfile,
                        loading: patientContextLoading,
                        patientId: consultation.patientId,
                        editable: isEditable && editMode,
                        antecedentsRef,
                        onProfileSaved: setPatientProfile,
                        onAntecedentsDraftKeyChange: setAntecedentsDraftKey,
                        onAntecedentsDirtyChange: setAntecedentsDirty,
                        onAntecedentsPersistError: (message) => {
                          setManualSaveStatus("error");
                          setSaveMsg(message);
                        },
                      },
                    }}
                    diagnosisCode={
                      diagnosisState.diagnosisCode ||
                      diagnosisState.diagnosis ||
                      undefined
                    }
                  />
                </LiquidClinicalWorkspaceShell>
              </ConsultationClinicalProviders>
            ) : (
              <LiquidClinicalWorkspaceShell
                consultationId={id}
                encounterStatus={status}
                isSigned={isSigned}
                isLocked={isLocked}
                role="doctor"
                copilotOpen={copilotDrawerOpen}
                onOpenCopilot={() => {
                  setDnaDrawerOpen(false);
                  setCopilotDrawerOpen(true);
                }}
              >
                <ConsultationWorkspace
                  actionWorkspaceEnabled={clinicalActionWorkspaceEnabled}
                  smartWorkspaceEnabled={smartClinicalWorkspaceEnabled}
                  consultation={consultation}
                  consultationId={id}
                  clinicId={consultation.clinicId ?? ctxClinicId ?? null}
                  activeTab={workspaceTab}
                  onTabChange={setWorkspaceTab}
                  leftPaneTab={leftPaneTab}
                  onLeftPaneTabChange={setLeftPaneTab}
                  rightPaneTab={rightPaneTab}
                  onRightPaneTabChange={setRightPaneTab}
                  patientContext={{
                    patientId: consultation.patientId,
                    patient: patientRow,
                    profile: patientProfile,
                    loading: patientContextLoading,
                    error: patientContextError,
                    fallbackName: patientName,
                    currentConsultationId: id,
                    encounterDiagnosis,
                    clinicalMemory: effectiveClinicalMemory,
                    clinicalMemoryLoading: effectiveClinicalMemoryLoading,
                    clinicalMemoryError: effectiveClinicalMemoryError,
                    clinicalFoundationOutputs,
                    clinicalFoundationLoading: clinicalFoundationState.loading,
                    clinicalFoundationError: clinicalFoundationState.error,
                    onOpenFullRecord: openFullRecord,
                  }}
                  ordersSubTab={ordersSubTab}
                  onOrdersSubTabChange={setOrdersSubTab}
                  documentHandlers={{
                    onStartTeleconsultation: () => void handleStartCall(),
                    onOpenPrescription: handleOpenPrescription,
                    onGenerateInvoice: () => void handleGenerateInvoice(),
                    onDownloadPdf: () => void handleDownloadPdf(),
                    onToggleEdit: handleToggleEdit,
                    onAnalyzeWithAi: handleAnalyzeWithAi,
                    onDelete: () => void handleDeleteConsultation(),
                    onGenerateSignedPrescription: () =>
                      void handleSignedPrescription(),
                    onGenerateSignedCertificate: () =>
                      void handleSignedCertificate(),
                    onGenerateSignedReferral: () => void handleSignedReferral(),
                    onGeneratePremiumDocument: () =>
                      void handlePremiumDocument(),
                  }}
                  documentLoading={actionLoading}
                  documentDisabled={documentDisabled}
                  onLegacyInvoiceResult={handleActionResult}
                  ordersHighlight={ordersHighlight}
                  ordersRefreshKey={ordersRefreshKey}
                  ordersPanelExpandSignal={ordersPanelExpandSignal}
                  encounterChart={{
                    onOpenFullRecord: openFullRecord,
                    consultationId: consultation.id,
                    vitals,
                    onVitalsChange: setVitals,
                    physicalExam,
                    onPhysicalExamChange: setPhysicalExam,
                    presentIllnessHistory,
                    onPresentIllnessHistoryChange: setPresentIllnessHistory,
                    treatment,
                    onTreatmentChange: setTreatment,
                    clinicId: consultation.clinicId ?? ctxClinicId ?? null,
                    diagnosis: diagnosisState.diagnosis,
                    diagnosisCode: diagnosisState.diagnosisCode || null,
                    diagnosisDescription:
                      diagnosisState.diagnosisDescription || null,
                    diagnosisSource: diagnosisState.source,
                    diagnosisError,
                    onDiagnosisChange: handleDiagnosisDraftChange,
                    onDiagnosisConfirm: handleDiagnosisConfirm,
                    patientId: consultation.patientId,
                    encounterDiagnosis,
                    allergyLines: jsonLinesToList(patientProfile?.allergies),
                    clinicalMemory: effectiveClinicalMemory,
                    clinicalMemoryLoading: effectiveClinicalMemoryLoading,
                    clinicalMemoryError: effectiveClinicalMemoryError,
                    editable: isEditable && editMode,
                    canToggleEdit: isEditable,
                    isEditing: editMode,
                    onToggleEdit: handleToggleEdit,
                    antecedentsDirty,
                    autosaveStatus,
                    lastSavedAt: effectiveLastSavedAt,
                    autosaveError,
                    manualSaveStatus,
                    onManualSave: handleManualSave,
                    saveFeedbackMessage:
                      saveMsg && paymentStep !== "confirm" ? saveMsg : null,
                    closure: {
                      status,
                      isSigned,
                      isLocked,
                      canSign,
                      signing,
                      onSign: handleSign,
                      signedAt: consultation.signedAt,
                      doctorSignature: consultation.doctorSignature,
                      documentHandlers: {
                        onStartTeleconsultation: () => void handleStartCall(),
                        onOpenPrescription: handleOpenPrescription,
                        onGenerateInvoice: () => void handleGenerateInvoice(),
                        onDownloadPdf: () => void handleDownloadPdf(),
                        onToggleEdit: handleToggleEdit,
                        onAnalyzeWithAi: handleAnalyzeWithAi,
                        onDelete: () => void handleDeleteConsultation(),
                        onGenerateSignedPrescription: () =>
                          void handleSignedPrescription(),
                        onGenerateSignedCertificate: () =>
                          void handleSignedCertificate(),
                        onGenerateSignedReferral: () =>
                          void handleSignedReferral(),
                        onGeneratePremiumDocument: () =>
                          void handlePremiumDocument(),
                      },
                      documentLoading: actionLoading,
                      documentDisabled,
                      signMessage: signMsg || undefined,
                    },
                    longitudinal: {
                      patient: patientRow,
                      profile: patientProfile,
                      loading: patientContextLoading,
                      patientId: consultation.patientId,
                      editable: isEditable && editMode,
                      antecedentsRef,
                      onProfileSaved: setPatientProfile,
                      onAntecedentsDraftKeyChange: setAntecedentsDraftKey,
                      onAntecedentsDirtyChange: setAntecedentsDirty,
                      onAntecedentsPersistError: (message) => {
                        setManualSaveStatus("error");
                        setSaveMsg(message);
                      },
                    },
                  }}
                  diagnosisCode={
                    diagnosisState.diagnosisCode ||
                    diagnosisState.diagnosis ||
                    undefined
                  }
                />
              </LiquidClinicalWorkspaceShell>
            )}

            {isLocked ? (
              <Card className="border-green-200 bg-green-50 p-4">
                <p className="font-semibold text-green-800">
                  Consulta pagada y bloqueada
                </p>
                <p className="mt-1 text-sm text-green-700">
                  Esta consulta ha sido finalizada. No se permiten
                  modificaciones.
                </p>
              </Card>
            ) : null}

            <ConsultationConsentCard
              consentGivenAt={consultation.consentGivenAt}
              consentVersion={consultation.consentVersion}
            />

            {!isEditable && !canPay && !isLocked && saveMsg ? (
              <p
                className={`text-sm ${saveMsg.includes("Error") ? "text-red-600" : "text-green-700"}`}
              >
                {saveMsg}
              </p>
            ) : null}

            <EncounterFullRecordOverlay
              open={fullRecordOpen}
              onClose={closeFullRecord}
              patient={patientRow}
              profile={patientProfile}
              fallbackName={patientName}
              loading={patientContextLoading}
              error={patientContextError}
            />
          </div>
        </HeyDoctorCopilotRuntimeProviders>
      </CopilotNavigationProvider>
    </ClinicalActionWorkspaceProvider>
  );
}
