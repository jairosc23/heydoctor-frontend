export const OWN_CLINIC_REGISTER_PATH = "/auth/register/clinic";
export const OWN_CLINIC_RESEND_PATH = "/auth/register/clinic/resend";
export const PENDING_CLINIC_RETURN_PATH = "/register?notice=pending";

export function pendingClinicLoginHref(): string {
  return `/login?redirect=${encodeURIComponent(PENDING_CLINIC_RETURN_PATH)}`;
}

export type ClinicRegisterLanguage = "es" | "en";

export function buildOwnClinicRegisterBody(input: {
  clinicName: string;
  email: string;
  password: string;
}): { clinicName: string; email: string; password: string } {
  return {
    clinicName: input.clinicName.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
}

export function buildOwnClinicResendBody(email: string): { email: string } {
  return { email: email.trim().toLowerCase() };
}

export function readClinicVerificationStatus(
  body: unknown,
): "pending" | "failed" {
  if (
    body &&
    typeof body === "object" &&
    (body as { emailVerification?: unknown }).emailVerification === "pending"
  ) {
    return "pending";
  }
  return "failed";
}

export function clinicRegisterError(
  status: number,
  language: ClinicRegisterLanguage,
): string | null {
  const copy = CLINIC_REGISTER_COPY[language];
  if (status === 409) return copy.duplicate;
  if (status === 400 || status === 403) return copy.rejected;
  if (status === 429) return copy.limited;
  return null;
}

export function clinicRegisterFailureMessage(
  status: number,
  language: ClinicRegisterLanguage,
): string {
  const copy = CLINIC_REGISTER_COPY[language];
  return clinicRegisterError(status, language) ?? (status >= 500 ? copy.network : copy.rejected);
}

export const CLINIC_REGISTER_COPY = {
  es: {
    title: "Registrar clínica",
    intro:
      "Crea tu clínica y el primer administrador. No se une a una clínica existente.",
    clinicName: "Nombre de la clínica",
    email: "Correo",
    password: "Contraseña",
    confirm: "Confirmar contraseña",
    submit: "Crear clínica",
    submitting: "Creando…",
    skip: "Saltar al formulario",
    language: "English",
    emailPlaceholder: "clinica@ejemplo.cl",
    missing: "Completa el nombre, el correo y la contraseña.",
    shortPassword: "La contraseña debe tener al menos 6 caracteres.",
    mismatch: "Las contraseñas no coinciden.",
    duplicate: "Ese correo ya está registrado.",
    rejected: "No se pudo crear la clínica con esos datos.",
    limited: "Demasiados intentos. Espera un momento.",
    network: "No se pudo conectar con el servidor.",
    pendingTitle: "Clínica creada",
    pendingBody:
      "Quedó pendiente la verificación de correo y la activación comercial. Aún no hay suscripción, profesionales, reservas, pagos ni telemedicina.",
    failedTitle: "Clínica creada",
    failedBody:
      "No se pudo emitir la verificación de correo. Puedes reintentar. La clínica no quedó habilitada.",
    resend: "Reenviar verificación",
    login: "Ir a iniciar sesión",
    hasAccount: "¿Ya tienes cuenta?",
    signIn: "Iniciar sesión",
  },
  en: {
    title: "Register clinic",
    intro:
      "Create your clinic and its first administrator. This does not join an existing clinic.",
    clinicName: "Clinic name",
    email: "Email",
    password: "Password",
    confirm: "Confirm password",
    submit: "Create clinic",
    submitting: "Creating…",
    skip: "Skip to form",
    language: "Español",
    emailPlaceholder: "clinic@example.com",
    missing: "Enter the clinic name, email, and password.",
    shortPassword: "Password must be at least 6 characters.",
    mismatch: "Passwords do not match.",
    duplicate: "That email is already registered.",
    rejected: "The clinic could not be created with those details.",
    limited: "Too many attempts. Wait a moment.",
    network: "Could not reach the server.",
    pendingTitle: "Clinic created",
    pendingBody:
      "Email verification and commercial activation are still pending. No subscription, professionals, bookings, payments, or telemedicine are on.",
    failedTitle: "Clinic created",
    failedBody:
      "The verification email could not be issued. You can retry. The clinic was not enabled.",
    resend: "Resend verification",
    login: "Go to sign in",
    hasAccount: "Already have an account?",
    signIn: "Sign in",
  },
} as const;
