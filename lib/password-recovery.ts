export const PASSWORD_REQUEST_PATH = "/recuperar-contrasena";
export const PASSWORD_RESET_PATH = "/restablecer-contrasena";
export const FORGOT_PASSWORD_API = "/auth/password/forgot";
export const RESET_PASSWORD_API = "/auth/password/reset";
export const LOGIN_PATH = "/login";

const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

export type RecoveryLanguage = "es" | "en";

export type ResetView =
  | "missing"
  | "invalid"
  | "ready"
  | "submitting"
  | "success"
  | "unusable"
  | "error";

export function readResetFragment(
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
  const token = params.get("token")?.trim() ?? "";
  if (!TOKEN_PATTERN.test(token)) {
    return { view: "invalid" };
  }
  return { view: "ready", token };
}

export function classifyResetResponse(
  status: number,
  body: unknown,
): "success" | "unusable" | "error" {
  if (
    status === 200 &&
    Boolean(body) &&
    typeof body === "object" &&
    (body as { reset?: unknown }).reset === true
  ) {
    return "success";
  }
  if (status === 400) {
    return "unusable";
  }
  return "error";
}

export function classifyForgotResponse(status: number): "accepted" | "error" {
  return status === 202 ? "accepted" : "error";
}

export function passwordMeetsPolicy(password: string): boolean {
  return password.length >= 6;
}

export const REQUEST_COPY: Record<
  RecoveryLanguage,
  {
    title: string;
    body: string;
    email: string;
    action: string;
    acceptedTitle: string;
    acceptedBody: string;
    error: string;
    login: string;
    language: string;
  }
> = {
  es: {
    title: "Recuperar contraseña",
    body: "Escribe el correo de tu cuenta. La respuesta es la misma si existe o no.",
    email: "Correo",
    action: "Enviar enlace",
    acceptedTitle: "Revisa tu correo",
    acceptedBody:
      "Si el correo corresponde a una cuenta de HeyDoctor, enviamos un enlace para elegir una contraseña nueva. Caduca en 15 minutos.",
    error: "No pudimos enviar la solicitud. Inténtalo de nuevo.",
    login: "Volver al acceso",
    language: "English",
  },
  en: {
    title: "Reset password",
    body: "Enter your account email. The response is the same whether it exists or not.",
    email: "Email",
    action: "Send link",
    acceptedTitle: "Check your email",
    acceptedBody:
      "If the email belongs to a HeyDoctor account, we sent a link to choose a new password. It expires in 15 minutes.",
    error: "We could not send the request. Try again.",
    login: "Back to sign in",
    language: "Español",
  },
};

export const RESET_COPY: Record<
  RecoveryLanguage,
  Record<ResetView, { title: string; body: string; action: string }>
> = {
  es: {
    missing: {
      title: "Falta el enlace",
      body: "Abre el enlace completo del correo. No pegues el token en otro sitio.",
      action: "Pedir un enlace nuevo",
    },
    invalid: {
      title: "Enlace no válido",
      body: "Este enlace no sirve. Pide uno nuevo.",
      action: "Pedir un enlace nuevo",
    },
    ready: {
      title: "Nueva contraseña",
      body: "Usa al menos 6 caracteres. Después deberás entrar de nuevo.",
      action: "Guardar contraseña",
    },
    submitting: {
      title: "Guardando",
      body: "Estamos actualizando tu contraseña.",
      action: "Guardando…",
    },
    success: {
      title: "Contraseña actualizada",
      body: "Tus sesiones anteriores quedaron cerradas. Entra con la contraseña nueva.",
      action: "Ir al acceso",
    },
    unusable: {
      title: "Enlace vencido o usado",
      body: "Este enlace ya no sirve. Pide uno nuevo. Tu clínica y tu acceso no cambiaron.",
      action: "Pedir un enlace nuevo",
    },
    error: {
      title: "No se pudo guardar",
      body: "Inténtalo otra vez. Si el enlace venció, pide uno nuevo.",
      action: "Reintentar",
    },
  },
  en: {
    missing: {
      title: "Missing link",
      body: "Open the full link from the email. Do not paste the token anywhere else.",
      action: "Request a new link",
    },
    invalid: {
      title: "Invalid link",
      body: "This link cannot be used. Request a new one.",
      action: "Request a new link",
    },
    ready: {
      title: "New password",
      body: "Use at least 6 characters. You will need to sign in again.",
      action: "Save password",
    },
    submitting: {
      title: "Saving",
      body: "We are updating your password.",
      action: "Saving…",
    },
    success: {
      title: "Password updated",
      body: "Your previous sessions were closed. Sign in with the new password.",
      action: "Go to sign in",
    },
    unusable: {
      title: "Expired or used link",
      body: "This link no longer works. Request a new one. Your clinic and access did not change.",
      action: "Request a new link",
    },
    error: {
      title: "Could not save",
      body: "Try again. If the link expired, request a new one.",
      action: "Retry",
    },
  },
};
