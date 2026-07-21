"use client";

import React from "react";
import { resolveAgeDisplay } from "@/lib/global-address-engine";
import { gaeInputStyle, gaeLabelStyle } from "./field-styles";

export interface AgeFromBirthDateFieldProps {
  birthDate: string;
  /** Optional legacy age from API when birthDate missing. */
  fallbackAge?: number | string | null;
  label?: string;
  id?: string;
  style?: React.CSSProperties;
}

/** Read-only age always derived from birthDate when valid. */
export function AgeFromBirthDateField({
  birthDate,
  fallbackAge,
  label = "Edad (calculada)",
  id = "gae-age",
  style,
}: AgeFromBirthDateFieldProps) {
  const display = resolveAgeDisplay(birthDate, fallbackAge);

  return (
    <div>
      <label htmlFor={id} style={gaeLabelStyle}>
        {label}
      </label>
      <input
        id={id}
        readOnly
        disabled
        value={display}
        style={{ ...gaeInputStyle, background: "#f8fafb", ...style }}
      />
    </div>
  );
}
