import React, { useEffect, useRef } from "react";
import { proceduralRadio } from "./proceduralAudioEngine";

interface SpectrumVisualizerProps {
  height?: number;
  barColor?: string;
  className?: string;
}

export function SpectrumVisualizer({
  height = 24,
  barColor = "#00d4ff",
  className = "",
}: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const freqData = new Uint8Array(32);

    const draw = () => {
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = height);

      ctx.clearRect(0, 0, w, h);

      proceduralRadio.getByteFrequencyData(freqData);

      const barCount = 18;
      const barSpacing = 2;
      const totalSpacing = (barCount - 1) * barSpacing;
      const barWidth = Math.max(2, (w - totalSpacing) / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i * 1] || 0;
        const normalized = val / 255;
        const barH = Math.max(2, normalized * (h - 2));

        const x = i * (barWidth + barSpacing);
        const y = h - barH;

        ctx.fillStyle = barColor;
        ctx.globalAlpha = 0.3 + normalized * 0.7;
        ctx.fillRect(x, y, barWidth, barH);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [height, barColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ height: `${height}px` }}
      className={`w-full block ${className}`}
    />
  );
}
