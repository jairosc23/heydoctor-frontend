import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalOrdersSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalOrdersSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalOrders = vi.fn();

vi.mock("@/lib/clinical-orders", () => ({
  listEnabledClinicalOrders: (...args: unknown[]) =>
    listEnabledClinicalOrders(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function prescriptionItem() {
  return {
    type: "prescription",
    preview: {
      data: {
        type: "prescription",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "order-1",
            type: "prescription",
            title: "Receta médica",
            status: "draft",
            priority: "routine",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            issuedAt: null,
            validity: null,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "prescription",
              medications: [{ name: "Losartan 50 mg", dosage: "1-0-1" }],
            },
            origin: "encounter",
            hitlRequired: true,
            orderedBy: null,
            approvedBy: null,
            sourceRef: null,
            orderSetId: null,
            supportsPreview: true,
            supportsIssue: true,
            supportsDispatch: false,
            supportsDocument: true,
            requiresPersistedSource: true,
            rxForbiddenInE08: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          type: "prescription",
          title: "Receta médica",
          supportsPreview: true,
          supportsIssue: true,
          supportsDispatch: false as const,
          supportsDocument: true,
          canBelongToOrderSet: true,
          requiresHitl: true as const,
          requiresPersistedSource: true,
          inClinicalEngineScope: true,
          enabledCountries: "*" as const,
          rxForbiddenInE08: true,
        },
      },
    },
    capability: {
      type: "prescription",
      title: "Receta médica",
      supportsPreview: true,
      supportsIssue: true,
      supportsDispatch: false as const,
      supportsDocument: true,
      canBelongToOrderSet: true,
      requiresHitl: true as const,
      requiresPersistedSource: true,
      inClinicalEngineScope: true,
      enabledCountries: "*" as const,
      rxForbiddenInE08: true,
    },
  };
}

describe("ClinicalOrdersSection", () => {
  beforeEach(() => {
    listEnabledClinicalOrders.mockReset();
  });

  it("shows skeleton while loading, then OrderView, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalOrders.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalOrdersSection consultationId={CONSULTATION_ID} />,
    );

    expect(screen.getByTestId("clinical-orders-skeleton")).toBeInTheDocument();
    resolveList([prescriptionItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-orders-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Receta médica")).toBeInTheDocument();
    expect(screen.getByText("Losartan 50 mg · 1-0-1")).toBeInTheDocument();
    expect(screen.getByText("Borrador · Rutina")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-order-hitl-prescription"),
    ).toHaveTextContent("HITL");
    expect(
      screen.getByTestId("clinical-order-view-prescription"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("clinical-order-capability-prescription"),
    ).toHaveTextContent("Emisión no disponible");
    expect(
      screen.getByTestId("clinical-order-capability-prescription"),
    ).toHaveTextContent("Dispatch off");
    expect(
      screen.queryByRole("button", { name: /emitir|issue|descargar|preview/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without issue actions", async () => {
    const item = prescriptionItem();
    const gated = {
      ...item,
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_medications",
                field: "payload.medications",
                message: "medications are required",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalOrders.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalOrdersSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-order-gate-prescription"),
      ).toHaveTextContent("medications are required");
    });
    expect(screen.queryByRole("button", { name: /emitir/i })).not.toBeInTheDocument();
  });

  it("shows an empty state when no orders are enabled", async () => {
    listEnabledClinicalOrders.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalOrdersSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-orders-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalOrders.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalOrdersSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-orders-error")).toBeInTheDocument();
    });
    listEnabledClinicalOrders.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-orders-empty")).toBeInTheDocument();
    });
  });
});
