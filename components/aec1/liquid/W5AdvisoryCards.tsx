"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STEWARD_FORBIDDEN_PATHS,
  W5_CLINICAL_AUTHORITY,
  W5_CLINICAL_DISCLAIMER,
  resolveInsightId,
  w5ClinicalAckInsight,
  w5ClinicalDismissInsight,
  w5ClinicalListInsights,
  type W5ClinicalInsight,
  type W5ClinicalListResponse,
} from "@/lib/aec1/w5-clinical-steward-api";
import { DEFAULT_ASSIST_FATIGUE } from "@/lib/aec1/assist-orchestrator";
import {
  formatW5Explainability,
  formatW5PriorityLabel,
  formatW5Provenance,
  insightAuthorityClass,
  isInsightLocallySettled,
  resolveW5AdvisoryUiState,
  sortW5InsightsForAssist,
} from "@/lib/aec1/w5-advisory-view";

export type W5AdvisoryCardsProps = {
  /** Encounter id for composition context only — never used to invent clinical writes. */
  consultationId?: string;
  disclosure: "collapsed" | "expanded";
  /** Test injection / soak overrides. */
  listInsights?: typeof w5ClinicalListInsights;
  autoLoad?: boolean;
  /**
   * Soft-cap for expanded list. Prefer value from AssistOrchestrator plan
   * (`deterministicMaxVisible`). Default aligns with Assist fatigue SSOT.
   */
  maxVisible?: number;
};

/**
 * M5 — governed W5 DETERMINISTIC advisory cards inside LiquidAssistPlane.
 * Reuses M1 steward client (list / dismiss / ack). Never Confirm / Emit / apply.
 * Fatigue soft-cap is owned by AssistOrchestrator (M6.3); this component only applies it.
 */
