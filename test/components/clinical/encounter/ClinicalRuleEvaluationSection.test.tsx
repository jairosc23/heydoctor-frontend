import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalRuleEvaluationSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalRuleEvaluationSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalRuleTypes = vi.fn();

vi.mock("@/lib/clinical-rules", () => ({
  listEnabledClinicalRuleTypes: (...args: unknown[]) =>
    listEnabledClinicalRuleTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function medicationItem() {
  return {
    ruleType: "medication_rule",
    preview: {
      data: {
        ruleType: "medication_rule",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "evaluation-1",
            ruleType: "medication_rule",
            title: "Regla de medicación",
            description: "Regla de medicación",
            status: "evaluated",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "medication_rule",
              facts: [
                { artifactId: "artifact-1", artifactType: "clinical_order" },
              ],
              recordRefs: [{ recordId: "record-1", recordType: "orders" }],
            },
            provenance: {
              origin: "clinical_artifact_registry",
              factsRegistered: true as const,
            },
            sourceRefs: {
              facts: [
                { artifactId: "artifact-1", artifactType: "clinical_order" },
              ],
              recordRefs: [{ recordId: "record-1", recordType: "orders" }],
            },
            ruleSetId: null,
            evaluatedAt: "2026-08-16T12:00:00.000Z",
            evaluationChannel: "clinical_rules_evaluator" as const,
            supportsPreview: true,
            supportsEvaluation: true,
            supportsExplanation: false as const,
            supportsExecution: false as const,
            immutable: true as const,
            inClinicalRulesScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          ruleType: "medication_rule",
          title: "Regla de medicación",
          supportsPreview: true,
          supportsEvaluation: true,
          supportsExplanation: false as const,
          supportsExecution: false as const,
          immutable: true as const,
          inClinicalRulesScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      ruleType: "medication_rule",
      title: "Regla de medicación",
      supportsPreview: true,
      supportsEvaluation: true,
      supportsExplanation: false as const,
      supportsExecution: false as const,
      immutable: true as const,
      inClinicalRulesScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalRuleEvaluationSection", () => {
  beforeEach(() => {
    listEnabledClinicalRuleTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalRuleTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalRuleEvaluationSection consultationId={CONSULTATION_ID} />,
    );

    expect(screen.getByTestId("clinical-rules-skeleton")).toBeInTheDocument();
    resolveList([medicationItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-rules-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Regla de medicación")).toBeInTheDocument();
    expect(screen.getByText("artifact-1 · record-1")).toBeInTheDocument();
    expect(screen.getByText("Evaluado")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-rule-immutable-medication_rule"),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId("clinical-rule-view-medication_rule"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("clinical-rule-capability-medication_rule"),
    ).toHaveTextContent("Evaluación on");
    expect(
      screen.getByTestId("clinical-rule-capability-medication_rule"),
    ).toHaveTextContent("Ejecución off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|buscar|ejecutar/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = medicationItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_registered_facts",
                field: "payload.facts",
                message:
                  "an evaluated result requires at least one registered fact citation",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalRuleTypes.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalRuleEvaluationSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-rule-gate-medication_rule"),
      ).toHaveTextContent("registered fact citation");
    });
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no rule types are enabled", async () => {
    listEnabledClinicalRuleTypes.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalRuleEvaluationSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-rules-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalRuleTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalRuleEvaluationSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-rules-error")).toBeInTheDocument();
    });
    listEnabledClinicalRuleTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-rules-empty")).toBeInTheDocument();
    });
  });
});
