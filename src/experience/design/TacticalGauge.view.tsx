import React from "react";

interface TacticalGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  history?: number[]; // Historique des 24 derniers ticks
  warningThreshold?: number; // Ex: 30%
  criticalThreshold?: number; // Ex: 15%
  invertThresholds?: boolean; // Si la jauge est dangereuse quand elle monte (ex: Stress, Déchets)
  accentColor?: string; // Classe couleur ou hex
  compact?: boolean;
}

export function TacticalGauge({
  label,
  value,
  max,
  unit,
  history = [],
  warningThreshold = 30,
  criticalThreshold = 15,
  invertThresholds = false,
  accentColor = "text-cyan-400",
  compact = false,
}: TacticalGaugeProps) {
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  // Calcul du statut de sévérité basé sur les seuils physiques
  let statusColor = accentColor;
  let barBg = "bg-cyan-500";
  let isWarning = false;
  let isCritical = false;

  if (invertThresholds) {
    if (pct >= (100 - criticalThreshold)) {
      statusColor = "text-rose-500";
      barBg = "bg-rose-500";
      isCritical = true;
    } else if (pct >= (100 - warningThreshold)) {
      statusColor = "text-amber-400";
      barBg = "bg-amber-400";
      isWarning = true;
    }
  } else {
    if (pct <= criticalThreshold) {
      statusColor = "text-rose-500";
      barBg = "bg-rose-500";
      isCritical = true;
    } else if (pct <= warningThreshold) {
      statusColor = "text-amber-400";
      barBg = "bg-amber-400";
      isWarning = true;
    }
  }

  // Micro-courbe sparkline SVG (24 derniers ticks)
  const sparklineData = history.slice(-24);
  const sparkWidth = 60;
  const sparkHeight = 14;
  let sparkPoints = "";

  if (sparklineData.length > 1) {
    const minH = Math.min(...sparklineData, 0);
    const maxH = Math.max(...sparklineData, max || 1);
    const range = maxH - minH || 1;
    sparkPoints = sparklineData
      .map((val, idx) => {
        const x = (idx / (sparklineData.length - 1)) * sparkWidth;
        const y = sparkHeight - ((val - minH) / range) * (sparkHeight - 2) - 1;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <div className={`flex flex-col gap-1 w-full font-mono ${compact ? "text-[11px]" : "text-xs"}`}>
      {/* Header : Libellé en petites capitales + Valeur tabulaire + Unité */}
      <div className="flex items-center justify-between text-slate-300">
        <span className="uppercase tracking-wider font-semibold text-slate-400 text-[10px]">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`font-bold tabular-nums text-sm ${statusColor}`}>
            {typeof value === "number" ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
          </span>
          <span className="text-[10px] text-slate-500 font-normal">{unit}</span>
        </div>
      </div>

      {/* Barre physique fine avec graduations de seuil et sparkline en filigrane */}
      <div className="relative w-full h-2 bg-slate-900/90 rounded-sm overflow-hidden border border-white/[0.08] flex items-center">
        {/* Micro sparkline en arrière-plan discret */}
        {sparkPoints && (
          <svg
            className="absolute right-1 inset-y-0 h-full w-[60px] opacity-25 pointer-events-none"
            viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className={statusColor}
              points={sparkPoints}
            />
          </svg>
        )}

        {/* Jauge active */}
        <div
          className={`h-full ${barBg} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />

        {/* Marqueur physique Seuil Alerte */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400/70 z-10"
          style={{ left: `${invertThresholds ? 100 - warningThreshold : warningThreshold}%` }}
          title={`Seuil Alerte (${warningThreshold}%)`}
        />

        {/* Marqueur physique Seuil Critique */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10"
          style={{ left: `${invertThresholds ? 100 - criticalThreshold : criticalThreshold}%` }}
          title={`Seuil Critique (${criticalThreshold}%)`}
        />
      </div>

      {/* Statut sous la jauge si anomalie */}
      {(isWarning || isCritical) && (
        <div className={`text-[9px] font-semibold tracking-wider flex items-center gap-1 ${statusColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {isCritical ? "SEUIL CRITIQUE DÉPASSÉ" : "VIGILANCE SYSTÈME"}
        </div>
      )}
    </div>
  );
}
