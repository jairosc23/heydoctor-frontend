import { heydoctorApi } from "../heydoctor-api";
import { withCache } from "../clinical-cache";
import { createClinicalLogger } from "../clinical-logger";

const log = createClinicalLogger("diagnostics");

type SearchResult = {
  data?: {
    patients?: unknown[];
    doctors?: unknown[];
    diagnostics?: unknown[];
  };
};

/**
 * Búsqueda médica (CIE-10, pacientes, doctores). Cache 30 s por (q,type) para
 * que el typeahead no genere una petición por keystroke.
 */
export const searchMedical = withCache(
  async (
    q: string,
    type: "patient" | "doctor" | "diagnostic" = "diagnostic"
  ): Promise<SearchResult> => {
    const res = await heydoctorApi.getOrFallback<SearchResult>(
      `/search?q=${encodeURIComponent(q)}&type=${type}`,
      { data: { patients: [], doctors: [], diagnostics: [] } }
    );
    log.debug("searchMedical", {
      q,
      type,
      diagnostics: res?.data?.diagnostics?.length ?? 0,
    });
    return res;
  },
  (q: string, type = "diagnostic") => `${type}:${q.trim().toLowerCase()}`,
  {
    ttlMs: 30_000,
    shouldCache: (r) => {
      const lengths = [
        r?.data?.patients?.length ?? 0,
        r?.data?.doctors?.length ?? 0,
        r?.data?.diagnostics?.length ?? 0,
      ];
      return lengths.some((n) => n > 0);
    },
  }
);
