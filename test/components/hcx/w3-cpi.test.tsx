import { describe, expect, it, vi } from "vitest";
import { W3CpiSuggestionList } from "@/components/hcx/intelligence/cpi";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3CpiEnabled } from "@/lib/w3/flags";
import { w3CpiEvaluate } from "@/lib/w3/cpi-api";

describe("W3 WP-04 Care Plan Intelligence HCX", () => {
  it("CPI flag defaults off", () => {
    expect(isW3CpiEnabled(undefined)).toBe(false);
  });

  it("list separates Apply from Plan Ready and has no Confirm", () => {
    renderWithProviders(
      <W3CpiSuggestionList
        enabled
        suggestions={[
          {
            suggestionId: "s1",
            kind: "plan_item",
            label: "Item",
            detail: null,
            status: "suggested",
          },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-cpi-suggestion-list")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Insert into draft$/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Plan Ready/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
  });

  it("evaluate client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3CpiEvaluate("c1", fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
