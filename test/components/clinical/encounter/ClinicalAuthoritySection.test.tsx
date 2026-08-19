import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalAuthoritySection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalAuthoritySection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalAuthorityActs = vi.fn();

vi.mock("@/lib/clinical-authority", () => ({
  listEnabledClinicalAuthorityActs: (...args: unknown[]) =>
    listEnabledClinicalAuthorityActs(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function encounterCloseItem() {
  return {
    actClass: "encounter_close",
    preview: {
      data: {
        actClass: "encounter_close",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "act-1",
            actClass: "encounter_close",
            title: "Acto de cierre de encuentro",
            description: "Acto de cierre de encuentro",
            status: "proposed",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            validity: null,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "encounter_close",
              note: "Cierre de consulta",
            },
            provenance: { origin: "encounter", hitlRequired: true as const },
            sourceRefs: [],
            confirmedBy: null,
            decisionReason: null,
            habDecisionId: null,
            emissionId: null,
            emittedAt: null,
            authorityChannel: "clinical_authority_spine" as const,
            supportsPreview: true,
            supportsConfirm: true,
            supportsAuthorize: true,
            supportsEmission: false as const,
            requiresHitl: true as const,
            requiresPhysician: true as const,
            inAuthoritySpineScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          actClass: "encounter_close",
          title: "Acto de cierre de encuentro",
          supportsPreview: true,
          supportsConfirm: true,
          supportsAuthorize: true,
          supportsEmission: false as const,
          requiresHitl: true as const,
          requiresPhysician: true as const,
          inAuthoritySpineScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      actClass: "encounter_close",
      title: "Acto de cierre de encuentro",
      supportsPreview: true,
      supportsConfirm: true,
      supportsAuthorize: true,
      supportsEmission: false as const,
      requiresHitl: true as const,
      requiresPhysician: true as const,
      inAuthoritySpineScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalAuthoritySection", () => {
  beforeEach(() => {
    listEnabledClinicalAuthorityActs.mockReset();
  });

  it("shows skeleton while loading, then View, Gate, Capability and ConfirmationMount", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalAuthorityActs.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalAuthoritySection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-authority-skeleton"),
    ).toBeInTheDocument();
    resolveList([encounterCloseItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-authority-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Acto de cierre de encuentro")).toBeInTheDocument();
    expect(screen.getByText("Cierre de consulta")).toBeInTheDocument();
    expect(screen.getByText("Propuesto")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-authority-hitl-encounter_close"),
    ).toHaveTextContent("HITL");
    expect(
      screen.getByTestId("clinical-authority-view-encounter_close"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("clinical-authority-capability-encounter_close"),
    ).toHaveTextContent("Emisión no disponible");
    expect(
      screen.getByTestId("clinical-authority-confirmation-mount-encounter_close"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-authority-confirm-encounter_close"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("clinical-authority-authorize-encounter_close"),
    ).toBeDisabled();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = encounterCloseItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_country_code",
                field: "countryCode",
                message: "countryCode is required",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalAuthorityActs.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalAuthoritySection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-authority-gate-encounter_close"),
      ).toHaveTextContent("countryCode is required");
    });
    expect(
      screen.getByTestId("clinical-authority-confirm-encounter_close"),
    ).toBeDisabled();
  });

  it("shows an empty state when no acts are enabled", async () => {
    listEnabledClinicalAuthorityActs.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalAuthoritySection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-authority-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalAuthorityActs.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalAuthoritySection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-authority-error")).toBeInTheDocument();
    });
    listEnabledClinicalAuthorityActs.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-authority-empty")).toBeInTheDocument();
    });
  });
});
