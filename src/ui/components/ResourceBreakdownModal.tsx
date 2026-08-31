import React from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { BUILDING_BLUEPRINTS } from "../../simulation/constants";
import { proceduralRadio } from "../../audio/radio";
import {
  Zap,
  Droplets,
  Wind,
  Leaf,
  Layers,
  Sparkles,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Coins,
  Users,
  Flame,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export type ResourceKey =
  | "energy_gw"
  | "oxygen_l"
  | "water_l"
  | "biomass_kg"
  | "alloys_tonnes"
  | "deuterium_kg"
  | "credits_cr"
  | "population_active";

interface ResourceBreakdownModalProps {
  resourceKey: ResourceKey | null;
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
}

export function ResourceBreakdownModal({
  resourceKey,
  gameState,
  theme,
  onClose,
}: ResourceBreakdownModalProps) {
  if (!resourceKey) return null;

  const res = gameState.resources;
  const buildings = gameState.buildings || [];
  const climate = gameState.climate;

  const getResourceMeta = () => {
    switch (resourceKey) {
      case "energy_gw":
        return {
          title: "Énergie & Flux Supraconducteurs",
          unit: "GW",
          icon: Zap,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10 border-amber-500/30",
          current: Math.round(res.energy_gw),
          capacity: 1000,
          desc: "Alimente le bouclier déflecteur, les dômes atmosphériques et le réseau de transfert quantique.",
        };
      case "oxygen_l":
        return {
          title: "Réserve d'Oxygène Pressurisé",
          unit: "L",
          icon: Wind,
          color: "text-sky-500",
          bgColor: "bg-sky-500/10 border-sky-500/30",
          current: Math.round(res.oxygen_l),
          capacity: 5000,
          desc: "Contrôle la composition atmosphérique des dômes et la survie biologique des citoyens.",
        };
      case "water_l":
        return {
          title: "Hydratation & Eau Potable (H₂O)",
          unit: "L",
          icon: Droplets,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10 border-blue-500/30",
          current: Math.round(res.water_l),
          capacity: 8000,
          desc: "Ressource vitale pour la nutrition, le refroidissement des réacteurs et les serres d'urgence.",
        };
      case "biomass_kg":
        return {
          title: "Nutriments & Biomasse Synthétique",
          unit: "kg",
          icon: Leaf,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10 border-emerald-500/30",
          current: Math.round(res.biomass_kg),
          capacity: 4000,
          desc: "Alimentation hydroponique transformée en rations énergétiques et bio-polymères.",
        };
      case "alloys_tonnes":
        return {
          title: "Alliages & Matériaux de Métamorphose",
          unit: "t",
          icon: Layers,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10 border-orange-500/30",
          current: Math.round(res.alloys_tonnes),
          capacity: 2500,
          desc: "Matériau brut pour l'extension des dômes, l'armure de l'Arche et le remplacement des pièces d'avarie.",
        };
      case "deuterium_kg":
        return {
          title: "Isotopes de Deutérium (²H)",
          unit: "kg",
          icon: Flame,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10 border-purple-500/30",
          current: Math.round(res.deuterium_kg || 0),
          capacity: 1000,
          desc: "Combustible à haute densité d'énergie pour les réacteurs à fusion Tokamak et les sauts sous-spatiaux.",
        };
      case "credits_cr":
        return {
          title: "Crédits de Gouvernance & Récompenses",
          unit: "Cr",
          icon: Coins,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10 border-yellow-500/30",
          current: Math.round(res.credits_cr || 1500),
          capacity: 100000,
          desc: "Monnaie de troc inter-factions et d'incitation économique pour les décrets d'urgence.",
        };
      case "population_active":
        return {
          title: "Démographie Active & Stabilité",
          unit: "Citoyens",
          icon: Users,
          color: "text-teal-500",
          bgColor: "bg-teal-500/10 border-teal-500/30",
          current: res.population_active,
          capacity: 2000,
          desc: "Corps civique et force ouvrière qualifiée répartie sur les dômes et les ateliers industriels.",
        };
    }
  };

  const meta = getResourceMeta();
  const Icon = meta.icon;

  // Calcul des producteurs et consommateurs
  const producers = buildings.filter((b) => {
    const bp = BUILDING_BLUEPRINTS[b.blueprint_id];
    if (!bp) return false;
    return bp.base_outputs && Object.keys(bp.base_outputs).some((k) => k.includes(resourceKey.split("_")[0]));
  });

  const consumers = buildings.filter((b) => {
    const bp = BUILDING_BLUEPRINTS[b.blueprint_id];
    if (!bp) return false;
    return bp.base_inputs && Object.keys(bp.base_inputs).some((k) => k.includes(resourceKey.split("_")[0]));
  });

  const pctFilled = Math.min(100, Math.max(0, Math.round((meta.current / meta.capacity) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden scroll-smooth-touch ${
          theme.isLight
            ? "bg-white border-slate-300 text-slate-900 shadow-sky-900/10"
            : "bg-slate-950 border-sky-500/40 text-slate-100 shadow-cyan-950/60"
        }`}
      >
        {/* HEADER MODAL */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            theme.isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900/90 border-white/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${meta.bgColor}`}>
              <Icon className={`w-6 h-6 ${meta.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">{meta.title}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${meta.bgColor} ${meta.color}`}>
                  TÉLÉMÉTRIE N.I.A.
                </span>
              </div>
              <p className={`text-xs ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>
                {meta.desc}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onClose();
            }}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              theme.isLight
                ? "bg-white border-slate-300 text-slate-600 hover:text-slate-900"
                : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENU MODAL AVEC SCROLL SMOOTH */}
        <div className="p-5 overflow-y-auto space-y-5 scroll-smooth-touch flex-1 text-xs font-mono">
          {/* CARTE STOCK & JAUGE DE CAPACITÉ */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme.isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-white/10"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.isLight ? "text-slate-500" : "text-slate-400"}`}>
                  Stock Actuel / Capacité Max
                </span>
                <div className="text-2xl font-extrabold flex items-baseline gap-1.5 mt-0.5">
                  <span className={meta.color}>{meta.current}</span>
                  <span className="text-sm text-slate-400 font-normal">/ {meta.capacity} {meta.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Flux Net Estimé
                  </span>
                  <div className="text-sm font-bold flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" /> +12.5 {meta.unit} / Sol
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Remplissage des réservoirs</span>
                <span>{pctFilled}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pctFilled > 80 ? "bg-emerald-500" : pctFilled > 30 ? "bg-sky-500" : "bg-amber-500 animate-pulse"
                  }`}
                  style={{ width: `${pctFilled}%` }}
                />
              </div>
            </div>
          </div>

          {/* IMPACT CLIMATIQUE & SÉVÉRITÉ */}
          {climate.silica_storm_active && resourceKey === "energy_gw" && (
            <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                <strong>Alerte Tempête de Silice :</strong> Le rendement des centrales photovoltaïques et des condensateurs est réduit de <strong>40%</strong>.
              </span>
            </div>
          )}

          {/* TABLEAU DES PRODUCTEURS (STRUCTURES) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-sky-600 dark:text-sky-400 border-b pb-1.5 border-slate-200 dark:border-white/10">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Structures Productrices ({producers.length})
              </span>
              <span className="text-[10px] text-slate-400">Génération par Sol</span>
            </div>

            {producers.length === 0 ? (
              <div className="p-3 text-center text-slate-400 italic bg-slate-100 dark:bg-slate-900/40 rounded-lg">
                Aucune structure actuellement assignée à la production directe de cette ressource.
              </div>
            ) : (
              <div className="space-y-1.5">
                {producers.map((bld) => (
                  <div
                    key={bld.building_instance_id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      theme.isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-white/10"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span>{bld.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {bld.position.z.replace("Z_", "")}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Intégrité : {bld.integrity_pct}%</span>
                        <span>· Personnel : {bld.personnel_assigned} citoyens</span>
                      </div>
                    </div>
                    <div className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +15.0 {meta.unit} / Sol
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TABLEAU DES CONSOMMATEURS (RÉSEAU) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400 border-b pb-1.5 border-slate-200 dark:border-white/10">
              <span className="flex items-center gap-1.5 uppercase text-[11px]">
                <TrendingDown className="w-4 h-4 text-amber-500" /> Consommation & Tirage Réseau ({consumers.length})
              </span>
              <span className="text-[10px] text-slate-400">Prélèvement par Sol</span>
            </div>

            {consumers.length === 0 ? (
              <div className="p-3 text-center text-slate-400 italic bg-slate-100 dark:bg-slate-900/40 rounded-lg">
                Aucune consommation industrielle directe enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-1.5">
                {consumers.map((bld) => (
                  <div
                    key={bld.building_instance_id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      theme.isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-white/10"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {bld.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Consommation nominale de fonctionnement
                      </div>
                    </div>
                    <div className="text-right font-bold text-amber-600 dark:text-amber-400">
                      -{bld.power_consumption_mw || 5} {meta.unit} / Sol
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS RAPIDES N.I.A. */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-2">
            <button
              onClick={() => {
                proceduralRadio.playUIChime("CONFIRM");
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Cpu className="w-4 h-4" /> Optimiser l'Allocation N.I.A.
            </button>
            <button
              onClick={() => {
                proceduralRadio.playUIChime("CLICK");
                onClose();
              }}
              className={`py-2 px-4 rounded-lg font-bold border transition-colors cursor-pointer ${
                theme.isLight
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10"
              }`}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
