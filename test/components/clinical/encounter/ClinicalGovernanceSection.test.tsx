import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalGovernanceSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalGovernanceSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalGovernanceTypes = vi.fn();

vi.mock("@/lib/clinical-governance", () => ({
  listEnabledClinicalGovernanceTypes: (...args: unknown[]) =>
    listEnabledClinicalGovernanceTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function therapeuticItem() {
  return {
    governanceType: "therapeutic_governance",
    preview: {
      data: {
        governanceType: "therapeutic_governance",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "governance-1",
            governanceType: "therapeutic_governance",
            title: "Gobernanza terapéutica",
            description: "Gobernanza terapéutica",
            status: "governed",
            posture: "constrain",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "therapeutic_governance",
              recommendations: [
                {
                  recommendationId: "recommendation-1",
                  recommendationType: "therapeutic_recommendation",
                },
              ],
            },
            provenance: {
              origin: "clinical_recommendation",
              recommendationOffered: true as const,
            },
            sourceRefs: {
              recommendations: [
                {
                  recommendationId: "recommendation-1",
                  recommendationType: "therapeutic_recommendation",
                },
              ],
            },
            governanceSetId: null,
            governedAt: "2026-08-17T16:00:00.000Z",
            governanceChannel: "clinical_governance" as const,
            supportsPreview: true,
            supportsGovernance: true,
            supportsDiagnosis: false as const,
            supportsAuthorization: false as const,
            supportsDisposition: false as const,
            supportsExecution: false as const,
            immutable: true as const,
            inClinicalGovernanceScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          governanceType: "therapeutic_governance",
          title: "Gobernanza terapéutica",
          supportsPreview: true,
          supportsGovernance: true,
          supportsDiagnosis: false as const,
          supportsAuthorization: false as const,
          supportsDisposition: false as const,
          supportsExecution: false as const,
          immutable: true as const,
          inClinicalGovernanceScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      governanceType: "therapeutic_governance",
      title: "Gobernanza terapéutica",
      supportsPreview: true,
      supportsGovernance: true,
      supportsDiagnosis: false as const,
      supportsAuthorization: false as const,
      supportsDisposition: false as const,
      supportsExecution: false as const,
      immutable: true as const,
      inClinicalGovernanceScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalGovernanceSection", () => {
  beforeEach(() => {
    listEnabledClinicalGovernanceTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalGovernanceTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalGovernanceSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-governance-skeleton"),
    ).toBeInTheDocument();
    resolveList([therapeuticItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-governance-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Gobernanza terapéutica")).toBeInTheDocument();
    expect(screen.getByText("recommendation-1")).toBeInTheDocument();
    expect(screen.getByText(/Gobernado/)).toBeInTheDocument();
    expect(screen.getByText(/Constrain/)).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-governance-immutable-therapeutic_governance"),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId("clinical-governance-view-therapeutic_governance"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId(
        "clinical-governance-capability-therapeutic_governance",
      ),
    ).toHaveTextContent("Gobernanza on");
    expect(
      screen.getByTestId(
        "clinical-governance-capability-therapeutic_governance",
      ),
    ).toHaveTextContent("Diagnóstico off");
    expect(
      screen.getByTestId(
        "clinical-governance-capability-therapeutic_governance",
      ),
    ).toHaveTextContent("Autorización off");
    expect(
      screen.getByTestId(
        "clinical-governance-capability-therapeutic_governance",
      ),
    ).toHaveTextContent("Disposición off");
    expect(
      screen.getByTestId(
        "clinical-governance-capability-therapeutic_governance",
      ),
    ).toHaveTextContent("Ejecución off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /editar|eliminar|buscar|ejecutar|diagnosticar|autorizar|emitir/i,
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
                code: "missing_governance_posture",
                field: "posture",
                message:
                  "governance must declare a fail-closed posture; silent allow is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalGovernanceTypes.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalGovernanceSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-governance-gate-therapeutic_governance"),
      ).toHaveTextContent("fail-closed posture");
    });
    expect(
      screen.queryByRole("button", {
        name: /editar|eliminar|ejecutar|diagnosticar|autorizar|emitir/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no governance types are enabled", async () => {
    listEnabledClinicalGovernanceTypes.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalGovernanceSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-governance-empty"),
      ).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalGovernanceTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalGovernanceSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-governance-error"),
      ).toBeInTheDocument();
    });
    listEnabledClinicalGovernanceTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-governance-empty"),
      ).toBeInTheDocument();
    });
  });
});
