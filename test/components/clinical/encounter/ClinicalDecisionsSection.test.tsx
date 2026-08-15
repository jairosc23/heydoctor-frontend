import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalDecisionsSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalDecisionsSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalDecisions = vi.fn();

vi.mock("@/lib/clinical-decisions", () => ({
  listEnabledClinicalDecisions: (...args: unknown[]) =>
    listEnabledClinicalDecisions(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function allergyItem() {
  return {
    type: "allergy_conflict",
    preview: {
      data: {
        type: "allergy_conflict",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "cds-1",
            type: "allergy_conflict",
            title: "Conflicto de alergia",
            status: "presented",
            severity: "critical",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            validity: null,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "allergy_conflict",
              allergen: "Penicilina",
              implicatedMedication: "Amoxicilina",
            },
            provenance: { origin: "foundation", hitlRequired: true as const },
            reviewedBy: null,
            overrideReason: null,
            sourceRefs: [{ domain: "allergies", id: "alg-1" }],
            relatedOrderId: null,
            relatedDocumentId: null,
            decisionSetId: null,
            supportsPreview: true,
            supportsAcknowledge: true,
            supportsOverride: true,
            evaluatesRules: false as const,
            aiForbidden: true as const,
            requiresHitl: true as const,
            requiresSourceRef: true,
            canBelongToDecisionSet: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          type: "allergy_conflict",
          title: "Conflicto de alergia",
          supportsPreview: true,
          supportsAcknowledge: true,
          supportsOverride: true,
          evaluatesRules: false as const,
          aiForbidden: true as const,
          requiresHitl: true as const,
          requiresSourceRef: true,
          canBelongToDecisionSet: true,
          inClinicalEngineScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      type: "allergy_conflict",
      title: "Conflicto de alergia",
      supportsPreview: true,
      supportsAcknowledge: true,
      supportsOverride: true,
      evaluatesRules: false as const,
      aiForbidden: true as const,
      requiresHitl: true as const,
      requiresSourceRef: true,
      canBelongToDecisionSet: true,
      inClinicalEngineScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalDecisionsSection", () => {
  beforeEach(() => {
    listEnabledClinicalDecisions.mockReset();
  });

  it("shows skeleton while loading, then DecisionView, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalDecisions.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalDecisionsSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-decisions-skeleton"),
    ).toBeInTheDocument();
    resolveList([allergyItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-decisions-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Conflicto de alergia")).toBeInTheDocument();
    expect(screen.getByText("Penicilina · Amoxicilina")).toBeInTheDocument();
    expect(screen.getByText("Presentada · Crítica")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-decision-hitl-allergy_conflict"),
    ).toHaveTextContent("HITL");
    expect(
      screen.getByTestId("clinical-decision-view-allergy_conflict"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("clinical-decision-capability-allergy_conflict"),
    ).toHaveTextContent("Aceptación no disponible");
    expect(
      screen.getByTestId("clinical-decision-capability-allergy_conflict"),
    ).toHaveTextContent("Descarte no disponible");
    expect(
      screen.queryByRole("button", {
        name: /aceptar|descartar|acknowledge|override/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = allergyItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_allergen",
                field: "payload.allergen",
                message: "allergen is required",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalDecisions.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalDecisionsSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-decision-gate-allergy_conflict"),
      ).toHaveTextContent("allergen is required");
    });
    expect(
      screen.queryByRole("button", { name: /aceptar|descartar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no decisions are enabled", async () => {
    listEnabledClinicalDecisions.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalDecisionsSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-decisions-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalDecisions.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalDecisionsSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-decisions-error")).toBeInTheDocument();
    });
    listEnabledClinicalDecisions.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-decisions-empty")).toBeInTheDocument();
    });
  });
});
