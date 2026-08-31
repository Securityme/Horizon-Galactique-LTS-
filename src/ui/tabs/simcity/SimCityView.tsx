import React, { useState } from "react";
import { GameState } from "../../../simulation/engine";
import { ThemeDefinition } from "../../../theme/themes";
import { ConcentricZone, ZLevel } from "../../../types/genesis";
import { BUILDING_BLUEPRINTS, ERAS_CONFIG } from "../../../simulation/constants";
import { InstalledBuilding, BuildingBlueprint, BuildingCategory, BuildQueueItem } from "../../../types/simulation";
import { MicroLogItem } from "../../../types/journal";
import { proceduralRadio } from "../../../audio/radio";
import { useTooltip } from "../../components/GlobalTooltip";
import { D3ResourceChart } from "./D3ResourceChart";
import {
  Building2,
  Hammer,
  Layers,
  ShieldAlert,
  Wrench,
  Zap,
  Droplets,
  Leaf,
  Plus,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Filter,
  Cpu,
  Clock,
  Sparkles,
  ChevronRight,
  Boxes,
} from "lucide-react";

interface SimCityViewProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onPlaceBuilding: (blueprintId: string, x: number, y: number, z: ZLevel, sectorId: string) => void;
  onRepairBuilding: (buildingId: string) => void;
  onSetNiaMode?: (mode: "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF") => void;
}

