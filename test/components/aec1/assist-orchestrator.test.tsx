import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssistOrchestrator } from "@/components/aec1/liquid/AssistOrchestrator";
import { LiquidAssistPlane } from "@/components/aec1/liquid/LiquidAssistPlane";
import * as w5Api from "@/lib/aec1/w5-clinical-steward-api";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

describe("AEC-1 Assist Orchestrator composition (M6.3)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(w5Api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [],
      authorityClass: "NON_AUTHORITY",
      disclaimer: w5Api.W5_CLINICAL_DISCLAIMER,
    });
  });

  it("owns disclosure+fatigue SSOT and mounts W5 + CopilotPresence", async () => {
    renderWithProviders(
      <AssistOrchestrator
        phase="active"
        consultationId="c1"
        onOpenCopilot={() => undefined}
      />,
    );

    const root = screen.getByTestId("aec1-assist-orchestrator");
    expect(root).toHaveAttribute("data-ssot", "AssistOrchestrator");
    expect(root).toHaveAttribute("data-disclosure", "expanded");
    expect(root).toHaveAttribute("data-disclosure-fatigue-ssot", "true");
    expect(root).toHaveAttribute("data-fatigue-max", "5");
    expect(root).toHaveAttribute("data-expand-list", "true");
    expect(root).toHaveAttribute("data-registered", "DETERMINISTIC,MODEL");

    expect(screen.getByTestId("aec1-assist-slot-model")).toHaveAttribute(
      "data-enabled",
      "true",
    );
    expect(screen.getByTestId("aec1-copilot-presence")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-advisory-cards")).toBeInTheDocument();
    });
    expect(screen.getByTestId("aec1-w5-advisory-cards")).toHaveAttribute(
      "data-disclosure",
      "expanded",
    );
    expect(
      screen.queryByRole("button", { name: /Confirm|Emit|Emitir|Aplicar/i }),
    ).toBeNull();
  });

  it("collapsed phase keeps compact disclosure without inventing local policy", async () => {
    renderWithProviders(
      <AssistOrchestrator phase="pre_encounter" consultationId="c1" />,
    );
    expect(screen.getByTestId("aec1-assist-orchestrator")).toHaveAttribute(
      "data-disclosure",
      "collapsed",
    );
    expect(screen.getByTestId("aec1-assist-orchestrator")).toHaveAttribute(
      "data-compact",
      "true",
    );
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-collapsed-summary")).toBeInTheDocument();
    });
  });

  it("LiquidAssistPlane uses Assist disclosure SSOT (no liquid-composition import path)", async () => {
    renderWithProviders(
      <LiquidAssistPlane phase="active" consultationId="c1">
        <span data-testid="assist-child">extra</span>
      </LiquidAssistPlane>,
    );

    expect(screen.getByTestId("aec1-liquid-assist-plane")).toHaveAttribute(
      "data-disclosure",
      "expanded",
    );
    expect(screen.getByTestId("aec1-assist-orchestrator")).toHaveAttribute(
      "data-disclosure-fatigue-ssot",
      "true",
    );
    expect(screen.getByTestId("assist-child")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-advisory-cards")).toBeInTheDocument();
    });
  });
});
