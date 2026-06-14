#!/usr/bin/env bash
# Phase 4.9.2 — Ejecutar E2E P0 contra preview Vercel
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
[[ -z "${E2E_BASE_URL:-}" ]] && missing+=("E2E_BASE_URL")
[[ -z "${E2E_DOCTOR_EMAIL:-}" ]] && missing+=("E2E_DOCTOR_EMAIL")
[[ -z "${E2E_DOCTOR_PASSWORD:-}" ]] && missing+=("E2E_DOCTOR_PASSWORD")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "ERROR: Variables obligatorias ausentes: ${missing[*]}"
  exit 1
fi

echo "E2E target: ${E2E_BASE_URL}"
cd "$ROOT"
npm run test:e2e