export function SimCityView({
  gameState,
  theme,
  onPlaceBuilding,
  onRepairBuilding,
  onSetNiaMode,
}: SimCityViewProps) {
  const { showTooltip, hideTooltip } = useTooltip();
  const [activeSubTab, setActiveSubTab] = useState<"URBAN" | "TERRAFORMING" | "NIA" | "STATS">("URBAN");

  React.useEffect(() => {
    return () => {
      hideTooltip();
    };
  }, [hideTooltip]);
  const [selectedZLevel, setSelectedZLevel] = useState<ZLevel>("Z_ZERO_DOME");
  const [selectedBuilding, setSelectedBuilding] = useState<InstalledBuilding | null>(null);
  const [selectedBlueprintToPlace, setSelectedBlueprintToPlace] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtres du Catalogue
  const [selectedEraFilter, setSelectedEraFilter] = useState<number | "ALL">("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<BuildingCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const GRID_SIZE = 14;

  const zLevels: Array<{ id: ZLevel; label: string; desc: string }> = [
    { id: "Z_PLUS_2_ORBIT", label: "Z+2 Orbite", desc: "Spatioport orbital, satellites relais & défense" },
    { id: "Z_PLUS_1_SURFACE", label: "Z+1 Surface Hostile", desc: "Centrales solaires, foreuses & sas Zone 3" },
    { id: "Z_ZERO_DOME", label: "Z0 Plan Masse Dômes", desc: "Dômes résidentiels, serres & agoras Zone 1" },
    { id: "Z_MINUS_1_SUB", label: "Z-1 Sous-Sol", desc: "Câblage supraconducteur, réservoirs H2O/O2" },
    { id: "Z_MINUS_2_DEEP", label: "Z-2 Cavernes Profondes", desc: "Réacteurs fusion, bunker N.I.A. & géothermie" },
  ];

  const categoriesList: Array<{ id: BuildingCategory | "ALL"; label: string }> = [
    { id: "ALL", label: "Toutes Catégories" },
    { id: "HAB", label: "Habitation" },
    { id: "ENE", label: "Énergie" },
    { id: "AGR", label: "Agriculture" },
    { id: "IND", label: "Industrie" },
    { id: "LOG", label: "Logistique" },
    { id: "SEC", label: "Sécurité" },
  ];

  // Bâtiments filtrés par niveau Z
  const buildingsOnCurrentZ = gameState.buildings.filter(
    (b) => b.position.z === selectedZLevel
  );

  // Blueprints disponibles filtrés par niveau Z, ère, catégorie et recherche
  const catalogBlueprints = Object.values(BUILDING_BLUEPRINTS).filter((bp) => {
    const matchesZ = bp.allowed_z_levels.includes(selectedZLevel);
    const matchesEra = selectedEraFilter === "ALL" || bp.unlocked_era === selectedEraFilter;
    const matchesCat = selectedCategoryFilter === "ALL" || bp.category === selectedCategoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZ && matchesEra && matchesCat && matchesSearch;
  });

  const [queueSourceFilter, setQueueSourceFilter] = useState<"ALL" | "PLAYER" | "NIA">("ALL");

  // Separate build queues (Player vs N.I.A. Auto-Build)
  const allBuildQueue: BuildQueueItem[] = gameState.buildQueue || [];
  const playerBuildQueue = allBuildQueue.filter((item) => !item.auto_built_by_nia);
  const niaEngineQueue: BuildQueueItem[] = gameState.productionQueue || [];
  const niaBuildQueue = [
    ...allBuildQueue.filter((item) => item.auto_built_by_nia),
    ...niaEngineQueue,
  ];
  const combinedQueueLength = playerBuildQueue.length + niaBuildQueue.length;

  const handleCellClick = (x: number, y: number) => {
    const existing = buildingsOnCurrentZ.find(
      (b) => b.position.x === x && b.position.y === y
    );

    if (existing) {
      proceduralRadio.playUIChime("CLICK");
      setSelectedBuilding(existing);
      setSelectedBlueprintToPlace(null);
    } else if (selectedBlueprintToPlace) {
      const bp = BUILDING_BLUEPRINTS[selectedBlueprintToPlace];
      if (bp) {
        // Vérification des ressources
        const costAlloys = bp.construction_cost.alloys_tonnes || 0;
        const costEnergy = bp.construction_cost.energy_gw || 0;

        if (
          gameState.resources.alloys_tonnes >= costAlloys &&
          gameState.resources.energy_gw >= costEnergy
        ) {
          proceduralRadio.playUIChime("CONFIRM");
          onPlaceBuilding(selectedBlueprintToPlace, x, y, selectedZLevel, "SEC-09");
          setSelectedBlueprintToPlace(null);
          setErrorMessage(null);
        } else {
          proceduralRadio.playUIChime("ERROR");
          setErrorMessage(`Ressources insuffisantes pour construire ${bp.name} (Requis: ${costAlloys}t Alliages, ${costEnergy}GW Énergie).`);
          setTimeout(() => setErrorMessage(null), 4000);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-full p-2 md:p-4 max-w-7xl mx-auto scroll-smooth-touch overflow-y-auto">
      {/* BARRE DE NAV SUB-TABS (DÉVELOPPEMENT URBAIN, TERRAFORMATION Z+1, N.I.A., STATISTIQUES) */}
      <div className={`p-1.5 rounded-xl border flex flex-wrap gap-1.5 font-mono text-xs ${
        theme.isLight ? "bg-white border-slate-300 shadow-sm" : "bg-black/60 border-white/10"
      }`}>
        {[
          { id: "URBAN" as const, label: "Plan de Masse & Grille Z", icon: Building2 },
          { id: "TERRAFORMING" as const, label: "Surface Terraformée Z+1", icon: Leaf },
          { id: "NIA" as const, label: "Matrice & Auto-Chantiers N.I.A.", icon: Cpu },
          { id: "STATS" as const, label: "Statistiques Coloniales", icon: Boxes },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                proceduralRadio.playUIChime("CLICK");
                setActiveSubTab(tab.id);
              }}
              className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                isActive
                  ? theme.isLight
                    ? "bg-sky-600 text-white border-sky-400 shadow-sm"
                    : "bg-sky-500/20 border-sky-400 text-sky-200 shadow-sky-500/10 font-extrabold"
                  : theme.isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-sky-300" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-950/90 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold px-1.5 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* CONTENU SELON SUB-TAB ACTIF */}
      {activeSubTab === "URBAN" && (
        <>
          {/* BLOC PRINCIPAL : GRILLE ET CATALOGUE EN PARALLÈLE */}
          <div className="flex flex-col lg:flex-row gap-4">
        {/* COLONNE GAUCHE : NIVEAUX Z ET GRILLE TACTIQUE */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Z-Levels Switcher Tabs */}
          <div className={`flex flex-wrap gap-1.5 p-1.5 rounded-xl border scroll-horizontal-touch overflow-x-auto ${theme.isLight ? "bg-slate-100 border-slate-300" : "bg-black/40 border-white/10"}`}>
            {zLevels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setSelectedZLevel(lvl.id);
                  setSelectedBuilding(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                  selectedZLevel === lvl.id
                    ? theme.isLight
                      ? "bg-sky-200 border-sky-500 text-sky-950 font-bold shadow-sm"
                      : "bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm"
                    : theme.isLight
                      ? "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                      : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lvl.label}</span>
              </button>
            ))}
          </div>

          {/* Grille Interactive de Construction */}
          <div className={`relative border rounded-xl p-4 flex flex-col items-center justify-center min-h-[380px] ${
            theme.isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/70 border-sky-500/30 text-slate-100"
          }`}>
            <div className={`text-[11px] font-mono mb-3 flex items-center justify-between w-full font-bold ${
              theme.isLight ? "text-sky-800" : "text-sky-400/90"
            }`}>
              <span>SECTEUR & PLAN TOPOLOGIQUE : {zLevels.find((z) => z.id === selectedZLevel)?.desc}</span>
              <span className="text-emerald-600 dark:text-emerald-400">{buildingsOnCurrentZ.length} STRUCTURES DÉPLOYÉES</span>
            </div>

            <div
              className={`grid gap-1.5 p-3 rounded-lg border shadow-inner ${
                theme.isLight ? "bg-white border-slate-300" : "bg-slate-950/80 border-white/10"
              }`}
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: 6 }).map((_, rowIndex) =>
                Array.from({ length: GRID_SIZE }).map((_, colIndex) => {
                  const x = colIndex + 1;
                  const y = rowIndex + 1;
                  const building = buildingsOnCurrentZ.find(
                    (b) => b.position.x === x && b.position.y === y
                  );

                  const queueItem = playerBuildQueue.find(
                    (q) => q.position.x === x && q.position.y === y && q.position.z === selectedZLevel
                  ) || niaBuildQueue.find(
                    (q) => q.position.x === x && q.position.y === y && q.position.z === selectedZLevel
                  );

                  const isBuildingSelected =
                    selectedBuilding?.building_instance_id === building?.building_instance_id;

                  const getTooltipData = () => {
                    if (building) {
                      const modifiers: string[] = [];
                      if (building.category === "ENE") {
                        modifiers.push("+15% Efficacité de stockage supraconducteur");
                        modifiers.push("+10% Taux d'infusion de deutérium");
                      } else if (building.category === "AGR") {
                        modifiers.push("+25% Croissance accélérée par spectre UV");
                        modifiers.push("-10% Pertes en eau par recyclage direct");
                      } else if (building.category === "HAB") {
                        modifiers.push("+10% Confort de vie résidentiel");
                        modifiers.push("+5% Taux de natalité");
                      } else {
                        modifiers.push("+12% Vitesse de production de secours");
                      }
                      return {
                        title: building.name,
                        category: building.category === "HAB" ? "Habitation" : building.category === "ENE" ? "Énergie" : building.category === "AGR" ? "Agriculture" : "Industrie/Logistique",
                        status: `${building.status} (${building.integrity_pct}% Intégrité)`,
                        description: `Charge électrique de la structure : ${building.power_consumption_mw} GW. Personnel de maintenance : ${building.personnel_assigned} citoyens colons.`,
                        modifiers,
                      };
                    } else if (queueItem) {
                      const pct = Math.round((queueItem.progress_ticks / queueItem.total_duration_ticks) * 100);
                      return {
                        title: `Chantier: ${queueItem.name}`,
                        category: "Construction",
                        status: `Progrès : ${pct}%`,
                        description: `Structure en cours d'assemblage atomique. Durée : ${queueItem.progress_ticks}/${queueItem.total_duration_ticks} cycles de ticks. Auto-build N.I.A : ${queueItem.auto_built_by_nia ? "Actif" : "Inactif"}.`,
                        modifiers: ["+30% Conductivité géothermique sous dôme", "+15% Efficacité d'assemblage standard"],
                      };
                    } else {
                      return {
                        title: `Case libre (${x},${y})`,
                        category: "Terrain",
                        status: "Disponible",
                        description: `Emplacement topologique libre prêt à accueillir toute infrastructure compatible avec le niveau Z ${selectedZLevel}.`,
                        modifiers: ["100% Efficacité de fondation tellurique"],
                      };
                    }
                  };

                  return (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      onMouseEnter={(e) => showTooltip(getTooltipData(), e)}
                      onMouseLeave={hideTooltip}
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md border flex items-center justify-center text-[10px] font-mono transition-all cursor-pointer relative group ${
                        building
                          ? isBuildingSelected
                            ? "border-amber-400 bg-amber-500/30 text-amber-200 font-bold scale-105 shadow-md z-10"
                            : building.status === "NOMINAL"
                            ? theme.isLight
                              ? "bg-sky-100 border-sky-400 text-sky-900 font-bold hover:bg-sky-200"
                              : "bg-sky-900/60 border-sky-400/60 text-sky-200 font-bold hover:border-sky-300"
                            : "bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse"
                          : queueItem
                          ? queueItem.auto_built_by_nia
                            ? "border-purple-500 bg-purple-950/40 text-purple-300 animate-pulse font-semibold"
                            : "border-amber-500 bg-amber-950/40 text-amber-300 animate-pulse font-semibold"
                          : selectedBlueprintToPlace
                          ? theme.isLight
                            ? "bg-emerald-50 border-emerald-300 hover:bg-emerald-200 text-emerald-800 border-dashed"
                            : "bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 border-dashed"
                          : theme.isLight
                          ? "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-400"
                          : "bg-slate-900/40 border-white/5 hover:bg-white/10 text-slate-600"
                      }`}
                    >
                      {building ? (
                        building.category === "HAB" ? (
                          <Building2 className="w-4 h-4 text-sky-400" />
                        ) : building.category === "ENE" ? (
                          <Zap className="w-4 h-4 text-amber-400" />
                        ) : building.category === "AGR" ? (
                          <Leaf className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Hammer className="w-4 h-4 text-orange-400" />
                        )
                      ) : queueItem ? (
                        <Hammer className={`w-4 h-4 animate-spin duration-3000 ${queueItem.auto_built_by_nia ? "text-purple-400" : "text-amber-400"}`} />
                      ) : (
                        <span className="text-[9px] opacity-40">{x},{y}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : PANNEAU DÉTAILS BÂTIMENT OU CATALOGUE ENRICHI */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-3">
          {selectedBuilding ? (
            /* Panneau d'inspection du Bâtiment Sélectionné */
            <div className={`border rounded-xl p-4 space-y-3 font-mono text-xs flex-1 ${
              theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-md" : "bg-black/70 border-white/10 text-slate-100"
            }`}>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="font-bold flex items-center gap-2 text-sky-500">
                  <Building2 className="w-4 h-4" /> {selectedBuilding.name}
                </div>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Statut Opérationnel :</span>
                  <span className={`font-bold ${
                    selectedBuilding.status === "NOMINAL" ? "text-emerald-400" : "text-rose-400"
                  }`}>{selectedBuilding.status}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Intégrité Structurelle :</span>
                  <span className="font-bold">{selectedBuilding.integrity_pct}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedBuilding.integrity_pct > 70 ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                    }`}
                    style={{ width: `${selectedBuilding.integrity_pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Charge Énergétique :</span>
                  <span className="text-amber-400 font-bold">{selectedBuilding.power_consumption_mw} GW</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Personnel Assigné :</span>
                  <span className="text-sky-300 font-bold">{selectedBuilding.personnel_assigned} citoyens</span>
                </div>
              </div>

              {selectedBuilding.integrity_pct < 100 && (
                <button
                  onClick={() => {
                    proceduralRadio.playUIChime("CONFIRM");
                    onRepairBuilding(selectedBuilding.building_instance_id);
                  }}
                  className={`w-full py-2 font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    theme.isLight
                      ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                      : "bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold"
                  }`}
                >
                  <Wrench className="w-4 h-4" /> Réparer la Structure (2 Alliages)
                </button>
              )}
            </div>
          ) : (
            /* Catalogue des Blueprints Multi-Niveaux & Multi-Catégories */
            <div className={`border rounded-xl p-4 space-y-3 font-mono text-xs flex-1 flex flex-col ${
              theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-md" : "bg-black/70 border-white/10 text-slate-100"
            }`}>
              <div className={`font-bold border-b pb-2 flex items-center justify-between ${
                theme.isLight ? "text-sky-900 border-slate-200" : "text-sky-400 border-white/10"
              }`}>
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4" /> Catalogue d'Infrastructures
                </div>
                <span className="text-[10px] text-slate-400">{catalogBlueprints.length} plans</span>
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher une structure..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs font-mono outline-none ${
                    theme.isLight
                      ? "bg-slate-100 border-slate-300 text-slate-900 focus:border-sky-500"
                      : "bg-slate-900 border-white/10 text-slate-100 focus:border-sky-400"
                  }`}
                />
              </div>

              {/* Filtres par Niveau / Ère */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paliers d'Ère / Niveau :</span>
                <div className="flex flex-wrap gap-1">
                  {["ALL", 1, 2, 3, 4, 5].map((era) => (
                    <button
                      key={era}
                      onClick={() => {
                        proceduralRadio.playUIChime("CLICK");
                        setSelectedEraFilter(era as any);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer border ${
                        selectedEraFilter === era
                          ? "bg-sky-600 text-white border-sky-400 shadow-sm"
                          : theme.isLight
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border-white/10"
                      }`}
                    >
                      {era === "ALL" ? "Tous" : `Ère ${era}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtres par Catégorie */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catégories :</span>
                <div className="flex flex-wrap gap-1 scroll-horizontal-touch overflow-x-auto pb-1">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        proceduralRadio.playUIChime("CLICK");
                        setSelectedCategoryFilter(cat.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer border shrink-0 ${
                        selectedCategoryFilter === cat.id
                          ? "bg-amber-600 text-white border-amber-400 shadow-sm"
                          : theme.isLight
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200 border-white/10"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des Blueprints */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1 scroll-smooth-touch">
                {catalogBlueprints.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic">
                    Aucun plan ne correspond aux filtres actuels.
                  </div>
                ) : (
                  catalogBlueprints.map((bp) => {
                    const isSelected = selectedBlueprintToPlace === bp.blueprint_id;
                    const canAfford =
                      gameState.resources.alloys_tonnes >= (bp.construction_cost.alloys_tonnes || 0);

                    return (
                      <div
                        key={bp.blueprint_id}
                        onClick={() => {
                          proceduralRadio.playUIChime("CLICK");
                          setSelectedBlueprintToPlace(isSelected ? null : bp.blueprint_id);
                        }}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? theme.isLight
                              ? "bg-sky-100 border-sky-500 text-sky-950 font-bold shadow-sm"
                              : "bg-sky-500/20 border-sky-400 text-white shadow-sm"
                            : canAfford
                            ? theme.isLight
                              ? "bg-slate-50 border-slate-300 hover:border-sky-400 text-slate-800"
                              : "bg-slate-900/70 border-white/10 hover:border-sky-500/30 text-slate-300"
                            : theme.isLight
                              ? "bg-slate-100 border-slate-200 text-slate-400 opacity-60"
                              : "bg-slate-950/40 border-white/5 text-slate-500 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={theme.isLight ? "text-slate-900" : "text-slate-200"}>{bp.name}</span>
                          <span className={`text-[10px] font-mono ${theme.isLight ? "text-sky-800" : "text-sky-300"}`}>Ère {bp.unlocked_era}</span>
                        </div>
                        <div className={`text-[10px] my-1 ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>{bp.description}</div>
                        <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                          <span>Coût : {bp.construction_cost.alloys_tonnes || 0}t alliages</span>
                          <span>· {bp.construction_cost.energy_gw || 0} GW</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selectedBlueprintToPlace && (
                <div className={`p-2 rounded text-[11px] text-center font-bold animate-pulse border ${
                  theme.isLight
                    ? "bg-sky-100 border-sky-400 text-sky-900"
                    : "bg-sky-950/50 border-sky-400/40 text-sky-200"
                }`}>
                  Cliquez sur une case libre de la grille pour poser le bâtiment.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION INFERIEURE : STORE DE LA FILE DE CONSTRUCTION (JOUEUR VS N.I.A. AUTO-BUILD) */}
      <div
        className={`border rounded-xl p-4 font-mono text-xs space-y-3 ${
          theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-sm" : "bg-black/60 border-white/10 text-slate-100"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between border-b pb-2 gap-2">
          <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400">
            <Clock className="w-4 h-4" />
            <span>Store & File d'Attente de Construction Supraconductrice</span>
          </div>

          {/* REAL-TIME N.I.A PILOTING MODE SWITCHER */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 text-[11px] bg-purple-950/25 px-2.5 py-1.5 rounded-lg border border-purple-500/30">
              <span className="text-[9px] uppercase font-bold text-purple-400">Mode N.I.A :</span>
              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  onSetNiaMode?.("OFF");
                }}
                className={`flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                  gameState.niaMode === "OFF" || gameState.niaMode === "SEMI_MANUEL" ? "text-sky-400" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Désactiver le moteur autonome de l'IA"
              >
                <span className="font-sans text-xs">{(gameState.niaMode === "OFF" || gameState.niaMode === "SEMI_MANUEL") ? "●" : "○"}</span>
                Joueur (Manuel)
              </button>

              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  onSetNiaMode?.("AUTO");
                }}
                className={`flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                  gameState.niaMode === "AUTO" ? "text-purple-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Activer la construction et réparation automatique N.I.A."
              >
                <span className="font-sans text-xs">{gameState.niaMode === "AUTO" ? "●" : "○"}</span>
                Autonome N.I.A.
              </button>
            </div>

            {/* QUEUE VISUAL FILTER BUTTONS */}
            <div className="flex items-center gap-2 text-[11px] bg-slate-900/60 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setQueueSourceFilter("ALL");
                }}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  queueSourceFilter === "ALL"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tous ({combinedQueueLength})
              </button>

              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setQueueSourceFilter("PLAYER");
                }}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  queueSourceFilter === "PLAYER"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Joueur ({playerBuildQueue.length})
              </button>

              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setQueueSourceFilter("NIA");
                }}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  queueSourceFilter === "NIA"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                N.I.A. ({niaBuildQueue.length})
              </button>
            </div>
          </div>
        </div>

        {combinedQueueLength === 0 ? (
          <div className="p-4 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 rounded-lg">
            Aucun projet actuellement en chantier. Sélectionnez un plan ci-dessus ou activez l'Auto-Build N.I.A.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* FILE DU JOUEUR */}
            {(queueSourceFilter === "ALL" || queueSourceFilter === "PLAYER") && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">
                  Projets Initiés par le Primat-Archonte (Joueur)
                </span>
                {playerBuildQueue.length === 0 ? (
                  <div className="p-2.5 text-slate-500 text-[11px] italic bg-slate-100 dark:bg-slate-900/40 rounded-lg">
                    Aucun chantier joueur actif.
                  </div>
                ) : (
                  playerBuildQueue.map((item) => {
                    const pct = Math.round((item.progress_ticks / item.total_duration_ticks) * 100);
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border space-y-1.5 ${
                          theme.isLight ? "bg-slate-50 border-sky-300" : "bg-sky-950/20 border-sky-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-sky-400">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Secteur : {item.position.sector_id} ({item.position.x},{item.position.y})</span>
                          <span>Coût : {item.cost_alloys}t</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* FILE AUTOMATIQUE N.I.A. */}
            {(queueSourceFilter === "ALL" || queueSourceFilter === "NIA") && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-400" /> Projets Autonomes Moteur N.I.A. (Auto-Build)
                </span>
                {niaBuildQueue.length === 0 ? (
                  <div className="p-2.5 text-slate-500 text-[11px] italic bg-slate-100 dark:bg-slate-900/40 rounded-lg">
                    N.I.A. en veille passive (surplus stables).
                  </div>
                ) : (
                  niaBuildQueue.map((item) => {
                    const pct = Math.round((item.progress_ticks / item.total_duration_ticks) * 100);
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border space-y-1.5 ${
                          theme.isLight ? "bg-purple-50 border-purple-300" : "bg-purple-950/20 border-purple-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 text-purple-300">
                            {item.name}
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/30 text-purple-200 border border-purple-400/40">
                              N.I.A. Auto
                            </span>
                          </span>
                          <span className="text-[10px] text-purple-400">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Niveau : {item.position.z} ({item.position.x},{item.position.y})</span>
                          <span>Alliages alloués : {item.cost_alloys}t</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {/* SUB-TAB TERRAFORMING Z+1 */}
      {activeSubTab === "TERRAFORMING" && (
        <div className={`border rounded-xl p-5 space-y-4 font-mono text-xs ${
          theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-sm" : "bg-black/70 border-emerald-500/30 text-slate-100"
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-emerald-500/30">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm uppercase">
              <Leaf className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Surface Terraformée Z+1 & Atmosphère Planétaire</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              ZONE 2 PERIPHERY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 border border-emerald-500/20 rounded-xl space-y-2">
              <div className="text-[11px] text-slate-400 font-bold uppercase">Pression & Oxygène</div>
              <div className="text-2xl font-bold text-emerald-400">0.42 atm</div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "42%" }} />
              </div>
              <div className="text-[10px] text-slate-400">Objectif Viabilité à l'Air Libre : 0.85 atm</div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-xl space-y-2">
              <div className="text-[11px] text-slate-400 font-bold uppercase">Température Moyenne Equateur</div>
              <div className="text-2xl font-bold text-sky-400">-14 °C</div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-sky-500" style={{ width: "65%" }} />
              </div>
              <div className="text-[10px] text-slate-400">Effet de Serre Généré par les Injecteurs HFC</div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-amber-500/20 rounded-xl space-y-2">
              <div className="text-[11px] text-slate-400 font-bold uppercase">Couverture Végétale Biomasse</div>
              <div className="text-2xl font-bold text-amber-400">18.4 %</div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: "18.4%" }} />
              </div>
              <div className="text-[10px] text-slate-400">Lichen Genétiquement Modifié & Algues Noires</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-3">
            <div className="font-bold text-emerald-300 text-xs">Directives d'Expansion Extérieure Z+1</div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              La construction sur le niveau <strong>Z+1 (Surface Extérieure)</strong> permet de déployer des méga-structures agricoles sans dômes protecteurs dès que la pression d'O₂ dépasse 0.40 atm. Les ouvriers portent un équipement respiratoire léger.
            </p>
            <button
              onClick={() => {
                proceduralRadio.playUIChime("CLICK");
                setSelectedZLevel("Z_PLUS_1_SURFACE");
                setActiveSubTab("URBAN");
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Passer à la Grille Z+1 Surface
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB N.I.A. AUTO-CONSTRUCTION */}
      {activeSubTab === "NIA" && (
        <div className={`border rounded-xl p-5 space-y-4 font-mono text-xs ${
          theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-sm" : "bg-black/70 border-purple-500/30 text-slate-100"
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-purple-500/30">
            <div className="flex items-center gap-2 font-bold text-purple-400 text-sm uppercase">
              <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
              <span>Matrice d'Autonomie & Auto-Chantiers N.I.A.</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
              SUPER-CALCULATEUR K-900
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl space-y-3">
              <div className="font-bold text-purple-300 text-xs uppercase">Mode de Gestion Actif</div>
              
              {/* Interactive mode selector buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    onSetNiaMode?.("OFF");
                  }}
                  className={`py-2 px-3 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                    gameState.niaMode === "OFF" || gameState.niaMode === "SEMI_MANUEL"
                      ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm"
                      : "bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  ● MANUEL
                </button>
                <button
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    onSetNiaMode?.("AUTO");
                  }}
                  className={`py-2 px-3 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                    gameState.niaMode === "AUTO"
                      ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-sm animate-pulse"
                      : "bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  ✦ AUTONOME N.I.A.
                </button>
              </div>

              <p className="text-[11px] text-slate-400 font-sans mt-2 pt-1 border-t border-white/5">
                {(gameState.niaMode || "AUTO") === "AUTO"
                  ? "✓ N.I.A. gère de manière totalement autonome la file d'attente de construction en réattribuant les alliages excédentaires."
                  : "✗ Contrôle manuel strict. Le joueur doit poser manuellement chaque dôme et structure."}
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl space-y-3">
              <div className="font-bold text-purple-300 text-xs uppercase">Capacité de Calcul & TFlops</div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Charge Processeur Quantum :</span>
                <span className="font-bold text-purple-400">840 / 1200 TFlops</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: "70%",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Indice d'Éthique : 98%</span>
                <span>Loyauté : 100%</span>
              </div>
            </div>
          </div>

          {/* Unified Journal Logs for N.I.A. Activities */}
          <div className="p-4 bg-slate-950/80 border border-purple-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-purple-300 text-xs font-bold uppercase pb-1.5 border-b border-purple-500/10">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Console de Surveillance : Journal d'Activité Unifié</span>
              </div>
              <span className="text-[9px] text-slate-500">Flux d'événements du moteur</span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto scroll-horizontal-touch">
              {gameState.journalItems
                .filter((item) => {
                  if (item.type !== "MICRO_LOG") return false;
                  const log = item as MicroLogItem;
                  return (
                    log.code?.startsWith("NIA") ||
                    log.message?.toLowerCase().includes("nia") ||
                    log.message?.toLowerCase().includes("n.i.a.") ||
                    log.category === "SYSTEM"
                  );
                })
                .slice(-6)
                .reverse()
                .map((log) => {
                  const item = log as MicroLogItem;
                  return (
                    <div
                      key={item.id}
                      className="text-[11px] leading-relaxed flex items-start gap-2 border-b border-white/5 pb-1 last:border-0 hover:bg-white/5 p-1 rounded transition-colors"
                    >
                      <span className="text-purple-400 shrink-0 font-bold">
                        [{item.timestamp.stardateLabel.split(" - ")[0]}]
                      </span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-300 font-extrabold uppercase shrink-0">
                        {item.code || "SYSTEM"}
                      </span>
                      <span className="text-slate-300">{item.message}</span>
                    </div>
                  );
                })}

              {gameState.journalItems.filter((item) => {
                if (item.type !== "MICRO_LOG") return false;
                const log = item as MicroLogItem;
                return (
                  log.code?.startsWith("NIA") ||
                  log.message?.toLowerCase().includes("nia") ||
                  log.message?.toLowerCase().includes("n.i.a.") ||
                  log.category === "SYSTEM"
                );
              }).length === 0 && (
                <div className="text-slate-500 italic text-center py-4">
                  En attente des premiers journaux du processeur quantique... Activez l'auto-build pour lancer la production.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB STATISTIQUES COLONIALES */}
      {activeSubTab === "STATS" && (
        <div className={`border rounded-xl p-5 space-y-4 font-mono text-xs ${
          theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-sm" : "bg-black/70 border-sky-500/30 text-slate-100"
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-sky-500/30">
            <div className="flex items-center gap-2 font-bold text-sky-400 text-sm uppercase">
              <Boxes className="w-5 h-5 text-sky-400 animate-pulse" />
              <span>Statistiques Globales & Métriques de la Colonie</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold">
              SOL {gameState.clock.sol}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Population Actuelle</div>
              <div className="text-xl font-bold text-sky-400">{Math.round(gameState.resources.population_active)}</div>
              <div className="text-[9px] text-emerald-400">+1.2% par Sol</div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Bâtiments Installés</div>
              <div className="text-xl font-bold text-emerald-400">{gameState.buildings.length}</div>
              <div className="text-[9px] text-slate-400">Toutes couches Z</div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Stabilité Politique</div>
              <div className="text-xl font-bold text-amber-400">{Math.round(gameState.genesis.pillar_1_governance.senate_stability)}%</div>
              <div className="text-[9px] text-slate-400">Équilibre Factions</div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Réseau Électrique GW</div>
              <div className="text-xl font-bold text-purple-400">{Math.round(gameState.resources.energy_gw)} GW</div>
              <div className="text-[9px] text-emerald-400">Charge nominale</div>
            </div>
          </div>

          <div className="pt-4 border-t border-sky-500/10">
            <D3ResourceChart historyDeltas={gameState.historyDeltas} isLight={theme.isLight} />
          </div>
        </div>
      )}
    </div>
  );
}
