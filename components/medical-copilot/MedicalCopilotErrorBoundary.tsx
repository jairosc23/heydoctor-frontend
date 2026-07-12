"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { MedicalCopilotErrorState } from "./states";

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
  message: string | null;
};

export class MedicalCopilotErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Error inesperado en Medical Copilot",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== "production") {
      console.error("medical_copilot_ui_error", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <MedicalCopilotErrorState
          title={this.props.fallbackTitle ?? "Error en Medical Copilot"}
          message={this.state.message ?? undefined}
          onRetry={() => this.setState({ hasError: false, message: null })}
        />
      );
    }
    return this.props.children;
  }
}
