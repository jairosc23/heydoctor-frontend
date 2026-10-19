/**
 * Manejo centralizado de errores para operaciones asíncronas.
 * Usa `toast` si hay un sistema de notificaciones, sino muestra alert.
 */

type ErrorHandler = (msg: string) => void;

let _handler: ErrorHandler | null = null;

export function setGlobalErrorHandler(handler: ErrorHandler) {
  _handler = handler;
}

export function reportError(err: unknown, context?: string): void {
  const msg =
    err instanceof Error ? err.message : "Error inesperado";
  const full = context ? `${context}: ${msg}` : msg;

  if (_handler) {
    _handler(full);
  }
}

/** Catch handler para Promises silenciosas que al menos loguean */
export function silentCatch(context: string) {
  return (err: unknown) => {
    reportError(err, context);
  };
}
