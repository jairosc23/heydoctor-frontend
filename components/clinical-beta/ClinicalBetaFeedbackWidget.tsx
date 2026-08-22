"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchWithAuth } from "@/lib/heydoctor-api";
import {
  CLINICAL_BETA_FEEDBACK_CATEGORIES,
  fileToDataUrl,
  sanitizeBetaComment,
  type ClinicalBetaFeedbackCategory,
} from "@/lib/clinical-beta/feedback";
import { CLINICAL_OVERLAY_CLASS } from "@/lib/clinical-overlay-contract";
import { cn } from "@/lib/utils";

export function ClinicalBetaFeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [category, setCategory] =
    useState<ClinicalBetaFeedbackCategory>("suggestion");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = sanitizeBetaComment(event.message ?? "frontend_error");
      void fetchWithAuth("/api/clinical-beta/frontend-errors", {
        method: "POST",
        body: JSON.stringify({
          message,
          routePath: window.location.pathname,
          locale: navigator.language,
        }),
      }).catch(() => undefined);
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  async function submit() {
    setStatus("sending");
    try {
      const file = fileRef.current?.files?.[0];
      const screenshotDataUrl = file ? await fileToDataUrl(file) : undefined;
      const res = await fetchWithAuth("/api/clinical-beta/feedback", {
        method: "POST",
        body: JSON.stringify({
          category,
          comment: sanitizeBetaComment(comment),
          screenshotDataUrl,
          routePath: window.location.pathname.replace(
            /\/[0-9a-f-]{36}(?=\/|$)/gi,
            "/:id",
          ),
          locale: navigator.language,
        }),
      });
      if (!res.ok) throw new Error("feedback_failed");
      setComment("");
      if (fileRef.current) fileRef.current.value = "";
      setStatus("sent");
      setTimeout(() => {
        setStatus("idle");
        setOpen(false);
      }, 1200);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-5 left-4 sm:left-6",
        CLINICAL_OVERLAY_CLASS.system,
      )}
      data-overlay-layer="system"
      data-testid="clinical-beta-feedback-widget"
    >
      {open ? (
        <form
          className="pointer-events-auto mb-3 w-[min(92vw,320px)] rounded-2xl border border-hd-border-subtle bg-white p-3 shadow-hd-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <p className="mb-2 text-xs font-semibold text-primary">
            Clinical Beta
          </p>
          <select
            className="mb-2 w-full rounded-lg border border-hd-border-default px-2 py-1.5 text-sm"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ClinicalBetaFeedbackCategory)
            }
            aria-label="Tipo de feedback"
          >
            {CLINICAL_BETA_FEEDBACK_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <textarea
            className="mb-2 h-20 w-full resize-none rounded-lg border border-hd-border-default px-2 py-1.5 text-sm"
            placeholder="Comentario (sin datos de pacientes)"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mb-2 block w-full text-xs"
            aria-label="Captura de pantalla"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="text-xs text-primaryDark/70"
              onClick={() => setOpen(false)}
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
            >
              {status === "sending"
                ? "Enviando…"
                : status === "sent"
                  ? "Enviado"
                  : "Enviar"}
            </button>
          </div>
          {status === "error" ? (
            <p className="mt-2 text-xs text-red-600">No se pudo enviar.</p>
          ) : null}
        </form>
      ) : null}
      <button
        type="button"
        className="pointer-events-auto rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white shadow-hd-2"
        onClick={() => setOpen((value) => !value)}
        aria-label="Enviar feedback de Clinical Beta"
      >
        Feedback
      </button>
    </div>
  );
}
