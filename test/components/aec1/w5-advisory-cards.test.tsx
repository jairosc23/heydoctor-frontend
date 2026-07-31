import { describe, expect, it, vi, beforeEach } from "vitest";
import { W5AdvisoryCards } from "@/components/aec1/liquid/W5AdvisoryCards";
import * as api from "@/lib/aec1/w5-clinical-steward-api";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

describe("AEC-1 M5 W5 advisory cards", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders NON_AUTHORITY and forbids Confirm/Emit/apply CTAs", async () => {
    vi.spyOn(api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [
        {
          insightId: "i1",
          title: "Gap de laboratorio",
          summary: "HbA1c pendiente",
          priority: 80,
          explainability: { summary: "Regla determinística", reasons: ["LAB"] },
          provenance: { source: "w5-rule", ruleId: "LAB-01" },
          authorityClass: "NON_AUTHORITY",
        },
      ],
      authorityClass: "NON_AUTHORITY",
      disclaimer: api.W5_CLINICAL_DISCLAIMER,
    });

    renderWithProviders(
      <W5AdvisoryCards disclosure="expanded" consultationId="c1" />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-insight-i1")).toBeInTheDocument();
    });
    expect(screen.getByTestId("aec1-w5-non-authority")).toHaveTextContent(
      "NON_AUTHORITY",
    );
    expect(screen.getByTestId("aec1-w5-priority-i1")).toHaveTextContent("80");
    expect(screen.getByTestId("aec1-w5-provenance-i1")).toHaveTextContent(
      "w5-rule",
    );
    expect(screen.getByTestId("aec1-w5-no-confirm")).toBeInTheDocument();
    expect(screen.getByTestId("aec1-w5-no-emit")).toBeInTheDocument();
    expect(screen.getByTestId("aec1-w5-no-apply")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Confirm|Emit|Emitir|Aplicar/i }),
    ).toBeNull();
    expect(screen.getByTestId("aec1-w5-forbidden-paths").textContent).toMatch(
      /confirm|emit|apply-to-chart/i,
    );

    screen.getByTestId("aec1-w5-explain-toggle-i1").click();
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-explain-i1")).toHaveTextContent(
        "Regla determinística",
      );
    });
  });

  it("acknowledge and dismiss call steward endpoints only (≠ HAB)", async () => {
    vi.spyOn(api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [{ insightId: "i1", title: "Aviso", summary: "Detalle" }],
      authorityClass: "NON_AUTHORITY",
    });
    const dismiss = vi
      .spyOn(api, "w5ClinicalDismissInsight")
      .mockResolvedValue({ ok: true });
    const ack = vi
      .spyOn(api, "w5ClinicalAckInsight")
      .mockResolvedValue({ ok: true });

    renderWithProviders(<W5AdvisoryCards disclosure="expanded" />);

    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-ack-i1")).toBeInTheDocument();
    });

    screen.getByTestId("aec1-w5-ack-i1").click();
    await waitFor(() =>
      expect(ack).toHaveBeenCalledWith("i1", "liquid-assist-m5"),
    );
    expect(ack.mock.calls[0]?.[0]).not.toMatch(/confirm|emit|hab/i);

    screen.getByTestId("aec1-w5-dismiss-i1").click();
    await waitFor(() =>
      expect(dismiss).toHaveBeenCalledWith("i1", "liquid-assist-m5"),
    );
    expect(screen.getByTestId("aec1-w5-last-action").textContent).toMatch(
      /≠ HAB/,
    );
  });

  it("fail-closed when W5 unavailable without blocking host", async () => {
    vi.spyOn(api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [],
      code: "W5_FLAG_OR_AUTHORITY_DENIED",
      authorityClass: "NON_AUTHORITY",
    });

    renderWithProviders(
      <div data-testid="host-workspace">
        <W5AdvisoryCards disclosure="expanded" />
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-state-forbidden")).toBeInTheDocument();
    });
    expect(screen.getByTestId("aec1-w5-advisory-cards")).toHaveAttribute(
      "data-ui-state",
      "forbidden",
    );
    expect(screen.getByTestId("host-workspace")).toBeInTheDocument();
    expect(screen.queryByTestId("aec1-w5-insight-list")).toBeNull();
  });

  it("shows empty and error degraded states", async () => {
    const list = vi.spyOn(api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [],
      authorityClass: "NON_AUTHORITY",
    });

    const { rerender } = renderWithProviders(
      <W5AdvisoryCards disclosure="expanded" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-state-empty")).toBeInTheDocument();
    });

    list.mockResolvedValue({
      insights: [],
      code: "W5_CLINICAL_ERROR",
      message: "boom",
      authorityClass: "NON_AUTHORITY",
    });
    rerender(<W5AdvisoryCards disclosure="expanded" key="err" />);
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-state-error")).toBeInTheDocument();
    });
  });

  it("collapsed disclosure keeps progressive summary only", async () => {
    vi.spyOn(api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [{ id: "i1", title: "Aviso" }],
      authorityClass: "NON_AUTHORITY",
    });

    renderWithProviders(<W5AdvisoryCards disclosure="collapsed" />);
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-collapsed-summary")).toHaveTextContent(
        /aviso/i,
      );
    });
    expect(screen.queryByTestId("aec1-w5-insight-list")).toBeNull();
    expect(screen.getByTestId("aec1-w5-non-authority")).toBeInTheDocument();
  });
});
