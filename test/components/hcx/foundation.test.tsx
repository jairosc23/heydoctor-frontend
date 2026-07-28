import { describe, expect, it } from "vitest";
import { HcxButton } from "@/components/hcx/foundation/HcxButton";
import { HcxBanner } from "@/components/hcx/foundation/HcxBanner";
import { HcxFoundationGate } from "@/components/hcx/foundation/HcxFoundationGate";
import { HcxInput } from "@/components/hcx/foundation/HcxInput";
import { HcxText } from "@/components/hcx/primitive/HcxText";
import { renderWithProviders, screen } from "@/test/utils/render";
import { isHcxFoundationEnabled } from "@/lib/hcx/flags";

describe("HCX Phase 12 Foundation", () => {
  it("renders foundation button without clinical authority verbs", () => {
    renderWithProviders(<HcxButton>Continuar</HcxButton>);
    const btn = screen.getByTestId("hcx-button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("Continuar");
    expect(btn.textContent).not.toMatch(/Confirmar y emitir|Emitir|Dispose/i);
  });

  it("banner exposes assertive live region for critical tone", () => {
    renderWithProviders(
      <HcxBanner title="Estado crítico" tone="critical">
        Texto + color
      </HcxBanner>,
    );
    const banner = screen.getByTestId("hcx-banner");
    expect(banner).toHaveAttribute("aria-live", "assertive");
    expect(banner).toHaveTextContent("Estado crítico");
  });

  it("input associates label and error for a11y", () => {
    renderWithProviders(
      <HcxInput label="Nombre" error="Requerido" />,
    );
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Requerido");
  });

  it("foundation gate respects enabled override", () => {
    const { rerender } = renderWithProviders(
      <HcxFoundationGate enabled={false} fallback={<span>off</span>}>
        <HcxText>on</HcxText>
      </HcxFoundationGate>,
    );
    expect(screen.getByText("off")).toBeInTheDocument();
    rerender(
      <HcxFoundationGate enabled>
        <HcxText>on</HcxText>
      </HcxFoundationGate>,
    );
    expect(screen.getByTestId("hcx-foundation-root")).toBeInTheDocument();
    expect(screen.getByText("on")).toBeInTheDocument();
  });

  it("flag helper defaults off without env", () => {
    expect(isHcxFoundationEnabled(undefined)).toBe(false);
    expect(isHcxFoundationEnabled("true")).toBe(true);
    expect(isHcxFoundationEnabled("0")).toBe(false);
  });
});
