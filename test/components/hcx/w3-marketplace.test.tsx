import { describe, expect, it, vi } from "vitest";
import { W3MarketplaceWorkspace } from "@/components/hcx/intelligence/marketplace";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3MarketplaceEnabled } from "@/lib/w3/flags";
import { w3MarketplaceOpen } from "@/lib/w3/marketplace-api";

describe("W3 WP-12 Clinical Marketplace HCX", () => {
  it("Marketplace flag defaults off", () => {
    expect(isW3MarketplaceEnabled(undefined)).toBe(false);
  });

  it("workspace is orchestration-only without Confirm/Emit", () => {
    renderWithProviders(
      <W3MarketplaceWorkspace
        enabled
        adminMode
        specialties={["cardiology"]}
        providers={[
          {
            providerId: "p1",
            displayName: "Dr. X",
            specialties: ["cardiology"],
            isAuthority: false,
          },
        ]}
        referralCount={1}
        connectorCount={1}
      />,
    );
    const ws = screen.getByTestId("w3-marketplace-workspace");
    expect(ws).toHaveAttribute("data-orchestration-only", "true");
    expect(ws).toHaveAttribute("data-owns-cos", "false");
    expect(ws).toHaveAttribute("data-may-confirm", "false");
    expect(ws).toHaveAttribute("data-may-emit", "false");
    expect(ws).toHaveAttribute("data-may-order", "false");
    expect(screen.getByTestId("w3-marketplace-admin-console")).toBeInTheDocument();
    expect(screen.getByTestId("w3-marketplace-provider-row")).toHaveAttribute(
      "data-is-authority",
      "false",
    );
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Emit/i })).toBeNull();
  });

  it("open marketplace client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3MarketplaceOpen(fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
