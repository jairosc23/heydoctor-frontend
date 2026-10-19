import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalKnowledgeJurisdictionSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalKnowledgeJurisdictionSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalKnowledgeJurisdictionTypes = vi.fn();

vi.mock("@/lib/clinical-knowledge-jurisdiction", () => ({
  listEnabledClinicalKnowledgeJurisdictionTypes: (...args: unknown[]) =>
    listEnabledClinicalKnowledgeJurisdictionTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function provenanceItem() {
  return {
    jurisdictionType: "in_force_standing",
    preview: {
      data: {
        jurisdictionType: "in_force_standing",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "standing-1",
            jurisdictionType: "in_force_standing",
            title: "Vigencia jurisdiccional",
            description: "Vigencia jurisdiccional",
            status: "constituted",
            jurisdictionStance: "restrict",
            countryCode: "CL",
            locale: "es-CL",
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            payload: {
              kind: "in_force_standing",
              citations: [
                { federationId: "scientific-1", federationClass: "in_force_standing" },
              ],
            },
            provenance: { origin: "clinical_knowledge_jurisdiction", phiFree: true as const },
            parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
            sourceRefs: {
              citations: [
                { federationId: "scientific-1", federationClass: "in_force_standing" },
              ],
            },
            jurisdictionSetId: null,
            constitutedAt: "2026-08-17T20:00:00.000Z",
            jurisdictionChannel: "clinical_knowledge_jurisdiction" as const,
            supportsPreview: true,
            supportsJurisdiction: true,
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
            inClinicalKnowledgeJurisdictionScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          jurisdictionType: "in_force_standing",
          title: "Vigencia jurisdiccional",
          supportsPreview: true,
          supportsJurisdiction: true,
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
          inClinicalKnowledgeJurisdictionScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      jurisdictionType: "in_force_standing",
      title: "Vigencia jurisdiccional",
      supportsPreview: true,
      supportsJurisdiction: true,
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
      inClinicalKnowledgeJurisdictionScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalKnowledgeJurisdictionSection", () => {
  beforeEach(() => {
    listEnabledClinicalKnowledgeJurisdictionTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalKnowledgeJurisdictionTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalKnowledgeJurisdictionSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-skeleton")).toBeInTheDocument();
    resolveList([provenanceItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-jurisdiction-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Vigencia jurisdiccional")).toBeInTheDocument();
    expect(screen.getByText("scientific-1")).toBeInTheDocument();
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.getByText(/Restrict/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-immutable-in_force_standing")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-view-in_force_standing")).toHaveTextContent("Clinica Demo");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-view-in_force_standing")).not.toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Conocimiento off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Evidencia off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Gobernanza científica off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Federación off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Jurisdicción on");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-knowledge-jurisdiction-capability-in_force_standing")).toHaveTextContent("Emisión off");
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
                field: "jurisdictionStance",
                message: "scientific governance must declare a fail-closed stance; silent share is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalKnowledgeJurisdictionTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalKnowledgeJurisdictionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-jurisdiction-gate-in_force_standing")).toHaveTextContent("fail-closed stance");
    });
  });

  it("shows an empty state when no scientific types are enabled", async () => {
    listEnabledClinicalKnowledgeJurisdictionTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalKnowledgeJurisdictionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-jurisdiction-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalKnowledgeJurisdictionTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalKnowledgeJurisdictionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-jurisdiction-error")).toBeInTheDocument();
    });
    listEnabledClinicalKnowledgeJurisdictionTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-jurisdiction-empty")).toBeInTheDocument();
    });
  });
});
