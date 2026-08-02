"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { PAYMENT_UNAVAILABLE_USER_MESSAGE } from "@/lib/payment-user-errors";

type Props = {
  children: ReactNode;
  /** Optional recovery link (e.g. Marketplace). */
  continueHref?: string;
  continueLabel?: string;
};

type State = {
  hasError: boolean;
};

/**
 * Converts unexpected payment UI crashes into a controlled friendly state.
 * Never renders JSON, stacks, or provider messages.
 */
export class PaymentErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Technical details stay in the console / monitoring — never in UI.
    console.error("[payment-ui]", error.message, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const href = this.props.continueHref ?? "/consultar";
    const label = this.props.continueLabel ?? "Seguir explorando";

    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        data-testid="payment-error-boundary"
      >
        <p className="mb-3">{PAYMENT_UNAVAILABLE_USER_MESSAGE}</p>
        <a
          href={href}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {label}
        </a>
      </div>
    );
  }
}
