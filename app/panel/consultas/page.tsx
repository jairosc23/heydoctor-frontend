"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConsultation } from "@/context/ConsultationContext";
import {
  fetchPatients,
  fetchConsultations,
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
} from "@/components/clinical";

function ConsultasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  } = useConsultation();

  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [consultations, setConsultations] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [consentGivenAt, setConsentGivenAt] = useState<string | null | undefined>(
    undefined
  );
  const [consentVersion, setConsentVersion] = useState<string | null | undefined>(
    undefined
  );

  // Load patient when patientIdParam present
  useEffect(() => {
    if (patientIdParam && patientIdParam !== patientId) {
      setPatient(patientIdParam);
    }
  }, [patientIdParam, patientId, setPatient]);

  // Load patients for selector
  useEffect(() => {
    fetchPatients({ limit: 100 })
      .then(({ data }) =>
        setPatients(Array.isArray(data) ? (data as PatientRow[]) : [])
      )
      .catch(() => setPatients([]));
  }, []);

  // Load consultations (Nest: lista filtrada por clínica del JWT)
  useEffect(() => {
    setLoading(true);
    fetchConsultations({ limit: 20 })
      .then(({ data }) => setConsultations(Array.isArray(data) ? data : []))
      .catch(() => setConsultations([]))
      .finally(() => setLoading(false));
  }, []);

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

  const handleStartConsultation = async () => {
    if (!patientIdParam && !patientId) return;
    const pid = patientIdParam ?? patientId;
    if (!pid) return;
    setStarting(true);
    try {
      await startConsultation(pid);
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
    try {
      await createDiagnosis({
        consultationId,
        cie10CodeId: item.cie10CodeId,
        diagnostic_date: new Date().toISOString(),
        diagnosis_details: `${item.code} - ${item.description}`,
      });
    } catch {
      // Show error could be added
    }
  };

  const selectedPatient = patients.find((p) => p.id === (patientId ?? patientIdParam));

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
          <select
            value={patientIdParam ?? patientId ?? ""}
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
              !(patientIdParam ?? patientId) ||
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
            {starting ? "Iniciando..." : "Iniciar consulta"}
          </button>
          {!doctorId && !ctxLoading && (
            <p style={{ marginTop: 8, color: "#c00", fontSize: 13 }}>
              No se pudo identificar al médico en sesión. Vuelve a iniciar sesión.
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
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          <div>
            <AiInsightsPanel
              patientId={patientId}
              consultationId={consultationId}
            />
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
                    style={{
                      padding: "12px 16px",
                      background: "white",
                      marginBottom: 8,
                      borderRadius: 8,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    {patientLabel}{" "}
                    · {when ? new Date(when).toLocaleDateString() : "—"} ·{" "}
                    {c.status ?? "—"}
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
