import { ConsultarClient } from "./consultar-client";
import { fetchPublicDoctorsCached } from "@/lib/server/public-doctors";

export default async function ConsultarPage() {
  let initialDoctors: Awaited<ReturnType<typeof fetchPublicDoctorsCached>> = [];
  try {
    initialDoctors = await fetchPublicDoctorsCached();
  } catch {
    initialDoctors = [];
  }
  return <ConsultarClient initialDoctors={initialDoctors} />;
}
