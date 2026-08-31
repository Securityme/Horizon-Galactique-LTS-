import React from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import {
  Thermometer,
  Wind,
  Cloud,
  Sun,
  Zap,
  ShieldAlert,
  Droplets,
  Activity,
  X,
  Compass,
  AlertTriangle,
  Globe,
  Sparkles,
} from "lucide-react";

interface ClimateWeatherModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
}

export function ClimateWeatherModal({ gameState, theme, onClose }: ClimateWeatherModalProps) {
  const isLight = theme.isLight ?? false;
  const climate = gameState.climate;

  const terraformingIndex = Math.min(
    100,
    Math.round(
      (climate.surface_temp_c + 50) * 0.4 +
        climate.atmosphere_p_atm * 20 +
        (climate.silica_storm_active ? 0 : 15)
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className={`border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl font-mono animate-in zoom-in-95 duration-200 ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/10"
            : "bg-slate-950 border-sky-500/40 text-slate-100"
        }`}
      >
        {/* Header Modal */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/80 border-white/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold shadow-md ${
                isLight
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : "border-amber-500/50 bg-amber-950/40 text-amber-300 shadow-amber-500/20"
              }`}
            >
              <Wind className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div
                className={`text-base font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}
              >
                Station Météo & Climatologie Extérieure
              </div>
              <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Données télémétriques atmosphériques et indice d'habitabilité
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onClose();
            }}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs scroll-smooth-touch">
          {/* Status Banner */}
          {climate.silica_storm_active ? (
            <div className="p-3.5 bg-amber-950/80 border border-amber-500/60 rounded-xl text-amber-200 flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-sm text-amber-300">
                  TEMPÊTE DE SILICE EN COURS
                </div>
                <div className="text-[11px] opacity-90">
                  Particules abrasives en suspension. Rendement des panneaux solaires -35%, usure accrue des filtres à air.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-sm text-emerald-300">
                  CONDITIONS ATMOSPHÉRIQUES STABLES
                </div>
                <div className="text-[11px] opacity-90">
                  Vents de régolithe calmes. Production énergétique nominale et pression régulée sous les dômes.
                </div>
              </div>
            </div>
          )}

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`p-3.5 rounded-xl border space-y-1 ${
                isLight ? "bg-amber-50 border-amber-200" : "bg-black/60 border-white/10"
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Thermometer className="w-4 h-4" /> Température Surface
              </div>
              <div className="text-2xl font-bold text-amber-500">
                {climate.surface_temp_c} °C
              </div>
              <div className="text-[10px] text-slate-400">
                Gradient nocturne : -45 °C · Gradient diurne : +32 °C
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border space-y-1 ${
                isLight ? "bg-sky-50 border-sky-200" : "bg-black/60 border-white/10"
              }`}
            >
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                <Wind className="w-4 h-4" /> Pression Atmosphérique
              </div>
              <div className="text-2xl font-bold text-sky-400">
                {climate.atmosphere_p_atm} atm
              </div>
              <div className="text-[10px] text-slate-400">
                Dôme pressurisé : 1.00 atm N₂/O₂ respirable
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border space-y-1 ${
                isLight ? "bg-purple-50 border-purple-200" : "bg-black/60 border-white/10"
              }`}
            >
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                <Globe className="w-4 h-4" /> Indice de Terraformation
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {terraformingIndex} %
              </div>
              <div className="text-[10px] text-slate-400">
                Potentiel biosphérique global de l'exoplanète
              </div>
            </div>
          </div>

          {/* Atmospheric Composition */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isLight ? "bg-white border-slate-300" : "bg-slate-900/60 border-white/10"
            }`}
          >
            <div className="font-bold text-sky-400 flex items-center gap-2">
              <Activity className="w-4 h-4" /> ANALYSE SPECTROMÉTRIQUE DE L'AIR
            </div>
            <div className="space-y-2">
              {[
                { gas: "Azote (N₂)", pct: 76.4, color: "bg-sky-500" },
                { gas: "Dioxyde de Carbone (CO₂)", pct: 17.8, color: "bg-amber-500" },
                { gas: "Argon & Gaz Rares (Ar)", pct: 4.2, color: "bg-purple-500" },
                { gas: "Traces d'Oxygène (O₂)", pct: 1.6, color: "bg-emerald-500" },
              ].map((g, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{g.gas}</span>
                    <span className="font-bold text-slate-100">{g.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${g.color}`} style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
