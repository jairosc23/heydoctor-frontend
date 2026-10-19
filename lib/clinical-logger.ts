/**
 * Logger especializado para flujos clínicos (data fetch, fallbacks, errores
 * no críticos). A diferencia de `lib/logger`, este sí emite en producción
 * pero **filtrado** y siempre con prefijo, para no contaminar la consola.
 *
 * Reglas:
 * - `debug` / `info`: solo en development o cuando `NEXT_PUBLIC_CLINICAL_LOGS=on`.
 * - `warn` / `error`: siempre.
 * - `event(name, data)`: telemetría ligera; solo dev por defecto, en prod se
 *   suprime salvo flag explícito.
 *
 * Si más adelante se conecta a Sentry o Datadog, el único punto a tocar es
 * `dispatchToObservability`. La firma pública del logger no cambia.
 */

type LogChannel = "clinical" | "ai" | "consultation" | "diagnostics";

const PREFIX = "[heydoctor]";

function getChannelTag(channel: LogChannel): string {
  return `[${channel}]`;
}

function isDev(): boolean {
  return (
    typeof process !== "undefined" &&
    (process as { env?: { NODE_ENV?: string } }).env?.NODE_ENV !== "production"
  );
}

function isVerboseEnabled(): boolean {
  if (isDev()) return true;
  if (typeof process === "undefined") return false;
  const flag = (process as { env?: { NEXT_PUBLIC_CLINICAL_LOGS?: string } })
    .env?.NEXT_PUBLIC_CLINICAL_LOGS;
  return flag === "on" || flag === "1" || flag === "true";
}

/**
 * Punto único de extensión para enviar a Sentry / DD / Logflare. En este
 * momento solo dejamos un placeholder; mantenerlo aquí evita propagar
 * `import("@sentry/nextjs")` por el codebase.
 */
function dispatchToObservability(
  level: "warn" | "error",
  channel: LogChannel,
  message: string,
  extras?: unknown,
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    __HEYDOCTOR_OBSERVE__?: (
      level: "warn" | "error",
      channel: LogChannel,
      message: string,
      extras?: unknown,
    ) => void;
  };
  try {
    w.__HEYDOCTOR_OBSERVE__?.(level, channel, message, extras);
  } catch {
    /* observabilidad opcional: no propagar errores */
  }
}

function format(channel: LogChannel, args: unknown[]): unknown[] {
  return [`${PREFIX}${getChannelTag(channel)}`, ...args];
}

/**
 * Crea un logger especializado para un canal concreto. Permite usarlo como
 * `const log = createClinicalLogger("ai")` en cada componente.
 */
export function createClinicalLogger(channel: LogChannel) {
  return {
    debug: (...args: unknown[]) => {
      if (isVerboseEnabled()) console.debug(...format(channel, args));
    },
    info: (...args: unknown[]) => {
      if (isVerboseEnabled()) console.info(...format(channel, args));
    },
    warn: (message: string, extras?: unknown) => {
      console.warn(...format(channel, [message, extras].filter(Boolean)));
      dispatchToObservability("warn", channel, message, extras);
    },
    error: (message: string, extras?: unknown) => {
      console.error(...format(channel, [message, extras].filter(Boolean)));
      dispatchToObservability("error", channel, message, extras);
    },
    /**
     * Telemetría estructurada. En dev imprime `console.info`; en prod solo
     * sale si `NEXT_PUBLIC_CLINICAL_LOGS=on`.
     */
    event: (name: string, data?: Record<string, unknown>) => {
      if (!isVerboseEnabled()) return;
      console.info(...format(channel, [`event:${name}`, data ?? {}]));
    },
  };
}

export const clinicalLogger = createClinicalLogger("clinical");
