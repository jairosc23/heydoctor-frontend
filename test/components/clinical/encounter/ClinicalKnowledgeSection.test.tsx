import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalKnowledgeSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalKnowledgeSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalKnowledgeTypes = vi.fn();

vi.mock("@/lib/clinical-knowledge", () => ({
  listEnabledClinicalKnowledgeTypes: (...args: unknown[]) =>
    listEnabledClinicalKnowledgeTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function protocolItem() {
  return {
    knowledgeType: "protocol_knowledge",
    preview: {
      data: {
        knowledgeType: "protocol_knowledge",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "knowledge-1",
            knowledgeType: "protocol_knowledge",
            title: "Conocimiento de protocolo",
            description: "Conocimiento de protocolo",
            status: "constituted",
            knowledgeStance: "withhold",
            countryCode: "CL",
            locale: "es-CL",
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            payload: {
              kind: "protocol_knowledge",
              citations: [{ knowledgeId: "ref-1", knowledgeClass: "protocol_knowledge" }],
            },
            provenance: { origin: "clinical_knowledge", phiFree: true as const },
            parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
            sourceRefs: {
              citations: [{ knowledgeId: "ref-1", knowledgeClass: "protocol_knowledge" }],
            },
            knowledgeSetId: null,
            constitutedAt: "2026-08-17T20:00:00.000Z",
            knowledgeChannel: "clinical_knowledge" as const,
            supportsPreview: true,
            supportsKnowledge: true,
            supportsLearning: false as const,
            supportsReentry: false as const,
            supportsDiagnosis: false as const,
            supportsDecision: false as const,
            supportsGovernance: false as const,
            supportsAuthorization: false as const,
            supportsExecution: false as const,
            supportsEmission: false as const,
            immutable: true as const,
            inClinicalKnowledgeScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          knowledgeType: "protocol_knowledge",
          title: "Conocimiento de protocolo",
          supportsPreview: true,
          supportsKnowledge: true,
          supportsLearning: false as const,
          supportsReentry: false as const,
          supportsDiagnosis: false as const,
          supportsDecision: false as const,
          supportsGovernance: false as const,
          supportsAuthorization: false as const,
          supportsExecution: false as const,
          supportsEmission: false as const,
          immutable: true as const,
          inClinicalKnowledgeScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      knowledgeType: "protocol_knowledge",
      title: "Conocimiento de protocolo",
      supportsPreview: true,
      supportsKnowledge: true,
      supportsLearning: false as const,
      supportsReentry: false as const,
      supportsDiagnosis: false as const,
      supportsDecision: false as const,
      supportsGovernance: false as const,
      supportsAuthorization: false as const,
      supportsExecution: false as const,
      supportsEmission: false as const,
      immutable: true as const,
      inClinicalKnowledgeScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalKnowledgeSection", () => {
  beforeEach(() => {
    listEnabledClinicalKnowledgeTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalKnowledgeTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalKnowledgeSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-knowledge-skeleton")).toBeInTheDocument();
    resolveList([protocolItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Conocimiento de protocolo")).toBeInTheDocument();
    expect(screen.getByText("ref-1")).toBeInTheDocument();
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.getByText(/Withhold/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-knowledge-immutable-protocol_knowledge")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-knowledge-view-protocol_knowledge")).toHaveTextContent("Clinica Demo");
    expect(screen.getByTestId("clinical-knowledge-view-protocol_knowledge")).not.toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Conocimiento on");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Reingreso off");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-knowledge-capability-protocol_knowledge")).toHaveTextContent("Emisión off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar|autorizar|emitir|aprender/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = protocolItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_knowledge_stance",
                field: "knowledgeStance",
                message: "knowledge must declare a fail-closed stance; silent advise is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalKnowledgeTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalKnowledgeSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-gate-protocol_knowledge")).toHaveTextContent("fail-closed stance");
    });
  });

  it("shows an empty state when no knowledge types are enabled", async () => {
    listEnabledClinicalKnowledgeTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalKnowledgeSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalKnowledgeTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalKnowledgeSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-error")).toBeInTheDocument();
    });
    listEnabledClinicalKnowledgeTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-knowledge-empty")).toBeInTheDocument();
    });
  });
});
