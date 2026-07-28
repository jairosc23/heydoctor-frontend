import { describe, expect, it, vi } from "vitest";
import { ConfirmationMount } from "@/components/clinical/hab/ConfirmationMount";
import { renderWithProviders, screen } from "@/test/utils/render";

vi.mock("@/lib/hab-authority/api", () => ({
  submitHabDecision: vi.fn(),
}));

describe("ConfirmationMount (E04 HAB ≠ Copilot Dispose)", () => {
  it("renders HAB challenge controls and labels non-dispose", () => {
    renderWithProviders(
      <ConfirmationMount
        consultationId="c1"
        enabled
        contextBound
      />,
    );
    expect(screen.getByTestId("hab-confirmation-mount")).toBeInTheDocument();
    expect(screen.getByTestId("hab-confirm")).toBeInTheDocument();
    expect(screen.getByTestId("hab-reject")).toBeInTheDocument();
    expect(screen.getByTestId("hab-modify")).toBeInTheDocument();
    expect(screen.getByTestId("hab-abort")).toBeInTheDocument();
    expect(screen.getByTestId("hab-not-copilot-dispose")).toHaveTextContent(
      /Dispose/i,
    );
    expect(screen.queryByTestId("gce-copilot-assist-toggle")).toBeNull();
  });

  it("blocks HAB actions when context unbound", () => {
    renderWithProviders(
      <ConfirmationMount
        consultationId="c1"
        enabled
        contextBound={false}
      />,
    );
    expect(screen.getByTestId("hab-confirm")).toBeDisabled();
    expect(screen.getByText(/Contexto no vinculado/i)).toBeInTheDocument();
  });
});
