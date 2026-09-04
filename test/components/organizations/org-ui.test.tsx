import { describe, expect, it } from "vitest";
import { OrgErrorState, OrgNav, OrgSection } from "@/components/organizations/org-ui";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("Organization UX", () => {
  it("renders the organization sections and navigation", () => {
    renderWithProviders(
      <>
        <OrgNav
          organizationId="org-1"
          currentPath="/organizacion/org-1/clinicas"
        />
        <OrgSection title="Clínicas" empty>
          <p>hidden</p>
        </OrgSection>
        <OrgErrorState message="No se pudo cargar la organización" />
      </>,
    );

    expect(screen.getByRole("navigation", { name: "Organización" })).toBeTruthy();
    expect(screen.getAllByText("Clínicas").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Clínicas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByText("Usuarios")).toBeTruthy();
    expect(screen.getByText("Equipos")).toBeTruthy();
    expect(screen.getByText("Configuración")).toBeTruthy();
    expect(screen.getByText("Aún no hay información.")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain(
      "No se pudo cargar la organización",
    );
  });
});
