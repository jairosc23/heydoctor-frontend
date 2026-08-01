import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssistOrchestrator } from "@/components/aec1/liquid/AssistOrchestrator";
import { LiquidAssistPlane } from "@/components/aec1/liquid/LiquidAssistPlane";
import * as w5Api from "@/lib/aec1/w5-clinical-steward-api";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

describe("AEC-1 Assist Orchestrator composition", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(w5Api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [],
      authorityClass: "NON_AUTHORITY",
      disclaimer: w5Api.W5_CLINICAL_DISCLAIMER,
    });
  });

  it("registers DETERMINISTIC + MODEL and mounts W5 + CopilotPresence", async () => {
    renderWithProviders(
      <AssistOrchestrator
        phase="active"
        consultationId="c1"
        disclosure="expanded"
        onOpenCopilot={() => undefined}
      />,
    );

    const root = screen.getByTestId("aec1-assist-orchestrator");
    expect(root).toHaveAttribute("data-ssot", "AssistOrchestrator");
    expect(root).toHaveAttribute("data-registered", "DETERMINISTIC,MODEL");
    expect(root).toHaveAttribute("data-authority-outside", "true");
    expect(root).toHaveAttribute("data-max-one-model", "true");

    expect(screen.getByTestId("aec1-assist-slot-deterministic")).toHaveAttribute(
      "data-source",
      "DETERMINISTIC",
    );
    expect(screen.getByTestId("aec1-assist-slot-model")).toHaveAttribute(
      "data-enabled",
      "true",
    );
    expect(screen.getByTestId("aec1-copilot-presence")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-advisory-cards")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /Confirm|Emit|Emitir|Aplicar/i }),
    ).toBeNull();
  });

  it("LiquidAssistPlane composes via AssistOrchestrator (no visual authority CTAs)", async () => {
    renderWithProviders(
      <LiquidAssistPlane phase="active" consultationId="c1">
        <span data-testid="assist-child">extra</span>
      </LiquidAssistPlane>,
    );

    expect(screen.getByTestId("aec1-liquid-assist-plane")).toHaveAttribute(
      "data-authority",
      "NON_AUTHORITY",
    );
    expect(screen.getByTestId("aec1-assist-orchestrator")).toBeInTheDocument();
    expect(screen.getByTestId("assist-child")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-advisory-cards")).toBeInTheDocument();
    });
  });
});
