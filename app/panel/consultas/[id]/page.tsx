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
import { createPaymentSession } from "@/lib/services/payments";
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
import { ConsultationConsentCard, SignatureCanvas } from "@/components/clinical";

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
      setNotes(c.notes ?? "");
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
    if (paymentResult === "success") {
      setPaymentStep("idle");
      setSaveMsg("Pago procesado correctamente");
      setTimeout(() => setSaveMsg(""), 5000);
      load();
    }
  }, [paymentResult, load]);

  useEffect(() => {
    setPaymentStep("idle");
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateConsultation(id, {
        notes: notes.trim() || undefined,
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
    <div style={{ padding: 25, maxWidth: 900 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
