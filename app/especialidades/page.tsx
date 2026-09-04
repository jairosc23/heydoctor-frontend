import { EspecialidadesClient } from "./especialidades-client";

export const metadata = {
  title: "Especialidades | HeyDoctor",
  description:
    "Explora especialidades médicas públicas y reserva la próxima hora disponible.",
};

export default function EspecialidadesPage() {
  return <EspecialidadesClient />;
}
