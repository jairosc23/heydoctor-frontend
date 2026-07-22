"use client";

import { useEffect, useMemo, useState } from "react";
import type { SelectedMedication } from "@/lib/types/selected-medication";
import {
  acknowledgeWarning,
  aggregateAlerts,
  buildDecisionState,
  createMockSafetyProvider,
  MOCK_SAFETY_SCENARIOS,
  MockSafetyProvider,
  revokeWarningAck,
  upsertCriticalJustification,
  type CriticalJustification,
  type DecisionState,
  type MockSafetyScenario,
  type SafetyEvaluation,
  type SafetyProvider,
  type WarningAcknowledgement,
} from "@/lib/prescription-safety";
import { SafetyAlertCard } from "./SafetyAlertCard";

export interface PrescriptionSafetyPanelProps {
  patientId: string;
  consultationId?: string | null;
  diagnosis?: string;
  lines: SelectedMedication[];
  /** Injected provider — defaults to mock; swap for Backend without UI changes. */
  provider?: SafetyProvider;
  /** Optional controlled mock scenario (only when using MockSafetyProvider). */
  mockScenario?: MockSafetyScenario;
  onDecisionStateChange?: (state: DecisionState) => void;
  className?: string;
}

/**
 * PR-4.1 — Clinical Safety Panel (UX only).
 * Consumes SafetyProvider contract; contains no clinical rule engine.
 */
export function PrescriptionSafetyPanel({
  patientId,
  consultationId,
  diagnosis,
  lines,
  provider: providerProp,
  mockScenario = "none",
  onDecisionStateChange,
  className = "",
}: PrescriptionSafetyPanelProps) {
  const [ownedMock] = useState(() => new MockSafetyProvider(mockScenario));
  const provider = providerProp ?? ownedMock;
  const [scenario, setScenario] = useState<MockSafetyScenario>(mockScenario);
  const [evaluation, setEvaluation] = useState<SafetyEvaluation | null>(null);
  const [acknowledgements, setAcknowledgements] = useState<
    WarningAcknowledgement[]
  >([]);
  const [justifications, setJustifications] = useState<
    CriticalJustification[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provider instanceof MockSafetyProvider) {
      provider.setScenario(scenario);
    }
  }, [provider, scenario]);

  useEffect(() => {
    setScenario(mockScenario);
  }, [mockScenario]);

  const lineInput = useMemo(
    () =>
      lines.map((line, lineIndex) => ({
        lineIndex,
        displayLabel: line.displayLabel,
        drugPresentationId: line.drugPresentationId,
      })),
    [lines],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void provider
      .evaluate({
        patientId,
        consultationId,
        diagnosis,
        lines: lineInput,
      })
      .then((result) => {
        if (cancelled) return;
        setEvaluation(result);
        setAcknowledgements([]);
        setJustifications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provider, patientId, consultationId, diagnosis, lineInput, scenario]);

  const aggregated = useMemo(
    () => (evaluation ? aggregateAlerts(evaluation.alerts) : []),
    [evaluation],
  );

  const decision = useMemo(
    () =>
      buildDecisionState({
        evaluation,
        acknowledgements,
        justifications,
      }),
    [evaluation, acknowledgements, justifications],
  );

  useEffect(() => {
    onDecisionStateChange?.(decision);
  }, [decision, onDecisionStateChange]);

  const showMockControls = provider instanceof MockSafetyProvider;
  const happyPath = aggregated.length === 0 && !loading;

  return (
    <section
      className={`rounded-md border border-slate-200 bg-white p-3 ${className}`}
      data-testid="prescription-safety-panel"
      aria-label="Panel de seguridad clínica"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Seguridad clínica
        </h4>
        <DecisionBadge decision={decision} loading={loading} />
      </div>

      {showMockControls ? (
        <label className="mb-3 block text-[11px] text-slate-500">
          Simulación Safety (mock — reemplazable)
          <select
            value={scenario}
            onChange={(e) =>
              setScenario(e.target.value as MockSafetyScenario)
            }
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:max-w-xs"
            aria-label="Escenario de simulación del Safety Panel"
            data-testid="safety-mock-scenario"
          >
            {MOCK_SAFETY_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {happyPath ? (
        <p
          className="text-sm text-slate-600"
          data-testid="safety-happy-path"
          role="status"
        >
          Sin alertas de seguridad en esta evaluación.
        </p>
      ) : null}

      {aggregated.length > 0 ? (
        <ul className="space-y-2" data-testid="safety-alert-list">
          {aggregated.map((alert) => (
            <li key={alert.alertId}>
              <SafetyAlertCard
                alert={alert}
                acknowledgement={acknowledgements.find(
                  (a) => a.alertId === alert.alertId,
                )}
                justification={justifications.find(
                  (j) => j.alertId === alert.alertId,
                )}
                onAcknowledge={(alertId) =>
                  setAcknowledgements((prev) =>
                    acknowledgeWarning(prev, alertId),
                  )
                }
                onRevokeAck={(alertId) =>
                  setAcknowledgements((prev) =>
                    revokeWarningAck(prev, alertId),
                  )
                }
                onJustificationChange={(next) =>
                  setJustifications((prev) =>
                    upsertCriticalJustification(prev, next),
                  )
                }
              />
            </li>
          ))}
        </ul>
      ) : null}

      {!decision.readyToIssue ? (
        <p
          className="mt-3 text-xs text-slate-600"
          role="status"
          data-testid="safety-soft-gate-hint"
        >
          {decision.issueDecision === "needs_justification"
            ? "Hay CRITICAL pendientes de justificación. La emisión no se bloquea."
            : "Hay WARNING pendientes de reconocimiento. La emisión no se bloquea."}
        </p>
      ) : null}
    </section>
  );
}

function DecisionBadge({
  decision,
  loading,
}: {
  decision: DecisionState;
  loading: boolean;
}) {
  if (loading) {
    return (
      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
        Evaluando…
      </span>
    );
  }
  const label =
    decision.issueDecision === "ready"
      ? "Listo"
      : decision.issueDecision === "ready_with_info_only"
        ? "INFO"
        : decision.issueDecision === "needs_ack"
          ? "Ack pendiente"
          : "Justificación pendiente";
  return (
    <span
      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
      data-testid="safety-decision-badge"
      data-issue-decision={decision.issueDecision}
    >
      {label}
    </span>
  );
}

/** Factory helper for tests / future Backend wiring. */
export function defaultSafetyProvider(
  scenario: MockSafetyScenario = "none",
): SafetyProvider {
  return createMockSafetyProvider(scenario);
}
