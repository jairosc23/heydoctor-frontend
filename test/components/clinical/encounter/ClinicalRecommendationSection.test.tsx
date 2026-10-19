import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalRecommendationSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalRecommendationSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalRecommendationTypes = vi.fn();

vi.mock("@/lib/clinical-recommendation", () => ({
  listEnabledClinicalRecommendationTypes: (...args: unknown[]) =>
    listEnabledClinicalRecommendationTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function therapeuticItem() {
  return {
    recommendationType: "therapeutic_recommendation",
    preview: {
      data: {
        recommendationType: "therapeutic_recommendation",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "recommendation-1",
            recommendationType: "therapeutic_recommendation",
            title: "Recomendación terapéutica",
            description: "Recomendación terapéutica",
            status: "offered",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "therapeutic_recommendation",
              reasonings: [
                {
                  reasoningId: "reasoning-1",
                  reasoningType: "hypothesis_reasoning",
                },
              ],
            },
            provenance: {
              origin: "clinical_reasoning",
              reasoningReasoned: true as const,
            },
            sourceRefs: {
              reasonings: [
                {
                  reasoningId: "reasoning-1",
                  reasoningType: "hypothesis_reasoning",
                },
              ],
            },
            recommendationSetId: null,
            offeredAt: "2026-08-16T21:00:00.000Z",
            recommendationChannel: "clinical_recommendation" as const,
            supportsPreview: true,
            supportsRecommendation: true,
            supportsDiagnosis: false as const,
            supportsAuthorization: false as const,
            supportsDisposition: false as const,
            immutable: true as const,
            inClinicalRecommendationScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          recommendationType: "therapeutic_recommendation",
          title: "Recomendación terapéutica",
          supportsPreview: true,
          supportsRecommendation: true,
          supportsDiagnosis: false as const,
          supportsAuthorization: false as const,
          supportsDisposition: false as const,
          immutable: true as const,
          inClinicalRecommendationScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      recommendationType: "therapeutic_recommendation",
      title: "Recomendación terapéutica",
      supportsPreview: true,
      supportsRecommendation: true,
      supportsDiagnosis: false as const,
      supportsAuthorization: false as const,
      supportsDisposition: false as const,
      immutable: true as const,
      inClinicalRecommendationScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalRecommendationSection", () => {
  beforeEach(() => {
    listEnabledClinicalRecommendationTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalRecommendationTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalRecommendationSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-recommendation-skeleton"),
    ).toBeInTheDocument();
    resolveList([therapeuticItem()]);

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-recommendation-list"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Recomendación terapéutica")).toBeInTheDocument();
    expect(screen.getByText("reasoning-1")).toBeInTheDocument();
    expect(screen.getByText("Ofrecida")).toBeInTheDocument();
    expect(
      screen.getByTestId(
        "clinical-recommendation-immutable-therapeutic_recommendation",
      ),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId(
        "clinical-recommendation-view-therapeutic_recommendation",
      ),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId(
        "clinical-recommendation-capability-therapeutic_recommendation",
      ),
    ).toHaveTextContent("Recomendación on");
    expect(
      screen.getByTestId(
        "clinical-recommendation-capability-therapeutic_recommendation",
      ),
    ).toHaveTextContent("Diagnóstico off");
    expect(
      screen.getByTestId(
        "clinical-recommendation-capability-therapeutic_recommendation",
      ),
    ).toHaveTextContent("Autorización off");
    expect(
      screen.getByTestId(
        "clinical-recommendation-capability-therapeutic_recommendation",
      ),
    ).toHaveTextContent("Disposición off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /editar|eliminar|buscar|ejecutar|diagnosticar|autorizar/i,
      }),
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
                code: "missing_reasoned_reasoning",
                field: "payload.reasonings",
                message:
                  "a recommendation requires at least one reasoned reasoning citation",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalRecommendationTypes.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalRecommendationSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "clinical-recommendation-gate-therapeutic_recommendation",
        ),
      ).toHaveTextContent("reasoned reasoning citation");
    });
    expect(
      screen.queryByRole("button", {
        name: /editar|eliminar|ejecutar|diagnosticar|autorizar/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no recommendation types are enabled", async () => {
    listEnabledClinicalRecommendationTypes.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalRecommendationSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-recommendation-empty"),
      ).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalRecommendationTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalRecommendationSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-recommendation-error"),
      ).toBeInTheDocument();
    });
    listEnabledClinicalRecommendationTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-recommendation-empty"),
      ).toBeInTheDocument();
    });
  });
});
