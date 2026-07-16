/** RC5 FE resilience — timeout, abort, duplicate-retry protection. */

export const RC5_FE_GET_TIMEOUT_MS = 20_000;

export class Rc5FeTimeoutError extends Error {
  constructor(path: string, ms: number) {
    super(`RC5 FE timeout ${ms}ms: ${path}`);
    this.name = 'Rc5FeTimeoutError';
  }
}

let duplicateBlocked = 0;
let timeouts = 0;

export function rc5FeResilienceStats() {
  return { duplicateBlocked, timeouts };
}

export function __rc5FeResetResilienceForTests() {
  duplicateBlocked = 0;
  timeouts = 0;
}

export function withFeTimeout<T>(
  promise: Promise<T>,
  path: string,
  ms: number = RC5_FE_GET_TIMEOUT_MS,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      timeouts += 1;
      reject(new Rc5FeTimeoutError(path, ms));
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (v) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        reject(e);
      },
    );
  });
}

export function markDuplicateBlocked(): void {
  duplicateBlocked += 1;
}
