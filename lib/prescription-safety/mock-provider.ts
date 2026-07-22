/**
 * Mock Safety Provider — decoupled, replaceable by Backend Rule Engine.
 * Generates deterministic UX scenarios. No clinical rule evaluation.
 */

import type {
  SafetyAlert,
  SafetyConfidence,
  SafetyEvaluateInput,
  SafetyEvaluation,
  SafetyPriority,
  SafetyProvider,
  SafetySeverity,
} from "./types";

export type MockSafetyScenario =
  | "none"
  | "info"
  | "warning"
  | "critical"
  | "multi"
  | "confidence_low"
  | "confidence_partial"
  | "confidence_high";

export const MOCK_SAFETY_SCENARIOS: Array<{
  id: MockSafetyScenario;
  label: string;
}> = [
  { id: "none", label: "Sin alertas" },
  { id: "info", label: "INFO" },
  { id: "warning", label: "WARNING" },
  { id: "critical", label: "CRITICAL" },
  { id: "multi", label: "Múltiples alertas" },
  { id: "confidence_low", label: "Confidence LOW" },
  { id: "confidence_partial", label: "Confidence PARTIAL" },
  { id: "confidence_high", label: "Confidence HIGH" },
];

function alert(partial: Omit<SafetyAlert, "source"> & { source?: string }): SafetyAlert {
  return {
    source: partial.source ?? "mock_safety_provider",
    ...partial,
  };
}

function buildAlerts(
  scenario: MockSafetyScenario,
  input: SafetyEvaluateInput,
): SafetyAlert[] {
  const line0 = input.lines[0]?.lineIndex ?? 0;
  const line1 = input.lines[1]?.lineIndex ?? line0;

  switch (scenario) {
    case "none":
      return [];
    case "info":
      return [
        alert({
          alertId: "mock-info-1",
          ruleId: "R5",
          family: "incomplete_safety_context",
          severity: "INFO",
          priority: "LOW",
          confidence: "HIGH",
          message: "Paciente sin alergias registradas en el perfil.",
          evidenceSummary: "Perfil · allergies[] vacío",
          lineIndexes: [],
          requires: "none",
          arrivedAt: 1,
        }),
      ];
    case "warning":
      return [
        alert({
          alertId: "mock-warn-1",
          ruleId: "R3",
          family: "therapeutic_duplication",
          severity: "WARNING",
          priority: "NORMAL",
          confidence: "HIGH",
          message:
            "Posible duplicidad terapéutica (misma clase ATC) en la receta.",
          evidenceSummary: "Líneas con ATC superpuesto (simulado)",
          lineIndexes: [line0, line1],
          requires: "ack",
          arrivedAt: 1,
        }),
      ];
    case "critical":
      return [
        alert({
          alertId: "mock-crit-1",
          ruleId: "R1",
          family: "allergy_match",
          severity: "CRITICAL",
          priority: "HIGH",
          confidence: "HIGH",
          message:
            "Posible alergia a la sustancia seleccionada (simulado).",
          evidenceSummary: "Match sustancia · confianza alta (mock)",
          lineIndexes: [line0],
          requires: "justification",
          arrivedAt: 1,
        }),
      ];
    case "multi":
      return [
        alert({
          alertId: "mock-multi-crit",
          ruleId: "R1",
          family: "allergy_match",
          severity: "CRITICAL",
          priority: "HIGH",
          confidence: "HIGH",
          message: "CRITICAL simulado: alergia a sustancia.",
          lineIndexes: [line0],
          requires: "justification",
          arrivedAt: 1,
        }),
        alert({
          alertId: "mock-multi-warn-high",
          ruleId: "R3",
          family: "therapeutic_duplication",
          severity: "WARNING",
          priority: "HIGH",
          confidence: "PARTIAL",
          message: "WARNING simulado: duplicidad terapéutica.",
          lineIndexes: [line0, line1],
          requires: "ack",
          arrivedAt: 2,
        }),
        alert({
          alertId: "mock-multi-warn-low",
          ruleId: "R6",
          family: "incomplete_safety_context",
          severity: "WARNING",
          priority: "LOW",
          confidence: "LOW",
          message: "WARNING simulado: línea sin presentación de catálogo.",
          lineIndexes: [line1],
          requires: "ack",
          arrivedAt: 3,
        }),
        alert({
          alertId: "mock-multi-info",
          ruleId: "R5",
          family: "incomplete_safety_context",
          severity: "INFO",
          priority: "NORMAL",
          confidence: "HIGH",
          message: "INFO simulado: evaluación parcial del contexto.",
          lineIndexes: [],
          requires: "none",
          arrivedAt: 4,
        }),
        // Duplicate of warn-high — aggregator must drop.
        alert({
          alertId: "mock-multi-warn-high-dup",
          ruleId: "R3",
          family: "therapeutic_duplication",
          severity: "WARNING",
          priority: "HIGH",
          confidence: "PARTIAL",
          message: "WARNING simulado: duplicidad terapéutica.",
          lineIndexes: [line0, line1],
          requires: "ack",
          arrivedAt: 5,
        }),
      ];
    case "confidence_low":
      return [confidenceAlert("LOW", "NORMAL", line0)];
    case "confidence_partial":
      return [confidenceAlert("PARTIAL", "NORMAL", line0)];
    case "confidence_high":
      return [confidenceAlert("HIGH", "HIGH", line0)];
    default:
      return [];
  }
}

function confidenceAlert(
  confidence: SafetyConfidence,
  priority: SafetyPriority,
  lineIndex: number,
): SafetyAlert {
  const severity: SafetySeverity = "WARNING";
  return alert({
    alertId: `mock-conf-${confidence.toLowerCase()}`,
    ruleId: "R2",
    family: "allergy_match",
    severity,
    priority,
    confidence,
    message: `Alerta simulada con confidence ${confidence}.`,
    evidenceSummary: `Confidence ${confidence} (representación UX)`,
    lineIndexes: [lineIndex],
    requires: "ack",
    arrivedAt: 1,
  });
}

export class MockSafetyProvider implements SafetyProvider {
  readonly id = "mock_safety_provider";

  constructor(private scenario: MockSafetyScenario = "none") {}

  getScenario(): MockSafetyScenario {
    return this.scenario;
  }

  setScenario(scenario: MockSafetyScenario): void {
    this.scenario = scenario;
  }

  async evaluate(input: SafetyEvaluateInput): Promise<SafetyEvaluation> {
    const alerts = buildAlerts(this.scenario, input);
    return {
      evaluationId: `mock-eval-${this.scenario}-${Date.now()}`,
      evaluatedAt: new Date().toISOString(),
      engineVersion: "safety-gate-mock-v1",
      patientId: input.patientId,
      consultationId: input.consultationId,
      alerts,
      ruleResults: alerts.map((a) => ({
        ruleId: a.ruleId,
        family: a.family,
        alerts: [a],
      })),
    };
  }
}

export function createMockSafetyProvider(
  scenario: MockSafetyScenario = "none",
): SafetyProvider {
  return new MockSafetyProvider(scenario);
}
