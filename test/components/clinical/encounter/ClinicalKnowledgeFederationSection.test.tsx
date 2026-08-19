import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalKnowledgeFederationSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalKnowledgeFederationSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalKnowledgeFederationTypes = vi.fn();

vi.mock("@/lib/clinical-knowledge-federation", () => ({
  listEnabledClinicalKnowledgeFederationTypes: (...args: unknown[]) =>
    listEnabledClinicalKnowledgeFederationTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function provenanceItem() {
  return {
    federationType: "federable_standing",
    preview: {
      data: {
        federationType: "federable_standing",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "standing-1",
            federationType: "federable_standing",
            title: "Federación compartible",
            description: "Federación compartible",
            status: "constituted",
            federationStance: "restrict",
            countryCode: "CL",
            locale: "es-CL",
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            payload: {
              kind: "federable_standing",
              citations: [
                { scientificId: "scientific-1", scientificClass: "federable_standing" },
              ],
            },
            provenance: { origin: "clinical_knowledge_federation", phiFree: true as const },
            parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
            sourceRefs: {
              citations: [
                { scientificId: "scientific-1", scientificClass: "federable_standing" },
              ],
            },
            federationSetId: null,
            constitutedAt: "2026-08-17T20:00:00.000Z",
            federationChannel: "clinical_knowledge_federation" as const,
            supportsPreview: true,
            supportsFederation: true,
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
            inClinicalKnowledgeFederationScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          federationType: "federable_standing",
          title: "Federación compartible",
          supportsPreview: true,
          supportsFederation: true,
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
          inClinicalKnowledgeFederationScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      federationType: "federable_standing",
      title: "Federación compartible",
      supportsPreview: true,
      supportsFederation: true,
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
      inClinicalKnowledgeFederationScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalKnowledgeFederationSection", () => {
  beforeEach(() => {
    listEnabledClinicalKnowledgeFederationTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalKnowledgeFederationTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalKnowledgeFederationSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-knowledge-federation-skeleton")).toBeInTheDocument();
    resolveList([provenanceItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-federation-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Federación compartible")).toBeInTheDocument();
    expect(screen.getByText("scientific-1")).toBeInTheDocument();
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.getByText(/Restrict/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-knowledge-federation-immutable-federable_standing")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-knowledge-federation-view-federable_standing")).toHaveTextContent("Clinica Demo");
    expect(screen.getByTestId("clinical-knowledge-federation-view-federable_standing")).not.toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Conocimiento off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Evidencia off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Gobernanza científica off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Federación on");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-knowledge-federation-capability-federable_standing")).toHaveTextContent("Emisión off");
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
                field: "federationStance",
                message: "scientific governance must declare a fail-closed stance; silent share is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalKnowledgeFederationTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalKnowledgeFederationSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-federation-gate-federable_standing")).toHaveTextContent("fail-closed stance");
    });
  });

  it("shows an empty state when no scientific types are enabled", async () => {
    listEnabledClinicalKnowledgeFederationTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalKnowledgeFederationSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-federation-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalKnowledgeFederationTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalKnowledgeFederationSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-federation-error")).toBeInTheDocument();
    });
    listEnabledClinicalKnowledgeFederationTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-federation-empty")).toBeInTheDocument();
    });
  });
});
