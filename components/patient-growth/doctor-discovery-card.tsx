import Button from "@/components/ui/Button";
import {
  doctorInitials,
  formatPublicSlot,
} from "@/lib/patient-growth/discovery";
import type { PublicAvailabilityDoctor } from "@/lib/services/public-discovery";

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100";

export function DoctorDiscoveryCard({
  doctor,
}: {
  doctor: PublicAvailabilityDoctor;
}) {
  const profileHref = `/dr/${encodeURIComponent(doctor.slug)}`;
  const nextLabel = doctor.nextSlot
    ? formatPublicSlot(doctor.nextSlot.startsAt, doctor.clinicTimezone)
    : null;

  return (
    <article
      className="flex flex-col rounded-xl border border-hd-border-subtle bg-white p-4 shadow-sm"
      data-testid="growth-doctor-card"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primaryLight text-sm font-bold text-primary">
          {doctor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            doctorInitials(doctor.name)
          )}
        </div>
        <div className="min-w-0">
          <h2
            className="truncate text-base font-bold text-primaryDark"
            style={{ fontFamily: FONT_HEADING }}
          >
            {doctor.name}
          </h2>
          <p className="truncate text-sm text-primary">{doctor.specialty}</p>
          <p className="mt-0.5 text-xs text-primaryDark/55">
            {doctor.country || "Online"}
            {doctor.rating > 0
              ? ` · ${Number(doctor.rating).toFixed(1)}★ (${doctor.ratingCount})`
              : ""}
          </p>
        </div>
      </div>
      {doctor.bio ? (
        <p className="mt-3 line-clamp-2 text-sm leading-snug text-primaryDark/70">
          {doctor.bio}
        </p>
      ) : (
        <p className="mt-3 text-sm text-primaryDark/50">
          Perfil público disponible para reserva.
        </p>
      )}
      <p className="mt-3 text-sm font-medium text-primaryDark">
        {nextLabel
          ? `Próximo horario: ${nextLabel}`
          : doctor.openSlotCount === 0
            ? "Sin horarios públicos en los próximos 7 días"
            : `${doctor.openSlotCount} horarios disponibles`}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          href={profileHref}
          variant="primary"
          className={`h-10 min-h-10 flex-1 text-sm ${CTA_PRIMARY}`}
        >
          Ver disponibilidad
        </Button>
        <Button
          href={`${profileHref}#reservar-cita`}
          variant="secondary"
          className="h-10 min-h-10 flex-1 text-sm"
        >
          Reservar
        </Button>
      </div>
    </article>
  );
}
