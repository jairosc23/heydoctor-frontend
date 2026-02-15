"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "../../../lib/api";

interface VerifyResult {
  valid: boolean;
  type?: string;
  date?: string;
  doctor?: {
    name: string;
    specialty: string;
    registration: string;
    signature?: string;
  };
}

export default function VerifyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/verify/${id}`)
      .then((r) => r.json())
      .then((data: VerifyResult) => {
        setResult(data);
      })
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        fontFamily: "Open Sans",
        background: "#f9fafb",
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
        <p>Cargando verificación...</p>
      ) : result?.valid ? (
        <div
          style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
            borderLeft: "6px solid #0bb38a",
          }}
        >
          <h1
            style={{
              fontFamily: "Montserrat",
              color: "#0bb38a",
              marginBottom: 16,
            }}
          >
            ✓ Documento verificado
          </h1>
          <p style={{ color: "#666", marginBottom: 8 }}>
            Tipo: {result.type || "—"}
          </p>
          <p style={{ color: "#666", marginBottom: 8 }}>
            Fecha: {result.date ? new Date(result.date).toLocaleDateString() : "—"}
          </p>
          {result.doctor && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee" }}>
              <p style={{ fontWeight: 600, color: "#333" }}>{result.doctor.name}</p>
              <p style={{ color: "#666" }}>{result.doctor.specialty}</p>
              <p style={{ color: "#666" }}>Registro: {result.doctor.registration}</p>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
            borderLeft: "6px solid #df3c3c",
          }}
        >
          <h1
            style={{
              fontFamily: "Montserrat",
              color: "#df3c3c",
              marginBottom: 16,
            }}
          >
            Documento no válido
          </h1>
          <p style={{ color: "#666" }}>
            El documento con ID {id} no pudo ser verificado.
          </p>
        </div>
      )}
    </div>
  );
}
