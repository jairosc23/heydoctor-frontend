"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const QR_SIZE = 200;

type WhatsAppQRProps = {
  url: string;
  caption?: string;
};

/**
 * QR con la misma URL que el botón de WhatsApp. Client-only (generación en navegador).
 */
export function WhatsAppQR({
  url,
  caption = "Escanea para agendar tu hora",
}: WhatsAppQRProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: QR_SIZE,
      margin: 2,
      color: { dark: "#111111", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((data) => {
        if (!cancelled) {
          setDataUrl(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          minWidth: QR_SIZE,
          minHeight: QR_SIZE,
          width: QR_SIZE,
          height: QR_SIZE,
          background: "#f3f4f6",
          borderRadius: 12,
          border: "2px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            width={QR_SIZE}
            height={QR_SIZE}
            alt=""
            style={{ display: "block", borderRadius: 8 }}
          />
        ) : (
          <span style={{ color: "#6b7280", fontSize: 14, padding: 16, textAlign: "center" }}>
            Cargando código…
          </span>
        )}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: "#1a1a1a",
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 1.4,
        }}
      >
        {caption}
      </p>
    </div>
  );
}
