import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalDocumentsSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalDocumentsSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalDocuments = vi.fn();
const fetchClinicalDocumentPdf = vi.fn();

vi.mock("@/lib/clinical-documents", () => ({
  listEnabledClinicalDocuments: (...args: unknown[]) =>
    listEnabledClinicalDocuments(...args),
  fetchClinicalDocumentPdf: (...args: unknown[]) =>
    fetchClinicalDocumentPdf(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function visitItem() {
  return {
    type: "visit_summary",
    preview: {
      data: {
        type: "visit_summary",
        consultationId: CONSULTATION_ID,
        model: {
          type: "visit_summary",
          countryCode: "CL",
          clinic: { name: "Clínica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Pérez" },
          payload: { kind: "visit_summary", reason: "Control HTA" },
          provenance: {
            hitlRequired: true,
            generatedByAi: false,
            sources: ["clinical_foundation"],
          },
        },
        gate: { ok: true, issues: [] },
      },
    },
    capability: {
      type: "visit_summary",
      title: "Resumen de consulta",
      supportsPreview: true,
      supportsPdf: true,
      requiresHitl: true,
      enabledForCountry: true,
      countryCode: "CL",
    },
  };
}

describe("ClinicalDocumentsSection", () => {
  beforeEach(() => {
    listEnabledClinicalDocuments.mockReset();
    fetchClinicalDocumentPdf.mockReset();
  });

  it("shows skeleton while loading, then preview/download actions", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalDocuments.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalDocumentsSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-documents-skeleton"),
    ).toBeInTheDocument();
    resolveList([visitItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-documents-list")).toBeInTheDocument();
    });
    expect(screen.getByText("Resumen de consulta")).toBeInTheDocument();
    expect(screen.getByText("Control HTA")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-document-hitl-visit_summary"),
    ).toHaveTextContent("HITL");
    expect(
      screen.getByTestId("clinical-document-preview-visit_summary"),
    ).toBeEnabled();
    expect(
      screen.getByTestId("clinical-document-download-visit_summary"),
    ).toBeEnabled();
  });

  it("renders gate errors and disables PDF when the engine rejects the model", async () => {
    const item = visitItem();
    const gated = {
      ...item,
      capability: { ...item.capability, supportsPdf: false },
      preview: {
        data: {
          ...item.preview.data,
          gate: {
            ok: false as const,
            issues: [
              {
                code: "missing_reason",
                field: "payload.reason",
                message: "reason is required",
              },
            ],
          },
        },
      },
    };
    listEnabledClinicalDocuments.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalDocumentsSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-document-gate-visit_summary"),
      ).toHaveTextContent("reason is required");
    });
    expect(
      screen.getByTestId("clinical-document-preview-visit_summary"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("clinical-document-download-visit_summary"),
    ).toBeDisabled();
  });

  it("shows an empty state when no documents are enabled", async () => {
    listEnabledClinicalDocuments.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalDocumentsSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-documents-empty"),
      ).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalDocuments.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalDocumentsSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-documents-error"),
      ).toBeInTheDocument();
    });
    listEnabledClinicalDocuments.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-documents-empty"),
      ).toBeInTheDocument();
    });
  });
});
