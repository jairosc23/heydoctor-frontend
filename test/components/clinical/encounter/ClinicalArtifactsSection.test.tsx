import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClinicalArtifactsSection } from "@/app/panel/consultas/[id]/_components/chart/ClinicalArtifactsSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledClinicalArtifacts = vi.fn();

vi.mock("@/lib/clinical-artifacts", () => ({
  listEnabledClinicalArtifacts: (...args: unknown[]) =>
    listEnabledClinicalArtifacts(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function documentItem() {
  return {
    artifactType: "clinical_document",
    preview: {
      data: {
        artifactType: "clinical_document",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "artifact-1",
            artifactType: "clinical_document",
            title: "Artefacto de documento clínico",
            description: "Artefacto de documento clínico",
            status: "recorded",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "clinical_document",
              documentType: "visit_summary",
              summary: "Alta ambulatoria",
            },
            provenance: {
              origin: "clinical_authority_spine",
              hitlSatisfied: true as const,
            },
            sourceRefs: [{ actId: "act-1", actClass: "clinical_document" }],
            relatedArtifactId: "artifact-0",
            artifactBundleId: null,
            recordedAt: "2026-08-15T21:00:00.000Z",
            registryChannel: "clinical_artifact_registry" as const,
            supportsPreview: true,
            supportsHistory: true,
            supportsTraceability: true,
            supportsRelationship: true,
            immutable: true as const,
            inRegistryScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          artifactType: "clinical_document",
          title: "Artefacto de documento clínico",
          supportsPreview: true,
          supportsHistory: true,
          supportsTraceability: true,
          supportsRelationship: true,
          immutable: true as const,
          inRegistryScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      artifactType: "clinical_document",
      title: "Artefacto de documento clínico",
      supportsPreview: true,
      supportsHistory: true,
      supportsTraceability: true,
      supportsRelationship: true,
      immutable: true as const,
      inRegistryScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("ClinicalArtifactsSection", () => {
  beforeEach(() => {
    listEnabledClinicalArtifacts.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledClinicalArtifacts.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <ClinicalArtifactsSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("clinical-artifacts-skeleton"),
    ).toBeInTheDocument();
    resolveList([documentItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("clinical-artifacts-list")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Artefacto de documento clínico"),
    ).toBeInTheDocument();
    expect(screen.getByText("visit_summary · Alta ambulatoria")).toBeInTheDocument();
    expect(screen.getByText("Registrado")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-artifact-immutable-clinical_document"),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId("clinical-artifact-view-clinical_document"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("clinical-artifact-related-clinical_document"),
    ).toHaveTextContent("Referencia: artifact-0");
    expect(
      screen.getByTestId("clinical-artifact-capability-clinical_document"),
    ).toHaveTextContent("Historia on");
    expect(
      screen.queryByRole("link"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar|eliminar|buscar/i }),
    ).not.toBeInTheDocument();
  });

  it("renders gate errors from the HTTP contract without write actions", async () => {
    const item = documentItem();
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
    listEnabledClinicalArtifacts.mockResolvedValue([gated]);

    renderWithProviders(
      <ClinicalArtifactsSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("clinical-artifact-gate-clinical_document"),
      ).toHaveTextContent("countryCode is required");
    });
    expect(
      screen.queryByRole("button", { name: /editar|eliminar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no artifacts are enabled", async () => {
    listEnabledClinicalArtifacts.mockResolvedValue([]);
    renderWithProviders(
      <ClinicalArtifactsSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-artifacts-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledClinicalArtifacts.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <ClinicalArtifactsSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("clinical-artifacts-error")).toBeInTheDocument();
    });
    listEnabledClinicalArtifacts.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("clinical-artifacts-empty")).toBeInTheDocument();
    });
  });
});
