"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "../../../lib/api";

export default function DoctorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [doctor, setDoctor] = useState<{
    name?: string;
    specialty?: string;
    registration?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/doctor`)
      .then((r) => r.json())
      .then((data) => {
        setDoctor(data);
      })
      .catch(() => setDoctor(null))
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
