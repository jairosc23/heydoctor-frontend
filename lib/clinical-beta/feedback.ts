export const CLINICAL_BETA_FEEDBACK_CATEGORIES = [
  { id: "error", label: "Error" },
  { id: "suggestion", label: "Sugerencia" },
  { id: "catalog", label: "Catálogo" },
  { id: "cie10", label: "CIE-10" },
  { id: "medication", label: "Medicamento" },
  { id: "experience", label: "Experiencia" },
  { id: "performance", label: "Performance" },
  { id: "other", label: "Otro" },
] as const;

export type ClinicalBetaFeedbackCategory =
  (typeof CLINICAL_BETA_FEEDBACK_CATEGORIES)[number]["id"];

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
const EMAIL_RE = /\S+@\S+\.\S+/g;

export function sanitizeBetaComment(raw: string): string {
  return raw
    .replace(UUID_RE, "[id]")
    .replace(EMAIL_RE, "[email]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("screenshot_must_be_image"));
      return;
    }
    if (file.size > 600_000) {
      reject(new Error("screenshot_too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("screenshot_read_failed"));
    reader.readAsDataURL(file);
  });
}
