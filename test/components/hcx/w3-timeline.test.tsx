import { describe, expect, it, vi } from "vitest";
import { W3TimelineRiver } from "@/components/hcx/intelligence/timeline";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3TimelineEnabled } from "@/lib/w3/flags";
import { w3TimelineGet } from "@/lib/w3/timeline-api";

describe("W3 WP-06 Clinical Timeline HCX", () => {
  it("Timeline flag defaults off", () => {
    expect(isW3TimelineEnabled(undefined)).toBe(false);
  });

  it("river renders mixed advisory sources without Confirm/Emit/Ready", () => {
    renderWithProviders(
      <W3TimelineRiver
        enabled
        events={[
          {
            eventId: "a1",
            sourceKind: "assist_proposal",
            sourceRef: "1",
            occurredAt: "2026-03-02T00:00:00.000Z",
            title: "Assist",
            summary: "Advisory",
            status: "active",
            advisory: true,
            navigationHint: "assist",
          },
          {
            eventId: "c1",
            sourceKind: "cds_recommendation",
            sourceRef: "2",
            occurredAt: "2026-03-03T00:00:00.000Z",
            title: "CDS",
            summary: "Warning",
            status: "proposed",
            advisory: true,
            navigationHint: "cds",
          },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-timeline-river")).toHaveAttribute(
      "data-read-only",
      "true",
    );
    expect(screen.getAllByTestId("w3-timeline-event")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Emit/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Ready/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Renew/i })).toBeNull();
  });

  it("GET client maps 403 and has no write helpers in module surface", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3TimelineGet({ consultationId: "c1" }, fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
