import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalEvidenceSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalEvidenceSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalEvidenceTypes = vi.fn();

vi.mock("@/lib/clinical-evidence", () => ({
  listEnabledClinicalEvidenceTypes: (...args: unknown[]) =>
    listEnabledClinicalEvidenceTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function supportingItem() {
  return {
    evidenceType: "supporting_evidence",
    preview: {
      data: {
        evidenceType: "supporting_evidence",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "evidence-1",
            evidenceType: "supporting_evidence",
            title: "Evidencia de apoyo",
            description: "Evidencia de apoyo",
            status: "constituted",
            evidenceStance: "contradict",
            countryCode: "CL",
            locale: "es-CL",
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            payload: {
              kind: "supporting_evidence",
              citations: [{ knowledgeId: "knowledge-1", knowledgeClass: "protocol_knowledge" }],
            },
            provenance: { origin: "clinical_evidence", phiFree: true as const },
            parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
            sourceRefs: {
              citations: [{ knowledgeId: "knowledge-1", knowledgeClass: "protocol_knowledge" }],
            },
            evidenceSetId: null,
            constitutedAt: "2026-08-17T20:00:00.000Z",
            evidenceChannel: "clinical_evidence" as const,
            supportsPreview: true,
            supportsEvidence: true,
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
            inClinicalEvidenceScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          evidenceType: "supporting_evidence",
          title: "Evidencia de apoyo",
          supportsPreview: true,
          supportsEvidence: true,
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
          inClinicalEvidenceScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      evidenceType: "supporting_evidence",
      title: "Evidencia de apoyo",
      supportsPreview: true,
      supportsEvidence: true,
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
      inClinicalEvidenceScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalEvidenceSection", () => {
  beforeEach(() => {
    listEnabledClinicalEvidenceTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalEvidenceTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalEvidenceSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-evidence-skeleton")).toBeInTheDocument();
    resolveList([supportingItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-evidence-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Evidencia de apoyo")).toBeInTheDocument();
    expect(screen.getByText("knowledge-1")).toBeInTheDocument();
    expect(screen.getByText(/Constituido/)).toBeInTheDocument();
    expect(screen.getByText(/Contradict/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-evidence-immutable-supporting_evidence")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-evidence-view-supporting_evidence")).toHaveTextContent("Clinica Demo");
    expect(screen.getByTestId("clinical-evidence-view-supporting_evidence")).not.toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Conocimiento off");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Evidencia on");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Reingreso off");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-evidence-capability-supporting_evidence")).toHaveTextContent("Emisión off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar|autorizar|emitir|aprender/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = supportingItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_evidence_stance",
                field: "evidenceStance",
                message: "evidence must declare a fail-closed stance; silent support is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalEvidenceTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalEvidenceSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-evidence-gate-supporting_evidence")).toHaveTextContent("fail-closed stance");
    });
  });

  it("shows an empty state when no evidence types are enabled", async () => {
    listEnabledClinicalEvidenceTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalEvidenceSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-evidence-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalEvidenceTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalEvidenceSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-evidence-error")).toBeInTheDocument();
    });
    listEnabledClinicalEvidenceTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-evidence-empty")).toBeInTheDocument();
    });
  });
});
