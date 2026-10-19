"use client";

import React from "react";
import Link from "next/link";
import type { DoctorProfile, RatingsResponse } from "@/lib/services/doctor-profiles";
import { BrandLogo } from "@/components/branding";
import { PublicDoctorBooking } from "@/components/public/public-doctor-booking";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2";

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars: string[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push("\u2605");
    else if (i === full && half) stars.push("\u2606");
    else stars.push("\u2606");
  }
  return (
    <span className="text-lg tracking-widest text-primary" aria-hidden>
      {stars.join("")}
    </span>
  );
}

export function DoctorProfileView({
  doctor,
  ratings,
}: {
  doctor: DoctorProfile;
  ratings: RatingsResponse;
}) {
  return (
    <div className="min-h-screen bg-hd-surface-base">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex h-16 items-center">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
        </Container>
      </header>

      <main className="py-8 sm:py-12">
        <Container className="max-w-2xl">
          <Card className="mb-6 p-8 text-center shadow-premium">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primaryMid to-primary text-4xl font-bold text-white"
              style={{ fontFamily: FONT_HEADING }}
            >
              {doctor.name.charAt(0).toUpperCase()}
            </div>
            <h1
              className="mb-1 text-[28px] font-bold text-primaryDark"
              style={{ fontFamily: FONT_HEADING }}
            >
              {doctor.name}
            </h1>
            <p className="mb-2 text-base font-semibold text-primary">
              {doctor.specialty}
            </p>
            <p className="mb-3 text-sm text-primaryDark/60">
              {doctor.country}
            </p>

            <div className="mb-4 flex items-center justify-center gap-2">
              <StarRating value={Number(doctor.rating)} />
              <span className="text-sm text-primaryDark/70">
                {Number(doctor.rating).toFixed(1)} ({doctor.ratingCount} valoraciones)
              </span>
            </div>

            {doctor.bio ? (
              <p className="mb-5 text-[15px] leading-relaxed text-primaryDark/70">
                {doctor.bio}
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                href="#reservar-cita"
                variant="primary"
                className={`min-h-12 px-8 ${CTA_PRIMARY}`}
              >
                Reservar cita
              </Button>
              <Button
                href="/consultar"
                variant="secondary"
                className="min-h-12 px-8"
              >
                Hablar con médico ahora
              </Button>
            </div>
          </Card>

          <div id="reservar-cita">
            <PublicDoctorBooking
              doctorSlug={doctor.slug}
              doctorName={doctor.name}
            />
          </div>

          <Card className="mt-6 p-6 shadow-premium">
            <h2
              className="mb-4 text-lg font-bold text-primaryDark"
              style={{ fontFamily: FONT_HEADING }}
            >
              Valoraciones de pacientes
            </h2>

            {!ratings || ratings.ratings.length === 0 ? (
              <p className="m-0 text-sm text-primaryDark/50">
                Aún no hay valoraciones para este doctor.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {ratings.ratings.map((r) => (
                  <div
                    key={r.id}
                    className="border-b border-hd-border-subtle pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-primaryDark">
                        {r.patientName}
                      </span>
                      <StarRating value={r.rating} />
                    </div>
                    {r.comment ? (
                      <p className="mt-2 mb-0 text-sm leading-relaxed text-primaryDark/70">
                        {r.comment}
                      </p>
                    ) : null}
                    <p className="mt-1 mb-0 text-xs text-primaryDark/50">
                      {new Date(r.createdAt).toLocaleDateString("es")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Container>
      </main>
    </div>
  );
}
