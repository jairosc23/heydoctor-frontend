import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalUnderstandingSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalUnderstandingSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalUnderstandingTypes = vi.fn();

vi.mock("@/lib/clinical-understanding", () => ({
  listEnabledClinicalUnderstandingTypes: (...args: unknown[]) =>
    listEnabledClinicalUnderstandingTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function situationItem() {
  return {
    understandingType: "situation_understanding",
    preview: {
      data: {
        understandingType: "situation_understanding",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "understanding-1",
            understandingType: "situation_understanding",
            title: "Comprensión de situación",
            description: "Comprensión de situación",
            status: "assembled",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "situation_understanding",
              facts: [
                { artifactId: "artifact-1", artifactType: "clinical_order" },
              ],
              recordRefs: [{ recordId: "record-1", recordType: "orders" }],
            },
            provenance: {
              origin: "clinical_artifact_registry",
              factsRegistered: true as const,
            },
            sourceRefs: {
              facts: [
                { artifactId: "artifact-1", artifactType: "clinical_order" },
              ],
              recordRefs: [{ recordId: "record-1", recordType: "orders" }],
            },
            understandingSetId: null,
            assembledAt: "2026-08-16T12:00:00.000Z",
            understandingChannel: "clinical_understanding" as const,
            supportsPreview: true,
            supportsAssembly: true,
            supportsDiagnosis: false as const,
            supportsReasoning: false as const,
            immutable: true as const,
            inClinicalUnderstandingScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          understandingType: "situation_understanding",
          title: "Comprensión de situación",
          supportsPreview: true,
          supportsAssembly: true,
          supportsDiagnosis: false as const,
          supportsReasoning: false as const,
          immutable: true as const,
          inClinicalUnderstandingScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      understandingType: "situation_understanding",
      title: "Comprensión de situación",
      supportsPreview: true,
      supportsAssembly: true,
      supportsDiagnosis: false as const,
      supportsReasoning: false as const,
      immutable: true as const,
      inClinicalUnderstandingScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalUnderstandingSection", () => {
  beforeEach(() => {
    listEnabledClinicalUnderstandingTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalUnderstandingTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalUnderstandingSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-understanding-skeleton"),
    ).toBeInTheDocument();
    resolveList([situationItem()]);

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-understanding-list"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Comprensión de situación")).toBeInTheDocument();
    expect(screen.getByText("artifact-1 · record-1")).toBeInTheDocument();
    expect(screen.getByText("Ensamblado")).toBeInTheDocument();
    expect(
      screen.getByTestId(
        "clinical-understanding-immutable-situation_understanding",
      ),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId("clinical-understanding-view-situation_understanding"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId(
        "clinical-understanding-capability-situation_understanding",
      ),
    ).toHaveTextContent("Ensamblado on");
    expect(
      screen.getByTestId(
        "clinical-understanding-capability-situation_understanding",
      ),
    ).toHaveTextContent("Diagnóstico off");
    expect(
      screen.getByTestId(
        "clinical-understanding-capability-situation_understanding",
      ),
    ).toHaveTextContent("Razonamiento off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|buscar|ejecutar|diagnosticar/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = situationItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_registered_facts",
                field: "payload.facts",
                message:
                  "an understanding requires at least one registered fact citation",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalUnderstandingTypes.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalUnderstandingSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "clinical-understanding-gate-situation_understanding",
        ),
      ).toHaveTextContent("registered fact citation");
    });
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar|diagnosticar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no understanding types are enabled", async () => {
    listEnabledClinicalUnderstandingTypes.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalUnderstandingSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-understanding-empty"),
      ).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalUnderstandingTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalUnderstandingSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-understanding-error"),
      ).toBeInTheDocument();
    });
    listEnabledClinicalUnderstandingTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-understanding-empty"),
      ).toBeInTheDocument();
    });
  });
});
