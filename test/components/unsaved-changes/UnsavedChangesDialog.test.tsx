import { describe, expect, it, vi } from "vitest";
import { UnsavedChangesDialog } from "@/components/unsaved-changes/UnsavedChangesDialog";
import { renderWithProviders, screen } from "@/test/utils/render";

describe("UnsavedChangesDialog", () => {
  it("exposes cancel, save-and-exit, and exit-without-saving", () => {
    const onCancel = vi.fn();
    const onSaveAndExit = vi.fn();
    const onExitWithoutSaving = vi.fn();
    renderWithProviders(
      <UnsavedChangesDialog
        open
        onCancel={onCancel}
        onSaveAndExit={onSaveAndExit}
        onExitWithoutSaving={onExitWithoutSaving}
      />,
    );
    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("unsaved-changes-backdrop")).toHaveAttribute(
      "data-overlay-layer",
      "dialog",
    );
    screen.getByTestId("unsaved-changes-cancel").click();
    screen.getByTestId("unsaved-changes-save").click();
    screen.getByTestId("unsaved-changes-discard").click();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSaveAndExit).toHaveBeenCalledTimes(1);
    expect(onExitWithoutSaving).toHaveBeenCalledTimes(1);
  });

  it("does not render when closed", () => {
    renderWithProviders(
      <UnsavedChangesDialog
        open={false}
        onCancel={() => undefined}
        onSaveAndExit={() => undefined}
        onExitWithoutSaving={() => undefined}
      />,
    );
    expect(screen.queryByTestId("unsaved-changes-dialog")).toBeNull();
  });
});
