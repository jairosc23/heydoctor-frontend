import { HcxBanner } from "../foundation/HcxBanner";

export type HcxConnectivityState = "online" | "degraded" | "offline";

export type HcxConnectivityBannerProps = {
  state: HcxConnectivityState;
  message?: string;
};

/**
 * Connectivity / offline banner — structural chrome.
 * Does not call COS; parent supplies state (demo or future adapter).
 */
export function HcxConnectivityBanner({
  state,
  message,
}: HcxConnectivityBannerProps) {
  if (state === "online") return null;

  const tone = state === "offline" ? "critical" : "warning";
  const title =
    state === "offline" ? "Sin conexión" : "Conectividad degradada";
  const body =
    message ??
    (state === "offline"
      ? "Trabajo local limitado. La autoridad clínica sigue en el backend cuando se recupere la conexión."
      : "La red es inestable. No uses esto como señal de autoridad clínica.");

  return (
    <div data-testid="hcx-connectivity-banner" data-state={state}>
      <HcxBanner title={title} tone={tone} live="assertive">
        {body}
      </HcxBanner>
    </div>
  );
}

export type HcxOfflineBannerProps = {
  visible: boolean;
  message?: string;
};

/** Explicit offline banner alias for Story Matrix ST-OFF-* chrome. */
export function HcxOfflineBanner({
  visible,
  message = "Estás sin conexión. Los cambios no se sincronizarán hasta recuperar red.",
}: HcxOfflineBannerProps) {
  if (!visible) return null;
  return (
    <div data-testid="hcx-offline-banner">
      <HcxBanner title="Offline" tone="critical" live="assertive">
        {message}
      </HcxBanner>
    </div>
  );
}
