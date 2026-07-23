"use client";

import { useEffect, useMemo, useState } from "react";
import type { SelectedMedication } from "@/lib/types/selected-medication";
import {
  acknowledgeWarning,
  aggregateAlerts,
  buildDecisionState,
  createDefaultSafetyProvider,
  isSafetyMockEnabled,
  MOCK_SAFETY_SCENARIOS,
  MockSafetyProvider,
  revokeWarningAck,
  upsertCriticalJustification,
  type ClinicalDecisionState,
  type CriticalJustification,
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
  /**
   * Injected provider. Defaults to createDefaultSafetyProvider()
   * (Http in production; Mock only when NEXT_PUBLIC_SAFETY_MOCK=1).
   */
  provider?: SafetyProvider;
  /** Optional controlled mock scenario (only when using MockSafetyProvider). */
  mockScenario?: MockSafetyScenario;
  onDecisionStateChange?: (state: ClinicalDecisionState) => void;
  className?: string;
}

/**
 * Clinical Safety Panel — consumes SafetyProvider; no rule engine in UI.
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
  const [defaultProvider] = useState(() => createDefaultSafetyProvider(mockScenario));
  const provider = providerProp ?? defaultProvider;
  const [scenario, setScenario] = useState<MockSafetyScenario>(mockScenario);
  const [evaluation, setEvaluation] = useState<SafetyEvaluation | null>(null);
  const [acknowledgements, setAcknowledgements] = useState<
    WarningAcknowledgement[]
  >([]);
  const [justifications, setJustifications] = useState<
    CriticalJustification[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

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
        dosage: line.dosage,
        frequency: line.frequency,
        duration: line.duration,
        route: line.routeCode || line.routeLabel,
        instructions: line.instructions,
      })),
    [lines],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setEvalError(null);
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
      .catch(() => {
        if (cancelled) return;
        setEvaluation(null);
        setEvalError("No se pudo evaluar seguridad clínica.");
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

  const showMockControls =
    isSafetyMockEnabled() && provider instanceof MockSafetyProvider;
  const happyPath = aggregated.length === 0 && !loading && !evalError;

  return (
    <section
      className={`rounded-md border border-slate-200 bg-white p-3 ${className}`}
      data-testid="prescription-safety-panel"
      aria-label="Panel de seguridad clínica"
      data-safety-provider={provider.id}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Seguridad clínica
        </h4>
        <DecisionBadge decision={decision} loading={loading} />
      </div>

      {showMockControls ? (
        <label className="mb-3 block text-[11px] text-slate-500">
          Simulación Safety (solo desarrollo — NEXT_PUBLIC_SAFETY_MOCK=1)
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

      {evalError ? (
        <p className="mb-2 text-sm text-amber-700" role="alert">
          {evalError}
        </p>
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
          {decision.uxIssueDecision === "needs_justification"
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
  decision: ClinicalDecisionState;
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
    decision.uxIssueDecision === "ready"
      ? "Listo"
      : decision.uxIssueDecision === "ready_with_info_only"
        ? "INFO"
        : decision.uxIssueDecision === "needs_ack"
          ? "Ack pendiente"
          : "Justificación pendiente";
  return (
    <span
      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
      data-testid="safety-decision-badge"
      data-ux-issue-decision={decision.uxIssueDecision}
    >
      {label}
    </span>
  );
}

/** @deprecated Prefer createDefaultSafetyProvider from lib/prescription-safety. */
export function defaultSafetyProvider(
  scenario: MockSafetyScenario = "none",
): SafetyProvider {
  return createDefaultSafetyProvider(scenario);
}
