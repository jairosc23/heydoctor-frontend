import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalScientificGovernanceSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalScientificGovernanceSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalScientificGovernanceTypes = vi.fn();

vi.mock("@/lib/clinical-scientific-governance", () => ({
  listEnabledClinicalScientificGovernanceTypes: (...args: unknown[]) =>
    listEnabledClinicalScientificGovernanceTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function provenanceItem() {
  return {
    scientificType: "provenance_standing",
    preview: {
      data: {
        scientificType: "provenance_standing",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "standing-1",
            scientificType: "provenance_standing",
            title: "Gobernanza de procedencia",
            description: "Gobernanza de procedencia",
            status: "constituted",
            scientificStance: "conflicted",
            countryCode: "CL",
            locale: "es-CL",
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            payload: {
              kind: "provenance_standing",
              citations: [
                { knowledgeId: "knowledge-1", knowledgeClass: "protocol_knowledge" },
                { evidenceId: "evidence-1", evidenceClass: "supporting_evidence" },
              ],
            },
            provenance: { origin: "clinical_scientific_governance", phiFree: true as const },
            parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
            sourceRefs: {
              citations: [
                { knowledgeId: "knowledge-1", knowledgeClass: "protocol_knowledge" },
                { evidenceId: "evidence-1", evidenceClass: "supporting_evidence" },
              ],
            },
            scientificSetId: null,
            constitutedAt: "2026-08-17T20:00:00.000Z",
            scientificChannel: "clinical_scientific_governance" as const,
            supportsPreview: true,
            supportsScientificGovernance: true,
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
            inClinicalScientificGovernanceScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          scientificType: "provenance_standing",
          title: "Gobernanza de procedencia",
          supportsPreview: true,
          supportsScientificGovernance: true,
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
          inClinicalScientificGovernanceScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      scientificType: "provenance_standing",
      title: "Gobernanza de procedencia",
      supportsPreview: true,
      supportsScientificGovernance: true,
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
      inClinicalScientificGovernanceScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalScientificGovernanceSection", () => {
  beforeEach(() => {
    listEnabledClinicalScientificGovernanceTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalScientificGovernanceTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalScientificGovernanceSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-scientific-governance-skeleton")).toBeInTheDocument();
    resolveList([provenanceItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-scientific-governance-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Gobernanza de procedencia")).toBeInTheDocument();
    expect(screen.getByText("knowledge-1 · evidence-1")).toBeInTheDocument();
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.getByText(/Conflicted/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-scientific-governance-immutable-provenance_standing")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-scientific-governance-view-provenance_standing")).toHaveTextContent("Clinica Demo");
    expect(screen.getByTestId("clinical-scientific-governance-view-provenance_standing")).not.toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Conocimiento off");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Evidencia off");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Gobernanza científica on");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-scientific-governance-capability-provenance_standing")).toHaveTextContent("Emisión off");
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
                field: "scientificStance",
                message: "scientific governance must declare a fail-closed stance; silent admit is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalScientificGovernanceTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalScientificGovernanceSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-scientific-governance-gate-provenance_standing")).toHaveTextContent("fail-closed stance");
    });
  });

  it("fail-closes a projected view with missing scientificStance without inventing admit or crashing", async () => {
    const item = provenanceItem();
    const incomplete = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          view: {
            ok: true as const,
            view: {
              ...item.preview.data.view.view,
              scientificStance: undefined,
            },
          },
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_scientific_stance",
                field: "scientificStance",
                message:
                  "scientific governance must declare a fail-closed stance; silent admit is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalScientificGovernanceTypes.mockResolvedValue([incomplete]);
    renderWithProviders(
      <ClinicalScientificGovernanceSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-scientific-governance-list"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByTestId("clinical-scientific-governance-gate-provenance_standing"),
    ).toHaveTextContent("fail-closed stance");
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.queryByText("Admit")).not.toBeInTheDocument();
    expect(screen.queryByText("Conflicted")).not.toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-scientific-governance-view-provenance_standing"),
    ).toHaveTextContent("Clinica Demo");
  });

  it("shows an empty state when no scientific types are enabled", async () => {
    listEnabledClinicalScientificGovernanceTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalScientificGovernanceSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-scientific-governance-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalScientificGovernanceTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalScientificGovernanceSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-scientific-governance-error")).toBeInTheDocument();
    });
    listEnabledClinicalScientificGovernanceTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-scientific-governance-empty")).toBeInTheDocument();
    });
  });
});
