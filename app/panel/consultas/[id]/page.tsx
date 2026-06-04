"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  fetchConsultation,
  updateConsultation,
  signConsultation,
  startCall,
  type NestConsultation,
} from "@/lib/services/consultations";
import { createDiagnosis } from "@/lib/services";
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
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";
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
  ConsultationActionBar,
  ConsultationConsentCard,
  ShareConsultationDialog,
  SignatureCanvas,
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
import { PatientBanner } from "./_components/PatientBanner";
import { PatientContextRail } from "./_components/PatientContextRail";
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
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  const [transitioning, setTransitioning] = useState(false);
  const [signing, setSigning] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "confirm">("idle");

  const [chiefComplaintDraft, setChiefComplaintDraft] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("soap");
  const [leftPaneTab, setLeftPaneTab] = useState<EncounterLeftPaneTab>("soap");
  const [rightPaneTab, setRightPaneTab] =
    useState<EncounterRightPaneTab>("orders");
  const [ordersSubTab, setOrdersSubTab] = useState<OrdersSubTab>("prescriptions");

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
      setDiagnosis(c.diagnosis ?? "");
      setTreatment(c.treatmentPlan ?? c.treatment ?? "");
      setChiefComplaintDraft(c.chiefComplaint ?? c.reason ?? "");
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

  const persistSoapDraft = useCallback(async () => {
    if (!consultation || !isEditable) return;
    const currentRecord = parseClinicalRecord(consultation.notes);
    const merged = serializeClinicalRecord({
      ...currentRecord,
      freeNotes: notes.trim(),
    });
    const updated = await updateConsultation(id, {
      notes: merged.length > 0 ? merged : undefined,
      diagnosis: diagnosis.trim() || undefined,
      treatmentPlan: treatment.trim() || undefined,
    });
    setConsultation(updated);
  }, [consultation, notes, diagnosis, treatment, id, isEditable]);

  const soapDraftKey = `${diagnosis}\n${notes}\n${treatment}`;

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
    setDiagnosisCode(item.code);
    setDiagnosis(`${item.code} - ${item.description}`);
    setDiagnosisError(null);
    try {
      await createDiagnosis({
        consultationId: id,
        cie10CodeId: item.cie10CodeId,
        diagnostic_date: new Date().toISOString(),
        diagnosis_details: `${item.code} - ${item.description}`,
      });
    } catch (e) {
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
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6 lg:p-8 xl:max-w-none 2xl:mx-auto 2xl:max-w-[1600px]">
      <PatientBanner
        patientName={patientName}
        chiefComplaint={consultation.reason || consultation.chiefComplaint || "—"}
        status={status}
        transitioning={transitioning}
        onBack={() => router.push("/panel/consultas")}
        onShare={() => setShareOpen(true)}
        onTransition={
          status === "draft" || status === "in_progress"
            ? () => void handleTransition()
            : undefined
        }
      />

      <ShareConsultationDialog
        consultationId={id}
        open={shareOpen}
        patientName={patientName}
        onClose={() => setShareOpen(false)}
      />

      <ConsultationActionBar
        isEditing={editMode}
        patientId={consultation.patientId ?? null}
        loading={{
          invoice: actionLoading.invoice,
          pdf: actionLoading.pdf,
          deleting: actionLoading.deleting,
          signedPrescription: actionLoading.signedPrescription,
          signedCertificate: actionLoading.signedCertificate,
          signedReferral: actionLoading.signedReferral,
          premium: actionLoading.premium,
        }}
        disabled={{
          startTele: !canStartCall || isLocked,
          prescription: isLocked,
          edit: isLocked,
          ai: isLocked,
          delete: isLocked,
          signedPrescription: !isSigned && !isLocked && !canSign,
        }}
        handlers={{
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
        onOpenDocuments={handleOpenDocuments}
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

      <div className="xl:hidden">
        <PatientContextRail
          patientId={consultation.patientId}
          patient={patientRow}
          profile={patientProfile}
          loading={patientContextLoading}
          error={patientContextError}
          fallbackName={patientName}
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
        diagnosisCode={diagnosisCode || diagnosis || undefined}
        soap={{
          consultationId: id,
          clinicId: consultation.clinicId ?? ctxClinicId ?? null,
          editable: isEditable,
          diagnosis,
          onDiagnosisChange: setDiagnosis,
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

      {canStartCall ? (
        <Card>
          <h3 className="text-base font-semibold text-slate-800">Teleconsulta</h3>
          <p className="mt-2 text-sm text-slate-600">
            Inicie una videollamada con el paciente. La consulta cambiará
            automáticamente a &quot;En progreso&quot;.
          </p>
          <button
            type="button"
            onClick={() => void handleStartCall()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            <span aria-hidden>📹</span>
            Iniciar Teleconsulta
          </button>
        </Card>
      ) : null}

      <Card>
        <h3 className="text-base font-semibold text-slate-800">Firma del médico</h3>
        {isSigned ? (
          <div className="mt-3">
            <p className="text-sm font-semibold text-green-700">
              Consulta firmada el{" "}
              {consultation.signedAt
                ? new Date(consultation.signedAt).toLocaleString("es")
                : "—"}
            </p>
            {consultation.doctorSignature ? (
              <div className="mt-3 inline-block rounded-lg border border-slate-200 bg-slate-50 p-2">
                <Image
                  unoptimized
                  src={`data:image/png;base64,${consultation.doctorSignature}`}
                  alt="Firma del doctor"
                  width={300}
                  height={120}
                  className="h-auto max-h-[120px] w-auto max-w-[300px]"
                />
              </div>
            ) : null}
          </div>
        ) : canSign ? (
          <div className="mt-3">
            <p className="mb-3 text-sm text-slate-600">
              Firme para cerrar esta consulta. La firma es inmutable una vez
              registrada.
            </p>
            <SignatureCanvas onSign={handleSign} disabled={signing} />
            {signing ? (
              <p className="mt-2 text-sm text-slate-500">Firmando...</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            La consulta debe estar en progreso o completada para poder firmar.
          </p>
        )}
        {saveMsg && !isEditable && !canPay ? (
          <p
            className={`mt-2 text-sm ${saveMsg.includes("Error") ? "text-red-600" : "text-green-700"}`}
          >
            {saveMsg}
          </p>
        ) : null}
      </Card>

      {canPay && !isLocked ? (
        <Card>
          <h3 className="text-base font-semibold text-slate-800">Pago de consulta</h3>
          <p className="mt-1 text-sm font-semibold text-primary">{URGENCY_AVAILABLE_NOW}</p>
          <p className="mt-2 text-sm text-slate-600">
            La consulta ha sido firmada. Confirma el monto y continúa al pago
            seguro para finalizar y bloquear la consulta.
          </p>
          {paymentStep === "idle" ? (
            <button
              type="button"
              onClick={() => {
                setSaveMsg("");
                setPaymentStep("confirm");
              }}
              disabled={creatingPayment}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <span aria-hidden>💳</span>
              Pagar consulta
            </button>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">Confirmar pago</p>
              <p className="mt-2 text-2xl text-slate-900">
                {consultationPrice.loading
                  ? "…"
                  : formatConsultationPrice(
                      consultationPrice.amount,
                      consultationPrice.currency,
                    )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Serás redirigido a nuestro proveedor de pago (Payku) para
                completar la transacción de forma segura.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePaymentAbandoned("user_cancelled_confirm")}
                  disabled={creatingPayment}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => void executePaymentToProvider()}
                  disabled={creatingPayment}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {creatingPayment
                    ? "Conectando con el proveedor de pago…"
                    : "Continuar al pago"}
                </button>
              </div>
            </div>
          )}
          {saveMsg ? (
            <p
              className={`mt-3 text-sm leading-relaxed ${
                saveMsg.includes("expiró") ||
                saveMsg.includes("No pudimos") ||
                saveMsg.includes("No tienes") ||
                saveMsg.includes("no está disponible") ||
                saveMsg.includes("no encontramos")
                  ? "text-red-600"
                  : "text-green-700"
              }`}
            >
              {saveMsg}
            </p>
          ) : null}
        </Card>
      ) : null}

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
