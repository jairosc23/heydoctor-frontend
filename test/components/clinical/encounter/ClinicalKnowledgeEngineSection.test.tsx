import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalKnowledgeEngineSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalKnowledgeEngineSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalKnowledgeEngineTypes = vi.fn();

vi.mock("@/lib/clinical-knowledge-engine", () => ({
  listEnabledClinicalKnowledgeEngineTypes: (...args: unknown[]) =>
    listEnabledClinicalKnowledgeEngineTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function provenanceItem() {
  return {
    adviseType: "eligible_advice",
    preview: {
      data: {
        adviseType: "eligible_advice",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "standing-1",
            adviseType: "eligible_advice",
            title: "Consejo elegible",
            description: "Consejo elegible",
            status: "constituted",
            adviseStance: "restrict",
            countryCode: "CL",
            locale: "es-CL",
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            payload: {
              kind: "eligible_advice",
              citations: [
                { jurisdictionId: "scientific-1", jurisdictionClass: "eligible_advice" },
              ],
            },
            provenance: { origin: "clinical_knowledge_engine", phiFree: true as const },
            parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
            sourceRefs: {
              citations: [
                { jurisdictionId: "scientific-1", jurisdictionClass: "eligible_advice" },
              ],
            },
            engineSetId: null,
            constitutedAt: "2026-08-17T20:00:00.000Z",
            engineChannel: "clinical_knowledge_engine" as const,
            supportsPreview: true,
            supportsAdvise: true as const,
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
            inClinicalKnowledgeEngineScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          adviseType: "eligible_advice",
          title: "Consejo elegible",
          supportsPreview: true,
          supportsAdvise: true as const,
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
          inClinicalKnowledgeEngineScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      adviseType: "eligible_advice",
      title: "Consejo elegible",
      supportsPreview: true,
      supportsAdvise: true as const,
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
      inClinicalKnowledgeEngineScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalKnowledgeEngineSection", () => {
  beforeEach(() => {
    listEnabledClinicalKnowledgeEngineTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalKnowledgeEngineTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalKnowledgeEngineSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-knowledge-engine-skeleton")).toBeInTheDocument();
    resolveList([provenanceItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-engine-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Consejo elegible")).toBeInTheDocument();
    expect(screen.getByText("scientific-1")).toBeInTheDocument();
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.getByText(/Restrict/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-knowledge-engine-immutable-eligible_advice")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-knowledge-engine-view-eligible_advice")).toHaveTextContent("Clinica Demo");
    expect(screen.getByTestId("clinical-knowledge-engine-view-eligible_advice")).not.toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Conocimiento off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Evidencia off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Gobernanza científica off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Federación off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Consejo on");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Jurisdicción off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-knowledge-engine-capability-eligible_advice")).toHaveTextContent("Emisión off");
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
                field: "adviseStance",
                message: "scientific governance must declare a fail-closed stance; silent share is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalKnowledgeEngineTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalKnowledgeEngineSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-engine-gate-eligible_advice")).toHaveTextContent("fail-closed stance");
    });
  });

  it("shows an empty state when no scientific types are enabled", async () => {
    listEnabledClinicalKnowledgeEngineTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalKnowledgeEngineSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-engine-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalKnowledgeEngineTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalKnowledgeEngineSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-engine-error")).toBeInTheDocument();
    });
    listEnabledClinicalKnowledgeEngineTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-engine-empty")).toBeInTheDocument();
    });
  });
});
