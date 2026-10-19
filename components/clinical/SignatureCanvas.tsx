"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { pointerToCanvasPoint } from "./signature-canvas-geometry";

interface SignatureCanvasProps {
  /** Legal consultation close — must call POST /consultations/:id/sign (or page handleSign). */
  onSign: (base64: string) => void | Promise<void>;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function SignatureCanvas({
  onSign,
  disabled = false,
  width = 500,
  height = 200,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [getCtx, width, height]);

  function getPos(
    e: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const bitmap = { width: canvas.width, height: canvas.height };
    if ("touches" in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return pointerToCanvasPoint(touch.clientX, touch.clientY, rect, bitmap);
    }
    return pointerToCanvasPoint(e.clientX, e.clientY, rect, bitmap);
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return;
    const ctx = getCtx();
    const pos = getPos(e);
    if (!ctx || !pos) return;
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing || disabled) return;
    const ctx = getCtx();
    const pos = getPos(e);
    if (!ctx || !pos) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasContent(true);
  }

  function handleEnd() {
    setDrawing(false);
  }

  function handleClear() {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    setHasContent(false);
  }

  async function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent || disabled) return;
    const base64 = canvas.toDataURL("image/png");
    try {
      await onSign(base64);
    } catch {
      // Parent surfaces the error (saveMsg / Close HITL audit). Keep canvas usable.
    }
  }

  return (
    <div>
      <div
        style={{
          border: "2px solid #cbd5e1",
          borderRadius: 8,
          overflow: "hidden",
          display: "inline-block",
          touchAction: "none",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ display: "block", width: "100%", maxWidth: width, height, cursor: disabled ? "not-allowed" : "crosshair" }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
      <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 0 0" }}>
        Dibuje su firma dentro del recuadro
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || !hasContent}
          style={{
            padding: "8px 16px",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 13,
          }}
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={disabled || !hasContent}
          data-testid="signature-confirm-button"
          style={{
            padding: "8px 16px",
            background: "#078a92",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: disabled || !hasContent ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {disabled ? "Firmando…" : "Firmar consulta"}
        </button>
      </div>
    </div>
  );
}
