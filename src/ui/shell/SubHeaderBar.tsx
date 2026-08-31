import React from "react";
import { proceduralRadio } from "../../audio/radio";
import {
  Play,
  Pause,
  Zap,
  Droplets,
  Wind,
  Leaf,
  Layers,
  Flame,
  Coins,
  Users,
  Activity,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { ResourceKey } from "../components/ResourceBreakdownModal";

interface SubHeaderBarProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  onSelectResource?: (resourceKey: ResourceKey) => void;
}

export function SubHeaderBar({
  gameState,
  theme,
  onSpeedChange,
  onSelectResource,
}: SubHeaderBarProps) {
  const res = gameState.resources;

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
      title: "Cliquer pour voir la production énergétique par bâtiment",
    },
    {
      key: "oxygen_l",
      label: "O₂",
      value: `${Math.round(res.oxygen_l)} L`,
      icon: Wind,
      color: "text-sky-500",
      bgColor: "hover:bg-sky-500/10 hover:border-sky-500/40",
      title: "Cliquer pour voir le bilan de filtration atmosphérique",
    },
    {
      key: "water_l",
      label: "Eau",
      value: `${Math.round(res.water_l)} L`,
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "hover:bg-blue-500/10 hover:border-blue-500/40",
      title: "Cliquer pour voir le recyclage H₂O",
    },
    {
      key: "biomass_kg",
      label: "Biomasse",
      value: `${Math.round(res.biomass_kg)} kg`,
      icon: Leaf,
      color: "text-emerald-500",
      bgColor: "hover:bg-emerald-500/10 hover:border-emerald-500/40",
      title: "Cliquer pour voir les récoltes hydroponiques",
    },
    {
      key: "alloys_tonnes",
      label: "Alliages",
      value: `${Math.round(res.alloys_tonnes)} t`,
      icon: Layers,
      color: "text-orange-500",
      bgColor: "hover:bg-orange-500/10 hover:border-orange-500/40",
      title: "Cliquer pour voir la production d'alliages métalliques",
    },
    {
      key: "deuterium_kg",
      label: "Deutérium",
      value: `${Math.round(res.deuterium_kg || 0)} kg`,
      icon: Flame,
      color: "text-purple-500",
      bgColor: "hover:bg-purple-500/10 hover:border-purple-500/40",
      title: "Cliquer pour voir la réserve de Deutérium",
    },
    {
      key: "credits_cr",
      label: "Crédits",
      value: `${Math.round(res.credits_cr || 1500)} Cr`,
      icon: Coins,
      color: "text-yellow-500",
      bgColor: "hover:bg-yellow-500/10 hover:border-yellow-500/40",
      title: "Cliquer pour voir les crédits de gouvernance",
    },
    {
      key: "population_active",
      label: "Pop",
      value: `${res.population_active}`,
      icon: Users,
      color: "text-teal-500",
      bgColor: "hover:bg-teal-500/10 hover:border-teal-500/40",
      title: "Cliquer pour voir la démographie et la stabilité",
    },
  ];

  return (
    <div
      className={`h-11 border-b flex items-center justify-between px-2 md:px-4 ${theme.cardBg} ${theme.cardBorder} text-xs font-mono select-none shadow-sm z-30 relative scroll-horizontal-touch overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-none`}
    >
      {/* SECTION GAUCHE : CONTRÔLEUR DE CADENCE / VITESSE DU TEMPS */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0 pr-3 border-r border-slate-200 dark:border-white/10">
        <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${theme.isLight ? "text-slate-500" : "text-slate-400"}`}>
          Cadence :
        </span>

        {/* Bouton Pause / Reprise */}
        <button
          onClick={() => {
            proceduralRadio.playUIChime("CLICK");
            onSpeedChange(gameState.clock.speedMultiplier, !gameState.clock.isPaused);
          }}
          className={`h-7 px-2 md:px-2.5 rounded-lg flex items-center gap-1 font-bold transition-all cursor-pointer border ${
            gameState.clock.isPaused
              ? theme.isLight
                ? "bg-amber-100 border-amber-400 text-amber-800 animate-pulse shadow-sm"
                : "bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse shadow-sm"
              : theme.isLight
                ? "bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200/80"
                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
          }`}
          title={gameState.clock.isPaused ? "Reprendre la simulation" : "Mettre en pause"}
        >
          {gameState.clock.isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] md:text-[11px]">PAUSE</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] md:text-[11px]">RUN</span>
            </>
          )}
        </button>

        {/* Sélecteurs de Multiplicateur de Vitesse */}
        <div className={`flex items-center rounded-lg p-0.5 border ${theme.isLight ? "bg-slate-200/80 border-slate-300" : "bg-black/40 border-white/10"}`}>
          {[1, 2, 5, 10].map((mult) => {
            const isActive = !gameState.clock.isPaused && gameState.clock.speedMultiplier === mult;
            return (
              <button
                key={mult}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  onSpeedChange(mult, false);
                }}
                className={`h-6 px-1.5 md:px-2 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  isActive
                    ? theme.isLight
                      ? "bg-sky-600 text-white font-extrabold shadow-sm"
                      : "bg-sky-500/30 text-sky-200 border border-sky-400/60"
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
      </div>

      {/* SECTION CENTRE & DROITE : BARRE DES RESSOURCES INTERACTIVE AVEC BREAKDOWN MODAL */}
      <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scroll-horizontal-touch py-1 px-1 flex-1">
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
              <span className={`text-[10px] font-medium hidden xl:inline ${theme.isLight ? "text-slate-500" : "text-slate-400"}`}>
                {item.label}:
              </span>
              <strong className="text-[11px] font-bold whitespace-nowrap">{item.value}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}
