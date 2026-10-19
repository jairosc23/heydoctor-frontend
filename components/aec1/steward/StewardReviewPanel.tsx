"use client";

import { useCallback, useMemo, useState } from "react";
import { HcxWorkspaceContainer } from "@/components/hcx/workspace";
import {
  STEWARD_SCENARIO_CATALOG,
  attestationIsComplete,
  buildStewardAttestation,
  type StewardDisposition,
  type StewardScenarioResult,
} from "@/lib/aec1/steward-attestation";
import {
  STEWARD_FORBIDDEN_PATHS,
  W5_CLINICAL_AUTHORITY,
  W5_CLINICAL_DISCLAIMER,
  resolveInsightId,
  w5ClinicalAckInsight,
  w5ClinicalDismissInsight,
  w5ClinicalListInsights,
  type W5ClinicalInsight,
} from "@/lib/aec1/w5-clinical-steward-api";

export type StewardReviewPanelProps = {
  enabled: boolean;
};

export function StewardReviewPanel({ enabled }: StewardReviewPanelProps) {
  const [stewardIdentity, setStewardIdentity] = useState("");
  const [disposition, setDisposition] =
    useState<StewardDisposition>("ACCEPT_WITH_FIXES");
  const [notes, setNotes] = useState("");
  const [tipSha, setTipSha] = useState("");
  const [scenarios, setScenarios] = useState<StewardScenarioResult[]>(() =>
    STEWARD_SCENARIO_CATALOG.map((s) => ({
      id: s.id,
      title: s.title,
      passed: null,
      notes: "",
    })),
  );
  const [insights, setInsights] = useState<W5ClinicalInsight[]>([]);
  const [apiCode, setApiCode] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [attestationJson, setAttestationJson] = useState<string | null>(null);

  const forbiddenListed = useMemo(
    () => STEWARD_FORBIDDEN_PATHS.join(", "),
    [],
  );

  const loadInsights = useCallback(async () => {
    setBusy(true);
    setLastAction("list");
    try {
      const res = await w5ClinicalListInsights({ includeDismissed: true });
      setInsights(res.insights ?? []);
      setApiCode(res.code ?? null);
      setApiMessage(res.message ?? res.disclaimer ?? null);
    } finally {
      setBusy(false);
    }
  }, []);

  const onDismiss = useCallback(async (insight: W5ClinicalInsight) => {
    const id = resolveInsightId(insight);
    if (!id) return;
    setBusy(true);
    setLastAction(`dismiss:${id}`);
    try {
      const res = await w5ClinicalDismissInsight(id, "steward-review");
      setApiCode(res.ok ? null : res.code ?? "DISMISS_FAILED");
      setApiMessage(res.ok ? "Dismiss OK (≠ HAB)" : String(res.code));
      await loadInsights();
    } finally {
      setBusy(false);
    }
  }, [loadInsights]);

  const onAck = useCallback(async (insight: W5ClinicalInsight) => {
    const id = resolveInsightId(insight);
    if (!id) return;
    setBusy(true);
    setLastAction(`ack:${id}`);
    try {
      const res = await w5ClinicalAckInsight(id, "steward-review");
      setApiCode(res.ok ? null : res.code ?? "ACK_FAILED");
      setApiMessage(res.ok ? "Acknowledge OK (≠ HAB)" : String(res.code));
      await loadInsights();
    } finally {
      setBusy(false);
    }
  }, [loadInsights]);

  const setScenarioPass = (id: string, passed: boolean) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, passed } : s)),
    );
  };

  const issueAttestation = () => {
    const attestation = buildStewardAttestation({
      stewardIdentity,
      disposition,
      scenarios,
      tipSha: tipSha.trim() || null,
      stewardReviewEnabled: enabled,
      notes,
    });
    if (!attestationIsComplete(attestation)) {
      setAttestationJson(null);
      setApiMessage("Complete steward identity and all scenario pass/fail marks.");
      return;
    }
    setAttestationJson(JSON.stringify(attestation, null, 2));
    setApiMessage(`Attestation issued: ${disposition}`);
  };

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="aec1-steward-disabled">
          Steward Review Mode is OFF. Define{" "}
          <code>NEXT_PUBLIC_AEC1_STEWARD_REVIEW=true</code> (staging/dev only).
        </p>
      </main>
    );
  }

  return (
    <HcxWorkspaceContainer>
      <div
        data-testid="aec1-steward-review"
        style={{
          padding: 16,
          fontFamily: "system-ui",
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <header>
          <h1 style={{ margin: 0, fontSize: 22 }}>AEC-1 Steward Review Mode</h1>
          <p
            data-testid="aec1-steward-non-authority"
            style={{
              marginTop: 8,
              padding: "8px 12px",
              background: "var(--hd-color-surface-muted, #f0f4f5)",
              borderLeft: "4px solid var(--hd-color-primary, #078A92)",
            }}
          >
            <strong>{W5_CLINICAL_AUTHORITY}</strong> — {W5_CLINICAL_DISCLAIMER}
          </p>
          <p style={{ fontSize: 13, color: "#444" }}>
            Steward ≠ clinical authority. UI forbids Confirm HAB / Emit PE /
            apply-to-chart. Forbidden paths: {forbiddenListed}
          </p>
        </header>

        <section
          data-testid="aec1-steward-live"
          style={{ border: "1px solid #d0d7da", borderRadius: 8, padding: 12 }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Live W5 clinical insights</h2>
          <button
            type="button"
            data-testid="aec1-steward-load"
            disabled={busy}
            onClick={() => void loadInsights()}
          >
            Load insights
          </button>
          {apiCode || apiMessage ? (
            <p data-testid="aec1-steward-api-status" style={{ fontSize: 13 }}>
              {apiCode ? <code>{apiCode}</code> : null} {apiMessage}
            </p>
          ) : null}
          {lastAction ? (
            <p data-testid="aec1-steward-last-action" style={{ fontSize: 12 }}>
              Last action: {lastAction}
            </p>
          ) : null}
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
            {insights.length === 0 ? (
              <li data-testid="aec1-steward-insights-empty">No insights loaded.</li>
            ) : (
              insights.map((insight) => {
                const id = resolveInsightId(insight) ?? "unknown";
                return (
                  <li
                    key={id}
                    data-testid={`aec1-steward-insight-${id}`}
                    style={{
                      borderTop: "1px solid #e5e9eb",
                      padding: "10px 0",
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div>
                      <span
                        data-testid="aec1-steward-badge"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 0.04,
                          color: "#078A92",
                        }}
                      >
                        ADVISORY · {insight.authorityClass ?? W5_CLINICAL_AUTHORITY}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {insight.title ?? insight.code ?? id}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {insight.summary ?? insight.disclaimer ?? W5_CLINICAL_DISCLAIMER}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        data-testid={`aec1-steward-dismiss-${id}`}
                        disabled={busy}
                        onClick={() => void onDismiss(insight)}
                      >
                        Dismiss (≠ HAB)
                      </button>
                      <button
                        type="button"
                        data-testid={`aec1-steward-ack-${id}`}
                        disabled={busy}
                        onClick={() => void onAck(insight)}
                      >
                        Acknowledge (≠ HAB)
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          {/* Explicit absence of authority CTAs for automated checks */}
          <div data-testid="aec1-steward-no-confirm" hidden>
            confirm-hab-absent
          </div>
          <div data-testid="aec1-steward-no-emit" hidden>
            emit-pe-absent
          </div>
          <div data-testid="aec1-steward-no-apply" hidden>
            apply-to-chart-absent
          </div>
        </section>

        <section
          data-testid="aec1-steward-checklist"
          style={{ border: "1px solid #d0d7da", borderRadius: 8, padding: 12 }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Scenario checklist</h2>
          {STEWARD_SCENARIO_CATALOG.map((catalog) => {
            const row = scenarios.find((s) => s.id === catalog.id)!;
            return (
              <div
                key={catalog.id}
                data-testid={`aec1-steward-scenario-${catalog.id}`}
                style={{ marginBottom: 10 }}
              >
                <div style={{ fontWeight: 600 }}>{catalog.title}</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {catalog.description}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    data-testid={`aec1-steward-scenario-${catalog.id}-pass`}
                    onClick={() => setScenarioPass(catalog.id, true)}
                  >
                    Pass{row.passed === true ? " ✓" : ""}
                  </button>
                  <button
                    type="button"
                    data-testid={`aec1-steward-scenario-${catalog.id}-fail`}
                    onClick={() => setScenarioPass(catalog.id, false)}
                  >
                    Fail{row.passed === false ? " ✓" : ""}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        <section
          data-testid="aec1-steward-attestation"
          style={{ border: "1px solid #d0d7da", borderRadius: 8, padding: 12 }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Attestation</h2>
          <label style={{ display: "grid", gap: 4, marginBottom: 8 }}>
            Steward identity
            <input
              data-testid="aec1-steward-identity"
              value={stewardIdentity}
              onChange={(e) => setStewardIdentity(e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 4, marginBottom: 8 }}>
            Tip SHA (optional)
            <input
              data-testid="aec1-steward-tip-sha"
              value={tipSha}
              onChange={(e) => setTipSha(e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 4, marginBottom: 8 }}>
            Disposition
            <select
              data-testid="aec1-steward-disposition"
              value={disposition}
              onChange={(e) =>
                setDisposition(e.target.value as StewardDisposition)
              }
            >
              <option value="ACCEPT">ACCEPT</option>
              <option value="ACCEPT_WITH_FIXES">ACCEPT_WITH_FIXES</option>
              <option value="REJECT">REJECT</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 4, marginBottom: 8 }}>
            Notes
            <textarea
              data-testid="aec1-steward-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>
          <button
            type="button"
            data-testid="aec1-steward-issue-attestation"
            onClick={issueAttestation}
          >
            Issue attestation JSON
          </button>
          {attestationJson ? (
            <pre
              data-testid="aec1-steward-attestation-json"
              style={{
                marginTop: 12,
                padding: 8,
                background: "#f7f9fa",
                overflow: "auto",
                fontSize: 12,
              }}
            >
              {attestationJson}
            </pre>
          ) : null}
        </section>
      </div>
    </HcxWorkspaceContainer>
  );
}
