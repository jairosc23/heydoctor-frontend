"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  fetchConsultation,
  updateConsultation,
  signConsultation,
  startCall,
  type NestConsultation,
} from "@/lib/services/consultations";
import { createPaymentSession } from "@/lib/services/payments";
import { ConsultationConsentCard, SignatureCanvas } from "@/components/clinical";

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

  const paymentResult = searchParams.get("payment");

  const load = useCallback(async () => {
    try {
      const c = await fetchConsultation(id);
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
      setSaveMsg("Pago procesado correctamente");
      setTimeout(() => setSaveMsg(""), 5000);
      load();
    }
  }, [paymentResult, load]);

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
      const updated = await updateConsultation(id, { status: next });
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
    setSigning(true);
    try {
      const updated = await signConsultation(id, base64);
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

  async function handlePayment() {
    setCreatingPayment(true);
    setSaveMsg("");
    try {
      const { paymentUrl } = await createPaymentSession(id);
      window.location.href = paymentUrl;
    } catch (err) {
      setSaveMsg(
        err instanceof Error ? err.message : "Error al crear sesión de pago"
      );
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${consultation.doctorSignature}`}
                  alt="Firma del doctor"
                  style={{ maxWidth: 300, maxHeight: 120 }}
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
          <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#333" }}>
            Pago de consulta
          </h3>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>
            La consulta ha sido firmada. Proceda al pago para finalizar y
            bloquear la consulta.
          </p>
          <button
            onClick={handlePayment}
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
            {creatingPayment ? "Redirigiendo a Payku..." : "Pagar consulta"}
          </button>
          {saveMsg && (
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
