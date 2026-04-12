"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { heydoctorApi } from "@/lib/heydoctor-api";

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
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        fontFamily: "Open Sans",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#078a92",
          textDecoration: "none",
          marginBottom: 24,
          display: "inline-block",
        }}
      >
        ← Volver
      </Link>
      {loading ? (
        <p>Cargando...</p>
      ) : unavailable ? (
        <p>Información del doctor no disponible.</p>
      ) : doctor ? (
        <div
          style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              fontFamily: "Montserrat",
              color: "#078a92",
              marginBottom: 12,
            }}
          >
            {doctor.name || "Doctor"}
          </h1>
          <p style={{ color: "#666", marginBottom: 8 }}>
            Especialidad: {doctor.specialty || "—"}
          </p>
          <p style={{ color: "#666" }}>
            Registro: {doctor.registration || "—"}
          </p>
        </div>
      ) : (
        <p>No se encontró información del doctor.</p>
      )}
    </div>
  );
}
