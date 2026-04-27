"use client";

import React, { useState } from "react";

interface GuestNamePromptProps {
  defaultName?: string;
  onContinue: (name: string) => void;
  /** Texto secundario opcional, p.ej. "Modo invitado". */
  subtitle?: string;
}

const NAME_MAX = 80;

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "linear-gradient(180deg,#f0fdfa 0%,#ffffff 60%)",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 12px 40px rgba(15,23,42,0.10)",
          border: "1px solid #e5e7eb",
          padding: "28px 24px",
        }}
        aria-labelledby="guest-prompt-title"
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#fef3c7",
            color: "#92400e",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          <span aria-hidden>🎫</span>
          {subtitle}
        </div>
        <h1
          id="guest-prompt-title"
          style={{
            margin: 0,
            marginBottom: 6,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          ¿Cómo te llamas?
        </h1>
        <p
          style={{
            margin: 0,
            marginBottom: 16,
            color: "#475569",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Antes de entrar, ingresa tu nombre para que el médico sepa quién está
          en la videollamada.
        </p>

        <label
          htmlFor="guest-name-input"
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 6,
          }}
        >
          Tu nombre
        </label>
        <input
          id="guest-name-input"
          autoFocus
          autoComplete="name"
          maxLength={NAME_MAX}
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
          placeholder="Ej: María González"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 10,
            fontSize: 14,
            outline: "none",
            marginBottom: 14,
            background: "#ffffff",
          }}
        />

        <button
          type="submit"
          disabled={!valid}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: valid
              ? "linear-gradient(90deg,#0d9488 0%,#078a92 100%)"
              : "#cbd5e1",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
            cursor: valid ? "pointer" : "not-allowed",
            transition: "background 200ms ease",
          }}
        >
          Entrar a la consulta
        </button>

        <p
          style={{
            margin: 0,
            marginTop: 10,
            color: "#94a3b8",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          No se requiere cuenta · No guardamos contraseñas
        </p>
      </form>
    </div>
  );
}
