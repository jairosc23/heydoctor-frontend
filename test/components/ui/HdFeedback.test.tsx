import { describe, expect, it } from "vitest";
import {
  HdEmptyState,
  HdErrorState,
  HdPageHeader,
  HdSection,
  HdSkeleton,
  HdSkipLink,
} from "@/components/ui/HdFeedback";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("HdFeedback (design system)", () => {
  it("renders skip link, header, loading, error and empty states", () => {
    renderWithProviders(
      <>
        <HdSkipLink />
        <HdPageHeader
          eyebrow="Multi-Clinic"
          title="Organización"
          description="Directorio unificado."
        />
        <HdSkeleton rows={2} testId="hd-skeleton" />
        <HdErrorState message="No se pudo cargar" />
        <HdEmptyState title="Sin datos" description="Aún no hay registros." />
        <HdSection title="Clínicas" empty>
          <p>hidden</p>
        </HdSection>
      </>,
    );

    expect(
      screen.getByRole("link", { name: "Saltar al contenido" }),
    ).toHaveAttribute("href", "#contenido-principal");
    expect(screen.getByText("Multi-Clinic")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Organización" })).toBeTruthy();
    expect(screen.getByTestId("hd-skeleton")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("hd-skeleton")).toHaveAttribute("role", "status");
    expect(screen.getByRole("alert").textContent).toContain("No se pudo cargar");
    expect(screen.getByText("Sin datos")).toBeTruthy();
    expect(screen.getByText("Aún no hay información.")).toBeTruthy();
  });
});