export function W5AdvisoryCards({
  consultationId,
  disclosure,
  listInsights = w5ClinicalListInsights,
  autoLoad = true,
  maxVisible = DEFAULT_ASSIST_FATIGUE.maxVisible,
}: W5AdvisoryCardsProps) {
  const [loading, setLoading] = useState(Boolean(autoLoad));
  const [response, setResponse] = useState<W5ClinicalListResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [expandedExplain, setExpandedExplain] = useState<Record<string, boolean>>(
    {},
  );
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listInsights({ includeDismissed: false });
      setResponse({
        ...res,
        authorityClass: res.authorityClass ?? W5_CLINICAL_AUTHORITY,
        disclaimer: res.disclaimer ?? W5_CLINICAL_DISCLAIMER,
      });
    } finally {
      setLoading(false);
    }
  }, [listInsights]);

  useEffect(() => {
    if (!autoLoad) return;
    void load();
  }, [autoLoad, load]);

  const uiState = resolveW5AdvisoryUiState({ loading, response });
  const insights = useMemo(
    () => sortW5InsightsForAssist(response?.insights ?? []),
    [response?.insights],
  );
  const visible = showAll ? insights : insights.slice(0, maxVisible);
  const hiddenCount = Math.max(0, insights.length - visible.length);

  const onDismiss = async (insight: W5ClinicalInsight) => {
    const id = resolveInsightId(insight);
    if (!id) return;
    setBusyId(id);
    setLastAction(`dismiss:${id}`);
    try {
      const res = await w5ClinicalDismissInsight(id, "liquid-assist-m5");
      if (res.ok) await load();
      else {
        setResponse((prev) => ({
          ...(prev ?? {}),
          code: res.code ?? "DISMISS_FAILED",
          message: "Dismiss failed (≠ HAB)",
          insights: prev?.insights ?? [],
          authorityClass: W5_CLINICAL_AUTHORITY,
          disclaimer: W5_CLINICAL_DISCLAIMER,
        }));
      }
    } finally {
      setBusyId(null);
    }
  };

  const onAck = async (insight: W5ClinicalInsight) => {
    const id = resolveInsightId(insight);
    if (!id) return;
    setBusyId(id);
    setLastAction(`ack:${id}`);
    try {
      const res = await w5ClinicalAckInsight(id, "liquid-assist-m5");
      if (res.ok) await load();
      else {
        setResponse((prev) => ({
          ...(prev ?? {}),
          code: res.code ?? "ACK_FAILED",
          message: "Acknowledge failed (≠ HAB)",
          insights: prev?.insights ?? [],
          authorityClass: W5_CLINICAL_AUTHORITY,
          disclaimer: W5_CLINICAL_DISCLAIMER,
        }));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      data-testid="aec1-w5-advisory-cards"
      data-plane="DETERMINISTIC"
      data-authority={W5_CLINICAL_AUTHORITY}
      data-ui-state={uiState}
      data-disclosure={disclosure}
      data-consultation-id={consultationId ?? ""}
      data-hab-mutation="false"
      style={{ display: "grid", gap: disclosure === "collapsed" ? 6 : 10 }}
    >
      <div
        data-testid="aec1-w5-non-authority"
        role="note"
        aria-label="Límite de autoridad clínica"
        style={{
          padding: "6px 8px",
          borderLeft: "3px solid var(--hd-color-primary, #078A92)",
          background: "var(--hd-color-surface-muted, #eef3f4)",
          fontSize: 11,
          lineHeight: 1.35,
        }}
      >
        <strong>{W5_CLINICAL_AUTHORITY}</strong>
        {" · "}
        Inteligencia clínica determinística (advisory). El clínico conserva la
        autoridad final. Reconocer/Descartar ≠ HAB.
      </div>

      {disclosure === "collapsed" ? (
        <p
          data-testid="aec1-w5-collapsed-summary"
          style={{ margin: 0, fontSize: 11, color: "#556" }}
        >
          {uiState === "loading"
            ? "Cargando avisos clínicos…"
            : uiState === "advisory"
              ? `${insights.length} aviso(s) advisory · DETERMINISTIC`
              : uiState === "forbidden"
                ? "Inteligencia clínica no disponible (fail-closed)"
                : uiState === "error"
                  ? "Inteligencia clínica degradada — el workspace sigue usable"
                  : "Sin avisos clínicos"}
        </p>
      ) : null}

      {disclosure === "expanded" ? (
        <>
          {uiState === "loading" ? (
            <p data-testid="aec1-w5-state-loading" style={{ margin: 0 }}>
              Cargando inteligencia clínica…
            </p>
          ) : null}

          {uiState === "empty" ? (
            <p data-testid="aec1-w5-state-empty" style={{ margin: 0 }}>
              No hay avisos clinical intelligence activos.
            </p>
          ) : null}

          {uiState === "forbidden" ? (
            <p data-testid="aec1-w5-state-forbidden" style={{ margin: 0 }}>
              Inteligencia clínica OFF o sin autoridad (
              <code>{response?.code ?? "W5_FLAG_OR_AUTHORITY_DENIED"}</code>).
              Assist degradado; el encuentro sigue usable.
            </p>
          ) : null}

          {uiState === "error" ? (
            <p data-testid="aec1-w5-state-error" style={{ margin: 0 }}>
              No se pudo cargar inteligencia clínica (
              <code>{response?.code ?? "W5_CLINICAL_ERROR"}</code>). Workspace
              clínico intacto.
              <button
                type="button"
                data-testid="aec1-w5-retry"
                onClick={() => void load()}
                style={{ marginLeft: 8 }}
              >
                Reintentar
              </button>
            </p>
          ) : null}

          {uiState === "advisory" ? (
            <ul
              data-testid="aec1-w5-insight-list"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {visible.map((insight) => {
                const id = resolveInsightId(insight) ?? "unknown";
                const priority = formatW5PriorityLabel(insight);
                const explain = formatW5Explainability(insight);
                const provenance = formatW5Provenance(insight);
                const settled = isInsightLocallySettled(insight);
                const explainOpen = Boolean(expandedExplain[id]);
                return (
                  <li
                    key={id}
                    data-testid={`aec1-w5-insight-${id}`}
                    data-authority={insightAuthorityClass(insight)}
                    data-acknowledged={settled.acknowledged ? "true" : "false"}
                    data-dismissed={settled.dismissed ? "true" : "false"}
                    style={{
                      borderTop: "1px solid var(--hd-color-border, #d0d7da)",
                      padding: "8px 0",
                      display: "grid",
                      gap: 4,
                    }}
                  >
                    <div
                      data-testid={`aec1-w5-badge-${id}`}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.04,
                        color: "var(--hd-color-primary, #078A92)",
                      }}
                    >
                      ADVISORY · {insightAuthorityClass(insight)} · DETERMINISTIC
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>
                      {insight.title ?? insight.code ?? id}
                      {priority ? (
                        <span
                          data-testid={`aec1-w5-priority-${id}`}
                          style={{
                            marginLeft: 8,
                            fontWeight: 500,
                            color: "#445055",
                          }}
                        >
                          prioridad {priority}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 11, color: "#445055" }}>
                      {insight.summary ??
                        insight.disclaimer ??
                        W5_CLINICAL_DISCLAIMER}
                    </div>
                    {provenance ? (
                      <div
                        data-testid={`aec1-w5-provenance-${id}`}
                        style={{ fontSize: 10, color: "#667" }}
                      >
                        Origen: {provenance}
                      </div>
                    ) : null}
                    {explain ? (
                      <div>
                        <button
                          type="button"
                          data-testid={`aec1-w5-explain-toggle-${id}`}
                          aria-expanded={explainOpen}
                          onClick={() =>
                            setExpandedExplain((prev) => ({
                              ...prev,
                              [id]: !prev[id],
                            }))
                          }
                          style={{
                            fontSize: 11,
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "var(--hd-color-primary, #078A92)",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {explainOpen
                            ? "Ocultar explicación"
                            : "Ver explicación"}
                        </button>
                        {explainOpen ? (
                          <p
                            data-testid={`aec1-w5-explain-${id}`}
                            style={{ margin: "4px 0 0", fontSize: 11 }}
                          >
                            {explain}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <button
                        type="button"
                        data-testid={`aec1-w5-ack-${id}`}
                        data-hab="false"
                        disabled={busyId === id || settled.acknowledged}
                        onClick={() => void onAck(insight)}
                        style={{ fontSize: 11 }}
                      >
                        Reconocer (≠ HAB)
                      </button>
                      <button
                        type="button"
                        data-testid={`aec1-w5-dismiss-${id}`}
                        data-hab="false"
                        disabled={busyId === id || settled.dismissed}
                        onClick={() => void onDismiss(insight)}
                        style={{ fontSize: 11 }}
                      >
                        Descartar (≠ HAB)
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {hiddenCount > 0 ? (
            <button
              type="button"
              data-testid="aec1-w5-show-more"
              onClick={() => setShowAll(true)}
              style={{ fontSize: 11, justifySelf: "start" }}
            >
              Mostrar {hiddenCount} más
            </button>
          ) : null}

          {lastAction ? (
            <p
              data-testid="aec1-w5-last-action"
              style={{ margin: 0, fontSize: 10, color: "#667" }}
            >
              Última acción: {lastAction} (≠ HAB)
            </p>
          ) : null}

          <p
            data-testid="aec1-w5-disclaimer"
            style={{ margin: 0, fontSize: 10, color: "#667" }}
          >
            {response?.disclaimer ?? W5_CLINICAL_DISCLAIMER}
          </p>
        </>
      ) : null}

      {/* Authority denylist markers for automated boundary checks */}
      <div data-testid="aec1-w5-no-confirm" hidden>
        confirm-hab-absent
      </div>
      <div data-testid="aec1-w5-no-emit" hidden>
        emit-pe-absent
      </div>
      <div data-testid="aec1-w5-no-apply" hidden>
        apply-to-chart-absent
      </div>
      <div data-testid="aec1-w5-forbidden-paths" hidden>
        {STEWARD_FORBIDDEN_PATHS.join(",")}
      </div>
    </div>
  );
}
