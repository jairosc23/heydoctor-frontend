/**
 * Wave-3 FE flags — chrome only. BE remains source of truth for authority.
 * All default OFF. Never disable COS HAB / context fail-closed.
 */

import { envTruthy } from "@/lib/env-truthy";

export const W3_FE_FLAGS = {
  WORKSPACE: "w3.workspace",
  ASSIST: "w3.assist",
  CDS: "w3.cds",
  CPI: "w3.cpi",
  LON_INSIGHTS: "w3.lon_insights",
  TIMELINE: "w3.timeline",
  COLLAB: "w3.collab",
  POP: "w3.pop",
  ANALYTICS: "w3.analytics",
  INTEROP: "w3.interop",
  MOBILE: "w3.mobile",
  MARKETPLACE: "w3.marketplace",
} as const;

export function isW3WorkspaceEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_WORKSPACE,
): boolean {
  return envTruthy(raw);
}

export function isW3AssistEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_ASSIST,
): boolean {
  return envTruthy(raw);
}

export function isW3CdsEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_CDS,
): boolean {
  return envTruthy(raw);
}

export function isW3CpiEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_CPI,
): boolean {
  return envTruthy(raw);
}

export function isW3LonInsightsEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_LON_INSIGHTS,
): boolean {
  return envTruthy(raw);
}

export function isW3TimelineEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_TIMELINE,
): boolean {
  return envTruthy(raw);
}

export function isW3CollabEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_COLLAB,
): boolean {
  return envTruthy(raw);
}

export function isW3PopEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_POP_SIGNALS,
): boolean {
  return envTruthy(raw);
}

export function isW3AnalyticsEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_ANALYTICS,
): boolean {
  return envTruthy(raw);
}

export function isW3InteropEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_INTEROP,
): boolean {
  return envTruthy(raw);
}

export function isW3MobileEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_MOBILE,
): boolean {
  return envTruthy(raw);
}

export function isW3MarketplaceEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_W3_MARKETPLACE,
): boolean {
  return envTruthy(raw);
}

export const NEXT_PUBLIC_W3_WORKSPACE = "NEXT_PUBLIC_W3_WORKSPACE" as const;
