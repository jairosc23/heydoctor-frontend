#!/usr/bin/env bash
# Phase 4.9.2 / PQ-01 — Ejecutar E2E P0 contra preview / local
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.e2e"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: Falta .env.e2e — copiar desde e2e/.env.e2e.example"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

missing=()
for key in \
  E2E_BASE_URL \
  E2E_DOCTOR_EMAIL \
  E2E_DOCTOR_PASSWORD \
  E2E_CONSULTATION_HTA \
  E2E_CONSULTATION_DM2 \
  E2E_CONSULTATION_ACUTE \
  E2E_CONSULTATION_PAYMENT
do
  if [[ -z "${!key:-}" ]]; then
    missing+=("$key")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "ERROR: Variables obligatorias ausentes: ${missing[*]}"
  echo "Ver e2e/.env.e2e.example (placeholders) y e2e/README.md"
  exit 1
fi

export E2E_STRICT="${E2E_STRICT:-1}"

echo "E2E target: ${E2E_BASE_URL}"
echo "Mode: P0 only (chromium-desktop-clinical-p0) · E2E_STRICT=${E2E_STRICT}"
cd "$ROOT"
npm run test:e2e:p0
