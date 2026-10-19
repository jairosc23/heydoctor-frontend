/**
 * fetch con timeout y composición de AbortSignal externo.
 */

import { AUTH_REQUEST_TIMEOUT_MS } from "./auth-request-config";

export class FetchTimeoutError extends Error {
  readonly name = "FetchTimeoutError";

  constructor(
    message = "Request timed out",
    readonly timeoutMs?: number,
  ) {
    super(message);
  }
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "AbortError" || err.code === 20)
  );
}

function combineAbortSignals(
  signals: (AbortSignal | undefined)[],
): AbortSignal | undefined {
  const active = signals.filter((s): s is AbortSignal => !!s && !s.aborted);
  if (active.length === 0) return undefined;
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(active);
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const signal of active) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }
  return controller.signal;
}

export type FetchWithTimeoutOptions = {
  timeoutMs?: number;
  signal?: AbortSignal;
  /** Permite usar apiFetch con credentials en lugar de fetch global. */
  fetchImpl?: typeof fetch;
};

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? AUTH_REQUEST_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutController = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      timeoutController.abort();
      reject(new FetchTimeoutError(`Request timed out after ${timeoutMs}ms`, timeoutMs));
    }, timeoutMs);
  });

  const combinedSignal = combineAbortSignals([
    init.signal ?? undefined,
    options.signal,
    timeoutController.signal,
  ]);

  if (combinedSignal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  try {
    const fetchPromise = fetchImpl(input, {
      ...init,
      signal: combinedSignal,
    });
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    if (err instanceof FetchTimeoutError) {
      throw err;
    }
    if (isAbortError(err)) {
      if (timeoutController.signal.aborted && !options.signal?.aborted) {
        throw new FetchTimeoutError(`Request timed out after ${timeoutMs}ms`, timeoutMs);
      }
    }
    throw err;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
