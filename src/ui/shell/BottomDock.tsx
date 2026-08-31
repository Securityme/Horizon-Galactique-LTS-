import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { FooterTierState, HeaderTierState } from "../../types/genesis";
import { proceduralRadio } from "../../audio/radio";
import { PLANET_PRESETS } from "../../simulation/constants";
import {
  Building2,
  FileText,
  Compass,
  Thermometer,
  Wind,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Gauge,
  Radio,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Droplets,
  HardDrive,
  BarChart3,
  TrendingUp,
  Play,
  Pause,
} from "lucide-react";

interface BottomDockProps {
  gameState: GameState;
  theme: ThemeDefinition;
  footerState: FooterTierState;
  activeFooterTab: "COLONIE" | "JOURNAL" | "SPATIAL";
  onFooterStateChange: (state: FooterTierState) => void;
  onFooterTabChange: (tab: "COLONIE" | "JOURNAL" | "SPATIAL") => void;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  // Coordinate with 6 tabs system
  activeHeaderTab?: "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS";
  onHeaderTabChange?: (tab: "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS") => void;
  headerState?: HeaderTierState;
  onHeaderStateChange?: (state: HeaderTierState) => void;
}

export function BottomDock({
  gameState,
  theme,
  footerState,
  activeFooterTab,
  onFooterStateChange,
  onFooterTabChange,
  onSpeedChange,
  activeHeaderTab,
  onHeaderTabChange,
  headerState,
  onHeaderStateChange,
}: BottomDockProps) {
  const unresolvedEventsCount = gameState.events.filter((e) => !e.resolved).length;
  const damagedBuildingsCount = gameState.buildings.filter((b) => b.status !== "NOMINAL").length;
  const [f3ActiveSubTab, setF3ActiveSubTab] = useState<"CARACTERISTIQUES_PLANETE" | "PALLIERS_PROGRESSION" | "LOGISTIQUE_GRID" | "SURVEILLANCE_POLLUTION">("CARACTERISTIQUES_PLANETE");

  const toggleF2 = () => {
    proceduralRadio.playUIChime("CLICK");
    if (footerState === "F1_FOLDED") {
      onFooterStateChange("F2_UNFOLDED_METRICS");
    } else {
      onFooterStateChange("F1_FOLDED");
    }
  };

  const toggleF3 = () => {
    proceduralRadio.playUIChime("CLICK");
    if (footerState === "F3_FULL_EXPANDED") {
      onFooterStateChange("F2_UNFOLDED_METRICS");
    } else {
      onFooterStateChange("F3_FULL_EXPANDED");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col select-none transition-all duration-300">
      {/* ========================================================= */}
      {/* ÉTAGE F3 : SUPERVISION GÉOTHERMIQUE & INFRASTRUCTURES BAS */}
      {/* ========================================================= */}
      {footerState === "F3_FULL_EXPANDED" && (
        <div className={`${theme.isLight ? "bg-white/95 text-slate-900 border-slate-300" : "bg-slate-950/95 text-slate-100 border-sky-500/30"} backdrop-blur-2xl border-t p-4 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 shadow-2xl font-mono text-xs`}>
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Header F3 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2 gap-3">
              <div className={`flex items-center gap-2 font-bold shrink-0 ${theme.isLight ? "text-sky-800" : "text-sky-400"}`}>
                <Gauge className="w-4 h-4" />
                <span>SUPERVISION INFRASTRUCTURE & TÉLÉMÉTRIE (ÉTAGE F3)</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap flex-nowrap scroll-horizontal-touch max-w-full pb-1 scrollbar-none shrink-0">
                {[
                  { id: "CARACTERISTIQUES_PLANETE", label: "Physique Planétaire & Saisons" },
                  { id: "PALLIERS_PROGRESSION", label: "Arbres de Progression & Inter-Impacts" },
                  { id: "LOGISTIQUE_GRID", label: "Réseau des Dômes" },
                  { id: "SURVEILLANCE_POLLUTION", label: "Intégrité Z-Levels & Silice" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setF3ActiveSubTab(st.id as any)}
                    className={`px-2.5 py-1 rounded text-[11px] cursor-pointer border shrink-0 transition-all ${
                      f3ActiveSubTab === st.id
                        ? theme.isLight
                          ? "bg-sky-100 border-sky-400 text-sky-900 font-bold"
                          : "bg-sky-500/20 border-sky-400 text-sky-200 font-bold"
                        : theme.isLight
                          ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900"
                          : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
                <button
                  onClick={toggleF3}
                  className={`px-2.5 py-1 rounded border text-[10px] cursor-pointer ml-1.5 shrink-0 transition-all ${
                    theme.isLight
                      ? "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10"
                  }`}
                >
                  ✕ Réduire
                </button>
              </div>
            </div>

            {/* Content F3 */}
            {f3ActiveSubTab === "CARACTERISTIQUES_PLANETE" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-xl border space-y-1 ${theme.isLight ? "bg-amber-50/80 border-amber-200 text-slate-900" : "bg-black/60 border-white/10"}`}>
                    <div className="text-[11px] flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
                      <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> Climat & Saison</span>
                      <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">{gameState.climate.season || "ESTIVAL"}</span>
                    </div>
                    <div className="text-xl font-bold text-amber-500">{gameState.climate.surface_temp_c} °C</div>
                    <div className="text-[10px] text-slate-400">Progression Solaire : {gameState.climate.season_progress_pct || 45}% · Orbital 360 Sols</div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${theme.isLight ? "bg-sky-50/80 border-sky-200 text-slate-900" : "bg-black/60 border-white/10"}`}>
                    <div className="text-[11px] flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                      <Wind className="w-3.5 h-3.5" /> Atmosphère & Silice
                    </div>
                    <div className="text-xl font-bold text-sky-400">{gameState.climate.atmosphere_p_atm} atm</div>
                    <div className="text-[10px] text-slate-400">Poussières Silice : {gameState.climate.silica_dust_density_g_m3 || 0.3} g/m³</div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${theme.isLight ? "bg-purple-50/80 border-purple-200 text-slate-900" : "bg-black/60 border-white/10"}`}>
                    <div className="text-[11px] flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                      <Zap className="w-3.5 h-3.5" /> Radiance & Géothermie
                    </div>
                    <div className="text-xl font-bold text-purple-400">{gameState.climate.radiance_w_m2} W/m²</div>
                    <div className="text-[10px] text-slate-400">Flux Géothermique : {gameState.climate.geothermal_flux_mw || 1850} MW</div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${theme.isLight ? "bg-emerald-50/80 border-emerald-200 text-slate-900" : "bg-black/60 border-white/10"}`}>
                    <div className="text-[11px] flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <Activity className="w-3.5 h-3.5" /> Impact Direct Simulation
                    </div>
                    <div className="text-lg font-bold text-emerald-400">
                      Rendement x{gameState.climate.production_multiplier || 1.0}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Morale Population : {(gameState.climate.population_happiness_impact || 0) >= 0 ? `+${gameState.climate.population_happiness_impact}%` : `${gameState.climate.population_happiness_impact}%`}
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] flex items-center justify-between ${theme.isLight ? "bg-slate-100 border-slate-300" : "bg-slate-900/60 border-white/10"}`}>
                  <span className="font-semibold text-slate-300">Description Météorologique & Télémétrie Planétaire :</span>
                  <span className="font-mono text-sky-400 font-bold">{gameState.climate.weather_description}</span>
                </div>
              </div>
            )}

            {f3ActiveSubTab === "PALLIERS_PROGRESSION" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Arbre 1: Démographie */}
                  <div className={`p-3 rounded-xl border space-y-2 ${theme.isLight ? "bg-sky-50/80 border-sky-300 text-slate-900" : "bg-black/60 border-sky-500/30 text-slate-100"}`}>
                    <div className="flex items-center justify-between border-b border-sky-500/20 pb-1">
                      <span className="font-bold text-sky-400">1. DÉMOGRAPHIE</span>
                      <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">PALIER P2</span>
                    </div>
                    <div className="text-xs font-bold text-sky-300">{gameState.resources.population_total} Colons actives</div>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <div>✦ Statut : Matrice Biologique Nominale</div>
                      <div>✦ Impact Croisé : +10% Production d'Alliages mais +15% Demande en O₂/Eau</div>
                    </div>
                  </div>

                  {/* Arbre 2: Développement Urbain */}
                  <div className={`p-3 rounded-xl border space-y-2 ${theme.isLight ? "bg-emerald-50/80 border-emerald-300 text-slate-900" : "bg-black/60 border-emerald-500/30 text-slate-100"}`}>
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1">
                      <span className="font-bold text-emerald-400">2. DÉVELOPPEMENT URBAIN</span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">PALIER U3</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-300">{gameState.buildings.length} Dômes (Z+2 à Z-2)</div>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <div>✦ Statut : 100% Maillage ICOM Hermétique</div>
                      <div>✦ Impact Croisé : +8% Bonheur Population & Isolation Thermique</div>
                    </div>
                  </div>

                  {/* Arbre 3: Leader Archonte */}
                  <div className={`p-3 rounded-xl border space-y-2 ${theme.isLight ? "bg-amber-50/80 border-amber-300 text-slate-900" : "bg-black/60 border-amber-500/30 text-slate-100"}`}>
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-1">
                      <span className="font-bold text-amber-400">3. LEADER ARCHONTE</span>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">PALIER L3</span>
                    </div>
                    <div className="text-xs font-bold text-amber-300">Gloire {gameState.genesis.pillar_1_governance.leader_profile.prestige.glory_score} · Moral {gameState.genesis.pillar_1_governance.leader_profile.happiness_pct}%</div>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <div>✦ Statut : Santé {gameState.genesis.pillar_1_governance.leader_profile.overall_health_pct}% · Stress {gameState.genesis.pillar_1_governance.leader_profile.stress_level}%</div>
                      <div>✦ Impact Croisé : Stabilité Sénat +12% & Inspiration Civique</div>
                    </div>
                  </div>

                  {/* Arbre 4: Gouvernance & N.I.A. */}
                  <div className={`p-3 rounded-xl border space-y-2 ${theme.isLight ? "bg-purple-50/80 border-purple-300 text-slate-900" : "bg-black/60 border-purple-500/30 text-slate-100"}`}>
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-1">
                      <span className="font-bold text-purple-400">4. GOUVERNANCE N.I.A.</span>
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">PALIER G4</span>
                    </div>
                    <div className="text-xs font-bold text-purple-300">Sénat {Math.round(gameState.genesis.pillar_1_governance.senate_stability)}% · Mode {gameState.niaMode}</div>
                    <div className="text-[10px] text-slate-400 space-y-1">
                      <div>✦ Statut : Chantiers Autonomes N.I.A. Actifs</div>
                      <div>✦ Impact Croisé : Réduction de 15% des Malus Tempête</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {f3ActiveSubTab === "LOGISTIQUE_GRID" && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border ${theme.isLight ? "bg-slate-50 border-slate-300" : "bg-black/60 border-white/10"}`}>
                  <div className={`text-[10px] ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>TOTAL DES MODULES</div>
                  <div className={`text-lg font-bold ${theme.isLight ? "text-slate-900" : "text-slate-100"}`}>{gameState.buildings.length} dômes</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">100% connectés au réseau ICOM</div>
                </div>
                <div className={`p-3 rounded-xl border ${theme.isLight ? "bg-slate-50 border-slate-300" : "bg-black/60 border-white/10"}`}>
                  <div className={`text-[10px] ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>PUISSANCE DÉPLOYÉE</div>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {gameState.buildings.reduce((acc, b) => acc + (b.power_consumption_mw || 0), 0)} MW
                  </div>
                  <div className={`text-[10px] mt-1 ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>Sur {Math.round(gameState.resources.energy_gw * 1000)} MW disp.</div>
                </div>
                <div className={`p-3 rounded-xl border ${theme.isLight ? "bg-slate-50 border-slate-300" : "bg-black/60 border-white/10"}`}>
                  <div className={`text-[10px] ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>MAIN D'ŒUVRE ACTIVE</div>
                  <div className="text-lg font-bold text-sky-600 dark:text-sky-300">
                    {gameState.buildings.reduce((acc, b) => acc + (b.personnel_assigned || 0), 0)} Colons
                  </div>
                  <div className={`text-[10px] mt-1 ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>Assignation optimale à 94%</div>
                </div>
                <div className={`p-3 rounded-xl border ${theme.isLight ? "bg-slate-50 border-slate-300" : "bg-black/60 border-white/10"}`}>
                  <div className={`text-[10px] ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>STOCKAGES PHYSIQUES</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-300">{Math.round(gameState.resources.alloys_tonnes)} t</div>
                  <div className={`text-[10px] mt-1 ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>Alliages et métaux raffinés</div>
                </div>
              </div>
            )}

            {f3ActiveSubTab === "SURVEILLANCE_POLLUTION" && (
              <div className={`p-3 rounded-xl border space-y-2 ${theme.isLight ? "bg-slate-50 border-slate-300" : "bg-black/60 border-white/10"}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${theme.isLight ? "text-sky-800" : "text-sky-300"}`}>Intégrité des Enceintes Pressurisées</span>
                  <span className={`text-[10px] ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>
                    {damagedBuildingsCount === 0 ? "TOUTES LES STRUCTURES SONT NOMINALES" : `${damagedBuildingsCount} DÔMES EN ALERTE`}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gameState.buildings.slice(0, 8).map((b) => (
                    <div key={b.building_instance_id} className={`p-2 rounded border text-[11px] ${
                      theme.isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-white/5"
                    }`}>
                      <div className={`truncate font-semibold ${theme.isLight ? "text-slate-900" : "text-slate-200"}`}>{b.name}</div>
                      <div className={`flex justify-between text-[10px] mt-1 ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>
                        <span>Intégrité</span>
                        <span className={b.integrity_pct > 70 ? "text-emerald-600 dark:text-sky-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                          {Math.round(b.integrity_pct)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ÉTAGE F2 : MÉTRIQUES DE SURFACE (+88px au-dessus de F1)   */}
      {/* ========================================================= */}
      {footerState !== "F1_FOLDED" && (
        <div className={`border-t py-2 px-4 ${theme.cardBg} ${theme.cardBorder} animate-in slide-in-from-bottom-2 duration-200`}>
          <div className="max-w-6xl mx-auto flex flex-nowrap whitespace-nowrap overflow-x-auto scroll-horizontal-touch items-center justify-between gap-3 text-xs font-mono pb-1 scrollbar-none">
            {/* Climat surface */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 ${theme.isLight ? "text-slate-800 font-medium" : "text-slate-300"}`}>
                <Thermometer className="w-4 h-4 text-amber-500" />
                <span>T_surface: <strong className={theme.isLight ? "text-slate-900" : "text-slate-100"}>{gameState.climate.surface_temp_c}°C</strong></span>
              </div>
              <div className={`flex items-center gap-1.5 ${theme.isLight ? "text-slate-800 font-medium" : "text-slate-300"}`}>
                <Wind className="w-4 h-4 text-sky-500" />
                <span>P_atm: <strong className={theme.isLight ? "text-slate-900" : "text-slate-100"}>{gameState.climate.atmosphere_p_atm} atm</strong></span>
              </div>
              {gameState.climate.silica_storm_active && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] animate-pulse font-bold">
                  ⚠ TEMPÊTE DE SILICE ACTIVE
                </span>
              )}
            </div>

            {/* Dômes state */}
            <div className="flex items-center gap-3">
              <span className={theme.isLight ? "text-slate-700" : "text-slate-400"}>
                Dômes actifs : <strong className="text-emerald-600 dark:text-emerald-400">{gameState.buildings.length}</strong>
              </span>
              {damagedBuildingsCount > 0 && (
                <span className="text-rose-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" /> {damagedBuildingsCount} en avarie
                </span>
              )}
              <button
                onClick={toggleF3}
                className={`px-2.5 py-1 rounded text-[11px] border cursor-pointer transition-colors ${
                  theme.isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-sky-800 border-slate-300 font-semibold"
                    : "bg-slate-800 hover:bg-slate-700 text-sky-300 border-sky-500/30"
                }`}
              >
                {footerState === "F3_FULL_EXPANDED" ? "Réduire Vue F3" : "Agrandir Console F3"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ÉTAGE F1 : DOCK DE BASE PERMANENT                         */}
      {/* ========================================================= */}
      <footer className={`min-h-[70px] py-2.5 border-t grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-4 md:px-8 ${theme.cardBg} ${theme.cardBorder}`}>
        {/* COLONNE GAUCHE : PLANÈTE & SOUS-ONGLETS */}
        <div className="md:col-span-4 flex flex-col items-start min-w-0">
          <span className={`text-[11px] font-bold tracking-wider uppercase truncate ${theme.isLight ? "text-sky-900" : "text-sky-400"}`}>
            🪐 {PLANET_PRESETS[gameState.genesis.pillar_2_environment.target_planet]?.name || gameState.genesis.pillar_2_environment.target_planet || "Aurelia Deserta"}
          </span>
          <div className="flex items-center gap-1.5 mt-1 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
            {[
              {
                label: "Plan de Masse",
                action: () => {
                  if (onHeaderStateChange) onHeaderStateChange("H1_FOLDED");
                  onFooterTabChange("COLONIE");
                }
              },
              {
                label: "Population",
                action: () => {
                  if (onHeaderStateChange) onHeaderStateChange("H1_FOLDED");
                  onFooterTabChange("COLONIE");
                  onFooterStateChange("F3_FULL_EXPANDED");
                  setF3ActiveSubTab("PALLIERS_PROGRESSION");
                }
              },
              {
                label: "Radio de Bord",
                action: () => {
                  if (onHeaderStateChange) onHeaderStateChange("H1_FOLDED");
                  onFooterTabChange("JOURNAL");
                }
              }
            ].map((sub, idx) => (
              <button
                key={idx}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  sub.action();
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border cursor-pointer transition-all ${
                  theme.isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 font-semibold"
                    : "bg-slate-900/60 hover:bg-slate-800 border-white/5 text-slate-300 hover:border-white/10"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* COLONNE CENTRALE : LES 3 TABS FOOTER & MINI JOURNAL TAPE */}
        <div className="md:col-span-4 flex flex-col items-center gap-1.5 min-w-0">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-2 max-w-full overflow-x-auto scrollbar-none">
            {[
              {
                id: "COLONIE" as const,
                label: "Colonie",
                icon: Building2,
                badge: damagedBuildingsCount > 0 ? damagedBuildingsCount : null,
                badgeColor: "bg-amber-500 text-black",
              },
              {
                id: "JOURNAL" as const,
                label: "Journal",
                icon: FileText,
                badge: unresolvedEventsCount > 0 ? unresolvedEventsCount : null,
                badgeColor: "bg-sky-500 text-white animate-pulse",
              },
              {
                id: "SPATIAL" as const,
                label: "Spatial",
                icon: Compass,
                badge: null,
                badgeColor: "bg-indigo-500 text-white",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFooterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    onFooterTabChange(tab.id);
                  }}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                    isActive
                      ? theme.isLight
                        ? "bg-sky-100 border-sky-500 text-sky-950 font-bold shadow-sm scale-105"
                        : "bg-sky-500/20 border-sky-400 text-sky-200 font-bold shadow-sm scale-105"
                      : theme.isLight
                        ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive && theme.isLight ? "text-sky-700" : ""}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mini Log / Ticker Journal */}
          <div className={`w-full max-w-[280px] sm:max-w-xs md:max-w-sm px-2 py-0.5 rounded border text-[9px] font-mono flex items-center gap-1.5 truncate ${
            theme.isLight ? "bg-slate-100/90 border-slate-200 text-slate-600" : "bg-black/40 border-white/5 text-slate-400"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-extrabold text-sky-400 shrink-0">TELEMETRIE JOURNAL :</span>
            <span className="truncate">
              {gameState.activeAlerts[0]?.message || gameState.events.find((e) => !e.resolved)?.narrative.message || "Système nominal, tous les capteurs d'analyse dôme au vert."}
            </span>
          </div>
        </div>

        {/* COLONNE DROITE : VITESSE DU TEMPS, HORLOGE, FLUSH F2 */}
        <div className="md:col-span-4 flex items-center justify-end gap-2 text-xs font-mono shrink-0">
          {/* Pause / Play Control */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onSpeedChange(gameState.clock.speedMultiplier, !gameState.clock.isPaused);
            }}
            className={`h-7 px-2 rounded-md flex items-center gap-1 font-bold transition-all cursor-pointer border ${
              gameState.clock.isPaused
                ? "bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse"
                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
            }`}
          >
            {gameState.clock.isPaused ? <Play className="w-3 h-3 fill-current text-amber-500" /> : <Pause className="w-3 h-3 fill-current text-emerald-500" />}
            <span className="text-[10px]">{gameState.clock.isPaused ? "PAUSE" : "RUN"}</span>
          </button>

          {/* Multipliers */}
          <div className={`flex items-center rounded-md p-0.5 border ${theme.isLight ? "bg-slate-200/80 border-slate-300" : "bg-black/40 border-white/10"}`}>
            {[1, 2, 5].map((mult) => {
              const isActive = !gameState.clock.isPaused && gameState.clock.speedMultiplier === mult;
              return (
                <button
                  key={mult}
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    onSpeedChange(mult, false);
                  }}
                  className={`h-5 px-1.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-sky-500/40 text-sky-100 font-extrabold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ×{mult}
                </button>
              );
            })}
          </div>

          {/* Clock indicator */}
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 shrink-0 ${
            theme.isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-slate-900 border-white/10 text-slate-200"
          }`}>
            <span className="text-purple-400">SOL {gameState.clock.sol}</span>
            <span className="opacity-60">{gameState.clock.tickInSol}:00</span>
          </div>

          {/* Toggle F2 Quick Metrics */}
          <button
            onClick={toggleF2}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              theme.isLight
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
            title="Télémétrie de surface F2"
          >
            {footerState !== "F1_FOLDED" ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
