"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlobalAddressFields } from "@/components/global-address";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  createEmptyAddressSelection,
  getCountryLabel,
  type AddressSelection,
} from "@/lib/global-address-engine";
import { submitDoctorApplication } from "@/lib/services/doctor-applications";

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100";

const FIELD =
  "min-h-12 rounded-lg border-hd-border-default px-3 py-3 text-base text-primaryDark focus:border-primary focus:ring-2 focus:ring-primaryLight";

const SPECIALTIES = [
  "Medicina General",
  "Pediatría",
  "Dermatología",
  "Cardiología",
  "Ginecología",
  "Psiquiatría",
  "Nutrición",
  "Endocrinología",
  "Neurología",
  "Otra",
];

/** Preserve legacy apply payload labels for known codes (API still receives display names). */
function countryPayloadLabel(code: string): string {
  if (code === "OTHER") return "Otro";
  return getCountryLabel(code, "es") || code;
}

export default function DoctorApplyPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [address, setAddress] = useState<AddressSelection>(() =>
    createEmptyAddressSelection(""),
  );
  const [licenseUrl, setLicenseUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitDoctorApplication({
        name: name.trim(),
        email: email.trim(),
        specialty,
        country: countryPayloadLabel(address.countryCode),
        licenseUrl: licenseUrl.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hd-surface-base px-4 py-12">
        <Card className="w-full max-w-md text-center shadow-premium">
          <BrandLogo markOnly markSize={72} priority className="mx-auto mb-6" />
          <div className="mb-4 text-4xl font-bold text-primary" aria-hidden>
            ✓
          </div>
          <h1
            className="mb-3 text-[28px] font-bold text-primary"
            style={{ fontFamily: FONT_HEADING }}
          >
            Solicitud enviada
          </h1>
          <p className="mb-6 text-base leading-relaxed text-primaryDark/70">
            Gracias por tu interés en unirte a HeyDoctor. Revisaremos tu solicitud
            y te contactaremos por correo electrónico en las próximas 48 horas.
          </p>
          <Button href="/" variant="primary" className={`w-full min-h-12 ${CTA_PRIMARY}`}>
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hd-surface-base pb-[env(safe-area-inset-bottom)]">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 min-h-10 items-center rounded-lg border border-primary bg-hd-surface-chrome px-5 text-sm font-medium text-primary no-underline transition-colors duration-hd-base hover:bg-primaryLight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{ fontFamily: FONT_HEADING }}
          >
            Iniciar sesión
          </Link>
        </Container>
      </header>

      <main className="py-8 sm:py-12">
        <Container className="max-w-xl">
          <div className="mb-8 text-center">
            <h1
              className="mb-3 text-3xl font-bold tracking-tight text-primary"
              style={{ fontFamily: FONT_HEADING }}
            >
              Únete a HeyDoctor
            </h1>
            <p className="mx-auto max-w-md text-base leading-relaxed text-primaryDark/70">
              Atiende pacientes en línea, gestiona tu agenda y haz crecer tu
              práctica médica con la plataforma de telemedicina líder.
            </p>
          </div>

          <Card className="p-6 shadow-premium sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field label="Nombre completo" required htmlFor="apply-name">
                <Input
                  id="apply-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Dr. Juan Pérez"
                  disabled={submitting}
                  className={FIELD}
                />
              </Field>

              <Field label="Correo electrónico" required htmlFor="apply-email">
                <Input
                  id="apply-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="doctor@email.com"
                  disabled={submitting}
                  className={FIELD}
                />
              </Field>

              <Field label="Especialidad" required htmlFor="apply-specialty">
                <select
                  id="apply-specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  disabled={submitting}
                  className={`w-full outline-none transition-all duration-200 disabled:opacity-60 ${FIELD}`}
                >
                  <option value="">Seleccionar...</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <GlobalAddressFields
                value={address}
                onChange={setAddress}
                disabled={submitting}
                showAdminLevels={false}
                showStreetFields={false}
                residenceCountryLabel="País"
                residenceCountryRequired
                idPrefix="apply-address"
                selectStyle={{
                  minHeight: 48,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  padding: "12px",
                  fontSize: 16,
                }}
              />

              <Field label="URL de licencia médica (opcional)" htmlFor="apply-license">
                <Input
                  id="apply-license"
                  type="url"
                  value={licenseUrl}
                  onChange={(e) => setLicenseUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  disabled={submitting}
                  className={FIELD}
                />
              </Field>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className={`w-full min-h-12 text-base ${CTA_PRIMARY}`}
              >
                {submitting ? "Enviando solicitud..." : "Enviar solicitud"}
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-[13px] text-primaryDark/60">
            Al enviar tu solicitud aceptas nuestros{" "}
            <Link href="/terms" className="font-semibold text-primary hover:underline">
              Términos
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </Container>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-semibold text-primaryDark"
        style={{ fontFamily: FONT_HEADING }}
      >
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {children}
    </div>
  );
}
