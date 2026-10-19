"use client";

import { useEffect, useState } from "react";

const DEFAULT_MOBILE_BREAKPOINT_PX = 768;

/**
 * Detecta si el viewport es de tipo móvil. Reactivo a `resize` y a cambios de
 * orientación. Devuelve `false` durante el render del servidor para evitar
 * mismatches de hidratación.
 *
 * Implementación con `matchMedia` y listener `change`, en lugar de `resize`,
 * para evitar trabajo en frame por cada drag del navegador.
 *
 * @param breakpointPx ancho en píxeles que separa móvil de no-móvil. Default 768.
 */
export function useIsMobile(
  breakpointPx: number = DEFAULT_MOBILE_BREAKPOINT_PX,
): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = `(max-width: ${breakpointPx - 1}px)`;
    const mql = window.matchMedia(query);

    const update = (event?: MediaQueryListEvent | MediaQueryList) => {
      const matches = event?.matches ?? mql.matches;
      setIsMobile(matches);
    };

    update(mql);

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, [breakpointPx]);

  return isMobile;
}
