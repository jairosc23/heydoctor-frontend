import { describe, expect, it, vi } from "vitest";
import { W3AssistDock, W3ProposalCard } from "@/components/hcx/intelligence/assist";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3AssistEnabled } from "@/lib/w3/flags";
import { w3AssistEvaluate } from "@/lib/w3/assist-api";

describe("W3 WP-02 Assist HCX", () => {
  it("assist flag defaults off", () => {
    expect(isW3AssistEnabled(undefined)).toBe(false);
  });

  it("dock has no Confirm/Emit CTAs", () => {
    renderWithProviders(
      <W3AssistDock
        enabled
        proposals={[
          {
            proposalId: "p1",
            kind: "note_fragment",
            status: "active",
            summary: "demo",
          },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-assist-dock")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Dispose \(accept\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Insert into draft$/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Emitir|Authorize/i })).toBeNull();
  });

  it("proposal card dispose callback", () => {
    const onDispose = vi.fn();
    renderWithProviders(
      <W3ProposalCard
        proposal={{
          proposalId: "p1",
          kind: "note_fragment",
          status: "active",
          summary: "x",
        }}
        onDispose={onDispose}
      />,
    );
    screen.getByText(/Dispose \(accept\)/i).click();
    expect(onDispose).toHaveBeenCalledWith("accept");
  });

  it("evaluate client maps 403 to deny error", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });
    await expect(
      w3AssistEvaluate("c1", undefined, fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
