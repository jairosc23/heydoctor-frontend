import { describe, expect, it, vi } from "vitest";
import { W3AnalyticsWorkspace } from "@/components/hcx/intelligence/analytics";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3AnalyticsEnabled } from "@/lib/w3/flags";
import { w3AnalyticsGetDashboard } from "@/lib/w3/analytics-api";

describe("W3 WP-09 Clinical Analytics HCX", () => {
  it("Analytics flag defaults off", () => {
    expect(isW3AnalyticsEnabled(undefined)).toBe(false);
  });

  it("workspace is read-only advisory with no Confirm/Emit/Order", () => {
    renderWithProviders(
      <W3AnalyticsWorkspace
        enabled
        kpis={[
          {
            kpiId: "k1",
            code: "consult_volume",
            label: "Volume",
            value: 10,
            unit: "count",
            advisory: true,
          },
        ]}
        operational={[
          {
            metricId: "o1",
            code: "docs_in_draft",
            label: "Drafts",
            value: 2,
            advisory: true,
          },
        ]}
        quality={[
          {
            indicatorId: "q1",
            code: "qi_doc_completion",
            label: "Completion",
            value: 0.9,
            status: "above",
            advisory: true,
          },
        ]}
        trends={[
          {
            trendId: "t1",
            code: "trend_consults",
            label: "Consults",
            direction: "up",
            delta: 3,
            advisory: true,
          },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-analytics-workspace")).toHaveAttribute(
      "data-read-only",
      "true",
    );
    expect(screen.getByTestId("w3-analytics-kpi-row")).toHaveAttribute(
      "data-advisory",
      "true",
    );
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Emit/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Order/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Ready/i })).toBeNull();
  });

  it("dashboard client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3AnalyticsGetDashboard("30d", fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
