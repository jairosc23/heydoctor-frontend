/**
 * URL `wa.me` para abrir WhatsApp con número y texto prellenado.
 * Número: solo dígitos con código país (ej. 56912345678).
 */
const DEFAULT_MESSAGE =
  "Hola, quiero agendar una hora con un médico en HeyDoctor.";

export function getWhatsAppBookingUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!raw) {
    return null;
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }
  const message =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE?.trim() || DEFAULT_MESSAGE;
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}
