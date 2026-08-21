"use client";

import { Component, type ReactNode } from "react";

type EncounterDisclosurePreviewBoundaryProps = {
  children: ReactNode;
};

type EncounterDisclosurePreviewBoundaryState = {
  error: Error | null;
};

/**
 * Isolates one CIP/clinical preview inside the Encounter disclosure.
 * A render throw in a sibling must not unmount Clinical Documents or the
 * rest of the panel. Fail-closed: the broken preview degrades locally.
 */
export class EncounterDisclosurePreviewBoundary extends Component<
  EncounterDisclosurePreviewBoundaryProps,
  EncounterDisclosurePreviewBoundaryState
> {
  state: EncounterDisclosurePreviewBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): EncounterDisclosurePreviewBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-3 py-hd-2 text-sm text-amber-950"
          data-testid="encounter-disclosure-preview-failed"
          role="alert"
        >
          Esta preview no está disponible. El resto del disclosure permanece
          abierto.
        </div>
      );
    }
    return this.props.children;
  }
}
