import React, { useState, useEffect } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { HeaderTierState, FooterTierState } from "../../types/genesis";
import { proceduralRadio } from "../../audio/radio";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { RadioWidget } from "../shell/RadioWidget";
import { ERAS_CONFIG } from "../../simulation/constants";
import {
  Activity,
  Bell,
  Cpu,
  Heart,
  Settings,
  Shield,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Cloud,
  Play,
  Pause,
  Zap,
  Droplets,
  Wind,
  Leaf,
  Flame,
  Coins,
  Users,
  Calendar,
  Trophy,
  Bot,
  CloudRain,
  Clock,
  Gauge,
} from "lucide-react";

import { ResourceKey } from "./ResourceBreakdownModal";

export interface VesselHeaderProps {
  gameState: GameState;
  theme: ThemeDefinition;
  headerState: HeaderTierState;
  activeHeaderTab: "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS";
  onHeaderStateChange: (state: HeaderTierState) => void;
  onHeaderTabChange: (tab: "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS") => void;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  onSetNiaMode?: (mode: "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF") => void;
  onOpenLeaderModal: () => void;
  onOpenConfigModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenNiaModal?: () => void;
  onOpenCloudModal?: () => void;
  onOpenWeatherModal?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenPlayerProfileModal?: () => void;
  onOpenTacticalDrawer?: () => void;
  onOpenLogisticsDrawer?: () => void;
  onSelectResource?: (resourceKey: ResourceKey) => void;
  activeFooterTab?: "COLONIE" | "JOURNAL" | "SPATIAL";
  onFooterTabChange?: (tab: "COLONIE" | "JOURNAL" | "SPATIAL") => void;
  footerState?: FooterTierState;
  onFooterStateChange?: (state: FooterTierState) => void;
}

