import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalReentrySection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalReentrySection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalReentryTypes = vi.fn();

vi.mock("@/lib/clinical-reentry", () => ({
  listEnabledClinicalReentryTypes: (...args: unknown[]) =>
    listEnabledClinicalReentryTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function therapeuticItem() {
  return {
    reentryType: "therapeutic_reentry",
    preview: {
      data: {
        reentryType: "therapeutic_reentry",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "reentry-1",
            reentryType: "therapeutic_reentry",
            title: "Reingreso terapéutico",
            description: "Reingreso terapéutico",
            status: "reentered",
            reentryAdmission: "withhold",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "therapeutic_reentry",
              learnings: [
                { learningId: "learning-1", learningType: "therapeutic_learning" },
              ],
            },
            provenance: { origin: "clinical_learning", learningConstituted: true as const },
            sourceRefs: {
              learnings: [
                { learningId: "learning-1", learningType: "therapeutic_learning" },
              ],
            },
            reentrySetId: null,
            reenteredAt: "2026-08-17T20:00:00.000Z",
            reentryChannel: "clinical_reentry" as const,
            supportsPreview: true,
            supportsReentry: true,
            supportsLearning: false as const,
            supportsDiagnosis: false as const,
            supportsDecision: false as const,
            supportsGovernance: false as const,
            supportsAuthorization: false as const,
            supportsExecution: false as const,
            supportsEmission: false as const,
            immutable: true as const,
            inClinicalReentryScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          reentryType: "therapeutic_reentry",
          title: "Reingreso terapéutico",
          supportsPreview: true,
          supportsReentry: true,
          supportsLearning: false as const,
          supportsDiagnosis: false as const,
          supportsDecision: false as const,
          supportsGovernance: false as const,
          supportsAuthorization: false as const,
          supportsExecution: false as const,
          supportsEmission: false as const,
          immutable: true as const,
          inClinicalReentryScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      reentryType: "therapeutic_reentry",
      title: "Reingreso terapéutico",
      supportsPreview: true,
      supportsReentry: true,
      supportsLearning: false as const,
      supportsDiagnosis: false as const,
      supportsDecision: false as const,
      supportsGovernance: false as const,
      supportsAuthorization: false as const,
      supportsExecution: false as const,
      supportsEmission: false as const,
      immutable: true as const,
      inClinicalReentryScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalReentrySection", () => {
  beforeEach(() => {
    listEnabledClinicalReentryTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalReentryTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );
    renderWithProviders(<ClinicalReentrySection consultationId={CONSULTATION_ID} />);
    expect(screen.getByTestId("clinical-reentry-skeleton")).toBeInTheDocument();
    resolveList([therapeuticItem()]);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-reentry-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Reingreso terapéutico")).toBeInTheDocument();
    expect(screen.getByText("learning-1")).toBeInTheDocument();
    expect(screen.getByText(/Candidato/)).toBeInTheDocument();
    expect(screen.getByText(/Withhold/)).toBeInTheDocument();
    expect(screen.getByTestId("clinical-reentry-immutable-therapeutic_reentry")).toHaveTextContent("Inmutable");
    expect(screen.getByTestId("clinical-reentry-view-therapeutic_reentry")).toHaveTextContent("Ana Perez");
    expect(screen.getByTestId("clinical-reentry-capability-therapeutic_reentry")).toHaveTextContent("Reingreso on");
    expect(screen.getByTestId("clinical-reentry-capability-therapeutic_reentry")).toHaveTextContent("Aprendizaje off");
    expect(screen.getByTestId("clinical-reentry-capability-therapeutic_reentry")).toHaveTextContent("Decisión off");
    expect(screen.getByTestId("clinical-reentry-capability-therapeutic_reentry")).toHaveTextContent("Gobernanza off");
    expect(screen.getByTestId("clinical-reentry-capability-therapeutic_reentry")).toHaveTextContent("Autorización off");
    expect(screen.getByTestId("clinical-reentry-capability-therapeutic_reentry")).toHaveTextContent("Ejecución off");
    expect(screen.getByTestId("clinical-reentry-capability-therapeutic_reentry")).toHaveTextContent("Emisión off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|ejecutar|autorizar|emitir|aprender/i }),
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
                code: "missing_reentry_admission",
                field: "reentryAdmission",
                message: "reentry must declare a fail-closed admission; silent admit is forbidden",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalReentryTypes.mockResolvedValue([gated]);
    renderWithProviders(<ClinicalReentrySection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-reentry-gate-therapeutic_reentry")).toHaveTextContent("fail-closed admission");
    });
  });

  it("shows an empty state when no reentry types are enabled", async () => {
    listEnabledClinicalReentryTypes.mockResolvedValue([]);
    renderWithProviders(<ClinicalReentrySection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-reentry-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalReentryTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(<ClinicalReentrySection consultationId={CONSULTATION_ID} />);
    await waitFor(() => {
      expect(screen.getByTestId("clinical-reentry-error")).toBeInTheDocument();
    });
    listEnabledClinicalReentryTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-reentry-empty")).toBeInTheDocument();
    });
  });
});
