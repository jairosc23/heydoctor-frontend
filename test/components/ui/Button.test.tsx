import { describe, expect, it, vi } from "vitest";
import Button from "@/components/ui/Button";
import { renderWithProviders, screen } from "@/test/utils/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));

describe("Button (ui primitive)", () => {
  it("renders a native button with accessible name", () => {
    renderWithProviders(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("honors disabled state", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <Button disabled onClick={onClick}>
        Enviar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as a link when href is provided", () => {
    renderWithProviders(<Button href="/panel">Ir al panel</Button>);
    const link = screen.getByRole("link", { name: "Ir al panel" });
    expect(link).toHaveAttribute("href", "/panel");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
