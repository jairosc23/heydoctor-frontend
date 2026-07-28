import { describe, expect, it, vi } from "vitest";
import { W3LonInsightPanel } from "@/components/hcx/intelligence/lon";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3LonInsightsEnabled } from "@/lib/w3/flags";
import { w3LonPublish } from "@/lib/w3/lon-api";

describe("W3 WP-05 Longitudinal Intelligence HCX", () => {
  it("LON flag defaults off", () => {
    expect(isW3LonInsightsEnabled(undefined)).toBe(false);
  });

  it("panel is observational with no Ready/Confirm/Renew/Diagnose actions", () => {
    renderWithProviders(
      <W3LonInsightPanel
        enabled
        insights={[
          {
            insightId: "i1",
            kind: "trend",
            title: "Trend",
            summary: "Observational",
            salienceScore: 0.6,
            status: "published",
            isDiagnosis: false,
          },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-lon-insight-panel")).toBeInTheDocument();
    expect(screen.getByTestId("w3-lon-insight-panel")).toHaveAttribute(
      "data-may-diagnose",
      "false",
    );
    expect(screen.getByTestId("w3-lon-insight-panel")).toHaveAttribute(
      "data-may-renew",
      "false",
    );
    expect(screen.queryByRole("button", { name: /Ready/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Renew/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Diagnos/i })).toBeNull();
    expect(screen.getByRole("button", { name: /^Dismiss$/i })).toBeInTheDocument();
  });

  it("publish client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3LonPublish("c1", fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
