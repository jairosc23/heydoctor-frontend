/**
 * Logger condicional: solo emite en desarrollo.
 * En producción (NODE_ENV=production), los logs son silenciados.
 * Reemplaza console.log/warn/error en código de aplicación.
 */

const isDev =
  typeof process !== "undefined" &&
  (process as { env?: { NODE_ENV?: string } }).env?.NODE_ENV !== "production";

function noop() {}

export const logger = {
  log: isDev ? console.log.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
};
