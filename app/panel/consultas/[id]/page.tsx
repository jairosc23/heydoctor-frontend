"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  fetchConsultation,
  updateConsultation,
  signConsultation,
  startCall,
  type NestConsultation,
} from "@/lib/services/consultations";
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
import { ApiError } from "@/lib/heydoctor-api";
import {
  ClinicalRecordPanel,
  ConsultationActionBar,
  ConsultationConsentCard,
  PrescriptionPanel,
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

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  in_progress: "En progreso",
  completed: "Completada",
  signed: "Firmada",
  locked: "Bloqueada",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  in_progress: "#0284c7",
  completed: "#16a34a",
  signed: "#7c3aed",
  locked: "#dc2626",
};

const NEXT_STATUS: Record<string, string> = {
  draft: "in_progress",
  in_progress: "completed",
};

const NEXT_STATUS_LABELS: Record<string, string> = {
  draft: "Iniciar consulta",
  in_progress: "Marcar como completada",
};

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const consultationPrice = useConsultationPrice();

  const [consultation, setConsultation] = useState<NestConsultation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [transitioning, setTransitioning] = useState(false);
  const [signing, setSigning] = useState(false);
  const [startingCall, setStartingCall] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "confirm">("idle");

  /** Estado del editor estructurado (ficha clínica + barra de acciones). */
  const [chiefComplaintDraft, setChiefComplaintDraft] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    invoice: false,
    pdf: false,
    deleting: false,
    signedPrescription: false,
    signedCertificate: false,
    signedReferral: false,
    premium: false,
  });
  const [actionMsg, setActionMsg] = useState<
    | { kind: "info" | "success" | "warning" | "error"; text: string; href?: string }
    | null
  >(null);

  /** Trigger para que ClinicalRecordPanel ejecute "Autollenar con IA". */
  const [aiTrigger, setAiTrigger] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

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
      /** El textarea "Notas de consulta" muestra solo las notas libres
       * (sin el bloque estructurado de la ficha cl\u00ednica). El panel de
       * ficha cl\u00ednica trabaja con `c.notes` crudo. */
      setNotes(parseClinicalRecord(c.notes).freeNotes);
      setDiagnosis(c.diagnosis ?? "");
      setTreatment(c.treatmentPlan ?? c.treatment ?? "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar consulta"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (paymentResult !== "success" && paymentResult !== "mock") {
      return;
    }
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
            "Pago en proceso de confirmación. Actualiza en unos segundos o revisa el estado de la consulta."
          );
          setTimeout(() => setSaveMsg(""), 8000);
        } else {
          setSaveMsg(
            "No confirmamos un pago completado todavía. Si ya pagaste, espera la confirmación; si no, puedes intentar de nuevo."
          );
          setTimeout(() => setSaveMsg(""), 8000);
        }
      } catch {
        if (!cancelled) {
          setSaveMsg(
            "No pudimos verificar el pago. Revisa tu conexión o vuelve a intentar más tarde."
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

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      /** Combina las notas libres con el bloque estructurado de la ficha
       * cl\u00ednica para no perder la informaci\u00f3n estructurada al editar el
       * textarea legacy. */
      const currentRecord = parseClinicalRecord(consultation?.notes);
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
      setSaveMsg("Guardado correctamente");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleTransition() {
    if (!consultation) return;
    const next = NEXT_STATUS[consultation.status ?? ""];
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
      setSaveMsg(
        err instanceof Error ? err.message : "Error al cambiar estado"
      );
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

  async function handleStartCall() {
    setStartingCall(true);
    setSaveMsg("");
    try {
      await startCall(id);
      router.push(`/panel/consultas/${id}/teleconsulta`);
    } catch (err) {
      setSaveMsg(
        err instanceof Error ? err.message : "Error al iniciar videollamada"
      );
      setStartingCall(false);
    }
  }

  /* ──────── Ficha cl\u00ednica + Action Bar handlers ──────── */

  /** Sincroniza el draft del motivo cuando llega/recarga la consulta. */
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
        `${label}: ${result.message ?? "esta acci\u00f3n estar\u00e1 disponible pronto."}`,
        undefined,
        9000,
      );
      return;
    }
    flashAction(
      "error",
      `${label}: ${result.message ?? "no se pudo completar la acci\u00f3n."}`,
      undefined,
      9000,
    );
  }

  async function handleSaveClinicalRecord({
    notes,
    chiefComplaint,
  }: {
    notes: string;
    chiefComplaint: string;
  }) {
    if (!consultation) return;
    const updated = await updateConsultation(id, {
      notes,
      chiefComplaint: chiefComplaint || undefined,
    });
    setConsultation(updated);
    setNotes(updated.notes ?? "");
  }

  function handleOpenPrescription() {
    setShowPrescription((v) => !v);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        const el = document.getElementById("prescription-section");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
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
  }

  function handleAnalyzeWithAi() {
    setAiTrigger((n) => n + 1);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        const el = document.getElementById("clinical-record-section");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
    flashAction(
      "info",
      "Generando propuesta con IA en la ficha cl\u00ednica\u2026",
      undefined,
      3500,
    );
  }

  async function handleDeleteConsultation() {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "\u00bfEliminar esta consulta? Esta acci\u00f3n no se puede deshacer.",
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
    handleActionResult("Certificado m\u00e9dico firmado", r);
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
      <div style={{ padding: 25, color: "#666" }}>Cargando consulta...</div>
    );
  }

  if (error || !consultation) {
    return (
      <div style={{ padding: 25 }}>
        <p style={{ color: "#c00" }}>{error || "Consulta no encontrada"}</p>
        <button
          onClick={() => router.push("/panel/consultas")}
          style={{
            marginTop: 12,
            padding: "8px 16px",
            background: "#078a92",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Volver a consultas
        </button>
      </div>
    );
  }

  const status = consultation.status ?? "draft";
  const isEditable = status === "draft" || status === "in_progress";
  const canSign = status === "in_progress" || status === "completed";
  const isSigned = status === "signed" || status === "locked";
  const isLocked = status === "locked";
  const canStartCall = status === "draft" || status === "in_progress";
  const canPay = status === "signed" || status === "completed";
  const patientName =
    consultation.patient?.name ||
    consultation.patient?.email ||
    "Paciente";

  return (
    <div style={{ padding: 25, maxWidth: 1100 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <button
            onClick={() => router.push("/panel/consultas")}
            style={{
              background: "none",
              border: "none",
              color: "#078a92",
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            &larr; Volver a consultas
          </button>
          <h1
            style={{
              fontFamily: "Montserrat",
              color: "#078a92",
              margin: 0,
              fontSize: 22,
            }}
          >
            Consulta &mdash; {patientName}
          </h1>
          <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
            Motivo: {consultation.reason || "\u2014"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            style={{
              padding: "8px 14px",
              background: "white",
              color: "#0f766e",
              border: "1px solid #0f766e",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Compartir
          </button>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              color: "white",
              background: STATUS_COLORS[status] ?? "#94a3b8",
            }}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
          {NEXT_STATUS[status] && (
            <button
              onClick={handleTransition}
              disabled={transitioning}
              style={{
                padding: "8px 16px",
                background: "#078a92",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: transitioning ? "not-allowed" : "pointer",
                fontSize: 13,
              }}
            >
              {transitioning ? "Cambiando..." : NEXT_STATUS_LABELS[status]}
            </button>
          )}
        </div>
      </div>

      <ShareConsultationDialog
        consultationId={id}
        open={shareOpen}
        patientName={patientName}
        onClose={() => setShareOpen(false)}
      />

      {/* Action bar (chips) */}
      <ConsultationActionBar
        isEditing={editMode}
        patientId={consultation.patientId ?? null}
        loading={{
          starting: startingCall,
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
      />

      {actionMsg ? (
        <div
          role="status"
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 13,
            background:
              actionMsg.kind === "success"
                ? "#ecfdf5"
                : actionMsg.kind === "warning"
                  ? "#fffbeb"
                  : actionMsg.kind === "error"
                    ? "#fef2f2"
                    : "#eff6ff",
            color:
              actionMsg.kind === "success"
                ? "#065f46"
                : actionMsg.kind === "warning"
                  ? "#92400e"
                  : actionMsg.kind === "error"
                    ? "#991b1b"
                    : "#1e3a8a",
            border:
              actionMsg.kind === "success"
                ? "1px solid #a7f3d0"
                : actionMsg.kind === "warning"
                  ? "1px solid #fde68a"
                  : actionMsg.kind === "error"
                    ? "1px solid #fecaca"
                    : "1px solid #bfdbfe",
          }}
        >
          {actionMsg.text}
          {actionMsg.href ? (
            <>
              {" "}
              <a
                href={actionMsg.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0f766e", fontWeight: 600 }}
              >
                Abrir documento \u2192
              </a>
            </>
          ) : null}
        </div>
      ) : null}

      {/* Ficha cl\u00ednica estructurada (motivo, HEA, revisi\u00f3n por sistemas) */}
      <div id="clinical-record-section" style={{ marginBottom: 20 }}>
        <ClinicalRecordPanel
          consultationId={id}
          rawNotes={consultation.notes ?? ""}
          chiefComplaint={chiefComplaintDraft}
          onChiefComplaintChange={setChiefComplaintDraft}
          createdAt={consultation.createdAt ?? null}
          editable={isEditable && editMode}
          patient={
            consultation.patient
              ? {
                  name: consultation.patient.name ?? null,
                }
              : null
          }
          onSave={handleSaveClinicalRecord}
          autofillRequest={aiTrigger}
        />
      </div>

      {/* Payment success banner */}
      {isLocked && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>&#x2705;</span>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: 14,
                color: "#166534",
              }}
            >
              Consulta pagada y bloqueada
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "#15803d",
              }}
            >
              Esta consulta ha sido finalizada. No se permiten modificaciones.
            </p>
          </div>
        </div>
      )}

      {/* Consent */}
      <div style={{ marginBottom: 20 }}>
        <ConsultationConsentCard
          consentGivenAt={consultation.consentGivenAt}
          consentVersion={consultation.consentVersion}
        />
      </div>

      {/* Video call section */}
      {canStartCall && (
        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#333" }}>
            Teleconsulta
          </h3>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>
            Inicie una videollamada con el paciente. La consulta cambiará
            automáticamente a &quot;En progreso&quot;.
          </p>
          <button
            onClick={handleStartCall}
            disabled={startingCall}
            style={{
              padding: "12px 24px",
              background: "#0284c7",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: startingCall ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>&#x1F4F9;</span>
            {startingCall ? "Conectando..." : "Iniciar videollamada"}
          </button>
        </div>
      )}

      {/* Clinical data */}
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginBottom: 20,
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>
          Datos clínicos
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                display: "block",
                marginBottom: 4,
              }}
            >
              Diagnóstico
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={!isEditable}
              rows={3}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                resize: "vertical",
                background: isEditable ? "white" : "#f8fafc",
              }}
              placeholder="Ingrese el diagnóstico..."
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                display: "block",
                marginBottom: 4,
              }}
            >
              Notas de consulta
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isEditable}
              rows={6}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                resize: "vertical",
                background: isEditable ? "white" : "#f8fafc",
              }}
              placeholder="Evolución, hallazgos, plan..."
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                display: "block",
                marginBottom: 4,
              }}
            >
              Tratamiento
            </label>
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              disabled={!isEditable}
              rows={3}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                resize: "vertical",
                background: isEditable ? "white" : "#f8fafc",
              }}
              placeholder="Indicaciones, medicación, seguimiento..."
            />
          </div>

          {isEditable && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 24px",
                  background: "#078a92",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {saving ? "Guardando..." : "Guardar datos clínicos"}
              </button>
              {saveMsg && (
                <span
                  style={{
                    fontSize: 13,
                    color: saveMsg.includes("Error") ? "#c00" : "#16a34a",
                  }}
                >
                  {saveMsg}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Prescription panel (toggle desde la action bar) */}
      {showPrescription && consultation.patientId ? (
        <div id="prescription-section" style={{ marginBottom: 20 }}>
          <PrescriptionPanel
            patientId={consultation.patientId}
            consultationId={id}
            diagnosisCode={diagnosis || undefined}
          />
        </div>
      ) : null}

      {/* Signature section */}
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          marginBottom: 20,
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#333" }}>
          Firma del médico
        </h3>
        {isSigned ? (
          <div>
            <p style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}>
              Consulta firmada el{" "}
              {consultation.signedAt
                ? new Date(consultation.signedAt).toLocaleString("es")
                : "\u2014"}
            </p>
            {consultation.doctorSignature && (
              <div
                style={{
                  marginTop: 12,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 8,
                  display: "inline-block",
                  background: "#f8fafc",
                }}
              >
                <Image
                  unoptimized
                  src={`data:image/png;base64,${consultation.doctorSignature}`}
                  alt="Firma del doctor"
                  width={300}
                  height={120}
                  style={{ maxWidth: 300, maxHeight: 120, width: "auto", height: "auto" }}
                />
              </div>
            )}
          </div>
        ) : canSign ? (
          <div>
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>
              Firme para cerrar esta consulta. La firma es inmutable una vez
              registrada.
            </p>
            <SignatureCanvas onSign={handleSign} disabled={signing} />
            {signing && (
              <p style={{ color: "#666", fontSize: 13, marginTop: 8 }}>
                Firmando...
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>
            La consulta debe estar en progreso o completada para poder firmar.
          </p>
        )}
        {saveMsg && !isEditable && !canPay && (
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: saveMsg.includes("Error") ? "#c00" : "#16a34a",
            }}
          >
            {saveMsg}
          </p>
        )}
      </div>

      {/* Payment section */}
      {canPay && !isLocked && (
        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#333" }}>
            Pago de consulta
          </h3>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              fontWeight: 600,
              color: "#0f766e",
            }}
          >
            {URGENCY_AVAILABLE_NOW}
          </p>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>
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
              style={{
                padding: "12px 24px",
                background: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: creatingPayment ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>&#x1F4B3;</span>
              Pagar consulta
            </button>
          ) : (
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 16,
                background: "#fafafa",
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>
                Confirmar pago
              </p>
              <p style={{ margin: "0 0 4px", fontSize: 22, color: "#1e293b" }}>
                {consultationPrice.loading
                  ? "…"
                  : formatConsultationPrice(
                      consultationPrice.amount,
                      consultationPrice.currency,
                    )}
              </p>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>
                Serás redirigido a nuestro proveedor de pago (Payku) para
                completar la transacción de forma segura.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => handlePaymentAbandoned("user_cancelled_confirm")}
                  disabled={creatingPayment}
                  style={{
                    padding: "10px 18px",
                    background: "white",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    cursor: creatingPayment ? "not-allowed" : "pointer",
                    fontSize: 14,
                  }}
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => void executePaymentToProvider()}
                  disabled={creatingPayment}
                  style={{
                    padding: "10px 18px",
                    background: creatingPayment ? "#a78bfa" : "#7c3aed",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: creatingPayment ? "wait" : "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {creatingPayment
                    ? "Conectando con el proveedor de pago…"
                    : "Continuar al pago"}
                </button>
              </div>
            </div>
          )}
          {saveMsg && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color:
                  saveMsg.includes("expiró") ||
                  saveMsg.includes("No pudimos") ||
                  saveMsg.includes("No tienes") ||
                  saveMsg.includes("no está disponible") ||
                  saveMsg.includes("no encontramos")
                    ? "#b91c1c"
                    : "#16a34a",
                lineHeight: 1.45,
              }}
            >
              {saveMsg}
            </p>
          )}
        </div>
      )}

      {/* General status message for non-editable states */}
      {!isEditable && !canPay && !isLocked && saveMsg && (
        <p
          style={{
            fontSize: 13,
            color: saveMsg.includes("Error") ? "#c00" : "#16a34a",
          }}
        >
          {saveMsg}
        </p>
      )}
    </div>
  );
}
