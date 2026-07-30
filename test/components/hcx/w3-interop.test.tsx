import { describe, expect, it, vi } from "vitest";
import { W3InteropWorkspace } from "@/components/hcx/intelligence/interop";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3InteropEnabled } from "@/lib/w3/flags";
import { mapInteropOpenToHarness, w3InteropOpen } from "@/lib/w3/interop-api";

describe("W3 WP-10 Interoperability HCX (W4-T2 M3)", () => {
  it("Interop flag defaults off", () => {
    expect(isW3InteropEnabled(undefined)).toBe(false);
  });

  it("workspace never owns COS / never Confirm", () => {
    renderWithProviders(
      <W3InteropWorkspace
        enabled
        quarantineCount={1}
        connectors={[{ connectorId: "c1", name: "Partner", ownsCos: false }]}
        persisted
        quarantineStatuses={[
          {
            quarantineId: "q1",
            status: "quarantined",
            resourceType: "Observation",
          },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-interop-workspace")).toHaveAttribute(
      "data-may-bypass-hab",
      "false",
    );
    expect(screen.getByTestId("w3-interop-workspace")).toHaveAttribute(
      "data-owns-cos",
      "false",
    );
    expect(screen.getByTestId("w3-interop-workspace")).toHaveAttribute(
      "data-persisted",
      "true",
    );
    expect(screen.getByTestId("w3-interop-quarantine-status")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
  });

  it("mapper forces connector ownsCos false", () => {
    const view = mapInteropOpenToHarness({
      persisted: true,
      connectors: [
        {
          connectorId: "c1",
          name: "X",
          ownsCos: true as unknown as boolean,
        },
      ],
      quarantine: [],
      exports: [],
    });
    expect(view.connectors[0].ownsCos).toBe(false);
  });

  it("open client maps 403 fail-closed", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3InteropOpen(fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
