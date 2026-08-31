import React, { useState } from "react";
import { GameState } from "../../../simulation/engine";
import { NiaOperatingMode, NiaDomainDelegation } from "./config.type";

interface SimulationSectionProps {
  gameState: GameState | null;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  onResetToDefaults: () => void;
}

export function SimulationSection({
  gameState,
  onSpeedChange,
  onResetToDefaults,
}: SimulationSectionProps) {
  const [niaMode, setNiaMode] = useState<NiaOperatingMode>("REGULE");
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [delegation, setDelegation] = useState<NiaDomainDelegation>({
    energy: true,
    biosphere: true,
    population: false,
    industry: true,
    defense: false,
  });

  const speedMultipliers = [
    { label: "x0 PAUSE", mult: 1, pause: true },
    { label: "x1 NOMINAL", mult: 1, pause: false },
    { label: "x2 RAPIDE", mult: 2, pause: false },
    { label: "x5 TACTIQUE", mult: 5, pause: false },
    { label: "x20 STRATÉGIQUE", mult: 20, pause: false },
  ];

  const currentSpeed = gameState?.clock.speedMultiplier || 1;
  const isPaused = !!gameState?.clock.isPaused;

  const handleCopySeed = () => {
    if (!gameState) return;
    navigator.clipboard.writeText(String(gameState.genesis.master_seed));
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const toggleDomain = (domain: keyof NiaDomainDelegation) => {
    setDelegation((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  const niaModesInfo: Record<
    NiaOperatingMode,
    { name: string; desc: string; powerMw: number }
  > = {
    AUTO: {
      name: "AUTO (Autonomie Totale)",
      desc: "La N.I.A. prend toutes les décisions de maintenance et réaffectations.",
      powerMw: 120,
    },
    REGULE: {
      name: "RÉGULÉ (Délégation Ciblée)",
      desc: "La N.I.A. gère les secteurs délégués par la matrice ci-dessous.",
      powerMw: 60,
    },
    SEMI_MANUEL: {
      name: "SEMI-MANUEL (Assistance Passive)",
      desc: "Recommandations et alertes uniquement, aucune action autonome.",
      powerMw: 25,
    },
    OFF: {
      name: "OFF (Déconnexion Totale)",
      desc: "Aucune assistance N.I.A. Zéro consommation énergétique.",
      powerMw: 0,
    },
  };

  return (
    <div className="space-y-6 text-xs font-mono">
      {/* 1. Vitesse d'Exécution & Invariant Déterministe */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400">
            1. Cadence d'Évolution Temporelle
          </h3>
          <span className="text-[10px] text-slate-400">
            1 Sol = 24 Ticks · 1 Tick = 1s réelle à x1
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mb-3 bg-slate-950/60 p-2.5 rounded border border-white/[0.06] leading-relaxed">
          <strong className="text-cyan-300">Invariant Déterministe :</strong> La cadence d'horloge n'altère en rien l'issue mathématique de la simulation. Tout état à <code className="text-white">Sol N</code> est strictement identique quelle que soit la vitesse choisie.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {speedMultipliers.map((sp) => {
            const isSelected = sp.pause ? isPaused : !isPaused && currentSpeed === sp.mult;
            return (
              <button
                key={sp.label}
                onClick={() => onSpeedChange(sp.mult, sp.pause)}
                className={`py-2 px-3 rounded font-bold text-xs transition-all border ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-950/50"
                    : "bg-slate-950/70 text-slate-300 border-white/[0.08] hover:border-white/[0.25]"
                }`}
              >
                {sp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mode Opérationnel N.I.A. & Consommation Énergétique */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400">
            2. Matrice N.I.A. & Niveaux d'Autonomie
          </h3>
          <span className="text-[10px] text-amber-400 font-bold">
            Consommation : {niaModesInfo[niaMode].powerMw} MW
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {(["AUTO", "REGULE", "SEMI_MANUEL", "OFF"] as NiaOperatingMode[]).map((mode) => {
            const info = niaModesInfo[mode];
            const isSelected = niaMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setNiaMode(mode)}
                className={`p-3 rounded border text-left transition-all ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/40 text-slate-100 ring-1 ring-cyan-400/40"
                    : "border-white/[0.08] bg-slate-950/50 text-slate-400 hover:border-white/[0.2]"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-200">{info.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {info.powerMw} MW
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{info.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Matrice de délégation par domaine si REGULE */}
        {niaMode === "REGULE" && (
          <div className="p-3 rounded bg-slate-950/80 border border-cyan-500/20 animate-in fade-in duration-200">
            <div className="text-[10px] uppercase font-bold text-cyan-300 mb-2">
              Délégation Sectorielle N.I.A. (Mode Régulé)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "energy", label: "Énergie" },
                { id: "biosphere", label: "Biosphère" },
                { id: "population", label: "Population" },
                { id: "industry", label: "Industrie" },
                { id: "defense", label: "Défense" },
              ].map((d) => {
                const active = delegation[d.id as keyof NiaDomainDelegation];
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleDomain(d.id as keyof NiaDomainDelegation)}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold uppercase transition-all border ${
                      active
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                        : "bg-slate-900 text-slate-500 border-white/[0.06]"
                    }`}
                  >
                    {d.label} : {active ? "ON" : "OFF"}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Matricule Ligne Temporelle & Realism-Flex */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Matricule Seed */}
        <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50 flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-200 mb-1">Matricule de Ligne Temporelle (Seed)</div>
            <p className="text-[10px] text-slate-400 mb-3">
              Identifiant cryptographique déterministe de votre univers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-2 rounded bg-slate-950 border border-white/[0.08] text-[11px] text-cyan-300 font-mono truncate">
              {gameState?.genesis.master_seed ?? "SEED-PRIME-001"}
            </div>
            <button
              onClick={handleCopySeed}
              className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px] uppercase transition-all shrink-0 border border-white/[0.1]"
            >
              {copiedSeed ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>

        {/* Garde-Fou Realism-Flex */}
        <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50 flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-200 mb-1">Garde-Fou Realism-Flex</div>
            <p className="text-[10px] text-slate-400 mb-3">
              Protection thermique et régulation automatique en début d'ère.
            </p>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-white/[0.08] text-[11px] flex justify-between items-center">
            <span className="text-slate-400">Statut :</span>
            <span className="text-emerald-400 font-bold">ACTIF (Protection Sol 0 - 30)</span>
          </div>
        </div>
      </div>

      {/* Bouton de réinitialisation */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onResetToDefaults}
          className="px-3 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] uppercase font-semibold transition-all border border-white/[0.06]"
        >
          Rétablir les valeurs canoniques (Simulation)
        </button>
      </div>
    </div>
  );
}
