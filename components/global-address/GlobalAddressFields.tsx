"use client";

import React, { useMemo } from "react";
import {
  applyAddressChange,
  buildLevelFieldStates,
  listCountriesForSelect,
  normalizeCountryCode,
  type AddressSelection,
  type LocaleCode,
} from "@/lib/global-address-engine";
import { gaeInputStyle, gaeLabelStyle } from "./field-styles";

export interface GlobalAddressFieldsProps {
  value: AddressSelection;
  onChange: (next: AddressSelection) => void;
  disabled?: boolean;
  locale?: LocaleCode;
  /** Show street lines + postal code (default true). */
  showStreetFields?: boolean;
  /**
   * Show adaptive admin cascade (región/estado/…).
   * Set false for country-only consumers that persist just ISO country.
   */
  showAdminLevels?: boolean;
  residenceCountryLabel?: string;
  residenceCountryRequired?: boolean;
  idPrefix?: string;
  style?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
}

/**
 * Reusable residence address block.
 * Country of residence is the master field; admin catalogs cascade from it.
 * Labels adapt per country adapter (Región / Estado / Departamento / …).
 */
export function GlobalAddressFields({
  value,
  onChange,
  disabled,
  locale = "es",
  showStreetFields = true,
  showAdminLevels = true,
  residenceCountryLabel = "País de residencia",
  residenceCountryRequired,
  idPrefix = "gae-address",
  style,
  selectStyle,
}: GlobalAddressFieldsProps) {
  const countries = useMemo(() => listCountriesForSelect(locale), [locale]);
  const levels = useMemo(
    () =>
      showAdminLevels ? buildLevelFieldStates(value, locale) : [],
    [value, locale, showAdminLevels],
  );
  const controlStyle = { ...gaeInputStyle, ...selectStyle };

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "1fr 1fr",
        ...style,
      }}
    >
      <div style={{ gridColumn: "1 / -1" }}>
        <label htmlFor={`${idPrefix}-country`} style={gaeLabelStyle}>
          {residenceCountryLabel}
          {residenceCountryRequired ? " *" : ""}
        </label>
        <select
          id={`${idPrefix}-country`}
          value={normalizeCountryCode(value.countryCode)}
          disabled={disabled}
          required={residenceCountryRequired}
          onChange={(e) =>
            onChange(
              applyAddressChange(value, {
                countryCode: e.target.value,
              }),
            )
          }
          style={controlStyle}
        >
          <option value="">—</option>
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {levels.map((level) => (
        <div key={level.key}>
          <label
            htmlFor={`${idPrefix}-${level.key}`}
            style={gaeLabelStyle}
          >
            {level.label}
          </label>
          {level.mode === "select" ? (
            <select
              id={`${idPrefix}-${level.key}`}
              value={level.valueCode}
              disabled={disabled || level.disabled}
              onChange={(e) =>
                onChange(
                  applyAddressChange(value, {
                    level: level.key,
                    code: e.target.value,
                  }),
                )
              }
              style={controlStyle}
            >
              <option value="">—</option>
              {level.options.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`${idPrefix}-${level.key}`}
              type="text"
              value={level.valueName}
              disabled={disabled || !value.countryCode}
              onChange={(e) =>
                onChange(
                  applyAddressChange(value, {
                    level: level.key,
                    freeText: e.target.value,
                  }),
                )
              }
              style={controlStyle}
            />
          )}
        </div>
      ))}

      {showStreetFields ? (
        <>
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor={`${idPrefix}-line1`} style={gaeLabelStyle}>
              Dirección
            </label>
            <input
              id={`${idPrefix}-line1`}
              type="text"
              value={value.addressLine1 ?? ""}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  applyAddressChange(value, {
                    addressLine1: e.target.value,
                  }),
                )
              }
              style={controlStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor={`${idPrefix}-line2`} style={gaeLabelStyle}>
              Dirección (línea 2)
            </label>
            <input
              id={`${idPrefix}-line2`}
              type="text"
              value={value.addressLine2 ?? ""}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  applyAddressChange(value, {
                    addressLine2: e.target.value,
                  }),
                )
              }
              style={controlStyle}
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-postal`} style={gaeLabelStyle}>
              Código postal
            </label>
            <input
              id={`${idPrefix}-postal`}
              type="text"
              value={value.postalCode ?? ""}
              disabled={disabled}
              onChange={(e) =>
                onChange(
                  applyAddressChange(value, {
                    postalCode: e.target.value,
                  }),
                )
              }
              style={controlStyle}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
