import { describe, expect, it, vi, beforeEach } from "vitest";
import { LongitudinalClinicalRecordSection } from "@/app/panel/consultas/[id]/_components/chart/LongitudinalClinicalRecordSection";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

const listEnabledLongitudinalRecordTypes = vi.fn();

vi.mock("@/lib/longitudinal-records", () => ({
  listEnabledLongitudinalRecordTypes: (...args: unknown[]) =>
    listEnabledLongitudinalRecordTypes(...args),
}));

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

function documentItem() {
  return {
    recordType: "documents",
    preview: {
      data: {
        recordType: "documents",
        consultationId: CONSULTATION_ID,
        view: {
          ok: true as const,
          view: {
            id: "record-1",
            recordType: "documents",
            title: "Registro longitudinal de documentos",
            description: "Registro longitudinal de documentos",
            status: "composed",
            countryCode: "CL",
            locale: "es-CL",
            consultationId: CONSULTATION_ID,
            clinic: { name: "Clinica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Perez" },
            payload: {
              kind: "documents",
              facts: [
                { artifactId: "artifact-1", artifactType: "clinical_document" },
              ],
            },
            provenance: {
              origin: "clinical_artifact_registry",
              factsRegistered: true as const,
            },
            sourceRefs: [
              { artifactId: "artifact-1", artifactType: "clinical_document" },
            ],
            timelineGroupId: null,
            composedAt: "2026-08-15T22:00:00.000Z",
            recordChannel: "longitudinal_clinical_record" as const,
            supportsPreview: true,
            supportsLongitudinalView: true,
            supportsHistoryNavigation: true,
            supportsTimeline: false as const,
            immutable: true as const,
            inLongitudinalScope: true,
          },
        },
        gate: { ok: true as const, issues: [] as [] },
        capability: {
          recordType: "documents",
          title: "Registro longitudinal de documentos",
          supportsPreview: true,
          supportsLongitudinalView: true,
          supportsHistoryNavigation: true,
          supportsTimeline: false as const,
          immutable: true as const,
          inLongitudinalScope: true,
          enabledCountries: "*" as const,
        },
      },
    },
    capability: {
      recordType: "documents",
      title: "Registro longitudinal de documentos",
      supportsPreview: true,
      supportsLongitudinalView: true,
      supportsHistoryNavigation: true,
      supportsTimeline: false as const,
      immutable: true as const,
      inLongitudinalScope: true,
      enabledCountries: "*" as const,
    },
  };
}

describe("LongitudinalClinicalRecordSection", () => {
  beforeEach(() => {
    listEnabledLongitudinalRecordTypes.mockReset();
  });

  it("shows skeleton while loading, then View, Gate and Capability", async () => {
    let resolveList: (value: unknown) => void = () => undefined;
    listEnabledLongitudinalRecordTypes.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderWithProviders(
      <LongitudinalClinicalRecordSection consultationId={CONSULTATION_ID} />,
    );

    expect(
      screen.getByTestId("longitudinal-records-skeleton"),
    ).toBeInTheDocument();
    resolveList([documentItem()]);

    await waitFor(() => {
      expect(screen.getByTestId("longitudinal-records-list")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Registro longitudinal de documentos"),
    ).toBeInTheDocument();
    expect(screen.getByText("artifact-1")).toBeInTheDocument();
    expect(screen.getByText("Compuesto")).toBeInTheDocument();
    expect(
      screen.getByTestId("longitudinal-record-immutable-documents"),
    ).toHaveTextContent("Inmutable");
    expect(
      screen.getByTestId("longitudinal-record-view-documents"),
    ).toHaveTextContent("Ana Perez");
    expect(
      screen.getByTestId("longitudinal-record-capability-documents"),
    ).toHaveTextContent("Vista on");
    expect(
      screen.getByTestId("longitudinal-record-capability-documents"),
    ).toHaveTextContent("Agrupación off");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
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
                code: "missing_registered_facts",
                field: "payload.facts",
                message: "a composed record requires at least one registered fact citation",
              },
            ],
          },
        },
      },
    };
    listEnabledLongitudinalRecordTypes.mockResolvedValue([gated]);

    renderWithProviders(
      <LongitudinalClinicalRecordSection consultationId={CONSULTATION_ID} />,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("longitudinal-record-gate-documents"),
      ).toHaveTextContent("registered fact citation");
    });
    expect(
      screen.queryByRole("button", { name: /editar|eliminar/i }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when no records are enabled", async () => {
    listEnabledLongitudinalRecordTypes.mockResolvedValue([]);
    renderWithProviders(
      <LongitudinalClinicalRecordSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("longitudinal-records-empty")).toBeInTheDocument();
    });
  });

  it("shows an error with retry when preview fails", async () => {
    listEnabledLongitudinalRecordTypes.mockRejectedValue(new Error("network"));
    renderWithProviders(
      <LongitudinalClinicalRecordSection consultationId={CONSULTATION_ID} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("longitudinal-records-error")).toBeInTheDocument();
    });
    listEnabledLongitudinalRecordTypes.mockResolvedValue([]);
    screen.getByRole("button", { name: "Reintentar" }).click();
    await waitFor(() => {
      expect(screen.getByTestId("longitudinal-records-empty")).toBeInTheDocument();
    });
  });
});
