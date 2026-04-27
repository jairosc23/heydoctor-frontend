/**
 * URL `wa.me` para abrir WhatsApp con número y texto prellenado.
 * Número: solo dígitos con código país (ej. 56912345678).
 *
 * El mensaje puede incluir `{{LINK}}` o `{{URL}}` (reemplazados por la URL
 * absoluta de /consulta-rapida). Si no hay plantilla en env, se usa un texto
 * por defecto con ese enlace.
 */
const DEFAULT_TEMPLATE =
  "Hola, quiero una consulta médica online en HeyDoctor: {{LINK}}";

export function buildConsultaRapidaUrl(origin?: string): string {
  const base =
    origin?.replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
    "https://heydoctor.health";
  return `${base}/consulta-rapida`;
}

export function getWhatsAppMessageText(origin?: string): string {
  const link = buildConsultaRapidaUrl(origin);
  const tpl = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE?.trim() || DEFAULT_TEMPLATE;
  return tpl.replace(/\{\{LINK\}\}/g, link).replace(/\{\{URL\}\}/g, link);
}

export function getWhatsAppBookingUrl(origin?: string): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!raw) {
    return null;
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }
  const text = encodeURIComponent(getWhatsAppMessageText(origin));
  return `https://wa.me/${digits}?text=${text}`;
}
