"use client";

import React from "react";
import {
  listCountriesForSelect,
  normalizeCountryCode,
  type LocaleCode,
} from "@/lib/global-address-engine";
import { gaeInputStyle, gaeLabelStyle } from "./field-styles";

export interface NationalityFieldProps {
  value: string;
  onChange: (nationalityCode: string) => void;
  disabled?: boolean;
  locale?: LocaleCode;
  label?: string;
  required?: boolean;
  id?: string;
  /** Optional style override for the select. */
  style?: React.CSSProperties;
}

/**
 * Nationality is independent from country of residence.
 * Changing this field must never mutate residence address state.
 */
export function NationalityField({
  value,
  onChange,
  disabled,
  locale = "es",
  label = "Nacionalidad",
  required,
  id = "gae-nationality",
  style,
}: NationalityFieldProps) {
  const options = listCountriesForSelect(locale);
  const normalized = normalizeCountryCode(value);

  return (
    <div>
      <label htmlFor={id} style={gaeLabelStyle}>
        {label}
        {required ? " *" : ""}
      </label>
      <select
        id={id}
        value={normalized}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(normalizeCountryCode(e.target.value))}
        style={{ ...gaeInputStyle, ...style }}
      >
        <option value="">—</option>
        {options.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
