import { describe, expect, it, vi } from "vitest";
import { W3PopWorkspace } from "@/components/hcx/intelligence/pop";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3PopEnabled } from "@/lib/w3/flags";
import { w3PopListCohorts } from "@/lib/w3/pop-api";

describe("W3 WP-08 Population Health HCX", () => {
  it("Population flag defaults off", () => {
    expect(isW3PopEnabled(undefined)).toBe(false);
  });

  it("workspace is observational with no Confirm/Emit/Order", () => {
    renderWithProviders(
      <W3PopWorkspace
        enabled
        cohorts={[
          {
            cohortId: "c1",
            label: "Demo",
            memberPatientIds: ["p1"],
            members: [
              {
                patientId: "p1",
                riskScore: 0.7,
                riskBand: "high",
                isAuthoritative: false,
              },
            ],
            insights: [
              {
                insightId: "i1",
                kind: "size",
                title: "Size",
                summary: "Advisory",
                advisory: true,
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-pop-workspace")).toHaveAttribute(
      "data-observational-only",
      "true",
    );
    expect(screen.getByTestId("w3-pop-member-row")).toHaveAttribute(
      "data-authoritative",
      "false",
    );
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Emit/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Order/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Ready/i })).toBeNull();
  });

  it("list client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3PopListCohorts(fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
