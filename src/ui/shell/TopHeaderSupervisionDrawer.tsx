import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import {
  Cpu,
  Radio,
  Satellite,
  Activity,
  Zap,
  Shield,
  Cloud,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";

interface TopHeaderSupervisionDrawerProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
  onOpenCloudModal: () => void;
}

export function TopHeaderSupervisionDrawer({
  gameState,
  theme,
  onClose,
  onOpenCloudModal,
}: TopHeaderSupervisionDrawerProps) {
  const isLight = theme.isLight ?? false;
  const [activeSubTab, setActiveSubTab] = useState<"ORBITAL_TELEMETRY" | "NIA_MATRIX" | "CLOUD_STATUS">("ORBITAL_TELEMETRY");

  return (
    <div
      className={`border-b p-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl font-mono text-xs backdrop-blur-2xl z-40 ${
        isLight
          ? "bg-white/95 text-slate-900 border-slate-300"
          : "bg-slate-950/95 text-slate-100 border-sky-500/30"
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Drawer Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
          <div className={`flex items-center gap-2 font-bold ${isLight ? "text-indigo-900" : "text-indigo-400"}`}>
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>CONSOLE DE COMMANDEMENT & SUPERVISION HAUTE DENSITÉ (ÉTAGE H3)</span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "ORBITAL_TELEMETRY", label: "Orbite & Satellites" },
              { id: "NIA_MATRIX", label: "Matrice N.I.A." },
              { id: "CLOUD_STATUS", label: "Cloud & Synchronisation" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setActiveSubTab(tab.id as any);
                }}
                className={`px-2.5 py-1 rounded text-[11px] cursor-pointer border transition-colors ${
                  activeSubTab === tab.id
                    ? isLight
                      ? "bg-indigo-100 border-indigo-400 text-indigo-900 font-bold"
                      : "bg-indigo-500/20 border-indigo-400 text-indigo-200 font-bold"
                    : isLight
                    ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900"
                    : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={onClose}
              className={`px-2 py-1 rounded border text-[10px] cursor-pointer ml-2 ${
                isLight
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10"
              }`}
            >
              ✕ Réduire H3
            </button>
          </div>
        </div>

        {/* SubTab 1: Orbital Telemetry */}
        {activeSubTab === "ORBITAL_TELEMETRY" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border space-y-1 ${isLight ? "bg-indigo-50 border-indigo-200" : "bg-black/60 border-white/10"}`}>
              <div className="text-indigo-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Satellite className="w-3.5 h-3.5" /> Satellite Relais Alpha
              </div>
              <div className="text-lg font-bold text-indigo-300">COUVERTURE 98.4%</div>
              <div className="text-[10px] text-slate-400">Canal quantique chiffré synchronisé à 12.8 Gbps</div>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${isLight ? "bg-sky-50 border-sky-200" : "bg-black/60 border-white/10"}`}>
              <div className="text-sky-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5" /> Bouclier Orbital Ionique
              </div>
              <div className="text-lg font-bold text-sky-300">NOMINAL (100%)</div>
              <div className="text-[10px] text-slate-400">Déflexion des poussières stellaires et radiations UV</div>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${isLight ? "bg-emerald-50 border-emerald-200" : "bg-black/60 border-white/10"}`}>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5" /> Télémétrie de Coquille
              </div>
              <div className="text-lg font-bold text-emerald-300">0 FISSURE RUGUEUSE</div>
              <div className="text-[10px] text-slate-400">Tous les dômes du plan Z0 sont hermétiques</div>
            </div>
          </div>
        )}

        {/* SubTab 2: N.I.A. Matrix */}
        {activeSubTab === "NIA_MATRIX" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl border space-y-1 ${isLight ? "bg-purple-50 border-purple-200" : "bg-black/60 border-white/10"}`}>
              <div className="text-purple-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Cpu className="w-3.5 h-3.5" /> Matrice Neuronale N.I.A.
              </div>
              <div className="text-lg font-bold text-purple-300">CAPACITÉ : 4.2 TFLOPS</div>
              <div className="text-[10px] text-slate-400">Analyse prospective des oracles et calculs de trajectoire</div>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${isLight ? "bg-amber-50 border-amber-200" : "bg-black/60 border-white/10"}`}>
              <div className="text-amber-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Zap className="w-3.5 h-3.5" /> Construction Autonome
              </div>
              <div className="text-lg font-bold text-amber-300">ACTIVE (3 Chantiers)</div>
              <div className="text-[10px] text-slate-400">N.I.A. gère l'expansion automatique des dômes</div>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${isLight ? "bg-cyan-50 border-cyan-200" : "bg-black/60 border-white/10"}`}>
              <div className="text-cyan-400 font-bold flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" /> Synchronisation Archonte
              </div>
              <div className="text-lg font-bold text-cyan-300">99.2% REQUIS</div>
              <div className="text-[10px] text-slate-400">Lien direct avec le profil du Primat-Archonte</div>
            </div>
          </div>
        )}

        {/* SubTab 3: Cloud Status */}
        {activeSubTab === "CLOUD_STATUS" && (
          <div className={`p-3 rounded-xl border space-y-2 flex items-center justify-between ${isLight ? "bg-emerald-50 border-emerald-300" : "bg-emerald-950/30 border-emerald-500/40"}`}>
            <div>
              <div className="font-bold text-emerald-300 flex items-center gap-2">
                <Cloud className="w-4 h-4" /> SYNCHRONISATION CLOUD FIRESTORE ACTIVE
              </div>
              <div className="text-[11px] text-slate-300">
                La sauvegarde automatique est synchronisée au Sol {gameState.clock.sol}.
              </div>
            </div>
            <button
              onClick={onOpenCloudModal}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              Gérer la Sauvegarde Cloud
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
