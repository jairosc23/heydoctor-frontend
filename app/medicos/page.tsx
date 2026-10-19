import { MedicosClient } from "./medicos-client";

export const metadata = {
  title: "Buscar médico | HeyDoctor",
  description:
    "Encuentra médico, especialidad y horarios públicos. Reserva, paga y entra a tu teleconsulta.",
};

export default async function MedicosPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    patientCountry?: string;
    patientSubdivision?: string;
  }>;
}) {
  const query = await searchParams;
  return (
    <MedicosClient
      initialQuery={query.q ?? ""}
      initialSpecialty={query.specialty ?? ""}
      initialCountry={(query.patientCountry ?? "").toUpperCase()}
      initialSubdivision={(query.patientSubdivision ?? "").toUpperCase()}
    />
  );
}
