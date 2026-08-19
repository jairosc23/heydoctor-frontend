import { describe, expect, it } from "vitest";
import { EncounterDisclosureMount } from "@/app/panel/consultas/[id]/_components/EncounterDisclosureMount";
import { renderWithProviders, screen } from "@/test/utils/render";

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
});
