import { describe, expect, it } from "vitest";
import Card from "@/components/ui/Card";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("Card (ui primitive)", () => {
  it("renders children content", () => {
    renderWithProviders(
      <Card>
        <h2>Resumen</h2>
        <p>Contenido reutilizable</p>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Resumen" })).toBeInTheDocument();
    expect(screen.getByText("Contenido reutilizable")).toBeInTheDocument();
  });
});
