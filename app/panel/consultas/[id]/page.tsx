"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  fetchConsultation,
  updateConsultation,
  signConsultation,
  startCall,
  type NestConsultation,
} from "@/lib/services/consultations";
import {
  buildSoapDraftKey,
  buildSoapPatch,
  emptyDiagnosisState,
  hydrateDiagnosisFromConsultation,
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
import { ApiError, getApiErrorMessage } from "@/lib/heydoctor-api";
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
import { useEncounterNotesDraft } from "@/hooks/useEncounterNotesDraft";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { PatientContextRail } from "./_components/PatientContextRail";
import { EncounterHeader } from "./_components/EncounterHeader";
import { StickyPatientHeader } from "./_components/StickyPatientHeader";
import { ClinicalCopilotDrawer } from "./_components/copilot/ClinicalCopilotDrawer";
import {
  DoctorDnaDrawer,
} from "./_components/DoctorDnaDrawer";
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
import { isClinicalActionWorkspaceEnabled } from "@/lib/clinical-action-workspace";
import { isSmartClinicalWorkspaceEnabled } from "@/lib/smart-clinical-workspace";
import {
  buildConsultationDocumentDisabled,
  resolveCanPay,
} from "@/lib/consultation-production-gates";
import type { ClinicalActionModuleId } from "@/lib/clinical-action-workspace";
import { ClinicalActionBar } from "./_components/action-workspace/ClinicalActionBar";
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
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return "Tu sesión expiró. Inicia sesión de nuevo e inténtalo otra vez.";
    }
    if (err.status === 403) {
      return "No tienes permiso para iniciar el pago de esta consulta.";
    }
    if (err.status === 404) {
      return "No encontramos la consulta o el endpoint de pagos. Contacta soporte.";
    }
    if (err.status >= 500) {
      return "El servicio de pagos no está disponible en este momento. Espera unos minutos e inténtalo de nuevo.";
    }
    const m = err.message?.trim();
    if (m) return m;
  }
  if (err instanceof Error && err.message) return err.message;
  return "No pudimos iniciar el pago. Revisa tu conexión e inténtalo de nuevo.";
}

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const consultationPrice = useConsultationPrice();
  const { clinicId: ctxClinicId, attachConsultationSession } = useConsultation();

  const [consultation, setConsultation] = useState<NestConsultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState("");
  const [diagnosisState, setDiagnosisState] =
    useState<ConsultationDiagnosisState>(emptyDiagnosisState());
  const [treatment, setTreatment] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [manualSaveStatus, setManualSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

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
  const [ordersSubTab, setOrdersSubTab] = useState<OrdersSubTab>("prescriptions");
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
  const [generativeExpandToken, setGenerativeExpandToken] = useState(0);

  const [patientRow, setPatientRow] = useState<PatientRow | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(
    null,
  );
  const [patientContextLoading, setPatientContextLoading] = useState(false);
  const [patientContextError, setPatientContextError] = useState<string | null>(
    null,
  );

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
  } = useEncounterNotesDraft(consultation?.notes ?? null, notes);

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
      void trackConsultationStartedDeduped(id, { status: st, source: "detail" });
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
        const [patient, profile] = await Promise.all([
          fetchPatientById(patientId),
          fetchPatientProfile(patientId).catch(() => null),
        ]);
        if (cancelled) return;
        setPatientRow(patient);
        setPatientProfile(profile);
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
          setTimeout(() => setSaveMsg(""), 5000);
        } else if (st.hasPending) {
          setSaveMsg(
            "Pago en proceso de confirmación. Actualiza en unos segundos o revisa el estado de la consulta.",
          );
          setTimeout(() => setSaveMsg(""), 8000);
        } else {
          setSaveMsg(
            "No confirmamos un pago completado todavía. Si ya pagaste, espera la confirmación; si no, puedes intentar de nuevo.",
          );
          setTimeout(() => setSaveMsg(""), 8000);
        }
      } catch {
        if (!cancelled) {
          setSaveMsg(
            "No pudimos verificar el pago. Revisa tu conexión o vuelve a intentar más tarde.",
          );
          setTimeout(() => setSaveMsg(""), 8000);
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
  const encounterContextModel = useMemo(
    () =>
      buildEncounterContextBarModel({
        patient: patientRow,
        profile: patientProfile,
        fallbackName: patientName,
        status,
        diagnosis: encounterDiagnosis,
        memory: patientClinicalMemoryState.data,
      }),
    [
      encounterDiagnosis,
      patientClinicalMemoryState.data,
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
      if (patchFingerprint === lastPersistedPatchRef.current) {
        return;
      }
      const updated = await updateConsultation(id, patch);
      lastPersistedPatchRef.current = patchFingerprint;
      setConsultation(updated);
      consultationRef.current = updated;
      const nextDiagnosis = hydrateDiagnosisFromConsultation(updated);
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
    },
    [notes, treatment, diagnosisState, id, isEditable, composeNotes],
  );

  const soapDraftKey = buildSoapDraftKey({
    notes,
    treatment,
    diagnosis: diagnosisState,
    vitals,
    physicalExam,
    presentIllnessHistory,
  });

  const { lastSavedAt, status: autosaveStatus, errorMessage: autosaveError, flushNow } =
    useConsultationAutosave({
      enabled: isEditable && Boolean(consultation),
      draftKey: soapDraftKey,
      debounceMs: 900,
      save: persistSoapDraft,
    });

  useEffect(() => {
    setManualSaveStatus((status) =>
      status === "saving" ? status : "idle",
    );
  }, [soapDraftKey]);

  async function handleManualSave() {
    if (!isEditable || !consultation) return;
    setManualSaveStatus("saving");
    try {
      await flushNow();
      setManualSaveStatus("saved");
      setSaveMsg("Guardado correctamente.");
    } catch (err) {
      setManualSaveStatus("error");
      setSaveMsg(err instanceof Error ? err.message : "Error al guardar");
    }
  }

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
      const prev = consultation.status ?? prevStatusRef.current;
      const updated = await updateConsultation(id, { status: next });
      const st = updated.status ?? "";
      trackConsultationCompletedIfNeeded(prev, st, id);
      prevStatusRef.current = st;
      setConsultation(updated);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Error al cambiar estado");
    } finally {
      setTransitioning(false);
    }
  }

  async function handleSign(base64: string) {
    if (!consultation) return;
    setSigning(true);
    try {
      if (isEditable) {
        await flushNow();
      }
      const prev = consultation.status ?? prevStatusRef.current;
      const updated = await signConsultation(id, base64);
      const st = updated.status ?? "";
      trackConsultationCompletedIfNeeded(prev, st, id);
      prevStatusRef.current = st;
      setConsultation(updated);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Error al firmar");
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
    window.setTimeout(() => setOrdersHighlight(false), 4000);
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
    setChiefComplaintDraft(consultation?.chiefComplaint ?? consultation?.reason ?? "");
  }, [consultation?.chiefComplaint, consultation?.reason]);

  function flashAction(
    kind: "info" | "success" | "warning" | "error",
    text: string,
    href?: string,
    ttl = 6000,
  ) {
    setActionMsg({ kind, text, href });
    if (ttl > 0) window.setTimeout(() => setActionMsg(null), ttl);
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

  function handleToggleEdit() {
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
      "Abriendo Clinical Copilot™ — asistente generativo listo para analizar.",
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

  if (loading) {
    return (
      <div className="p-6 text-slate-500">Cargando consulta...</div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-600">{error || "Consulta no encontrada"}</p>
        <Button variant="secondary" onClick={() => router.push("/panel/consultas")}>
          Volver a consultas
        </Button>
      </div>
    );
  }

  const soapPatientAge = patientRow ? resolvePatientAge(patientRow) : undefined;
  const soapPatientSex = patientRow ? formatPatientSex(patientRow.sex) : undefined;

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
    <div
      ref={workspaceRef}
      className="clinical-workspace mx-auto max-w-5xl space-y-hd-2 p-hd-3 md:p-hd-4 lg:p-hd-5 xl:max-w-none 2xl:mx-auto 2xl:max-w-[1600px]"
    >
      <EncounterChromeShell
        workspaceRef={workspaceRef}
        className="clinical-encounter-chrome clinical-depth-1 sticky top-0 z-30 -mx-3 border-b border-hd-border-subtle bg-hd-surface-chrome/95 shadow-hd-2 backdrop-blur md:-mx-4 lg:-mx-5"
      >
        <div className="clinical-depth-2 px-3 md:px-4 lg:px-5">
          <EncounterHeader
            key={id}
            status={status}
            transitioning={transitioning}
            onBack={() => router.push("/panel/consultas")}
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
              onGeneratePremiumDocument: () => void handlePremiumDocument(),
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
              loading={patientContextLoading || patientClinicalMemoryState.loading}
            />
            {clinicalActionWorkspaceEnabled && consultation.patientId ? (
              <ClinicalActionBar
                patientId={consultation.patientId}
                consultationId={id}
                ordersRefreshKey={ordersRefreshKey}
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
            diagnosisState.diagnosisCode || diagnosisState.diagnosis || undefined
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
            onGenerateSignedPrescription: () => void handleSignedPrescription(),
            onGenerateSignedCertificate: () => void handleSignedCertificate(),
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
        generativeExpandToken={generativeExpandToken}
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
        clinicalMemory={patientClinicalMemoryState.data}
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
              clinicalMemory={patientClinicalMemoryState.data}
              clinicalMemoryLoading={patientClinicalMemoryState.loading}
              clinicalMemoryError={patientClinicalMemoryState.error}
            />
          </div>

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
          clinicalMemory: patientClinicalMemoryState.data,
          clinicalMemoryLoading: patientClinicalMemoryState.loading,
          clinicalMemoryError: patientClinicalMemoryState.error,
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
          onGenerateSignedPrescription: () => void handleSignedPrescription(),
          onGenerateSignedCertificate: () => void handleSignedCertificate(),
          onGenerateSignedReferral: () => void handleSignedReferral(),
          onGeneratePremiumDocument: () => void handlePremiumDocument(),
        }}
        documentLoading={actionLoading}
        documentDisabled={documentDisabled}
        onLegacyInvoiceResult={handleActionResult}
        ordersHighlight={ordersHighlight}
        ordersRefreshKey={ordersRefreshKey}
        ordersPanelExpandSignal={ordersPanelExpandSignal}
        encounterChart={{
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
          diagnosisDescription: diagnosisState.diagnosisDescription || null,
          diagnosisSource: diagnosisState.source,
          diagnosisError,
          onDiagnosisConfirm: handleDiagnosisConfirm,
          patientId: consultation.patientId,
          encounterDiagnosis,
          allergyLines: jsonLinesToList(patientProfile?.allergies),
          clinicalMemory: patientClinicalMemoryState.data,
          clinicalMemoryLoading: patientClinicalMemoryState.loading,
          clinicalMemoryError: patientClinicalMemoryState.error,
          editable: isEditable && editMode,
          autosaveStatus,
          lastSavedAt,
          autosaveError,
          manualSaveStatus,
          onManualSave: handleManualSave,
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
              onGenerateSignedReferral: () => void handleSignedReferral(),
              onGeneratePremiumDocument: () => void handlePremiumDocument(),
            },
            documentLoading: actionLoading,
            documentDisabled,
            signMessage:
              saveMsg && paymentStep !== "confirm" ? saveMsg : undefined,
          },
          longitudinal: {
            patient: patientRow,
            profile: patientProfile,
            loading: patientContextLoading,
            patientId: consultation.patientId,
          },
        }}
        diagnosisCode={
          diagnosisState.diagnosisCode || diagnosisState.diagnosis || undefined
        }
          />
        </ConsultationClinicalProviders>
      ) : (
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
            clinicalMemory: patientClinicalMemoryState.data,
            clinicalMemoryLoading: patientClinicalMemoryState.loading,
            clinicalMemoryError: patientClinicalMemoryState.error,
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
            onGenerateSignedPrescription: () => void handleSignedPrescription(),
            onGenerateSignedCertificate: () => void handleSignedCertificate(),
            onGenerateSignedReferral: () => void handleSignedReferral(),
            onGeneratePremiumDocument: () => void handlePremiumDocument(),
          }}
          documentLoading={actionLoading}
          documentDisabled={documentDisabled}
          onLegacyInvoiceResult={handleActionResult}
          ordersHighlight={ordersHighlight}
          ordersRefreshKey={ordersRefreshKey}
          ordersPanelExpandSignal={ordersPanelExpandSignal}
          diagnosisCode={
            diagnosisState.diagnosisCode || diagnosisState.diagnosis || undefined
          }
        />
      )}

      {isLocked ? (
        <Card className="border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">Consulta pagada y bloqueada</p>
          <p className="mt-1 text-sm text-green-700">
            Esta consulta ha sido finalizada. No se permiten modificaciones.
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
    </div>
    </CopilotNavigationProvider>
    </ClinicalActionWorkspaceProvider>
  );
}
