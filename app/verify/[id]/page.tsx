"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { heydoctorApi } from "@/lib/heydoctor-api";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";

const FONT_HEADING = "Montserrat, sans-serif";

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
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!id) return;
    heydoctorApi.get<VerifyResult>(`/verify/${id}`, { requireAuth: false })
      .then((data) => setResult(data))
      .catch((e) => {
        if ((e as { status?: number }).status === 404) {
          setUnavailable(true);
        }
        setResult({ valid: false });
      })
      .finally(() => setLoading(false));
  }, [id]);

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
            <p className="text-primaryDark/70">Cargando verificación...</p>
          ) : unavailable ? (
            <Card className="border-l-4 border-l-primaryMid p-8 shadow-premium">
              <h1
                className="mb-4 text-2xl font-bold text-primaryMid"
                style={{ fontFamily: FONT_HEADING }}
              >
                Verificación no disponible
              </h1>
              <p className="m-0 text-primaryDark/70">
                El endpoint de verificación no está configurado en este backend.
              </p>
            </Card>
          ) : result?.valid ? (
            <Card className="border-l-4 border-l-primary p-8 shadow-premium">
              <h1
                className="mb-4 text-2xl font-bold text-primary"
                style={{ fontFamily: FONT_HEADING }}
              >
                ✓ Documento verificado
              </h1>
              <p className="mb-2 text-primaryDark/70">
                Tipo: {result.type || "—"}
              </p>
              <p className="mb-2 text-primaryDark/70">
                Fecha: {result.date ? new Date(result.date).toLocaleDateString() : "—"}
              </p>
              {result.doctor ? (
                <div className="mt-4 border-t border-hd-border-subtle pt-4">
                  <p className="m-0 font-semibold text-primaryDark">
                    {result.doctor.name}
                  </p>
                  <p className="m-0 text-primaryDark/70">{result.doctor.specialty}</p>
                  <p className="m-0 text-primaryDark/70">
                    Registro: {result.doctor.registration}
                  </p>
                </div>
              ) : null}
            </Card>
          ) : (
            <Card className="border-l-4 border-l-red-600 p-8 shadow-premium">
              <h1
                className="mb-4 text-2xl font-bold text-red-600"
                style={{ fontFamily: FONT_HEADING }}
              >
                Documento no válido
              </h1>
              <p className="m-0 text-primaryDark/70">
                El documento con ID {id} no pudo ser verificado.
              </p>
            </Card>
          )}
        </Container>
      </main>
    </div>
  );
}
