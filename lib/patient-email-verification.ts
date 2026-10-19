export const VERIFICATION_PAGE_PATH = "/verificar-correo";
export const VERIFY_PATIENT_EMAIL_PATH = "/auth/patient/email/verify";
export const LOGIN_PATH = "/login";

const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

export type VerificationView =
  | "missing"
  | "invalid"
  | "ready"
  | "verifying"
  | "success"
  | "unusable"
  | "error";

export type VerificationLanguage = "es" | "en";

export function readVerificationToken(
  raw: string | null | undefined,
): { view: "missing" | "invalid" } | { view: "ready"; token: string } {
  const token = raw?.trim() ?? "";
  if (!token) {
    return { view: "missing" };
  }
  if (!TOKEN_PATTERN.test(token)) {
    return { view: "invalid" };
  }
  return { view: "ready", token };
}

/** Fragment only. A query token is ignored so it cannot be reused after exposure. */
export function readVerificationFragment(
  hash: string | null | undefined,
): { view: "missing" | "invalid" } | { view: "ready"; token: string } {
  const raw = hash?.trim() ?? "";
  if (!raw.startsWith("#") || raw === "#") {
    return { view: "missing" };
  }
  const params = new URLSearchParams(raw.slice(1));
  if (!params.has("token")) {
    return { view: "missing" };
  }
  return readVerificationToken(params.get("token"));
}

export function classifyVerifyResponse(
  status: number,
  body: unknown,
): "success" | "unusable" | "error" {
  if (status === 200 && isVerifiedBody(body)) {
    return "success";
  }
  if (status === 400) {
    return "unusable";
  }
  return "error";
}

export function canSubmitVerification(view: VerificationView): boolean {
  return view === "ready" || view === "error";
}

function isVerifiedBody(body: unknown): boolean {
  return (
    Boolean(body) &&
    typeof body === "object" &&
    (body as { verified?: unknown }).verified === true
  );
}

export const VERIFICATION_COPY: Record<
  VerificationLanguage,
  Record<VerificationView, { title: string; body: string; action: string }>
> = {
  es: {
    missing: {
      title: "Falta el enlace",
      body: "Abre el enlace completo que enviamos a tu correo.",
      action: "",
    },
    invalid: {
      title: "Enlace inválido",
      body: "Este enlace no tiene el formato de verificación.",
      action: "",
    },
    ready: {
      title: "Verifica tu correo",
      body: "Confirma con el botón. Abrir esta página no usa el enlace.",
      action: "Verificar correo",
    },
    verifying: {
      title: "Verificando",
      body: "Estamos comprobando el enlace.",
      action: "Verificando…",
    },
    success: {
      title: "Correo verificado",
      body: "Ya puedes iniciar sesión. Esto no completa un reclamo ni una reserva.",
      action: "Ir a iniciar sesión",
    },
    unusable: {
      title: "No se pudo verificar",
      body: "El enlace es inválido, venció o ya se utilizó.",
      action: "",
    },
    error: {
      title: "No pudimos verificar",
      body: "Intenta de nuevo. El enlace sigue pendiente.",
      action: "Reintentar",
    },
  },
  en: {
    missing: {
      title: "Link missing",
      body: "Open the full link from your email.",
      action: "",
    },
    invalid: {
      title: "Invalid link",
      body: "This link is not a verification token.",
      action: "",
    },
    ready: {
      title: "Verify your email",
      body: "Confirm with the button. Opening this page does not use the link.",
      action: "Verify email",
    },
    verifying: {
      title: "Verifying",
      body: "We are checking the link.",
      action: "Verifying…",
    },
    success: {
      title: "Email verified",
      body: "You can sign in. This does not finish a claim or a booking.",
      action: "Go to sign in",
    },
    unusable: {
      title: "Could not verify",
      body: "The link is invalid, expired, or already used.",
      action: "",
    },
    error: {
      title: "We could not verify",
      body: "Try again. The link is still pending.",
      action: "Retry",
    },
  },
};
