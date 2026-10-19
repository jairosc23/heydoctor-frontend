import type { InputHTMLAttributes } from "react";

export type HcxInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

/**
 * Foundation Input — generic form control.
 * No clinical field semantics.
 */
export function HcxInput({
  label,
  hint,
  error,
  id,
  disabled,
  ...rest
}: HcxInputProps) {
  const inputId = id ?? `hcx-input-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--hcx-space-2)" }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: "var(--hcx-font-family-ui)",
          fontSize: "var(--hcx-font-size-body-sm)",
          fontWeight: "var(--hcx-font-weight-medium)",
          color: "var(--hcx-color-text-primary)",
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className="hcx-focus-ring"
        style={{
          padding: "var(--hcx-space-3) var(--hcx-space-4)",
          borderRadius: "var(--hcx-radius-md)",
          border: `1px solid ${
            error
              ? "var(--hcx-color-border-critical)"
              : "var(--hcx-color-border-subtle)"
          }`,
          background: "var(--hcx-color-bg-raised)",
          color: "var(--hcx-color-text-primary)",
          fontFamily: "var(--hcx-font-family-ui)",
          fontSize: "var(--hcx-font-size-body)",
          minHeight: 44,
        }}
        {...rest}
      />
      {hint && !error ? (
        <span
          id={hintId}
          style={{
            fontSize: "var(--hcx-font-size-meta)",
            color: "var(--hcx-color-text-muted)",
          }}
        >
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          id={errorId}
          role="alert"
          style={{
            fontSize: "var(--hcx-font-size-meta)",
            color: "var(--hcx-color-status-critical)",
          }}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
