import { redirect } from "next/navigation";

const PRESERVED_QUERY_PARAMS = [
  "q",
  "specialty",
  "patientCountry",
  "patientSubdivision",
] as const;

export default async function ConsultarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const key of PRESERVED_QUERY_PARAMS) {
    const raw = query[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "string" && value.trim()) {
      params.set(key, value.trim());
    }
  }
  const qs = params.toString();
  redirect(qs ? `/medicos?${qs}` : "/medicos");
}
