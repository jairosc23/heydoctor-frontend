import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalExecutionSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalExecutionSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalExecutionTypes = vi.fn();

vi.mock("@/lib/clinical-execution", () => ({
  listEnabledClinicalExecutionTypes: (...args: unknown[]) =>
    listEnabledClinicalExecutionTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function therapeuticItem() {
  return {
    executionType: "therapeutic_execution",
    preview: {
      data: {
        executionType: "therapeutic_execution",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "execution-1",
            executionType: "therapeutic_execution",
            title: "Ejecución terapéutica",
            description: "Ejecución terapéutica",
            status: "progressed",
            progression: "hold",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "therapeutic_execution",
              decisions: [
                { decisionId: "decision-1", decisionType: "therapeutic_decision" },
              ],
            },
            provenance: { origin: "human_decision", decisionConstituted: true as const },
            sourceRefs: {
              decisions: [
                { decisionId: "decision-1", decisionType: "therapeutic_decision" },
              ],
            },
            executionSetId: null,
            progressedAt: "2026-08-17T20:00:00.000Z",
            executionChannel: "clinical_execution" as const,
            supportsPreview: true,
            supportsExecution: true,
            supportsDiagnosis: false as const,
            supportsDecision: false as const,
            supportsGovernance: false as const,
            supportsAuthorization: false as const,
            supportsEmission: false as const,
            immutable: true as const,
            inClinicalExecutionScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          executionType: "therapeutic_execution",
          title: "Ejecución terapéutica",
          supportsPreview: true,
          supportsExecution: true,
          supportsDiagnosis: false as const,
          supportsDecision: false as const,
          supportsGovernance: false as const,
          supportsAuthorization: false as const,
          supportsEmission: false as const,
          immutable: true as const,
          inClinicalExecutionScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      executionType: "therapeutic_execution",
      title: "Ejecución terapéutica",
      supportsPreview: true,
      supportsExecution: true,
      supportsDiagnosis: false as const,
      supportsDecision: false as const,
      supportsGovernance: false as const,
      supportsAuthorization: false as const,
      supportsEmission: false as const,
      immutable: true as const,
      inClinicalExecutionScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalExecutionSection", () => {
  beforeEach(() => {
    listEnabledClinicalExecutionTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalExecutionTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalExecutionSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-execution-skeleton")).toBeInTheDocument();
    resolveList([therapeuticItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-execution-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Ejecución terapéutica")).toBeInTheDocument();
    expect(screen.getByText("decision-1")).toBeInTheDocument();
    expect(screen.getByText(/Progresado/)).toBeInTheDocument();
    expect(screen.getByText(/Hold/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-execution-immutable-therapeutic_execution")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-execution-view-therapeutic_execution")).toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-execution-capability-therapeutic_execution")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-execution-capability-therapeutic_execution")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-execution-capability-therapeutic_execution")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-execution-capability-therapeutic_execution")).toHaveTextContent("Ejecución on");
    expect(screen.getByTestId("clinical-execution-capability-therapeutic_execution")).toHaveTextContent("Emisión off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar|autorizar|emitir/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = therapeuticItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_execution_progression",
                field: "progression",
                message: "execution must declare a fail-closed progression; silent progress is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalExecutionTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalExecutionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-execution-gate-therapeutic_execution")).toHaveTextContent("fail-closed progression");
    });
  });

  it("shows an empty state when no execution types are enabled", async () => {
    listEnabledClinicalExecutionTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalExecutionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-execution-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalExecutionTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalExecutionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-execution-error")).toBeInTheDocument();
    });
    listEnabledClinicalExecutionTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-execution-empty")).toBeInTheDocument();
    });
  });
});
