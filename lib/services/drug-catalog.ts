import { heydoctorApi } from "../heydoctor-api";
import { withCache } from "../clinical-cache";
import { createClinicalLogger } from "../clinical-logger";
import type {
  DrugPresentationDetail,
  DrugPresentationSummary,
  DrugSubstanceSummary,
  SearchPresentationsParams,
} from "../types/drug-catalog";

const BASE = "/clinical-catalog";
const log = createClinicalLogger("clinical");

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function searchDrugPresentations(
  params: SearchPresentationsParams = {},
): Promise<DrugPresentationSummary[]> {
  const res = await heydoctorApi.get<{
    data?: { presentations?: DrugPresentationSummary[] };
  }>(
    `${BASE}/drug-presentations${buildQuery({
      q: params.q,
      substanceId: params.substanceId,
      jurisdictionCode: params.jurisdictionCode,
      routeCode: params.routeCode,
      limit: params.limit,
    })}`,
  );
  const list = res.data?.presentations ?? [];
  log.debug("searchDrugPresentations", { q: params.q, count: list.length });
  return list;
}

export const searchDrugPresentationsCached = withCache(
  searchDrugPresentations,
  (params: SearchPresentationsParams = {}) =>
    `rx-pres:${JSON.stringify({
      q: params.q?.trim().toLowerCase() ?? "",
      substanceId: params.substanceId ?? "",
      jurisdictionCode: params.jurisdictionCode ?? "",
      routeCode: params.routeCode ?? "",
      limit: params.limit ?? "",
    })}`,
  { ttlMs: 60_000, shouldCache: (list) => list.length > 0 },
);

export async function fetchDrugPresentationById(
  id: string,
): Promise<DrugPresentationDetail> {
  const res = await heydoctorApi.get<{ data: DrugPresentationDetail }>(
    `${BASE}/drug-presentations/${id}`,
  );
  return res.data;
}

export async function searchDrugSubstances(params: {
  q?: string;
  atcCode?: string;
  limit?: number;
} = {}): Promise<DrugSubstanceSummary[]> {
  const res = await heydoctorApi.get<{
    data?: { substances?: DrugSubstanceSummary[] };
  }>(
    `${BASE}/drug-substances${buildQuery({
      q: params.q,
      atcCode: params.atcCode,
      limit: params.limit,
    })}`,
  );
  return res.data?.substances ?? [];
}

export async function listDrugRoutes(): Promise<
  Array<{ code: string; nameEn: string; nameEs: string | null }>
> {
  const res = await heydoctorApi.get<{
    data?: {
      routes?: Array<{ code: string; nameEn: string; nameEs: string | null }>;
    };
  }>(`${BASE}/drug-routes`);
  return res.data?.routes ?? [];
}
