/**
 * Instantánea PHI-safe del entorno del navegador durante teleconsulta.
 * Sin SDP, tokens, IPs, URLs con query ni identificadores de paciente.
 */

export type WebrtcBrowserDiagnosticSnapshot = {
  event: 'webrtc_browser_snapshot';
  consultationId: string;
  online: boolean;
  visibility: DocumentVisibilityState | 'unknown';
  connectionType: string | null;
  effectiveType: string | null;
  saveData: boolean | null;
  userAgentPlatform: string | null;
  isIosSafari: boolean;
  isMobile: boolean;
  reason?: string;
};

function readNetworkInformation(): Pick<
  WebrtcBrowserDiagnosticSnapshot,
  'connectionType' | 'effectiveType' | 'saveData'
> {
  if (typeof navigator === 'undefined') {
    return { connectionType: null, effectiveType: null, saveData: null };
  }
  const conn = (
    navigator as Navigator & {
      connection?: {
        type?: string;
        effectiveType?: string;
        saveData?: boolean;
      };
    }
  ).connection;
  if (!conn) {
    return { connectionType: null, effectiveType: null, saveData: null };
  }
  return {
    connectionType: conn.type ?? null,
    effectiveType: conn.effectiveType ?? null,
    saveData: typeof conn.saveData === 'boolean' ? conn.saveData : null,
  };
}

function detectIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari =
    /Safari/i.test(ua) &&
    !/CriOS|FxiOS|EdgiOS|Chrome|Chromium/i.test(ua);
  return isIos && isSafari;
}

export function captureWebrtcBrowserDiagnostic(
  consultationId: string,
  reason?: string,
): WebrtcBrowserDiagnosticSnapshot {
  const network = readNetworkInformation();
  return {
    event: 'webrtc_browser_snapshot',
    consultationId,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    visibility:
      typeof document !== 'undefined'
        ? document.visibilityState
        : 'unknown',
    ...network,
    userAgentPlatform:
      typeof navigator !== 'undefined' ? navigator.platform ?? null : null,
    isIosSafari: detectIosSafari(),
    isMobile:
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(max-width: 768px)')?.matches ?? false),
    reason,
  };
}
