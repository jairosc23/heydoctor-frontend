import { describe, expect, it, vi } from "vitest";
import { W3MobileWorkspace } from "@/components/hcx/intelligence/mobile";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3MobileEnabled } from "@/lib/w3/flags";
import { w3MobileOpenSession } from "@/lib/w3/mobile-api";

describe("W3 WP-11 Mobile Clinical Experience HCX", () => {
  it("Mobile flag defaults off", () => {
    expect(isW3MobileEnabled(undefined)).toBe(false);
  });

  it("workspace is responsive and offline cannot modify authority", () => {
    renderWithProviders(
      <W3MobileWorkspace enabled cacheCount={1} pendingSyncCount={1} />,
    );
    expect(screen.getByTestId("w3-mobile-workspace")).toHaveAttribute(
      "data-offline-may-modify-authority",
      "false",
    );
    expect(screen.getByTestId("w3-mobile-workspace")).toHaveAttribute(
      "data-governed-sync",
      "true",
    );
    expect(screen.getByTestId("w3-mobile-nav")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Emit/i })).toBeNull();
  });

  it("open session client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3MobileOpenSession("dev-1", fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
