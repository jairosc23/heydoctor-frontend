import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalKnowledgeGroundingSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalKnowledgeGroundingSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalKnowledgeGroundingTypes = vi.fn();

vi.mock("@/lib/clinical-knowledge-grounding", () => ({
  listEnabledClinicalKnowledgeGroundingTypes: (...args: unknown[]) =>
    listEnabledClinicalKnowledgeGroundingTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function provenanceItem() {
  return {
    groundingType: "grounded_attribution",
    preview: {
      data: {
        groundingType: "grounded_attribution",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "standing-1",
            groundingType: "grounded_attribution",
            title: "Atribución trazable",
            description: "Atribución trazable",
            status: "constituted",
            groundingStance: "restrict",
            countryCode: "CL",
            locale: "es-CL",
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            payload: {
              kind: "grounded_attribution",
              citations: [
                { engineId: "scientific-1", engineClass: "grounded_attribution" },
              ],
            },
            provenance: { origin: "clinical_knowledge_grounding", phiFree: true as const },
            parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
            sourceRefs: {
              citations: [
                { engineId: "scientific-1", engineClass: "grounded_attribution" },
              ],
            },
            groundingSetId: null,
            constitutedAt: "2026-08-17T20:00:00.000Z",
            groundingChannel: "clinical_knowledge_grounding" as const,
            supportsPreview: true,
            supportsGrounding: true as const,
            supportsAdvise: false as const,
            supportsJurisdiction: false as const,
          supportsFederation: false,
          supportsScientificGovernance: false,
            supportsEvidence: false as const,
            supportsKnowledge: false as const,
            supportsLearning: false as const,
            supportsReentry: false as const,
            supportsDiagnosis: false as const,
            supportsDecision: false as const,
            supportsGovernance: false as const,
            supportsAuthorization: false as const,
            supportsExecution: false as const,
            supportsEmission: false as const,
            immutable: true as const,
            inClinicalKnowledgeGroundingScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          groundingType: "grounded_attribution",
          title: "Atribución trazable",
          supportsPreview: true,
          supportsGrounding: true as const,
            supportsAdvise: false as const,
            supportsJurisdiction: false as const,
          supportsFederation: false,
          supportsScientificGovernance: false,
          supportsEvidence: false as const,
          supportsKnowledge: false as const,
          supportsLearning: false as const,
          supportsReentry: false as const,
          supportsDiagnosis: false as const,
          supportsDecision: false as const,
          supportsGovernance: false as const,
          supportsAuthorization: false as const,
          supportsExecution: false as const,
          supportsEmission: false as const,
          immutable: true as const,
          inClinicalKnowledgeGroundingScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      groundingType: "grounded_attribution",
      title: "Atribución trazable",
      supportsPreview: true,
      supportsGrounding: true as const,
            supportsAdvise: false as const,
            supportsJurisdiction: false as const,
          supportsFederation: false,
          supportsScientificGovernance: false,
      supportsEvidence: false as const,
      supportsKnowledge: false as const,
      supportsLearning: false as const,
      supportsReentry: false as const,
      supportsDiagnosis: false as const,
      supportsDecision: false as const,
      supportsGovernance: false as const,
      supportsAuthorization: false as const,
      supportsExecution: false as const,
      supportsEmission: false as const,
      immutable: true as const,
      inClinicalKnowledgeGroundingScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalKnowledgeGroundingSection", () => {
  beforeEach(() => {
    listEnabledClinicalKnowledgeGroundingTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalKnowledgeGroundingTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalKnowledgeGroundingSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-knowledge-grounding-skeleton")).toBeInTheDocument();
    resolveList([provenanceItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-grounding-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Atribución trazable")).toBeInTheDocument();
    expect(screen.getByText("scientific-1")).toBeInTheDocument();
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.getByText(/Restrict/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-knowledge-grounding-immutable-grounded_attribution")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-knowledge-grounding-view-grounded_attribution")).toHaveTextContent("Clinica Demo");
    expect(screen.getByTestId("clinical-knowledge-grounding-view-grounded_attribution")).not.toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Conocimiento off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Evidencia off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Gobernanza científica off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Federación off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Atribución on");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Consejo off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Jurisdicción off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-knowledge-grounding-capability-grounded_attribution")).toHaveTextContent("Emisión off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar|autorizar|emitir|aprender/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = provenanceItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_scientific_stance",
                field: "groundingStance",
                message: "scientific governance must declare a fail-closed stance; silent share is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalKnowledgeGroundingTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalKnowledgeGroundingSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-grounding-gate-grounded_attribution")).toHaveTextContent("fail-closed stance");
    });
  });

  it("shows an empty state when no scientific types are enabled", async () => {
    listEnabledClinicalKnowledgeGroundingTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalKnowledgeGroundingSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-grounding-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalKnowledgeGroundingTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalKnowledgeGroundingSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-grounding-error")).toBeInTheDocument();
    });
    listEnabledClinicalKnowledgeGroundingTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-grounding-empty")).toBeInTheDocument();
    });
  });
});
