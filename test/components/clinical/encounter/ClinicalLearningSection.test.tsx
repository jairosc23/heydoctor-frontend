import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalLearningSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalLearningSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalLearningTypes = vi.fn();

vi.mock("@/lib/clinical-learning", () => ({
  listEnabledClinicalLearningTypes: (...args: unknown[]) =>
    listEnabledClinicalLearningTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function therapeuticItem() {
  return {
    learningType: "therapeutic_learning",
    preview: {
      data: {
        learningType: "therapeutic_learning",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "learning-1",
            learningType: "therapeutic_learning",
            title: "Aprendizaje terapéutico",
            description: "Aprendizaje terapéutico",
            status: "learned",
            learningReturn: "withhold",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "therapeutic_learning",
              executions: [
                { executionId: "execution-1", executionType: "therapeutic_execution" },
              ],
            },
            provenance: { origin: "clinical_execution", executionConstituted: true as const },
            sourceRefs: {
              executions: [
                { executionId: "execution-1", executionType: "therapeutic_execution" },
              ],
            },
            learningSetId: null,
            learnedAt: "2026-08-17T20:00:00.000Z",
            learningChannel: "clinical_learning" as const,
            supportsPreview: true,
            supportsLearning: true,
            supportsDiagnosis: false as const,
            supportsDecision: false as const,
            supportsGovernance: false as const,
            supportsAuthorization: false as const,
            supportsExecution: false as const,
            supportsEmission: false as const,
            immutable: true as const,
            inClinicalLearningScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          learningType: "therapeutic_learning",
          title: "Aprendizaje terapéutico",
          supportsPreview: true,
          supportsLearning: true,
          supportsDiagnosis: false as const,
          supportsDecision: false as const,
          supportsGovernance: false as const,
          supportsAuthorization: false as const,
          supportsExecution: false as const,
          supportsEmission: false as const,
          immutable: true as const,
          inClinicalLearningScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      learningType: "therapeutic_learning",
      title: "Aprendizaje terapéutico",
      supportsPreview: true,
      supportsLearning: true,
      supportsDiagnosis: false as const,
      supportsDecision: false as const,
      supportsGovernance: false as const,
      supportsAuthorization: false as const,
      supportsExecution: false as const,
      supportsEmission: false as const,
      immutable: true as const,
      inClinicalLearningScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalLearningSection", () => {
  beforeEach(() => {
    listEnabledClinicalLearningTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalLearningTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalLearningSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-learning-skeleton")).toBeInTheDocument();
    resolveList([therapeuticItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-learning-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Aprendizaje terapéutico")).toBeInTheDocument();
    expect(screen.getByText("execution-1")).toBeInTheDocument();
    expect(screen.getByText(/Candidato/)).toBeInTheDocument();
    expect(screen.getByText(/Withhold/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-learning-immutable-therapeutic_learning")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-learning-view-therapeutic_learning")).toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-learning-capability-therapeutic_learning")).toHaveTextContent("Aprendizaje on");
    expect(screen.getByTestId("clinical-learning-capability-therapeutic_learning")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-learning-capability-therapeutic_learning")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-learning-capability-therapeutic_learning")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-learning-capability-therapeutic_learning")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-learning-capability-therapeutic_learning")).toHaveTextContent("Emisión off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar|autorizar|emitir|aprender/i }),
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
                code: "missing_learning_return",
                field: "learningReturn",
                message: "learning must declare a fail-closed return; silent retain is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalLearningTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalLearningSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-learning-gate-therapeutic_learning")).toHaveTextContent("fail-closed return");
    });
  });

  it("shows an empty state when no learning types are enabled", async () => {
    listEnabledClinicalLearningTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalLearningSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-learning-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalLearningTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalLearningSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-learning-error")).toBeInTheDocument();
    });
    listEnabledClinicalLearningTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-learning-empty")).toBeInTheDocument();
    });
  });
});
