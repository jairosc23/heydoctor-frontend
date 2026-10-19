import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalOutcomeSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalOutcomeSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalOutcomeTypes = vi.fn();

vi.mock("@/lib/clinical-outcomes", () => ({
  listEnabledClinicalOutcomeTypes: (...args: unknown[]) =>
    listEnabledClinicalOutcomeTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function therapeuticItem() {
  return {
    outcomeType: "therapeutic_outcome",
    preview: {
      data: {
        outcomeType: "therapeutic_outcome",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "outcome-1",
            outcomeType: "therapeutic_outcome",
            title: "Resultado terapéutico",
            description: "Resultado terapéutico",
            status: "observed",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "therapeutic_outcome",
              records: [
                {
                  recordId: "record-1",
                  recordType: "composed_record",
                },
              ],
            },
            provenance: {
              origin: "longitudinal_clinical_record",
              recordComposed: true as const,
            },
            sourceRefs: {
              records: [
                {
                  recordId: "record-1",
                  recordType: "composed_record",
                },
              ],
            },
            outcomeSetId: null,
            observedAt: "2026-08-16T21:00:00.000Z",
            outcomeChannel: "clinical_outcomes" as const,
            supportsPreview: true,
            supportsOutcome: true,
            supportsDiagnosis: false as const,
            supportsAuthorization: false as const,
            supportsLearning: false as const,
            immutable: true as const,
            inClinicalOutcomesScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          outcomeType: "therapeutic_outcome",
          title: "Resultado terapéutico",
          supportsPreview: true,
          supportsOutcome: true,
          supportsDiagnosis: false as const,
          supportsAuthorization: false as const,
          supportsLearning: false as const,
          immutable: true as const,
          inClinicalOutcomesScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      outcomeType: "therapeutic_outcome",
      title: "Resultado terapéutico",
      supportsPreview: true,
      supportsOutcome: true,
      supportsDiagnosis: false as const,
      supportsAuthorization: false as const,
      supportsLearning: false as const,
      immutable: true as const,
      inClinicalOutcomesScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalOutcomeSection", () => {
  beforeEach(() => {
    listEnabledClinicalOutcomeTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalOutcomeTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalOutcomeSection consultationId={CONSULTATION_ID} />,
    );

    expect(screen.getByTestId("clinical-outcomes-skeleton")).toBeInTheDocument();
    resolveList([therapeuticItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-outcomes-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Resultado terapéutico")).toBeInTheDocument();
    expect(screen.getByText("record-1")).toBeInTheDocument();
    expect(screen.getByText("Observado")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-outcomes-immutable-therapeutic_outcome"),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId("clinical-outcomes-view-therapeutic_outcome"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("clinical-outcomes-capability-therapeutic_outcome"),
    ).toHaveTextContent("Resultado on");
    expect(
      screen.getByTestId("clinical-outcomes-capability-therapeutic_outcome"),
    ).toHaveTextContent("Diagnóstico off");
    expect(
      screen.getByTestId("clinical-outcomes-capability-therapeutic_outcome"),
    ).toHaveTextContent("Autorización off");
    expect(
      screen.getByTestId("clinical-outcomes-capability-therapeutic_outcome"),
    ).toHaveTextContent("Aprendizaje off");
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
                code: "missing_composed_record",
                field: "payload.records",
                message:
                  "an outcome requires at least one composed record citation",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalOutcomeTypes.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalOutcomeSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-outcomes-gate-therapeutic_outcome"),
      ).toHaveTextContent("composed record citation");
    });
    expect(
      screen.queryByRole("button", {
        name: /editar|eliminar|ejecutar|diagnosticar|autorizar/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no outcome types are enabled", async () => {
    listEnabledClinicalOutcomeTypes.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalOutcomeSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-outcomes-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalOutcomeTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalOutcomeSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-outcomes-error")).toBeInTheDocument();
    });
    listEnabledClinicalOutcomeTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-outcomes-empty")).toBeInTheDocument();
    });
  });
});
