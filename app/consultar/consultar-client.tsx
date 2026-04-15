"use client";

import React, { useState } from "react";
import Link from "next/link";
import HeyDoctorLogo from "@/components/ui/HeyDoctorLogo";
import { useRouter } from "next/navigation";
import type { DoctorProfile } from "@/lib/services/doctor-profiles";

const TEAL = "#078a92";

export function ConsultarClient({
  initialDoctors,
}: {
  initialDoctors: DoctorProfile[];
}) {
  const router = useRouter();
  const [doctors] = useState<DoctorProfile[]>(initialDoctors);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const params = new URLSearchParams({
      name: name.trim(),
      email: email.trim(),
      reason: reason.trim(),
      ...(selectedDoctor ? { doctor: selectedDoctor } : {}),
      redirect: "/panel/consultas",
    });

    router.push(`/register?${params.toString()}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)" }}>
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline"
            style={{ fontFamily: "Montserrat", color: TEAL }}
          >
            <HeyDoctorLogo size={36} priority />
            <span className="text-lg font-semibold tracking-tight">HeyDoctor</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-semibold no-underline hover:underline" style={{ color: TEAL }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="mb-6 flex w-full justify-center items-center">
            <HeyDoctorLogo size={72} priority />
          </div>
          <h1 style={{ fontFamily: "Montserrat", color: TEAL, fontSize: 36, marginBottom: 12 }}>
            Consulta médica online
          </h1>
          <p style={{ color: "#475569", fontSize: 18, lineHeight: 1.6 }}>
            Conecta con un especialista en minutos. Atención profesional
            desde la comodidad de tu hogar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={labelStyle}>
                Tu nombre <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nombre completo"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Correo electrónico <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Motivo de la consulta <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Describe brevemente tus síntomas o la razón de tu consulta..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {doctors.length > 0 && (
              <div>
                <label style={labelStyle}>Seleccionar especialista (opcional)</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Primer disponible</option>
                  {doctors.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name} — {d.specialty}{" "}
                      {d.rating > 0 ? `(${Number(d.rating).toFixed(1)})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              }}
            >
              {submitting ? "Preparando..." : "Agendar consulta"}
            </button>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            &iquest;Eres médico?{" "}
            <Link href="/for-doctors/apply" style={{ color: TEAL, fontWeight: 600 }}>
              Únete a HeyDoctor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  display: "block",
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
};
