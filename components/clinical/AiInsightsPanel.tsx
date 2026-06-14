"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getConsultationInsights,
  type ConsultationAiPayload,
} from "@/lib/clinical-ai-facade";
import { useConsultation } from "@/context/ConsultationContext";

interface AiInsightsPanelProps {
  patientId: string;
  consultationId?: string | null;
  symptoms?: string;
  onGenerated?: () => void;
  className?: string;
}

const cardShell: React.CSSProperties = {
  border: "1px solid #c7d7f7",
  borderRadius: 12,
  background: "#f9fafb",
  padding: 16,
  position: "relative",
};

const innerBlock: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: 8,
  padding: 12,
  border: "1px solid #eef2ff",
};

const spinKeyframes = `
@keyframes ai-spin { to { transform: rotate(360deg); } }
@keyframes ai-pulse { 50% { opacity: 0.55; } }
`;

function formatRelativeGenerated(iso: string | null, now: number): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.max(0, Math.floor((now - t) / 1000));
  if (sec < 45) return `Generated ${sec} second${sec === 1 ? "" : "s"} ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `Generated ${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Generated ${hr} hour${hr === 1 ? "" : "s"} ago`;
  const d = Math.floor(hr / 24);
  return `Generated ${d} day${d === 1 ? "" : "s"} ago`;
}

function hasAnyAiContent(p: ConsultationAiPayload | null): boolean {
  if (!p) return false;
  return Boolean(
    (p.summary && p.summary.trim()) ||
      (p.improvedNotes && p.improvedNotes.trim()) ||
      (p.suggestedDiagnosis && p.suggestedDiagnosis.length > 0)
  );
}

const btnUse: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #c7d2fe",
  color: "#4338ca",
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 10px",
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #e2e8f0",
  color: "#334155",
  cursor: "pointer",
};

const spinnerStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  border: "2px solid #bae6fd",
  borderTopColor: "#0284c7",
  borderRadius: "50%",
  animation: "ai-spin 0.7s linear infinite",
  flexShrink: 0,
};

function AiLoadingBlock({ message }: { message: string }) {
  const bar: React.CSSProperties = {
    height: 10,
    background: "#e2e8f0",
    borderRadius: 4,
    animation: "ai-pulse 1.2s ease-in-out infinite",
  };
  return (
    <div style={{ padding: "8px 0" }} aria-busy="true">
      <style>{spinKeyframes}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={spinnerStyle} aria-hidden />
        <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{message}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ ...bar, width: "80%" }} />
        <div style={{ ...bar, width: "100%" }} />
        <div style={{ ...bar, width: "55%" }} />
      </div>
    </div>
  );
}

export function AiInsightsPanel({
  patientId,
  consultationId,
  className = "",
}: AiInsightsPanelProps) {
  const { appendNotesFromAi, appendDiagnosisLineFromAi } = useConsultation();
  const [ai, setAi] = useState<ConsultationAiPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const loadAi = useCallback(
    (mode: "initial" | "regenerate") => {
      if (!consultationId) {
        setAi(null);
        return;
      }
      if (mode === "regenerate") setRegenerating(true);
      else setLoading(true);
      setError(null);
      if (process.env.NODE_ENV === "development") {
        console.debug("[heydoctor][ai] cargar", { consultationId, mode });
      }
      getConsultationInsights(consultationId)
        .then(({ data: payload }) => {
          if (process.env.NODE_ENV === "development") {
            console.debug("[heydoctor][ai] ok", {
              hasSummary: !!payload?.summary,
              diagCount: payload?.suggestedDiagnosis?.length ?? 0,
            });
          }
          setAi(payload);
        })
        .catch((e: unknown) => {
          if (process.env.NODE_ENV === "development") {
            console.error("[heydoctor][ai] error", e);
          }
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo cargar el asistente de IA",
          );
          if (mode === "initial") setAi(null);
        })
        .finally(() => {
          setLoading(false);
          setRegenerating(false);
        });
    },
    [consultationId]
  );

  useEffect(() => {
    if (!consultationId) {
      setAi(null);
      return;
    }
    loadAi("initial");
  }, [consultationId, loadAi]);

  const relativeLabel = useMemo(
    () => formatRelativeGenerated(ai?.generatedAt ?? null, nowTick),
    [ai?.generatedAt, nowTick]
  );

  const useSummaryInConsultation = () => {
    if (ai?.summary?.trim()) appendNotesFromAi(ai.summary.trim());
  };

  const useImprovedNotesInConsultation = () => {
    if (ai?.improvedNotes?.trim()) appendNotesFromAi(ai.improvedNotes.trim());
  };

  const handleRegenerate = () => loadAi("regenerate");

  return (
    <section className={className} style={cardShell}>
      <style>{spinKeyframes}</style>
      {regenerating && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(2px)",
          }}
          aria-live="polite"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
            <div style={{ ...spinnerStyle, width: 16, height: 16 }} />
            Refreshing…
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <h3
            style={{
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
              fontSize: 15,
              letterSpacing: "-0.02em",
            }}
          >
            ✨ AI Assistant
          </h3>
          {hasAnyAiContent(ai) && (
            <span
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background: "#e0f2fe",
                color: "#075985",
                border: "1px solid #bae6fd",
              }}
              title="Contenido generado por IA; verificar clínicamente."
            >
              Generated by AI
            </span>
          )}
        </div>
        {consultationId ? (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading || regenerating}
            style={{
              ...btnGhost,
              opacity: loading || regenerating ? 0.5 : 1,
              cursor: loading || regenerating ? "not-allowed" : "pointer",
            }}
          >
            🔄 Regenerate
          </button>
        ) : null}
      </div>

      {!consultationId ? (
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
          Inicia una consulta activa para ver sugerencias de IA (opcional).
        </p>
      ) : (
        <>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 12px" }}>
            Paciente: {patientId.slice(0, 8)}…
          </p>

          {error && (
            <p
              style={{
                fontSize: 13,
                color: "#92400e",
                margin: "0 0 12px",
                padding: 8,
                borderRadius: 8,
                background: "#fffbeb",
                border: "1px solid #fde68a",
              }}
            >
              {error}
            </p>
          )}

          {loading && !ai ? (
            <AiLoadingBlock message="AI is analyzing consultation..." />
          ) : !hasAnyAiContent(ai) ? (
            <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>
              AI will generate insights after updating consultation notes.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13, color: "#334155" }}>
              {ai?.summary ? (
                <div style={innerBlock}>
                  <h4
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 8px",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Resumen
                  </h4>
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.55, margin: 0 }}>{ai.summary}</p>
                  <button
                    type="button"
                    onClick={useSummaryInConsultation}
                    disabled={!ai.summary.trim()}
                    style={{
                      ...btnUse,
                      opacity: !ai.summary.trim() ? 0.4 : 1,
                      cursor: !ai.summary.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    ✨ Use in consultation
                  </button>
                </div>
              ) : null}

              {ai?.suggestedDiagnosis && ai.suggestedDiagnosis.length > 0 ? (
                <div style={innerBlock}>
                  <h4
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 8px",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Diagnósticos sugeridos
                  </h4>
                  <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 8px" }}>
                    Pulsa una línea para añadirla al campo de diagnóstico.
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {ai.suggestedDiagnosis.map((line, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>
                        <button
                          type="button"
                          onClick={() => appendDiagnosisLineFromAi(line)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            fontSize: 13,
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid transparent",
                            background: "transparent",
                            color: "#334155",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#bae6fd";
                            e.currentTarget.style.background = "#f0f9ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "transparent";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {line}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {ai?.improvedNotes ? (
                <div style={innerBlock}>
                  <h4
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 8px",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Notas (redacción asistida)
                  </h4>
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.55, margin: 0 }}>{ai.improvedNotes}</p>
                  <button
                    type="button"
                    onClick={useImprovedNotesInConsultation}
                    disabled={!ai.improvedNotes.trim()}
                    style={{
                      ...btnUse,
                      opacity: !ai.improvedNotes.trim() ? 0.4 : 1,
                      cursor: !ai.improvedNotes.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    ✨ Use in consultation
                  </button>
                </div>
              ) : null}

              {relativeLabel ? (
                <p
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    margin: 0,
                    paddingTop: 8,
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  {relativeLabel}
                </p>
              ) : null}
              {ai?.aiRunId ? (
                <p
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    margin: "8px 0 0",
                    fontFamily: "monospace",
                  }}
                >
                  Trazabilidad AI: {ai.aiRunId.slice(0, 8)}…
                  {ai.approvalState ? ` · ${ai.approvalState}` : ""}
                </p>
              ) : null}
            </div>
          )}
        </>
      )}
    </section>
  );
}
