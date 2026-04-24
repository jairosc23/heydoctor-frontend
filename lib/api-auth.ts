/**
 * Contrato de login con el Nest endurecido: solo `{ user }` en JSON;
 * sesión vía cookies HttpOnly (`credentials: 'include'`).
 */

export type { AuthLoginResult } from "./auth-client";
export { authLogin } from "./auth-client";
