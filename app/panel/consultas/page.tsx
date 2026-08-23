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
  LiveAiNoteSuggestions,
  ConsultationConsentCard,
  ShareConsultationDialog,
} from "@/components/clinical";
import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";
import { useConsultationPrice } from "@/lib/hooks/useConsultationPrice";
import { openWorkspaceShare } from "@/lib/clinical-workspace/visual-surfaces";
import { useVisualWorkspaceState } from "@/lib/clinical-workspace/use-visual-workspace-state";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";

/**
 * Phase 4.9.0 — Guard-rail: workspace inline legacy no se renderiza.
 * Flujo canónico: /panel/consultas/[id]. Código legacy conservado bajo flag.
 */
const LEGACY_INLINE_CONSULTATION_WORKSPACE = false;

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
  const visualWorkspace = useVisualWorkspaceState();
  const shareOpen = visualWorkspace.activeSurface === "share";

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
        // CW-2: acceso directo al encounter canónico (sin flash de workspace intermedio).
        router.replace(`/panel/consultas/${cid}`);
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
    <div className="space-y-5">
      {/*
        CW-2: si hay consulta activa en contexto y aún estamos en /panel/consultas,
        el useEffect hace replace al encounter. No mostrar banner intermedio.
      */}
      {!LEGACY_INLINE_CONSULTATION_WORKSPACE && consultationId ? (
        <div
          className="rounded-2xl border border-hd-border-subtle bg-hd-surface-chrome px-4 py-6 text-sm text-primaryDark/70"
          data-testid="consultation-entry-redirect"
          aria-live="polite"
        >
          Abriendo ficha clínica…
        </div>
      ) : null}

      {!(!LEGACY_INLINE_CONSULTATION_WORKSPACE && consultationId) ? (
        <>
      <div>
        <h1
          className="mb-3 text-2xl font-bold text-primary"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Consultas
        </h1>
        <p className="mb-0 text-primaryDark/70">
          Gestión de consultas médicas.
        </p>
      </div>

      {/* Patient selector / consultation starter */}
      {!consultationId ? (
        <div className="mb-6 rounded-2xl bg-hd-surface-chrome p-5 shadow-premium">
          <h3 className="mb-3 text-base font-bold text-primaryDark">Iniciar consulta</h3>
          <p className="mb-2 text-[13px] font-semibold text-primaryMid">
            {URGENCY_AVAILABLE_NOW}
          </p>
          <p className="mb-4 text-sm text-primaryDark/80">
            Valor referencial de la consulta:{" "}
            <strong className="text-primary">
              {consultationPrice.loading
                ? "…"
                : formatConsultationPrice(
                    consultationPrice.amount,
                    consultationPrice.currency,
                  )}
            </strong>{" "}
            <span className="text-xs text-primaryDark/50">
              (mismo monto que verás al pagar con Payku)
            </span>
          </p>
          <select
            value={patientId ?? patientIdParam ?? ""}
            onChange={(e) => setPatient(e.target.value || null)}
            className="mb-3 mr-3 min-w-[280px] rounded-lg border border-hd-border-default px-3.5 py-2.5 text-sm text-primaryDark outline-none focus:border-primary focus:ring-2 focus:ring-primaryLight"
          >
            <option value="">Seleccionar paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {[p.firstname, p.lastname].filter(Boolean).join(" ") || p.id}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleStartConsultation}
            disabled={
              starting ||
              ctxLoading ||
              !(patientId ?? patientIdParam)?.trim() ||
              !doctorId
            }
            className="rounded-lg border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? "Iniciando..." : "Hablar con médico ahora"}
          </button>
          {!doctorId && !ctxLoading && (
            <p className="mt-2 text-[13px] text-red-600">
              No se pudo identificar al médico en sesión. Vuelve a iniciar sesión.
            </p>
          )}
          {hasTelemedicineConsent === false && !startError && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[13px] text-amber-900">
              Antes de iniciar tu primera consulta debes aceptar el
              consentimiento informado de telemedicina. Se mostrará al pulsar
              «Hablar con médico ahora».
            </p>
          )}
          {startError && (
            <p
              role="alert"
              className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[13px] text-red-700"
            >
              {startError}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primaryLight p-4">
          <span className="text-primaryDark">
            Consulta activa:{" "}
            <strong>
              {selectedPatient
                ? [selectedPatient.firstname, selectedPatient.lastname]
                    .filter(Boolean)
                    .join(" ")
                : patientId}
            </strong>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => consultationId && openWorkspaceShare()}
              disabled={!consultationId}
              className="rounded-lg border-0 bg-primary px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Compartir consulta
            </button>
            <button
              type="button"
              onClick={endConsultation}
              className="rounded-lg border border-red-600 bg-transparent px-4 py-2 text-[13px] font-semibold text-red-600"
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
          onClose={() => clinicalWorkspaceKernel.dismiss("share")}
        />
      )}

      {/* Consultation workspace — legacy inline deshabilitado Phase 4.9.0 */}
      {LEGACY_INLINE_CONSULTATION_WORKSPACE && consultationId && patientId && (
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
                patientAge={selectedPatient?.age ?? undefined}
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
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                border: "1px solid #c7d7f7",
                background: "#f0f9ff",
                fontSize: 13,
                color: "#0f172a",
                lineHeight: 1.45,
              }}
            >
              El análisis clínico con IA está disponible en el workspace de
              detalle de consulta mediante{" "}
              <strong>HeyDoctor Copilot</strong> (✨).
            </div>
            {consultationId && (
              <ChatPanel consultationId={consultationId} sender="doctor" />
            )}
          </div>
        </div>
      )}

      {/* Recent consultations list */}
      {!consultationId && (
        <div className="mt-8">
          <h3 className="mb-4 text-base font-bold text-primaryDark">Consultas recientes</h3>
          {loading ? (
            <p className="text-primaryDark/70">Cargando...</p>
          ) : consultations.length === 0 ? (
            <p className="text-primaryDark/70">No hay consultas.</p>
          ) : (
            <ul className="m-0 list-none p-0">
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
                    className="mb-2 flex cursor-pointer items-center justify-between rounded-lg bg-hd-surface-chrome px-4 py-3 shadow-soft"
                  >
                    <span className="text-primaryDark">
                      {patientLabel}{" "}
                      · {when ? new Date(when).toLocaleDateString() : "—"} ·{" "}
                      {c.status ?? "—"}
                    </span>
                    <span className="text-[13px] font-semibold text-primary">
                      Ver detalle →
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
        </>
      ) : null}
    </div>
  );
}

export default function ConsultasPage() {
  return (
    <Suspense fallback={<div className="text-primaryDark/70">Cargando...</div>}>
      <ConsultasContent />
    </Suspense>
  );
}