export function VesselHeader({
  gameState,
  theme,
  headerState,
  activeHeaderTab,
  onHeaderStateChange,
  onHeaderTabChange,
  onSpeedChange,
  onSetNiaMode,
  onOpenLeaderModal,
  onOpenConfigModal,
  onOpenNotificationModal,
  onOpenNiaModal,
  onOpenCloudModal,
  onOpenWeatherModal,
  onOpenCalendarModal,
  onOpenPlayerProfileModal,
  onOpenTacticalDrawer,
  onOpenLogisticsDrawer,
  onSelectResource,
  activeFooterTab,
  onFooterTabChange,
  footerState,
  onFooterStateChange,
}: VesselHeaderProps) {
  const leader = gameState.genesis.pillar_1_governance.leader_profile;
  const spec = gameState.genesis.pillar_3_specialization;
  const unreadAlerts = gameState.activeAlerts.length;
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const res = gameState.resources;
  const currentNiaMode = gameState.niaMode || "REGULE";

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  const toggleH2 = () => {
    proceduralRadio.playUIChime("CLICK");
    if (headerState === "H1_FOLDED") {
      onHeaderStateChange("H2_UNFOLDED_NAV");
    } else {
      onHeaderStateChange("H1_FOLDED");
    }
  };

  const toggleH3 = () => {
    proceduralRadio.playUIChime("CLICK");
    if (headerState === "H3_FULL_EXPANDED") {
      onHeaderStateChange("H2_UNFOLDED_NAV");
    } else {
      onHeaderStateChange("H3_FULL_EXPANDED");
    }
  };

  const resourceItems: Array<{
    key: ResourceKey;
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    title: string;
  }> = [
    {
      key: "energy_gw",
      label: "Énergie",
      value: `${Math.round(res.energy_gw)} GW`,
      icon: Zap,
      color: "text-amber-500",
      bgColor: "hover:bg-amber-500/10 hover:border-amber-500/40",
      title: "Production & Réseau Énergétique (GW)",
    },
    {
      key: "oxygen_l",
      label: "O₂",
      value: `${Math.round(res.oxygen_l)} L`,
      icon: Wind,
      color: "text-sky-500",
      bgColor: "hover:bg-sky-500/10 hover:border-sky-500/40",
      title: "Bilan d'Oxygène Atmosphérique (L)",
    },
    {
      key: "water_l",
      label: "Eau",
      value: `${Math.round(res.water_l)} L`,
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "hover:bg-blue-500/10 hover:border-blue-500/40",
      title: "Réservez d'Eau Douce & Recyclage H₂O (L)",
    },
    {
      key: "biomass_kg",
      label: "Biomasse",
      value: `${Math.round(res.biomass_kg)} kg`,
      icon: Leaf,
      color: "text-emerald-500",
      bgColor: "hover:bg-emerald-500/10 hover:border-emerald-500/40",
      title: "Récoltes hydroponiques & Vivres (kg)",
    },
    {
      key: "alloys_tonnes",
      label: "Alliages",
      value: `${Math.round(res.alloys_tonnes)} t`,
      icon: Layers,
      color: "text-orange-500",
      bgColor: "hover:bg-orange-500/10 hover:border-orange-500/40",
      title: "Stock d'Alliages Métalliques (t)",
    },
    {
      key: "deuterium_kg",
      label: "Deutérium",
      value: `${Math.round(res.deuterium_kg || 0)} kg`,
      icon: Flame,
      color: "text-purple-500",
      bgColor: "hover:bg-purple-500/10 hover:border-purple-500/40",
      title: "Isotopes de Deutérium (kg)",
    },
    {
      key: "credits_cr",
      label: "Crédits",
      value: `${Math.round(res.credits_cr || 1500)} Cr`,
      icon: Coins,
      color: "text-yellow-500",
      bgColor: "hover:bg-yellow-500/10 hover:border-yellow-500/40",
      title: "Crédits de Gouvernance (Cr)",
    },
    {
      key: "population_active",
      label: "Pop",
      value: `${res.population_active}`,
      icon: Users,
      color: "text-teal-500",
      bgColor: "hover:bg-teal-500/10 hover:border-teal-500/40",
      title: "Démographie & Citoyens au sol",
    },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex flex-col select-none transition-all duration-300 pt-[env(safe-area-inset-top)] webkit-text-size-adjust-100">
      {/* ========================================================= */}
      {/* ÉTAGE 1 (HAUT) : PROFIL, TÉLÉMÉTRIE & MODALES RAPIDES (46px) */}
      {/* ========================================================= */}
      <header className={`h-11.5 border-b flex items-center justify-between px-2.5 md:px-4 ${theme.cardBg} ${theme.cardBorder} shrink-0 overflow-x-auto scroll-horizontal-touch scrollbar-none flex-nowrap whitespace-nowrap`}>
        {/* LEFT: Gouverneur Leader Badge & Era / Sub-Era Indicator */}
        <div className="flex items-center gap-2 min-w-0 max-w-[50%] sm:max-w-none shrink-0">
          <div
            onClick={onOpenLeaderModal}
            className="flex items-center gap-2 cursor-pointer group hover:opacity-85 transition-opacity min-w-0 shrink"
            title="Ouvrir le profil du Gouverneur d'Expédition"
          >
            <div
              className={`relative w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 shrink-0 ${
                theme.isLight
                  ? "border-sky-600 bg-sky-100 text-sky-900 shadow-sm"
                  : "border-sky-500/50 bg-slate-900 text-sky-300 shadow-sky-900/20"
              }`}
            >
              <Cpu className={`w-4 h-4 ${theme.isLight ? "text-sky-700" : "text-sky-400"}`} />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            </div>

            <div className="flex flex-col text-[10px] font-mono leading-tight min-w-0">
              <div className={`flex items-center gap-1 font-semibold ${theme.isLight ? "text-slate-900" : "text-slate-100"}`}>
                <span className={`truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[160px] ${theme.isLight ? "text-sky-800 font-bold" : "text-sky-300"}`}>
                  {leader.title}
                </span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 shrink-0">
                  <Award className="w-2.5 h-2.5 text-amber-500" /> {leader.prestige.glory_score}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 text-[9px] ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium shrink-0">
                  <Activity className="w-2.5 h-2.5" /> {Math.round(leader.overall_health_pct)}%
                </span>
                <span className="text-sky-600 dark:text-sky-300 flex items-center gap-0.5 font-medium shrink-0">
                  <Heart className="w-2.5 h-2.5 text-rose-500" /> {Math.round(leader.happiness_pct)}%
                </span>
              </div>
            </div>
          </div>

          {/* Badge Ère & Sous-Ère (Header Etage 1 Haut-Gauche) */}
          <button
            onClick={onOpenCalendarModal}
            className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono font-bold transition-all cursor-pointer ${
              theme.isLight
                ? "bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100"
                : "bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/40"
            }`}
            title={`Ère ${gameState.currentEraIndex || 1}.${gameState.currentSubEraIndex || 1} : ${ERAS_CONFIG[(gameState.currentEraIndex || 1) - 1]?.subtitle || ERAS_CONFIG[(gameState.currentEraIndex || 1) - 1]?.name || "Ère"}`}
          >
            <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="font-extrabold text-purple-400">
              ÈRE {gameState.currentEraIndex || 1}.{gameState.currentSubEraIndex || 1}
            </span>
            <span className="text-[9px] text-purple-400/80 truncate max-w-[100px]">
              {ERAS_CONFIG[(gameState.currentEraIndex || 1) - 1]?.name}
            </span>
          </button>
        </div>

        {/* CENTER: Real-Time Telemetry & Alert Ticker */}
        <div
          className={`hidden md:flex flex-1 max-w-md mx-3 overflow-hidden items-center rounded-md px-2 py-0.5 text-xs font-mono border ${
            theme.isLight
              ? "bg-slate-100/90 border-slate-300/80 text-slate-800"
              : "bg-black/40 border-white/10 text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 w-full truncate">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping shrink-0" />
            <span className={`font-bold shrink-0 text-[10px] ${theme.isLight ? "text-sky-800" : "text-sky-300"}`}>
              SOL {gameState.clock.sol} [{gameState.clock.tickInSol}:00] :
            </span>
            <span className={`truncate text-[10px] ${theme.isLight ? "text-slate-700 font-medium" : "text-slate-300"}`}>
              {gameState.activeAlerts[0]?.message || "Système en nominal. Surveillance des flux active."}
            </span>
          </div>
        </div>

        {/* RIGHT: Radio Widget, Modals Icons, Controls */}
        <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
          {/* Tiroir Tactique Gauche */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenTacticalDrawer?.();
            }}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              theme.isLight
                ? "bg-sky-100 border-sky-400 text-sky-900 font-bold hover:bg-sky-200"
                : "bg-sky-950/60 border-sky-500/40 text-sky-300 font-bold hover:bg-sky-900/60"
            }`}
            title="Ouvrir le Tiroir Tactique (Directives & Crises)"
          >
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
          </button>

          {/* Tiroir Logistique Droit */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenLogisticsDrawer?.();
            }}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              theme.isLight
                ? "bg-emerald-100 border-emerald-400 text-emerald-900 font-bold hover:bg-emerald-200"
                : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-900/60"
            }`}
            title="Ouvrir le Tiroir Logistique (Secteurs & Chantiers)"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Radio Widget */}
          <RadioWidget theme={theme} />

          {/* Météo / Climat Modal */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenWeatherModal?.();
            }}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              gameState.climate.silica_storm_active || gameState.climate.ion_storm_active
                ? "bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse"
                : theme.isLight
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800"
            }`}
            title="Monitoring Climat & Tempêtes"
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
          </button>

          {/* Calendrier Stellaire Modal */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenCalendarModal?.();
            }}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              theme.isLight
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800"
            }`}
            title="Calendrier Stellaire & Paliers d'Ère"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Profil Joueur Modal */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenPlayerProfileModal?.();
            }}
            className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
              theme.isLight
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800"
            }`}
            title="Profil Joueur & Hauts-Faits"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Cloud Sync Status */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenCloudModal?.();
            }}
            className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer border flex items-center gap-1 ${
              currentUser
                ? theme.isLight
                  ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                  : "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : theme.isLight
                  ? "bg-white border-slate-300 text-slate-600 hover:text-slate-900"
                  : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-300"
            }`}
            title={currentUser ? `Cloud Firestore : ${currentUser.email}` : "Cloud déconnecté"}
          >
            <Cloud className="w-3.5 h-3.5" />
            {currentUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          </button>

          {/* Supervision H3 Toggle */}
          <button
            onClick={toggleH3}
            className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer border ${
              headerState === "H3_FULL_EXPANDED"
                ? theme.isLight
                  ? "bg-indigo-100 border-indigo-400 text-indigo-900 font-bold"
                  : "bg-indigo-500/30 border-indigo-400 text-indigo-200"
                : theme.isLight
                  ? "bg-white border-slate-300 text-slate-600 hover:text-slate-900"
                  : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
            title="Supervision Haute Densité H3"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotificationModal}
            className={`relative p-1.5 rounded-md border transition-colors cursor-pointer ${
              theme.isLight
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800"
            }`}
            title="Alertes & Journal des notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* L'Arche Navigation Toggle */}
          <button
            onClick={toggleH2}
            className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1 transition-all cursor-pointer border ${
              headerState !== "H1_FOLDED"
                ? theme.isLight
                  ? "bg-sky-100 border-sky-400 text-sky-900 font-bold"
                  : "bg-sky-500/20 border-sky-400 text-sky-200 font-bold"
                : theme.isLight
                  ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "bg-slate-900 border-white/10 text-slate-300 hover:border-white/20"
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${theme.isLight ? "text-sky-700" : "text-sky-400"}`} />
            <span className="hidden sm:inline font-bold text-[11px]">Arche</span>
            {headerState !== "H1_FOLDED" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Settings Cog Button */}
          <button
            onClick={onOpenConfigModal}
            className={`p-1.5 rounded-md border text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
              theme.isLight
                ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
                : "bg-sky-600 text-white hover:bg-sky-500 border-sky-500"
            }`}
            title="Paramètres Système"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* ÉTAGE 2 (MILIEU) : GESTION DU TEMPS & CONTRÔLE N.I.A. (42px)*/}
      {/* ========================================================= */}
      <div
        className={`h-11 border-b flex items-center justify-between px-2.5 md:px-4 ${theme.cardBg} ${theme.cardBorder} text-xs font-mono shrink-0 overflow-x-auto scroll-horizontal-touch flex-nowrap whitespace-nowrap scrollbar-none`}
      >
        {/* SECTION GAUCHE : GESTION DU TEMPS (PAUSE / RUN / SPEED ×X / CHRONO) */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0 pr-3 border-r border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">TEMPS :</span>
          </div>

          {/* Pause / Play Toggle */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onSpeedChange(gameState.clock.speedMultiplier, !gameState.clock.isPaused);
            }}
            className={`h-6.5 px-2 rounded-md flex items-center gap-1 font-bold transition-all cursor-pointer border ${
              gameState.clock.isPaused
                ? theme.isLight
                  ? "bg-amber-100 border-amber-400 text-amber-800 animate-pulse shadow-sm"
                  : "bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse shadow-sm"
                : theme.isLight
                  ? "bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200/80"
                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
            }`}
            title={gameState.clock.isPaused ? "Reprendre le temps" : "Mettre en pause"}
          >
            {gameState.clock.isPaused ? (
              <>
                <Play className="w-3 h-3 fill-current text-amber-500" />
                <span className="text-[10px] font-extrabold">PAUSE</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 fill-current text-emerald-500" />
                <span className="text-[10px] font-extrabold">RUN</span>
              </>
            )}
          </button>

          {/* Speed Multipliers */}
          <div className={`flex items-center rounded-md p-0.5 border ${theme.isLight ? "bg-slate-200/80 border-slate-300" : "bg-black/40 border-white/10"}`}>
            {[1, 2, 5, 10].map((mult) => {
              const isActive = !gameState.clock.isPaused && gameState.clock.speedMultiplier === mult;
              return (
                <button
                  key={mult}
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    onSpeedChange(mult, false);
                  }}
                  className={`h-5.5 px-1.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    isActive
                      ? theme.isLight
                        ? "bg-sky-600 text-white font-extrabold shadow-sm"
                        : "bg-sky-500/40 text-sky-100 border border-sky-400/60 font-extrabold"
                      : theme.isLight
                        ? "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  ×{mult}
                </button>
              );
            })}
          </div>

          {/* Sol & Tick Clock Counter Badge */}
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
            theme.isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-slate-900 border-white/10 text-slate-200"
          }`}>
            <span className="text-sky-500">SOL {gameState.clock.sol}</span>
            <span className="opacity-60">[{gameState.clock.tickInSol}:00]</span>
          </div>
        </div>

        {/* SECTION DROITE : CONTRÔLE DU SYSTÈME N.I.A. (BOUTON MODAL + AUTO / RÉGULÉ / OFF) */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0 pl-2">
          {/* Bouton Modal N.I.A. */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenNiaModal?.();
            }}
            className={`h-6.5 px-2 rounded-md border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
              theme.isLight
                ? "bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100"
                : "bg-sky-950/40 border-sky-500/40 text-sky-300 hover:border-sky-400 shadow-sm"
            }`}
            title={`Ouvrir la Matrice N.I.A. [${spec.ai_acronym}]`}
          >
            <Bot className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase">
              {spec.ai_acronym || "N.I.A."} MATRIX
            </span>
          </button>

          {/* Mode Selector Pill (AUTO, REGULE, OFF) */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className={`hidden lg:inline text-[9px] font-bold uppercase ${theme.isLight ? "text-slate-500" : "text-slate-400"}`}>
              Mode :
            </span>
            <div className={`flex items-center rounded-md p-0.5 border ${theme.isLight ? "bg-slate-200/80 border-slate-300" : "bg-black/40 border-white/10"}`}>
              {[
                { id: "AUTO" as const, label: "AUTO", color: "bg-purple-600 text-white" },
                { id: "REGULE" as const, label: "RÉGULÉ", color: "bg-sky-600 text-white" },
                { id: "OFF" as const, label: "OFF", color: "bg-rose-600 text-white" },
              ].map((m) => {
                const isSel = currentNiaMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSetNiaMode?.(m.id);
                    }}
                    className={`h-5.5 px-1.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      isSel
                        ? `${m.color} font-extrabold shadow-sm`
                        : theme.isLight
                        ? "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TFlops / Charge Badge */}
          <div className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${
            theme.isLight ? "bg-slate-100 border-slate-300 text-slate-600" : "bg-slate-950/60 border-white/10 text-slate-400"
          }`}>
            <Gauge className="w-3 h-3 text-sky-400" />
            <span>12.8 TFlops</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ÉTAGE 3 (BAS) : BARRE DES RESSOURCES INTERACTIVES (38px)  */}
      {/* ========================================================= */}
      <div
        className={`h-10 border-b flex items-center overflow-x-auto scroll-horizontal-touch px-2 md:px-4 ${theme.cardBg} ${theme.cardBorder} text-xs font-mono shrink-0 select-none shadow-sm scrollbar-none flex-nowrap whitespace-nowrap`}
      >
        <div className="flex items-center gap-1 md:gap-1.5 py-0.5 flex-1 min-w-max">
          {resourceItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  onSelectResource?.(item.key);
                }}
                title={item.title}
                className={`h-7 px-2 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border-transparent ${
                  theme.isLight
                    ? `bg-slate-100/90 text-slate-800 border-slate-200/80 ${item.bgColor}`
                    : `bg-slate-900/80 text-slate-200 border-white/5 ${item.bgColor}`
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                <span className={`text-[9px] font-medium hidden xl:inline ${theme.isLight ? "text-slate-500" : "text-slate-400"}`}>
                  {item.label}:
                </span>
                <strong className="text-[10px] md:text-[11px] font-bold whitespace-nowrap">{item.value}</strong>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ÉTAGE 4 (BAS PERMANENT) : PROFIL LEADER & 6 TABS PRINCIPAUX */}
      {/* ========================================================= */}
      <div
        className={`h-11 border-b flex items-center justify-between px-2.5 md:px-4 ${theme.cardBg} ${theme.cardBorder} text-xs font-mono shrink-0 overflow-x-auto scroll-horizontal-touch flex-nowrap whitespace-nowrap scrollbar-none`}
      >
        {/* Profil Leader Tab Header */}
        <button
          onClick={onOpenLeaderModal}
          className={`flex items-center gap-2 h-8 px-2.5 rounded-lg border text-left transition-all cursor-pointer ${
            theme.isLight
              ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              : "bg-slate-900/80 border-white/10 text-slate-200 hover:border-sky-500/30"
          }`}
          title="Ouvrir la Console de Commandement du Leader"
        >
          <Award className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-[8px] text-slate-500 dark:text-slate-400 uppercase font-bold">Chef Suprême</span>
            <span className={`text-[10px] font-bold truncate max-w-[120px] ${theme.isLight ? "text-sky-950" : "text-sky-300"}`}>
              {leader.name}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-1 border-l border-slate-200 dark:border-white/10 pl-2 text-[9px] shrink-0">
            <span className="text-emerald-500 font-bold flex items-center gap-0.5" title="Santé Globale">
              ♥{Math.round(leader.overall_health_pct)}%
            </span>
            <span className="text-rose-500 font-bold flex items-center gap-0.5" title="Stress / Stabilité">
              ★{Math.round(leader.happiness_pct)}%
            </span>
            <span className="text-purple-400 font-bold shrink-0">
              Lvl {leader.mandate.leader_level}
            </span>
          </div>
        </button>

        {/* 6 Principal Tabs inside Header Floor 4 */}
        <div className="flex items-center gap-1.5 ml-3 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: "GOUVERNANCE" as const, label: "Gouvernance", isHeader: true },
            { id: "DECRETS" as const, label: "Décrets Lois", isHeader: true },
            { id: "INFRASTRUCTURES_ARCHE" as const, label: "Infrastructures", isHeader: true },
            { id: "COLONIE" as const, label: "Colonie (Dômes)", isHeader: false },
            { id: "JOURNAL" as const, label: "Journal & N.I.A.", isHeader: false },
            { id: "SPATIAL" as const, label: "4X Spatial", isHeader: false },
          ].map((tab) => {
            const isActive = tab.isHeader
              ? activeHeaderTab === tab.id && headerState !== "H1_FOLDED"
              : activeFooterTab === tab.id && headerState === "H1_FOLDED";

            return (
              <button
                key={tab.id}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  if (tab.isHeader) {
                    if (onFooterStateChange) onFooterStateChange("F1_FOLDED");
                    onHeaderStateChange("H2_UNFOLDED_NAV");
                    onHeaderTabChange(tab.id as "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS");
                  } else {
                    onHeaderStateChange("H1_FOLDED");
                    if (onFooterTabChange) onFooterTabChange(tab.id as any);
                    if (onFooterStateChange) onFooterStateChange("F2_UNFOLDED_METRICS");
                  }
                }}
                className={`h-7 px-2.5 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer border shrink-0 ${
                  isActive
                    ? theme.isLight
                      ? "bg-sky-100 border-sky-400 text-sky-950 font-extrabold shadow-sm scale-105"
                      : "bg-sky-500/25 border-sky-400 text-sky-200 font-extrabold shadow-sm scale-105"
                    : theme.isLight
                    ? "bg-white/85 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
