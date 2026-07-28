import { describe, expect, it, vi } from "vitest";
import { W3CdsPanel } from "@/components/hcx/intelligence/cds";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3CdsEnabled } from "@/lib/w3/flags";
import { w3CdsEvaluate } from "@/lib/w3/cds-api";

describe("W3 WP-03 CDS HCX", () => {
  it("CDS flag defaults off", () => {
    expect(isW3CdsEnabled(undefined)).toBe(false);
  });

  it("panel discloses conflicts and has no Confirm/Place order CTAs", () => {
    renderWithProviders(
      <W3CdsPanel
        enabled
        recommendations={[
          {
            recommendationId: "r1",
            ruleId: "x",
            severity: "critical",
            title: "Hint",
            detail: "d",
            status: "proposed",
          },
        ]}
        conflicts={[{ conflictId: "c1", summary: "Conflict A" }]}
      />,
    );
    expect(screen.getByTestId("w3-cds-conflict-banner")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Insert into draft$/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Place order|Emitir|Authorize/i }),
    ).toBeNull();
  });

  it("evaluate client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3CdsEvaluate("c1", fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
