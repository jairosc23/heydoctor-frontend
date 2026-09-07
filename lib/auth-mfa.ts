export type AuthLoginUserView = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

export type AuthSessionLoginResult = {
  kind: "session";
  user: AuthLoginUserView;
};

export type AuthMfaPendingLoginResult = {
  kind: "mfa_pending";
  mfaEnrolled: boolean;
  user: AuthLoginUserView;
};

export type AuthLoginOutcome =
  AuthSessionLoginResult | AuthMfaPendingLoginResult;

function parseLoginUser(raw: unknown): AuthLoginUserView {
  if (!raw || typeof raw !== "object") {
    throw new Error("Respuesta de login inválida: falta user");
  }
  const u = raw as Record<string, unknown>;
  const userId = String(u.id ?? "");
  if (!userId) {
    throw new Error("Respuesta de login inválida: falta user");
  }
  const fromNames = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  const fallback = fromNames || (typeof u.email === "string" ? u.email : "");
  const name = typeof u.name === "string" ? u.name : fallback;
  return {
    id: userId,
    email: typeof u.email === "string" ? u.email : "",
    name,
    role: typeof u.role === "string" ? u.role : undefined,
  };
}

/**
 * Interpreta el contrato Nest de login (sesión vs desafío MFA).
 * No persiste tokens.
 */
export function parseAuthLoginPayload(data: Record<string, unknown>): {
  outcome: AuthLoginOutcome;
  accessToken: string | null;
  pendingToken: string | null;
} {
  const user = parseLoginUser(data.user);
  if (data.kind === "mfa_pending") {
    const pendingToken =
      typeof data.mfa_pending_token === "string"
        ? data.mfa_pending_token.trim()
        : "";
    if (!pendingToken) {
      throw new Error("Respuesta MFA inválida");
    }
    return {
      outcome: {
        kind: "mfa_pending",
        mfaEnrolled: data.mfaEnrolled === true,
        user,
      },
      accessToken: null,
      pendingToken,
    };
  }

  const accessFromBody = data.access_token;
  const accessToken =
    typeof accessFromBody === "string" && accessFromBody.trim()
      ? accessFromBody.trim()
      : null;
  return {
    outcome: { kind: "session", user },
    accessToken,
    pendingToken: null,
  };
}

export function extractTotpSecretFromOtpauth(
  otpauthUri: string,
): string | null {
  try {
    const url = new URL(otpauthUri);
    if (url.protocol !== "otpauth:") {
      return null;
    }
    const secret = url.searchParams.get("secret");
    if (!secret || !/^[A-Z2-7]+=*$/i.test(secret)) {
      return null;
    }
    return secret.toUpperCase();
  } catch {
    return null;
  }
}

export function formatTotpSecretForDisplay(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

export function isMfaPendingOutcome(
  result: AuthLoginOutcome,
): result is AuthMfaPendingLoginResult {
  return result.kind === "mfa_pending";
}
