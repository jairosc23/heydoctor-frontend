/**
 * Sesión guest **client-only**: persistimos el nombre del invitado por
 * consultationId en localStorage para no pedírselo cada vez que abre el link
 * (refresco de página, recargas tras pérdida de red, abrir en pestaña nueva).
 *
 * No es PHI: solo es el nombre que el visitante se pone a sí mismo cuando
 * entra a la sala. Si el navegador bloquea localStorage, todas las funciones
 * fallan en silencio y el caller debe asumir "no hay nombre".
 */

const STORAGE_PREFIX = "heydoctor:guest:";

export function getGuestName(consultationId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(`${STORAGE_PREFIX}${consultationId}`);
    if (!v) return null;
    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function setGuestName(consultationId: string, name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${consultationId}`,
      name.trim().slice(0, 80),
    );
  } catch {
    /* localStorage deshabilitado: degrada en silencio */
  }
}

export function clearGuestName(consultationId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${consultationId}`);
  } catch {
    /* idem */
  }
}
