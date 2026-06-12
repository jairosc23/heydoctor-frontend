"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  parseClinicalRecord,
  serializeClinicalRecord,
} from "@/lib/services/clinical-record";
import { PatientContextRail } from "./_components/PatientContextRail";
import { SafetyStrip } from "./_components/SafetyStrip";
import { EncounterHeader } from "./_components/EncounterHeader";
import { PatientSnapshot } from "./_components/PatientSnapshot";
import {
  DoctorDnaDrawer,
  DoctorDnaSignatureChip,
} from "./_components/DoctorDnaDrawer";
import type { UnifiedPlanApplyResult } from "@/lib/types/unified-clinical-plan";
import { ConsultationClinicalProviders } from "./_components/ConsultationClinicalProviders";
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

  const [aiTrigger, setAiTrigger] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [dnaDrawerOpen, setDnaDrawerOpen] = useState(false);

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

  useEffect(() => {
    prevStatusRef.current = undefined;
  }, [id]);

  const load = useCallback(async () => {
    try {
      const c = await fetchConsultation(id);
      const st = c.status ?? "draft";
      trackConsultationCompletedIfNeeded(prevStatusRef.current, st, id);
      prevStatusRef.current = st;
      void trackConsultationStartedDeduped(id, { status: st, source: "detail" });
      setConsultation(c);
      setNotes(parseClinicalRecord(c.notes).freeNotes);
      setDiagnosisState(hydrateDiagnosisFromConsultation(c));
      setTreatment(c.treatmentPlan ?? c.treatment ?? "");
      setChiefComplaintDraft(c.chiefComplaint ?? c.reason ?? "");
      const loadedRecord = parseClinicalRecord(c.notes);
      const loadedMerged = serializeClinicalRecord({
        ...loadedRecord,
        freeNotes: loadedRecord.freeNotes.trim(),
      });
      lastPersistedPatchRef.current = soapPatchFingerprint(
        buildSoapPatch({
          notes: loadedMerged.length > 0 ? loadedMerged : undefined,
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
  const isEditable = status === "draft" || status === "in_progress";
  const canSign = status === "in_progress" || status === "completed";
  const isSigned = status === "signed" || status === "locked";
  const isLocked = status === "locked";
  const canStartCall = status === "draft" || status === "in_progress";
  const canPay = status === "signed" || status === "completed";

  const persistSoapDraft = useCallback(
    async (diagnosisOverride?: ConsultationDiagnosisState) => {
      const currentConsultation = consultationRef.current;
      if (!currentConsultation || !isEditable) return;
      const diagnosis = diagnosisOverride ?? diagnosisState;
      const currentRecord = parseClinicalRecord(currentConsultation.notes);
      const merged = serializeClinicalRecord({
        ...currentRecord,
        freeNotes: notes.trim(),
      });
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
    [notes, treatment, diagnosisState, id, isEditable],
  );

  const soapDraftKey = buildSoapDraftKey({
    notes,
    treatment,
    diagnosis: diagnosisState,
  });

  const { lastSavedAt, status: autosaveStatus, errorMessage: autosaveError } =
    useConsultationAutosave({
      enabled: isEditable && Boolean(consultation),
      draftKey: soapDraftKey,
      debounceMs: 900,
      save: persistSoapDraft,
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
    setRightPaneTab("orders");
    setWorkspaceTab("orders");
    if (result.labOrderCreated && !result.prescriptionCreated) {
      setOrdersSubTab("lab");
    } else if (result.prescriptionCreated) {
      setOrdersSubTab("prescriptions");
    } else if (result.labOrderCreated) {
      setOrdersSubTab("lab");
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

  async function handleSaveClinicalRecord({
    notes: serializedNotes,
    chiefComplaint,
  }: {
    notes: string;
    chiefComplaint: string;
  }) {
    if (!consultation) return;
    const updated = await updateConsultation(id, {
      notes: serializedNotes,
      chiefComplaint: chiefComplaint || undefined,
    });
    setConsultation(updated);
    setNotes(parseClinicalRecord(updated.notes).freeNotes);
  }

  function handleOpenPrescription() {
    setWorkspaceTab("orders");
    setRightPaneTab("orders");
    setOrdersSubTab("prescriptions");
  }

  function handleOpenLabOrders() {
    setWorkspaceTab("orders");
    setRightPaneTab("orders");
    setOrdersSubTab("lab");
  }

  function handleOpenDocuments() {
    setWorkspaceTab("documents");
    setRightPaneTab("documents");
  }

  async function handleGenerateInvoice() {
    setActionLoading((s) => ({ ...s, invoice: true }));
    const r = await generateConsultationInvoice(id);
    setActionLoading((s) => ({ ...s, invoice: false }));
    handleActionResult("Factura", r);
  }

  async function handleDownloadPdf() {
    setActionLoading((s) => ({ ...s, pdf: true }));
    const r = await downloadConsultationPdf(id);
    setActionLoading((s) => ({ ...s, pdf: false }));
    handleActionResult("PDF", r);
  }

  function handleToggleEdit() {
    setEditMode((v) => !v);
    setWorkspaceTab("record");
    setLeftPaneTab("record");
  }

  function handleAnalyzeWithAi() {
    setAiTrigger((n) => n + 1);
    setWorkspaceTab("record");
    setLeftPaneTab("record");
    flashAction(
      "info",
      "Generando propuesta con IA en la ficha clínica…",
      undefined,
      3500,
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
    setActionLoading((s) => ({ ...s, signedPrescription: true }));
    const r = await generateSignedPrescription(id);
    setActionLoading((s) => ({ ...s, signedPrescription: false }));
    handleActionResult("Receta firmada", r);
  }

  async function handleSignedCertificate() {
    setActionLoading((s) => ({ ...s, signedCertificate: true }));
    const r = await generateSignedMedicalCertificate(id);
    setActionLoading((s) => ({ ...s, signedCertificate: false }));
    handleActionResult("Certificado médico firmado", r);
  }

  async function handleSignedReferral() {
    setActionLoading((s) => ({ ...s, signedReferral: true }));
    const r = await generateSignedReferral(id);
    setActionLoading((s) => ({ ...s, signedReferral: false }));
    handleActionResult("Interconsulta firmada", r);
  }

  async function handlePremiumDocument() {
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

  const patientName =
    consultation.patient?.name || consultation.patient?.email || "Paciente";

  const actionMsgClass =
    actionMsg?.kind === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : actionMsg?.kind === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : actionMsg?.kind === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-blue-200 bg-blue-50 text-blue-900";

  return (
    <div className="mx-auto max-w-5xl space-y-2 p-3 md:p-4 lg:p-5 xl:max-w-none 2xl:mx-auto 2xl:max-w-[1600px]">
      <div
        className="sticky top-0 z-30 -mx-3 border-b border-slate-200 bg-white/95 backdrop-blur md:-mx-4 lg:-mx-5"
        style={{ ["--encounter-chrome-h" as string]: "5.5rem" }}
      >
        <div className="px-3 md:px-4 lg:px-5">
          <EncounterHeader
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
            onOpenDocuments={handleOpenDocuments}
            isSigned={isSigned}
            canSign={canSign}
            signing={signing}
            onSign={handleSign}
            signedAt={consultation.signedAt}
            doctorSignature={consultation.doctorSignature}
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
              saveMsg && (canPay || isSigned || signing) ? saveMsg : undefined
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
              invoice: isLocked,
              pdf: isLocked,
            }}
            dnaDrawerOpen={dnaDrawerOpen}
            onOpenDoctorDna={() => setDnaDrawerOpen(true)}
          />
          <div className="flex justify-end pb-0.5">
            <DoctorDnaSignatureChip onClick={() => setDnaDrawerOpen(true)} />
          </div>
          <PatientSnapshot
            patientId={consultation.patientId}
            patientName={patientName}
            patient={patientRow}
            profile={patientProfile}
            status={status}
          />
          {consultation.patientId ? (
            <SafetyStrip
              profile={patientProfile}
              loading={patientContextLoading}
              embedded
            />
          ) : null}
        </div>
      </div>

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
            />
          </div>

          <ConsultationWorkspace
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
        }}
        ordersSubTab={ordersSubTab}
        onOrdersSubTabChange={setOrdersSubTab}
        chiefComplaintDraft={chiefComplaintDraft}
        onChiefComplaintChange={setChiefComplaintDraft}
        editMode={editMode}
        isEditable={isEditable}
        aiTrigger={aiTrigger}
        onSaveClinicalRecord={handleSaveClinicalRecord}
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
        documentDisabled={{
          pdf: isLocked,
          invoice: isLocked,
          signedPrescription: !isSigned && !isLocked && !canSign,
        }}
        onLegacyInvoiceResult={handleActionResult}
        ordersHighlight={ordersHighlight}
        ordersRefreshKey={ordersRefreshKey}
        diagnosisCode={
          diagnosisState.diagnosisCode || diagnosisState.diagnosis || undefined
        }
        soap={{
          consultationId: id,
          clinicId: consultation.clinicId ?? ctxClinicId ?? null,
          editable: isEditable,
          diagnosis: diagnosisState.diagnosis,
          diagnosisCode: diagnosisState.diagnosisCode || null,
          diagnosisDescription: diagnosisState.diagnosisDescription || null,
          diagnosisSource: diagnosisState.source,
          onDiagnosisConfirm: handleDiagnosisConfirm,
          diagnosisError,
          notes,
          setNotes,
          treatment,
          onTreatmentChange: setTreatment,
          autosaveStatus,
          lastSavedAt,
          autosaveError,
        }}
          />
        </ConsultationClinicalProviders>
      ) : (
        <ConsultationWorkspace
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
          }}
          ordersSubTab={ordersSubTab}
          onOrdersSubTabChange={setOrdersSubTab}
          chiefComplaintDraft={chiefComplaintDraft}
          onChiefComplaintChange={setChiefComplaintDraft}
          editMode={editMode}
          isEditable={isEditable}
          aiTrigger={aiTrigger}
          onSaveClinicalRecord={handleSaveClinicalRecord}
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
          documentDisabled={{
            pdf: isLocked,
            invoice: isLocked,
            signedPrescription: !isSigned && !isLocked && !canSign,
          }}
          onLegacyInvoiceResult={handleActionResult}
          ordersHighlight={ordersHighlight}
          ordersRefreshKey={ordersRefreshKey}
          diagnosisCode={
            diagnosisState.diagnosisCode || diagnosisState.diagnosis || undefined
          }
          soap={{
            consultationId: id,
            clinicId: consultation.clinicId ?? ctxClinicId ?? null,
            editable: isEditable,
            diagnosis: diagnosisState.diagnosis,
            diagnosisCode: diagnosisState.diagnosisCode || null,
            diagnosisDescription: diagnosisState.diagnosisDescription || null,
            diagnosisSource: diagnosisState.source,
            onDiagnosisConfirm: handleDiagnosisConfirm,
            diagnosisError,
            notes,
            setNotes,
            treatment,
            onTreatmentChange: setTreatment,
            autosaveStatus,
            lastSavedAt,
            autosaveError,
          }}
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
  );
}
