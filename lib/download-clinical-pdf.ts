import { fetchWithAuth, ApiError } from "./heydoctor-api";

export async function downloadClinicalPdf(
  path: string,
  fileName: string,
): Promise<void> {
  const res = await fetchWithAuth(path);
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw new ApiError(
      `No se pudo descargar el PDF (${res.status})`,
      res.status,
      body,
    );
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
