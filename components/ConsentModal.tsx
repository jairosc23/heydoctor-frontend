"use client";

import React, { useState } from "react";
import { BrandLogo } from "@/components/branding";
import Button from "@/components/ui/Button";

export type ConsentModalProps = {
  onAccept: () => void | Promise<void>;
  onDecline: () => void;
  /** Mientras se registra el consentimiento en el backend */
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100";

const CTA_SECONDARY =
  "rounded-lg border border-hd-border-default bg-hd-surface-chrome text-primaryDark shadow-none hover:bg-hd-surface-muted hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2";

/**
 * Modal de consentimiento informado antes de iniciar videoconsulta.
 * La videollamada no debe montarse hasta que el usuario acepte.
 */
export function ConsentModal({
  onAccept,
  onDecline,
  isSubmitting = false,
  errorMessage = null,
}: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-primaryDark/70 p-5 backdrop-blur-sm"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-hd-surface-chrome shadow-premium">
        <div className="px-7 pb-5 pt-7">
          <div className="mb-4 flex justify-center">
            <BrandLogo markOnly markSize={48} priority />
          </div>
          <h2
            id="consent-modal-title"
            className="m-0 text-[22px] font-bold tracking-tight text-primary"
            style={{ fontFamily: FONT_HEADING }}
          >
            Consentimiento para telemedicina
          </h2>
          <p className="mt-3.5 mb-0 text-sm leading-relaxed text-primaryDark/70">
            Al continuar, accedes a una consulta a distancia por videollamada. El
            profesional evaluará tu caso con la información que aportes; la
            calidad del servicio depende de la conexión, del dispositivo y de la
            información veraz que proporciones.
          </p>
          <p className="mt-3 mb-0 text-sm leading-relaxed text-primaryDark/70">
            Esta modalidad no sustituye la atención presencial cuando sea
            necesaria (urgencias, signos de alarma). Si tu situación lo requiere,
            acude a un centro de salud o servicios de urgencias.
          </p>
          <p className="mt-3 mb-0 text-[13px] leading-relaxed text-primaryDark/60">
            El tratamiento de tus datos se realiza conforme a la normativa
            aplicable en materia de protección de datos y salud. Puedes retirar
            tu consentimiento en cualquier momento desde la configuración de tu
            cuenta cuando esté disponible.
          </p>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mx-7 mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] leading-relaxed text-red-700"
          >
            {errorMessage}
          </div>
        ) : null}

        <label className="mx-7 flex cursor-pointer items-start gap-3 rounded-lg border border-hd-border-default bg-hd-surface-muted px-3.5 py-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-primary"
          />
          <span className="text-sm font-semibold text-primaryDark">
            Acepto el{" "}
            <a
              href="/telemedicine-consent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              consentimiento informado de telemedicina
            </a>
          </span>
        </label>

        <div className="flex flex-wrap justify-end gap-3 px-7 pb-7 pt-5">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onDecline}
            className={CTA_SECONDARY}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!checked || isSubmitting}
            onClick={() => {
              void onAccept();
            }}
            className={CTA_PRIMARY}
          >
            {isSubmitting
              ? "Registrando consentimiento…"
              : "Continuar a la videollamada"}
          </Button>
        </div>
      </div>
    </div>
  );
}
