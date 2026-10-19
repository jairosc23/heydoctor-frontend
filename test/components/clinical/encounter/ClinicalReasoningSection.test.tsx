import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalReasoningSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalReasoningSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalReasoningTypes = vi.fn();

vi.mock("@/lib/clinical-reasoning", () => ({
  listEnabledClinicalReasoningTypes: (...args: unknown[]) =>
    listEnabledClinicalReasoningTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function hypothesisItem() {
  return {
    reasoningType: "hypothesis_reasoning",
    preview: {
      data: {
        reasoningType: "hypothesis_reasoning",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "reasoning-1",
            reasoningType: "hypothesis_reasoning",
            title: "Razonamiento de hipótesis",
            description: "Razonamiento de hipótesis",
            status: "reasoned",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "hypothesis_reasoning",
              understandings: [
                {
                  understandingId: "understanding-1",
                  understandingType: "situation_understanding",
                },
              ],
            },
            provenance: {
              origin: "clinical_understanding",
              understandingAssembled: true as const,
            },
            sourceRefs: {
              understandings: [
                {
                  understandingId: "understanding-1",
                  understandingType: "situation_understanding",
                },
              ],
            },
            reasoningSetId: null,
            reasonedAt: "2026-08-16T12:00:00.000Z",
            reasoningChannel: "clinical_reasoning" as const,
            supportsPreview: true,
            supportsReasoning: true,
            supportsDiagnosis: false as const,
            supportsRecommendation: false as const,
            immutable: true as const,
            inClinicalReasoningScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          reasoningType: "hypothesis_reasoning",
          title: "Razonamiento de hipótesis",
          supportsPreview: true,
          supportsReasoning: true,
          supportsDiagnosis: false as const,
          supportsRecommendation: false as const,
          immutable: true as const,
          inClinicalReasoningScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      reasoningType: "hypothesis_reasoning",
      title: "Razonamiento de hipótesis",
      supportsPreview: true,
      supportsReasoning: true,
      supportsDiagnosis: false as const,
      supportsRecommendation: false as const,
      immutable: true as const,
      inClinicalReasoningScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalReasoningSection", () => {
  beforeEach(() => {
    listEnabledClinicalReasoningTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalReasoningTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalReasoningSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-reasoning-skeleton"),
    ).toBeInTheDocument();
    resolveList([hypothesisItem()]);

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-reasoning-list"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Razonamiento de hipótesis")).toBeInTheDocument();
    expect(screen.getByText("understanding-1")).toBeInTheDocument();
    expect(screen.getByText("Razonado")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-reasoning-immutable-hypothesis_reasoning"),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId("clinical-reasoning-view-hypothesis_reasoning"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("clinical-reasoning-capability-hypothesis_reasoning"),
    ).toHaveTextContent("Razonamiento on");
    expect(
      screen.getByTestId("clinical-reasoning-capability-hypothesis_reasoning"),
    ).toHaveTextContent("Diagnóstico off");
    expect(
      screen.getByTestId("clinical-reasoning-capability-hypothesis_reasoning"),
    ).toHaveTextContent("Recomendación off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /editar|eliminar|buscar|ejecutar|diagnosticar|recomendar/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = hypothesisItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_assembled_understanding",
                field: "payload.understandings",
                message:
                  "a reasoning requires at least one assembled understanding citation",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalReasoningTypes.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalReasoningSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-reasoning-gate-hypothesis_reasoning"),
      ).toHaveTextContent("assembled understanding citation");
    });
    expect(
      screen.queryByRole("button", {
        name: /editar|eliminar|ejecutar|diagnosticar|recomendar/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no reasoning types are enabled", async () => {
    listEnabledClinicalReasoningTypes.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalReasoningSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-reasoning-empty"),
      ).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalReasoningTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalReasoningSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-reasoning-error"),
      ).toBeInTheDocument();
    });
    listEnabledClinicalReasoningTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-reasoning-empty"),
      ).toBeInTheDocument();
    });
  });
});
