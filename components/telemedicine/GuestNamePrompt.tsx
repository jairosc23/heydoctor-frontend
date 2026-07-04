"use client";

import React, { useState } from "react";
import { BrandLogo } from "@/components/branding";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface GuestNamePromptProps {
  defaultName?: string;
  onContinue: (name: string) => void;
  /** Texto secundario opcional, p.ej. "Modo invitado". */
  subtitle?: string;
}

const NAME_MAX = 80;
const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100";

/**
 * Pantalla previa a entrar a la teleconsulta como invitado: pedimos un nombre
 * para identificar al participante en chat/llamada. Se persiste en
 * localStorage por consultationId, así que solo aparece una vez por
 * dispositivo + consulta.
 */
export function GuestNamePrompt({
  defaultName = "",
  onContinue,
  subtitle = "Modo invitado",
}: GuestNamePromptProps) {
  const [name, setName] = useState(defaultName);
  const trimmed = name.trim();
  const valid = trimmed.length >= 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onContinue(trimmed);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hd-surface-base px-4 py-6">
      <Card className="w-full max-w-md p-6 shadow-premium sm:p-7">
        <form onSubmit={submit} aria-labelledby="guest-prompt-title">
          <div className="mb-4 flex justify-center">
            <BrandLogo markOnly markSize={56} priority />
          </div>
          <div className="mb-3.5 inline-flex items-center rounded-full bg-primaryLight px-2.5 py-1 text-[11px] font-semibold text-primary">
            {subtitle}
          </div>
          <h1
            id="guest-prompt-title"
            className="mb-1.5 text-[22px] font-bold text-primary"
            style={{ fontFamily: FONT_HEADING }}
          >
            ¿Cómo te llamas?
          </h1>
          <p className="mb-4 text-[13px] leading-relaxed text-primaryDark/70">
            Antes de entrar, ingresa tu nombre para que el médico sepa quién está
            en la videollamada.
          </p>

          <label
            htmlFor="guest-name-input"
            className="mb-1.5 block text-xs font-semibold text-primaryDark"
            style={{ fontFamily: FONT_HEADING }}
          >
            Tu nombre
          </label>
          <Input
            id="guest-name-input"
            autoFocus
            autoComplete="name"
            maxLength={NAME_MAX}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
            placeholder="Ej: María González"
            className="mb-3.5 min-h-11 rounded-lg border-hd-border-default"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={!valid}
            className={`w-full min-h-11 ${CTA_PRIMARY}`}
          >
            Entrar a la consulta
          </Button>

          <p className="mt-2.5 mb-0 text-center text-[11px] text-primaryDark/50">
            No se requiere cuenta · No guardamos contraseñas
          </p>
        </form>
      </Card>
    </div>
  );
}
