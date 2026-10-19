import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  UnsavedChangesGuardProvider,
  useUnsavedChangesGuard,
} from "@/lib/unsaved-changes-guard/unsaved-changes-guard-context";

const push = vi.fn();
const assign = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
  }),
}));

Object.defineProperty(window, "location", {
  configurable: true,
  value: { ...window.location, assign },
});

function DirtyBackProbe() {
  const { register, requestNavigation } = useUnsavedChangesGuard();
  useEffect(() => {
    return register({
      isDirty: () => true,
      save: async () => undefined,
      discard: () => undefined,
    });
  }, [register]);
  return (
    <button
      type="button"
      onClick={() => requestNavigation("/panel/consultas")}
    >
      Volver
    </button>
  );
}

describe("INC-003 SPR1-D19 discard confirmation", () => {
  it("runs pending navigation after Salir sin guardar", async () => {
    const user = userEvent.setup();
    push.mockClear();
    assign.mockClear();
    render(
      <UnsavedChangesGuardProvider>
        <DirtyBackProbe />
      </UnsavedChangesGuardProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Volver" }));
    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByTestId("unsaved-changes-discard"));
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/panel/consultas");
    });
    expect(screen.queryByTestId("unsaved-changes-dialog")).not.toBeInTheDocument();
  });

  it("does not navigate when Cancelar", async () => {
    const user = userEvent.setup();
    push.mockClear();
    assign.mockClear();
    render(
      <UnsavedChangesGuardProvider>
        <DirtyBackProbe />
      </UnsavedChangesGuardProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Volver" }));
    await user.click(screen.getByTestId("unsaved-changes-cancel"));
    expect(assign).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(screen.queryByTestId("unsaved-changes-dialog")).not.toBeInTheDocument();
  });
});
