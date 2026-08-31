import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import {
  Cpu,
  Bot,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  X,
  Sparkles,
  Layers,
  Wrench,
  Gauge,
  Power,
  RefreshCw,
} from "lucide-react";

interface NiaMatrixModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
  onSetNiaMode: (mode: "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF") => void;
}

export function NiaMatrixModal({
  gameState,
  theme,
  onClose,
  onSetNiaMode,
}: NiaMatrixModalProps) {
  const isLight = theme.isLight ?? false;
  const spec = gameState.genesis.pillar_3_specialization;
  const currentMode = gameState.niaMode || "REGULE";

  const [delegations, setDelegations] = useState({
    energy: true,
    construction: currentMode === "AUTO",
    defense: true,
    repair: true,
    resources: true,
  });

  const toggleDelegation = (key: keyof typeof delegations) => {
    proceduralRadio.playUIChime("CLICK");
    setDelegations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const niaModesInfo = [
    {
      id: "AUTO" as const,
      label: "MODE AUTO",
      tagline: "Autonomie Totale",
      desc: "La N.I.A. initie les constructions, alloue l'énergie et répare les dômes sans approbation préalable.",
      color: "border-purple-500 text-purple-300 bg-purple-950/40",
      activeBg: "bg-purple-600 text-white border-purple-400",
    },
    {
      id: "REGULE" as const,
      label: "MODE RÉGULÉ",
      tagline: "Assistance & Équilibrage",
      desc: "La N.I.A. régule les consommations et répare les avaries, mais requiert confirmation pour les nouvelles extensions.",
      color: "border-sky-500 text-sky-300 bg-sky-950/40",
      activeBg: "bg-sky-600 text-white border-sky-400",
    },
    {
      id: "SEMI_MANUEL" as const,
      label: "SEMI-MANUEL",
      tagline: "Surveillance Passive",
      desc: "La N.I.A. fournit des diagnostics de télémétrie mais n'effectue aucune action corrective automatique.",
      color: "border-amber-500 text-amber-300 bg-amber-950/40",
      activeBg: "bg-amber-600 text-white border-amber-400",
    },
    {
      id: "OFF" as const,
      label: "MODE OFF / DÉSACTIVÉ",
      tagline: "Arrêt des Réseaux",
      desc: "Arrêt complet des sous-routines N.I.A. Économise 15 GW d'énergie mais désactive la prévention d'urgence.",
      color: "border-rose-500 text-rose-300 bg-rose-950/40",
      activeBg: "bg-rose-600 text-white border-rose-400",
    },
  ];

  const autoQueueItems = gameState.buildQueue.filter((item) => item.auto_built_by_nia);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className={`border rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl font-mono animate-in zoom-in-95 duration-200 ${
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
                  ? "border-sky-500 bg-sky-100 text-sky-900"
                  : "border-sky-500/50 bg-sky-950/50 text-sky-300 shadow-sky-500/20"
              }`}
            >
              <Cpu className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div
                className={`text-base font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}
              >
                Matrice d'IA Synthétique [{spec.ai_acronym || "N.I.A."}]
              </div>
              <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {spec.ai_full_name || "Nodul-Intelligence Archonte"} · Télémétrie et Régulation Directe
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
          {/* Active Mode Quick Switcher Grid */}
          <div className="space-y-2">
            <div className="font-bold text-sky-400 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Power className="w-4 h-4" /> SELECTION DU MODE OPÉRATIONNEL N.I.A.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {niaModesInfo.map((mode) => {
                const isSelected = currentMode === mode.id;
                return (
                  <div
                    key={mode.id}
                    onClick={() => {
                      onSetNiaMode(mode.id);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? isLight
                          ? "bg-sky-50 border-sky-500 shadow-md ring-1 ring-sky-400"
                          : `${mode.color} ring-1 ring-sky-400 shadow-sky-500/10`
                        : isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{mode.label}</span>
                        {isSelected && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-extrabold uppercase">
                            ACTIF
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold opacity-75">{mode.tagline}</div>
                    </div>

                    <p className="text-[11px] leading-relaxed opacity-90 font-normal">
                      {mode.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subroutines & Delegations */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isLight ? "bg-white border-slate-300" : "bg-slate-900/60 border-white/10"
            }`}
          >
            <div className="font-bold text-sky-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> DÉLÉGATIONS TECHNIQUE & DELEGATION DE DOMAINE
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: "energy", label: "Régulation du Réseau Énergétique (MW)", desc: "Ajuste automatiquement les générateurs en cas de surcharge" },
                { key: "construction", label: "Chantiers Autonomes (Auto-Build)", desc: "Construit des dômes dès que les ressources accumulées le permettent" },
                { key: "defense", label: "Activation des Boucliers d'Urgence", desc: "Déploie les pare-tempêtes lors des tempêtes de silice" },
                { key: "repair", label: "Maintenance & Réparations Automatiques", desc: "Alloue des alliages pour réparer les bâtiments sous 50% d'intégrité" },
                { key: "resources", label: "Optimisation de la Biomasse & H₂O", desc: "Régule la consommation des filtres atmosphériques" },
              ].map((item) => {
                const isChecked = delegations[item.key as keyof typeof delegations];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleDelegation(item.key as keyof typeof delegations)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      isChecked
                        ? isLight
                          ? "bg-sky-50 border-sky-300 text-sky-950 font-bold"
                          : "bg-sky-950/40 border-sky-500/40 text-sky-200 font-bold"
                        : "bg-slate-950/20 border-white/5 text-slate-500"
                    }`}
                  >
                    <div>
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] opacity-75 font-normal">{item.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ml-2 ${
                        isChecked ? "bg-sky-500 border-sky-400 text-white" : "border-slate-600"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* N.I.A. Auto-Build Monitor */}
          <div className="space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <Wrench className="w-4 h-4" /> CHANTIERS DÉCLENCHÉS PAR LA N.I.A. ({autoQueueItems.length})
            </div>

            {autoQueueItems.length === 0 ? (
              <div className="p-3.5 text-center text-slate-400 italic bg-black/40 rounded-xl border border-white/5">
                Aucun chantier en cours initié par la N.I.A. (Mode actuel : {currentMode})
              </div>
            ) : (
              <div className="space-y-2">
                {autoQueueItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-900/80 border border-amber-500/30 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-amber-300">{item.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Secteur {item.position.sector_id} [{item.position.z}] · Progression : {item.progress_ticks}/{item.total_duration_ticks} Ticks
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${Math.round((item.progress_ticks / Math.max(1, item.total_duration_ticks)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
