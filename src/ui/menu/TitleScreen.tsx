import React from "react";
import { ThemeDefinition } from "../../theme/themes";
import { GameState } from "../../simulation/engine";
import { proceduralRadio } from "../../audio/radio";
import { Play, Settings, ArrowLeft, Activity, Users, Zap, Shield, Globe, Award, Dices } from "lucide-react";

interface TitleScreenProps {
  theme: ThemeDefinition;
  gameState: GameState;
  onPlay: () => void;
  onOpenOptions: () => void;
  onBackToMainMenu: () => void;
}

export function TitleScreen({
  theme,
  gameState,
  onPlay,
  onOpenOptions,
  onBackToMainMenu,
}: TitleScreenProps) {
  const leader = gameState.genesis.pillar_1_governance.leader_profile;
  const env = gameState.genesis.pillar_2_environment;
  const sol = gameState.clock.sol;
  const pop = gameState.resources.population_active;
  const energy = Math.round(gameState.resources.energy_gw);
  const stability = Math.round(gameState.genesis.pillar_1_governance.senate_stability);
  const domeCount = gameState.buildings ? gameState.buildings.length : 1;

  return (
    <div className={`min-h-screen relative flex flex-col justify-between p-4 sm:p-8 select-none ${
      theme.isLight
        ? "bg-slate-50 text-slate-900"
        : "bg-slate-950 text-slate-100"
    }`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)]" />
      </div>

      {/* Top bar with back to menu and settings */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10 font-mono text-xs">
        <button
          onClick={() => {
            proceduralRadio.playUIChime("CLICK");
            onBackToMainMenu();
          }}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 font-bold cursor-pointer transition-all ${
            theme.isLight
              ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
              : "bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>MENU PRINCIPAL</span>
        </button>

        <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
          SÉQUENCE D'ACCREDITATION :: ÉCRAN TITRE DE LA PARTIE
        </div>

        <button
          onClick={() => {
            proceduralRadio.playUIChime("CLICK");
            onOpenOptions();
          }}
          className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 font-bold cursor-pointer transition-all ${
            theme.isLight
              ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100"
              : "bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>PARAMÈTRES</span>
        </button>
      </header>

      {/* Main Title Content */}
      <div className="w-full max-w-4xl mx-auto z-10 my-auto py-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 font-mono text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>COLONIE : {env.target_planet}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider font-sans">
            HORIZON GALACTIQUE
          </h1>
          <p className="font-mono text-sm uppercase text-slate-500 font-bold tracking-widest">
            {gameState.genesis.pillar_1_governance.regime_type} · SEED #{gameState.genesis.master_seed}
          </p>
        </div>

        {/* Stats Dashboard Grid */}
        <div className={`p-6 rounded-2xl border space-y-6 ${
          theme.isLight
            ? "bg-white border-slate-300 shadow-md shadow-slate-200"
            : "bg-slate-900/80 border-slate-800 shadow-xl shadow-slate-950"
        }`}>
          {/* Leader Profile Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                  GOUVERNEUR D'EXPÉDITION & ARCHETYPE
                </div>
                <div className="text-base font-bold font-sans">
                  {leader.name || leader.title || "Gouverneur Suprême"}
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                  <span>Alignement : {leader.philosophical_alignment || leader.mandate.archetype || "CARTESIEN"}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-bold">Stabilité Sénat : {stability}%</span>
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs text-slate-500 font-bold uppercase">CHRONOLOGIE STELLAIRE</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                SOL {sol}
              </div>
              <div className="text-[10px] text-sky-400 font-bold uppercase">
                {gameState.climate?.silica_storm_active ? "⚠ Tempête de Silice Active" : "Atmosphère Calme"}
              </div>
            </div>
          </div>

          {/* Key Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>POPULATION</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {pop.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">Actifs au sol</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>ÉNERGIE RÉSEAU</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {energy} GW
              </div>
              <div className="text-[10px] text-amber-600 font-bold">Consommation : {Math.round(gameState.resources.energy_gw * 0.8)} GW</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>OXYGÈNE / O₂</span>
                <Activity className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {Math.round(gameState.resources.oxygen_l || 15000).toLocaleString()} L
              </div>
              <div className="text-[10px] text-cyan-600 font-bold">Atmosphère pressurisée</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>STRUCTURES</span>
                <Shield className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {domeCount}
              </div>
              <div className="text-[10px] text-sky-600 font-bold">Dômes & Installations</div>
            </div>
          </div>

          {/* Planetary Parameters Banner */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">PARAMÈTRES PLANÉTAIRES :</span>
              <span className="text-slate-500">Temp: {gameState.climate?.surface_temp_c ?? 15}°C</span>
              <span>•</span>
              <span className="text-slate-500">Gravité: {gameState.genesis.pillar_2_environment.gravity_g ?? 1.0}g</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                CONCORDIA SANCTUAIRE
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold text-[10px]">
                N.I.A. DÉTERMINISTE
              </span>
            </div>
          </div>
        </div>

        {/* Big Play Button */}
        <div className="pt-2 flex flex-col items-center">
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CONFIRM");
              onPlay();
            }}
            className={`w-full max-w-md py-5 px-8 rounded-2xl font-mono text-base font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-lg cursor-pointer transition-all transform hover:scale-[1.02] ${
              theme.isLight
                ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-400/50"
                : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-900/50"
            }`}
          >
            <Play className="w-6 h-6 fill-current" />
            <span>COMMENCER LE SERVICE</span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <footer className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>Horizon Galactique v2.5.0 (Build 2026.08)</div>
        <div>Moteur Déterministe N.I.A. & Firebase Sync</div>
      </footer>
    </div>
  );
}
