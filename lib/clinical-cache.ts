/**
 * Cache TTL en memoria para resultados clínicos (sugerencias de medicamentos,
 * exámenes, búsquedas CIE-10). Tres capas combinadas con `lib/clinical-logger`:
 *
 *   1. **API real** vía `heydoctorApi.getOrFallback` / `postOrFallback`.
 *   2. **Cache** en memoria (este archivo): respuestas exitosas guardadas con
 *      TTL configurable. Hit en cache evita refetch dentro del TTL.
 *   3. **Fallback demo** desde `lib/clinical-fallbacks` cuando la API responde
 *      vacío o explota.
 *
 * El cache es **process-scoped** (memoria del módulo): se limpia al recargar
 * la página. Suficiente para suavizar repetidas llamadas durante una sola
 * sesión clínica.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

export interface TtlCacheOptions {
  /** Tiempo de vida en ms. Default 60 s. */
  ttlMs?: number;
  /** Tamaño máximo (LRU simple). Default 128. */
  max?: number;
}

export interface TtlCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  size(): number;
}

const DEFAULT_TTL = 60_000;
const DEFAULT_MAX = 128;

/**
 * Crea una cache LRU con expiración. Las entradas expiradas se purgan en
 * `get`, y cuando el tamaño excede `max` se descarta la entrada más antigua
 * insertada (orden de inserción del Map → LRU primitiva pero suficiente).
 */
export function createTtlCache<T>(options: TtlCacheOptions = {}): TtlCache<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL;
  const max = options.max ?? DEFAULT_MAX;
  const store = new Map<string, Entry<T>>();

  function evictExpired() {
    const now = Date.now();
    for (const [k, v] of store) {
      if (v.expiresAt <= now) store.delete(k);
    }
  }

  function evictOverflow() {
    while (store.size > max) {
      const oldest = store.keys().next().value;
      if (typeof oldest === "string") store.delete(oldest);
      else break;
    }
  }

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= Date.now()) {
        store.delete(key);
        return undefined;
      }
      /**
       * Re-inserta para refrescar el orden (LRU). `delete` + `set` mantiene
       * la entrada al final del Map.
       */
      store.delete(key);
      store.set(key, entry);
      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      evictExpired();
      evictOverflow();
    },
    delete(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    size() {
      return store.size;
    },
  };
}

/**
 * Decora una función async para que reuse resultados cacheados durante
 * `ttlMs`. La clave se calcula con `keyFn(args...)`.
 *
 * @param shouldCache Decide si el resultado merece guardarse (por defecto:
 *                    siempre que no sea null/undefined). Útil para no cachear
 *                    listas vacías que hubieran disparado fallback.
 */
export function withCache<TArgs extends readonly unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyFn: (...args: TArgs) => string,
  options: TtlCacheOptions & {
    shouldCache?: (result: TResult) => boolean;
  } = {},
): (...args: TArgs) => Promise<TResult> {
  const cache = createTtlCache<TResult>(options);
  const shouldCache = options.shouldCache ?? ((r) => r != null);

  return async (...args: TArgs): Promise<TResult> => {
    const key = keyFn(...args);
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const fresh = await fn(...args);
    if (shouldCache(fresh)) cache.set(key, fresh);
    return fresh;
  };
}
