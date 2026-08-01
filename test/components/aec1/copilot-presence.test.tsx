import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssistOrchestrator } from "@/components/aec1/liquid/AssistOrchestrator";
import { CopilotPresence } from "@/components/aec1/liquid/CopilotPresence";
import { LiquidAssistPlane } from "@/components/aec1/liquid/LiquidAssistPlane";
import * as w5Api from "@/lib/aec1/w5-clinical-steward-api";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";

describe("AEC-1 M6.2 CopilotPresence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(w5Api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [],
      authorityClass: "NON_AUTHORITY",
      disclaimer: w5Api.W5_CLINICAL_DISCLAIMER,
    });
  });

  it("renders NON_AUTHORITY compact presence and opens via callback", () => {
    const onOpen = vi.fn();
    renderWithProviders(
      <CopilotPresence disclosure="expanded" onOpenCopilot={onOpen} />,
    );
    expect(screen.getByTestId("aec1-copilot-presence")).toHaveAttribute(
      "data-authority",
      "NON_AUTHORITY",
    );
    expect(screen.getByTestId("aec1-copilot-presence")).toHaveAttribute(
      "data-plane",
      "MODEL",
    );
    screen.getByTestId("aec1-copilot-presence-open").click();
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: /Confirm|Emit|Emitir|Aplicar/i }),
    ).toBeNull();
  });

  it("AssistOrchestrator enables MODEL slot with presence (not a second chat)", async () => {
    const onOpen = vi.fn();
    renderWithProviders(
      <AssistOrchestrator
        phase="active"
        consultationId="c1"
        onOpenCopilot={onOpen}
      />,
    );

    expect(screen.getByTestId("aec1-assist-slot-model")).toHaveAttribute(
      "data-enabled",
      "true",
    );
    expect(screen.getByTestId("aec1-copilot-presence")).toBeInTheDocument();
    expect(screen.getAllByTestId("aec1-copilot-presence")).toHaveLength(1);

    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-advisory-cards")).toBeInTheDocument();
    });

    screen.getByTestId("aec1-copilot-presence-open").click();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("LiquidAssistPlane wires CopilotPresence through orchestrator", async () => {
    const onOpen = vi.fn();
    renderWithProviders(
      <LiquidAssistPlane
        phase="active"
        consultationId="c1"
        onOpenCopilot={onOpen}
        copilotOpen={false}
      />,
    );
    expect(screen.getByTestId("aec1-copilot-presence")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("aec1-w5-advisory-cards")).toBeInTheDocument();
    });
  });
});
