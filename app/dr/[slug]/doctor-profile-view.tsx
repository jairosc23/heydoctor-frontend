"use client";

import React from "react";
import Link from "next/link";
import type { DoctorProfile, RatingsResponse } from "@/lib/services/doctor-profiles";

const TEAL = "#078a92";

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
    <span style={{ color: "#f59e0b", fontSize: 18, letterSpacing: 2 }}>
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <nav style={{ padding: "16px 32px", borderBottom: "1px solid #e2e8f0" }}>
        <Link href="/" style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 22, color: TEAL, textDecoration: "none" }}>
          HeyDoctor
        </Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${TEAL}, #0ea5e9)`,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 36,
              fontFamily: "Montserrat",
              fontWeight: 700,
            }}
          >
            {doctor.name.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: "Montserrat", color: "#1e293b", fontSize: 28, margin: "0 0 4px" }}>
            {doctor.name}
          </h1>
          <p style={{ color: TEAL, fontWeight: 600, fontSize: 16, margin: "0 0 8px" }}>
            {doctor.specialty}
          </p>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 12px" }}>
            {doctor.country}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <StarRating value={Number(doctor.rating)} />
            <span style={{ color: "#475569", fontSize: 14 }}>
              {Number(doctor.rating).toFixed(1)} ({doctor.ratingCount} valoraciones)
            </span>
          </div>

          {doctor.bio && (
            <p style={{ color: "#475569", fontSize: 15, marginTop: 16, lineHeight: 1.6 }}>
              {doctor.bio}
            </p>
          )}

          <Link
            href="/consultar"
            style={{
              display: "inline-block",
              marginTop: 20,
              padding: "12px 32px",
              background: TEAL,
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Hablar con médico ahora
          </Link>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>
            Valoraciones de pacientes
          </h2>

          {!ratings || ratings.ratings.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              Aún no hay valoraciones para este doctor.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ratings.ratings.map((r) => (
                <div
                  key={r.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>
                      {r.patientName}
                    </span>
                    <StarRating value={r.rating} />
                  </div>
                  {r.comment && (
                    <p style={{ color: "#475569", fontSize: 14, margin: "8px 0 0", lineHeight: 1.5 }}>
                      {r.comment}
                    </p>
                  )}
                  <p style={{ color: "#94a3b8", fontSize: 12, margin: "4px 0 0" }}>
                    {new Date(r.createdAt).toLocaleDateString("es")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
