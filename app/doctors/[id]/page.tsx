"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { heydoctorApi } from "@/lib/heydoctor-api";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";

const FONT_HEADING = "Montserrat, sans-serif";

export default function DoctorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [doctor, setDoctor] = useState<{
    name?: string;
    specialty?: string;
    registration?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    heydoctorApi.get<{ name?: string; specialty?: string; registration?: string }>("/clinics/me")
      .then((res) => {
        const d = (res as { data?: { doctor?: { user?: { firstName?: string; lastName?: string }; speciality?: string; licenseNumber?: string } } })?.data?.doctor;
        if (d) {
          setDoctor({
            name: d.user ? [d.user.firstName, d.user.lastName].filter(Boolean).join(" ") : undefined,
            specialty: d.speciality,
            registration: d.licenseNumber,
          });
        } else {
          setDoctor(null);
        }
      })
      .catch((e) => {
        if ((e as { status?: number }).status === 404) setUnavailable(true);
        setDoctor(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-hd-surface-base">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-primary no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            ← Volver
          </Link>
        </Container>
      </header>

      <main className="py-8 sm:py-12">
        <Container className="max-w-xl">
          {loading ? (
            <p className="text-primaryDark/70">Cargando...</p>
          ) : unavailable ? (
            <Card className="p-8 shadow-premium">
              <p className="m-0 text-primaryDark/70">
                Información del doctor no disponible.
              </p>
            </Card>
          ) : doctor ? (
            <Card className="p-8 shadow-premium">
              <h1
                className="mb-3 text-2xl font-bold text-primary"
                style={{ fontFamily: FONT_HEADING }}
              >
                {doctor.name || "Doctor"}
              </h1>
              <p className="mb-2 text-primaryDark/70">
                Especialidad: {doctor.specialty || "—"}
              </p>
              <p className="m-0 text-primaryDark/70">
                Registro: {doctor.registration || "—"}
              </p>
            </Card>
          ) : (
            <Card className="p-8 shadow-premium">
              <p className="m-0 text-primaryDark/70">
                No se encontró información del doctor.
              </p>
            </Card>
          )}
        </Container>
      </main>
    </div>
  );
}
