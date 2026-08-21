import { describe, expect, it, vi } from "vitest";
import { EncounterDisclosureMount } from "@/app/panel/consultas/[id]/_components/EncounterDisclosureMount";
import { renderWithProviders, screen } from "@/test/utils/render";

function BoomPreview(): never {
  throw new Error("Cannot read properties of undefined (reading 'trim')");
}

describe("E4 EncounterDisclosureMount", () => {
  it("does not mount constitutional previews on the collapsed hot path", () => {
    renderWithProviders(
      <EncounterDisclosureMount expanded={false}>
        <div data-testid="cip-preview">preview</div>
      </EncounterDisclosureMount>,
    );
    expect(
      screen.queryByTestId("encounter-disclosure-previews-mounted"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("cip-preview")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("encounter-cip-hop-tracer"),
    ).not.toBeInTheDocument();
  });

  it("mounts previews after one expand for disclosure or deep link", () => {
    renderWithProviders(
      <EncounterDisclosureMount expanded>
        <div data-testid="cip-preview">preview</div>
      </EncounterDisclosureMount>,
    );
    expect(
      screen.getByTestId("encounter-disclosure-previews-mounted"),
    ).toHaveAttribute("data-hot-path", "false");
    expect(screen.getByTestId("cip-preview")).toBeInTheDocument();
    expect(screen.getByTestId("encounter-cip-hop-tracer")).toHaveAttribute(
      "data-alertable",
      "false",
    );
  });

  it("isolates a throwing CIP preview so Clinical Documents and siblings stay mounted", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithProviders(
      <EncounterDisclosureMount expanded>
        <div data-testid="clinical-documents-alive">Documentos clínicos</div>
        <BoomPreview />
        <div data-testid="scientific-governance-alive">Gobernanza científica</div>
      </EncounterDisclosureMount>,
    );
    expect(
      screen.getByTestId("encounter-disclosure-previews-mounted"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("clinical-documents-alive")).toBeInTheDocument();
    expect(screen.getByTestId("scientific-governance-alive")).toBeInTheDocument();
    expect(screen.getByTestId("encounter-disclosure-preview-failed")).toBeInTheDocument();
    expect(screen.getByText("Documentos clínicos")).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
