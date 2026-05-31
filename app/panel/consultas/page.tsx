"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useConsultation } from "@/context/ConsultationContext";
import {
  useConsultationsListQuery,
  usePatientsListQuery,
} from "@/lib/hooks/use-panel-list-queries";
import {
  fetchConsultation,
  createDiagnosis,
  type PatientRow,
} from "@/lib/services";
import {
  SmartDiagnosisPicker,
  PrescriptionPanel,
  LabOrdersPanel,
  AiInsightsPanel,
  LiveAiNoteSuggestions,
  ConsultationConsentCard,
  ConsultationAssistPanel,
  ShareConsultationDialog,
} from "@/components/clinical";
import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";
import { useConsultationPrice } from "@/lib/hooks/useConsultationPrice";

function ConsultasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const patientIdParam = searchParams.get("patientId");
  const {
    patientId,
    consultationId,
    clinicId,
    doctorId,
    startConsultation,
    setPatient,
    endConsultation,
    isLoading: ctxLoading,
    clinicalNotes,
    setClinicalNotes,
    clinicalDiagnosisText,
    setClinicalDiagnosisText,
    startError,
    clearStartError,
    hasTelemedicineConsent,
  } = useConsultation();

  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const patientsQuery = usePatientsListQuery({ limit: 100 });
  const consultationsQuery = useConsultationsListQuery({ limit: 20 });

  const patients: PatientRow[] = Array.isArray(patientsQuery.data?.data)
    ? (patientsQuery.data.data as PatientRow[])
    : [];
  const consultations: unknown[] = Array.isArray(consultationsQuery.data?.data)
    ? consultationsQuery.data.data
    : [];

  const loading = patientsQuery.isPending || consultationsQuery.isPending;
  const [starting, setStarting] = useState(false);
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [consentGivenAt, setConsentGivenAt] = useState<string | null | undefined>(
    undefined
  );
  const [consentVersion, setConsentVersion] = useState<string | null | undefined>(
    undefined
  );

  // Sincronizar solo cuando cambia la query (?patientId=); no incluir `patientId` en deps
  // para no revertir el paciente elegido en el dropdown.
  useEffect(() => {
    if (patientIdParam) {
      setPatient(patientIdParam);
    }
  }, [patientIdParam, setPatient]);

  useEffect(() => {
    if (!consultationId) {
      setConsentGivenAt(undefined);
      setConsentVersion(undefined);
      return;
    }
    setConsentGivenAt(undefined);
    setConsentVersion(undefined);
    let cancelled = false;
    fetchConsultation(consultationId)
      .then((c) => {
        if (cancelled) return;
        const raw = c.consentGivenAt;
        const at =
          raw == null || raw === ""
            ? null
            : typeof raw === "string"
              ? raw
              : String(raw);
        setConsentGivenAt(at);
        setConsentVersion(c.consentVersion ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setConsentGivenAt(null);
          setConsentVersion(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [consultationId]);

  /**
   * La ficha clínica completa y la barra de acciones viven en
   * `/panel/consultas/[id]`. Si el contexto tiene `consultationId` pero la URL
   * sigue siendo exactamente `/panel/consultas` (p. ej. tras iniciar consulta
   * o al volver atrás), llevamos al médico al detalle para que vea siempre la
   * misma UI que en producción de referencia.
   */
  useEffect(() => {
    if (!consultationId) return;
    if (pathname !== "/panel/consultas") return;
    router.replace(`/panel/consultas/${consultationId}`);
  }, [consultationId, pathname, router]);

  const handleStartConsultation = async () => {
    const pid = (patientId ?? patientIdParam ?? "").trim();
    if (!pid) return;
    clearStartError();
    setStarting(true);
    try {
      const cid = await startConsultation(pid);
      if (cid) {
        router.push(`/panel/consultas/${cid}`);
      }
    } finally {
      setStarting(false);
    }
  };

  const handleDiagnosisConfirm = async (item: {
    code: string;
    description: string;
    cie10CodeId?: string;
  }) => {
    if (!consultationId) return;
    setDiagnosisCode(item.code);
    setClinicalDiagnosisText(`${item.code} - ${item.description}`);
    setDiagnosisError(null);
    if (process.env.NODE_ENV === "development") {
      console.debug("[heydoctor][diagnostic] confirmar", {
        consultationId,
        code: item.code,
      });
    }
    try {
      await createDiagnosis({
        consultationId,
        cie10CodeId: item.cie10CodeId,
        diagnostic_date: new Date().toISOString(),
        diagnosis_details: `${item.code} - ${item.description}`,
      });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "No se pudo guardar el diagnóstico. Reintenta.";
      setDiagnosisError(msg);
      if (process.env.NODE_ENV === "development") {
        console.error("[heydoctor][diagnostic] guardar falló", e);
      }
    }
  };

  const selectedPatient = patients.find(
    (p) => p.id === (patientId ?? patientIdParam ?? ""),
  );
  const consultationPrice = useConsultationPrice();

  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat",
          color: "#078a92",
          marginBottom: 12,
        }}
      >
        Consultas
      </h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Gestión de consultas médicas.
      </p>

      {/* Patient selector / consultation starter */}
      {!consultationId ? (
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>Iniciar consulta</h3>
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
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "#334155" }}>
            Valor referencial de la consulta:{" "}
            <strong style={{ color: "#078a92" }}>
              {consultationPrice.loading
                ? "…"
                : formatConsultationPrice(
                    consultationPrice.amount,
                    consultationPrice.currency,
                  )}
            </strong>{" "}
            <span style={{ color: "#64748b", fontSize: 12 }}>
              (mismo monto que verás al pagar con Payku)
            </span>
          </p>
          <select
            value={patientId ?? patientIdParam ?? ""}
            onChange={(e) => setPatient(e.target.value || null)}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              minWidth: 280,
              marginRight: 12,
              marginBottom: 12,
            }}
          >
            <option value="">Seleccionar paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {[p.firstname, p.lastname].filter(Boolean).join(" ") || p.id}
              </option>
            ))}
          </select>
          <button
            onClick={handleStartConsultation}
            disabled={
              starting ||
              ctxLoading ||
              !(patientId ?? patientIdParam)?.trim() ||
              !doctorId
            }
            style={{
              padding: "10px 20px",
              background: "#078a92",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: starting ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            {starting ? "Iniciando..." : "Hablar con médico ahora"}
          </button>
          {!doctorId && !ctxLoading && (
            <p style={{ marginTop: 8, color: "#c00", fontSize: 13 }}>
              No se pudo identificar al médico en sesión. Vuelve a iniciar sesión.
            </p>
          )}
          {hasTelemedicineConsent === false && !startError && (
            <p
              style={{
                marginTop: 8,
                color: "#92400e",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              Antes de iniciar tu primera consulta debes aceptar el
              consentimiento informado de telemedicina. Se mostrará al pulsar
              «Hablar con médico ahora».
            </p>
          )}
          {startError && (
            <p
              role="alert"
              style={{
                marginTop: 8,
                color: "#b91c1c",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
              }}
            >
              {startError}
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "#e8f7f7",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span>
            Consulta activa:{" "}
            <strong>
              {selectedPatient
                ? [selectedPatient.firstname, selectedPatient.lastname]
                    .filter(Boolean)
                    .join(" ")
                : patientId}
            </strong>
          </span>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                consultationId &&
                router.push(`/panel/consultas/${consultationId}/teleconsulta`)
              }
              disabled={!consultationId}
              style={{
                padding: "8px 16px",
                background: "#078a92",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: consultationId ? "pointer" : "not-allowed",
                fontSize: 13,
              }}
            >
              📹 Iniciar Teleconsulta
            </button>
            <button
              onClick={() => consultationId && setShareOpen(true)}
              disabled={!consultationId}
              style={{
                padding: "8px 16px",
                background: "white",
                color: "#078a92",
                border: "1px solid #078a92",
                borderRadius: 8,
                cursor: consultationId ? "pointer" : "not-allowed",
                fontSize: 13,
              }}
            >
              🔗 Compartir
            </button>
            <button
              onClick={endConsultation}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: "#c00",
                border: "1px solid #c00",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cerrar consulta
            </button>
          </div>
        </div>
      )}

      {consultationId && (
        <ShareConsultationDialog
          consultationId={consultationId}
          open={shareOpen}
          patientName={
            selectedPatient
              ? [selectedPatient.firstname, selectedPatient.lastname]
                  .filter(Boolean)
                  .join(" ")
              : undefined
          }
          onClose={() => setShareOpen(false)}
        />
      )}

      {/* Consultation workspace */}
      {consultationId && patientId && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {consentGivenAt !== undefined && consentVersion !== undefined ? (
              <ConsultationConsentCard
                consentGivenAt={consentGivenAt}
                consentVersion={consentVersion}
              />
            ) : (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                Cargando información de consentimiento…
              </div>
            )}
            {/* Diagnosis */}
            <div
              style={{
                background: "white",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <h3 style={{ marginBottom: 12, fontSize: 16 }}>Diagnóstico</h3>
              <SmartDiagnosisPicker
                value={clinicalDiagnosisText}
                onChange={() => {}}
                onConfirm={handleDiagnosisConfirm}
                clinicId={clinicId}
              />
              {diagnosisError && (
                <p
                  role="alert"
                  style={{
                    marginTop: 8,
                    color: "#b91c1c",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                  }}
                >
                  {diagnosisError}
                </p>
              )}
            </div>

            <div
              style={{
                background: "white",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <h3 style={{ marginBottom: 12, fontSize: 16 }}>Notas de consulta</h3>
              <LiveAiNoteSuggestions
                consultationId={consultationId}
                notes={clinicalNotes}
                setNotes={setClinicalNotes}
                diagnosisContext={clinicalDiagnosisText}
                patientAge={selectedPatient?.age}
                patientSex={
                  selectedPatient?.sex ?? selectedPatient?.gender
                }
              />
            </div>

            {/* Prescriptions & Lab */}
            <PrescriptionPanel
              patientId={patientId}
              consultationId={consultationId}
              diagnosisCode={diagnosisCode || clinicalDiagnosisText || undefined}
            />
            <LabOrdersPanel
              patientId={patientId}
              consultationId={consultationId}
              diagnosisCode={diagnosisCode || clinicalDiagnosisText || undefined}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ConsultationAssistPanel initialNotes={clinicalNotes} />
            <AiInsightsPanel
              patientId={patientId}
              consultationId={consultationId}
            />
            {consultationId && (
              <ChatPanel consultationId={consultationId} sender="doctor" />
            )}
          </div>
        </div>
      )}

      {/* Recent consultations list */}
      {!consultationId && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Consultas recientes</h3>
          {loading ? (
            <p style={{ color: "#666" }}>Cargando...</p>
          ) : consultations.length === 0 ? (
            <p style={{ color: "#666" }}>No hay consultas.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {(consultations as {
                id: string;
                createdAt?: string;
                date?: string;
                status?: string;
                patient?: {
                  firstname?: string;
                  lastname?: string;
                  name?: string;
                };
              }[]).map((c) => {
                const patientLabel = c.patient
                  ? c.patient.name ||
                    [c.patient.firstname, c.patient.lastname]
                      .filter(Boolean)
                      .join(" ")
                  : "Paciente";
                const when = c.createdAt ?? c.date;
                return (
                  <li
                    key={c.id}
                    onClick={() => router.push(`/panel/consultas/${c.id}`)}
                    style={{
                      padding: "12px 16px",
                      background: "white",
                      marginBottom: 8,
                      borderRadius: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      {patientLabel}{" "}
                      · {when ? new Date(when).toLocaleDateString() : "—"} ·{" "}
                      {c.status ?? "—"}
                    </span>
                    <span style={{ color: "#078a92", fontSize: 13 }}>
                      Ver detalle →
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConsultasPage() {
  return (
    <Suspense fallback={<div style={{ padding: 25 }}>Cargando...</div>}>
      <ConsultasContent />
    </Suspense>
  );
}
