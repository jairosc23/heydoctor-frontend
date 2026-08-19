import { describe, expect, it } from "vitest";
import { ConfirmationMount } from "@/components/clinical/clinical-authority/ConfirmationMount";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("ConfirmationMount (Clinical Authority Spine D6)", () => {
  it("renders the clinical confirmation point without executing actions", () => {
    renderWithProviders(<ConfirmationMount actClass="encounter_close" />);

    expect(
      screen.getByTestId("clinical-authority-confirmation-mount-encounter_close"),
    ).toBeInTheDocument();
    expect(screen.getByText("Punto de confirmación clínica")).toBeInTheDocument();
    expect(screen.getByText("Emisión no disponible")).toBeInTheDocument();
    expect(
      screen.getByTestId("clinical-authority-confirm-encounter_close"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("clinical-authority-authorize-encounter_close"),
    ).toBeDisabled();
  });
});
