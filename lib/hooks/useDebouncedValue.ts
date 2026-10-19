"use client";

import { useEffect, useState } from "react";

/** Retrasa actualizaciones (p. ej. búsqueda) para evitar ráfagas de API. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
