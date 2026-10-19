/**
 * PQ-02 — Shared render helpers for component tests.
 *
 * Keep providers minimal: UI primitives should not require clinical/auth context.
 * Extend `AllProviders` only when a new shared dependency is truly cross-cutting.
 */
import React, { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export type ProvidersProps = {
  children: ReactNode;
};

/** Default provider shell for reusable UI (intentionally thin). */
export function AllProviders({ children }: ProvidersProps) {
  return <>{children}</>;
}

export type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  wrapper?: React.ComponentType<{ children: ReactNode }>;
};

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
) {
  const { wrapper: ExtraWrapper, ...rest } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    const inner = <AllProviders>{children}</AllProviders>;
    return ExtraWrapper ? <ExtraWrapper>{inner}</ExtraWrapper> : inner;
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...rest }),
  };
}

export * from "@testing-library/react";
