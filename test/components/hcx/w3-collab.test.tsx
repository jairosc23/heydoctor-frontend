import { describe, expect, it, vi } from "vitest";
import { W3CollabWorkspace } from "@/components/hcx/intelligence/collab";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isW3CollabEnabled } from "@/lib/w3/flags";
import { w3CollabOpen } from "@/lib/w3/collab-api";

describe("W3 WP-07 Clinical Collaboration HCX", () => {
  it("Collab flag defaults off", () => {
    expect(isW3CollabEnabled(undefined)).toBe(false);
  });

  it("workspace is communication-only with no Confirm/Emit/Ready", () => {
    renderWithProviders(
      <W3CollabWorkspace
        enabled
        threads={[{ threadId: "th1", title: "Handoff" }]}
        messages={[
          {
            messageId: "m1",
            threadId: "th1",
            body: "Hi @nurse1",
            mentionUserIds: ["nurse1"],
          },
        ]}
        notes={[{ noteId: "n1", body: "Note", advisory: true }]}
        tasks={[
          {
            taskId: "t1",
            title: "Follow up",
            status: "assigned",
            assigneeUserId: "u2",
            isConfirm: false,
          },
        ]}
        presence={[{ userId: "u1", displayName: "Dr" }]}
        activity={[
          { activityId: "a1", kind: "mention", summary: "Mentioned nurse1" },
        ]}
      />,
    );
    expect(screen.getByTestId("w3-collab-workspace")).toHaveAttribute(
      "data-may-confirm",
      "false",
    );
    expect(screen.getByTestId("w3-collab-workspace")).toHaveAttribute(
      "data-communication-only",
      "true",
    );
    expect(screen.getByTestId("w3-collab-task-row")).toHaveAttribute(
      "data-is-confirm",
      "false",
    );
    expect(screen.getByRole("button", { name: /Mark done/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Confirm$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Emit/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Ready/i })).toBeNull();
  });

  it("open client maps 403", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(
      w3CollabOpen("c1", fetcher as unknown as typeof fetch),
    ).rejects.toThrow(/W3_FLAG_OR_CONTEXT_DENIED/);
  });
});
