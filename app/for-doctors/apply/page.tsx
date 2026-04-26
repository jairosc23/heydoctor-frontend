"use client";

import React, { useState } from "react";
import Link from "next/link";
import { submitDoctorApplication } from "@/lib/services/doctor-applications";

const TEAL = "#078a92";

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

const COUNTRIES = [
  "Chile",
  "México",
  "Colombia",
  "Argentina",
  "Perú",
  "España",
  "Otro",
];

export default function DoctorApplyPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [country, setCountry] = useState("");
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
        country,
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
      <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x2705;</div>
          <h1 style={{ fontFamily: "Montserrat", color: "#166534", fontSize: 28, marginBottom: 12 }}>
            Solicitud enviada
          </h1>
          <p style={{ color: "#15803d", fontSize: 16, lineHeight: 1.6 }}>
            Gracias por tu interés en unirte a HeyDoctor. Revisaremos tu solicitud
            y te contactaremos por correo electrónico en las próximas 48 horas.
          </p>
          <Link
            href="/"
            style={{ display: "inline-block", marginTop: 24, padding: "12px 32px", background: TEAL, color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)" }}>
      <nav style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 22, color: TEAL, textDecoration: "none" }}>
          HeyDoctor
        </Link>
        <Link href="/login" style={{ color: TEAL, fontWeight: 600, textDecoration: "none" }}>
          Iniciar sesión
        </Link>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontFamily: "Montserrat", color: TEAL, fontSize: 32, marginBottom: 8, textAlign: "center" }}>
          Únete a HeyDoctor
        </h1>
        <p style={{ color: "#475569", fontSize: 16, textAlign: "center", marginBottom: 32, lineHeight: 1.6 }}>
          Atiende pacientes en línea, gestiona tu agenda y haz crecer tu
          práctica médica con la plataforma de telemedicina líder.
        </p>

        <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Field label="Nombre completo" required>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Juan Pérez" style={inputStyle} />
            </Field>

            <Field label="Correo electrónico" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="doctor@email.com" style={inputStyle} />
            </Field>

            <Field label="Especialidad" required>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} required style={inputStyle}>
                <option value="">Seleccionar...</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="País" required>
              <select value={country} onChange={(e) => setCountry(e.target.value)} required style={inputStyle}>
                <option value="">Seleccionar...</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="URL de licencia médica (opcional)">
              <input type="url" value={licenseUrl} onChange={(e) => setLicenseUrl(e.target.value)} placeholder="https://drive.google.com/..." style={inputStyle} />
            </Field>

            {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 24px",
                background: TEAL,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Enviando solicitud..." : "Enviar solicitud"}
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#94a3b8" }}>
          Al enviar tu solicitud aceptas nuestros{" "}
          <Link href="/terms" style={{ color: TEAL }}>Términos</Link> y{" "}
          <Link href="/privacy" style={{ color: TEAL }}>Política de Privacidad</Link>.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
