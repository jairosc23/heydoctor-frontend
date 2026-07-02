import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HeyDoctor — Consulta médica online";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #024955 0%, #078a92 55%, #0f172a 100%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              border: "1px solid rgba(167, 243, 208, 0.55)",
              borderRadius: "999px",
              color: "#ccfbf1",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 5,
              padding: "12px 22px",
              textTransform: "uppercase",
              width: "max-content",
            }}
          >
            HeyDoctor
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 0.95, maxWidth: 920 }}>
              Consulta médica online inmediata
            </div>
            <div style={{ color: "#e0f2fe", fontSize: 32, lineHeight: 1.25, maxWidth: 860 }}>
              Telemedicina · IA clínica gobernada · PHI-safe
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
