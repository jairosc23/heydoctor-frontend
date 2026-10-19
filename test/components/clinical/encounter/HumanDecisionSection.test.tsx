import { describe, expect, it, vi, beforeEach } from "vitest";
import { HumanDecisionSection } from "@/app/panel/consultas/[id]/_components/chart/HumanDecisionSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledHumanDecisionTypes = vi.fn();

vi.mock("@/lib/human-decision", () => ({
  listEnabledHumanDecisionTypes: (...args: unknown[]) =>
    listEnabledHumanDecisionTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function therapeuticItem() {
  return {
    decisionType: "therapeutic_decision",
    preview: {
      data: {
        decisionType: "therapeutic_decision",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "decision-1",
            decisionType: "therapeutic_decision",
            title: "Decisión terapéutica",
            description: "Decisión terapéutica",
            status: "decided",
            disposition: "refine",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "therapeutic_decision",
              governances: [
                { governanceId: "governance-1", governanceType: "therapeutic_governance" },
              ],
            },
            provenance: { origin: "clinical_governance", governanceConstituted: true as const },
            sourceRefs: {
              governances: [
                { governanceId: "governance-1", governanceType: "therapeutic_governance" },
              ],
            },
            decisionSetId: null,
            decidedAt: "2026-08-17T18:00:00.000Z",
            decisionChannel: "human_decision" as const,
            supportsPreview: true,
            supportsDecision: true,
            supportsDiagnosis: false as const,
            supportsGovernance: false as const,
            supportsAuthorization: false as const,
            supportsExecution: false as const,
            supportsEmission: false as const,
            immutable: true as const,
            inHumanDecisionScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          decisionType: "therapeutic_decision",
          title: "Decisión terapéutica",
          supportsPreview: true,
          supportsDecision: true,
          supportsDiagnosis: false as const,
          supportsGovernance: false as const,
          supportsAuthorization: false as const,
          supportsExecution: false as const,
          supportsEmission: false as const,
          immutable: true as const,
          inHumanDecisionScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      decisionType: "therapeutic_decision",
      title: "Decisión terapéutica",
      supportsPreview: true,
      supportsDecision: true,
      supportsDiagnosis: false as const,
      supportsGovernance: false as const,
      supportsAuthorization: false as const,
      supportsExecution: false as const,
      supportsEmission: false as const,
      immutable: true as const,
      inHumanDecisionScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("HumanDecisionSection", () => {
  beforeEach(() => {
    listEnabledHumanDecisionTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledHumanDecisionTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<HumanDecisionSection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("human-decision-skeleton")).toBeInTheDocument();
    resolveList([therapeuticItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("human-decision-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Decisión terapéutica")).toBeInTheDocument();
    expect(screen.getByText("governance-1")).toBeInTheDocument();
    expect(screen.getByText(/Decidido/)).toBeInTheDocument();
    expect(screen.getByText(/Refine/)).toBeInTheDocument();
    expect(screen.getByTestId("human-decision-immutable-therapeutic_decision")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("human-decision-view-therapeutic_decision")).toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("human-decision-capability-therapeutic_decision")).toHaveTextContent("Decisión on");
    expect(screen.getByTestId("human-decision-capability-therapeutic_decision")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("human-decision-capability-therapeutic_decision")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("human-decision-capability-therapeutic_decision")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("human-decision-capability-therapeutic_decision")).toHaveTextContent("Emisión off");
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
                code: "missing_human_disposition",
                field: "disposition",
                message: "decision must declare a fail-closed disposition; silent accept is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledHumanDecisionTypes.mockResolvedValue([gated]);
    renderWithProviders(<HumanDecisionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("human-decision-gate-therapeutic_decision")).toHaveTextContent("fail-closed disposition");
    });
  });

  it("shows an empty state when no decision types are enabled", async () => {
    listEnabledHumanDecisionTypes.mockResolvedValue([]);
    renderWithProviders(<HumanDecisionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("human-decision-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledHumanDecisionTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<HumanDecisionSection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("human-decision-error")).toBeInTheDocument();
    });
    listEnabledHumanDecisionTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("human-decision-empty")).toBeInTheDocument();
    });
  });
});
