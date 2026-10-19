import { describe, expect, it } from "vitest";
import Input from "@/components/ui/Input";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("Input (ui primitive)", () => {
  it("renders a textbox and accepts typed value", async () => {
    const { user } = renderWithProviders(
      <Input aria-label="Correo" placeholder="medico@example.com" />,
    );
    const field = screen.getByLabelText("Correo");
    expect(field).toBeInTheDocument();
    await user.type(field, "qa@heydoctor.health");
    expect(field).toHaveValue("qa@heydoctor.health");
  });

  it("forwards disabled attribute", () => {
    renderWithProviders(<Input aria-label="Nombre" disabled />);
    expect(screen.getByLabelText("Nombre")).toBeDisabled();
  });
});
