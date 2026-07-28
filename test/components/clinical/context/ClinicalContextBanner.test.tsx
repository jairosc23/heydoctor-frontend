import { describe, expect, it } from "vitest";
import { ClinicalContextBanner } from "@/components/clinical/context/ClinicalContextBanner";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("ClinicalContextBanner (E05 fail-closed UX)", () => {
  it("renders nothing when bound", () => {
    const { container } = renderWithProviders(
      <ClinicalContextBanner status="bound" />,
    );
    expect(container.querySelector("[data-testid='clinical-context-banner']")).toBeNull();
  });

  it("shows unbound fail-closed message", () => {
    renderWithProviders(
      <ClinicalContextBanner status="unbound" onRetryBind={() => {}} />,
    );
    expect(screen.getByTestId("clinical-context-banner")).toHaveTextContent(
      /no vinculado/i,
    );
    expect(
      screen.getByTestId("clinical-context-bind-retry"),
    ).toBeInTheDocument();
  });
});
