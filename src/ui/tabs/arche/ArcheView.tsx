import React, { useState, useEffect } from "react";
import { GameState } from "../../../simulation/engine";
import { ThemeDefinition } from "../../../theme/themes";
import { Decree, SectorState } from "../../../types/simulation";
import { proceduralRadio } from "../../../audio/radio";
import { useTooltip } from "../../components/GlobalTooltip";
import {
  Shield,
  Cpu,
  BookOpen,
  Vote,
  Users,
  Check,
  AlertOctagon,
  Flame,
  Zap,
  Activity,
  Award,
} from "lucide-react";

interface ArcheViewProps {
  gameState: GameState;
  theme: ThemeDefinition;
  activeTab: "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS";
  onToggleDecree: (decreeId: string) => void;
  onAllocateSectorEnergy: (sectorId: string, delta: number) => void;
  onEnactSenateLaw: (factionId: string, lawType: string) => void;
}

export function ArcheView({
  gameState,
  theme,
  activeTab,
  onToggleDecree,
  onAllocateSectorEnergy,
  onEnactSenateLaw,
}: ArcheViewProps) {
  const { showTooltip, hideTooltip } = useTooltip();
  const [selectedSector, setSelectedSector] = useState<SectorState | null>(gameState.sectors[0] || null);

  useEffect(() => {
    return () => {
      hideTooltip();
    };
  }, [hideTooltip]);

  const leader = gameState.genesis.pillar_1_governance.leader_profile;

  return (
    <div className="flex flex-col min-h-full p-2 md:p-4 max-w-7xl mx-auto space-y-4 overflow-y-auto overscroll-y-contain webkit-overflow-scrolling-touch touch-pan-y">
      {/* ========================================================= */}
      {/* 1. GOUVERNANCE & SÉNAT DES FACTIONS                       */}
      {/* ========================================================= */}
      {activeTab === "GOUVERNANCE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne Gauche & Centre : Les 3 Factions et le Sénat */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black/70 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <div className="text-sm font-bold text-cyan-400 font-mono uppercase flex items-center gap-2">
                    <Vote className="w-4 h-4" /> Chambre du Sénat & Assemblée Bicamérale
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Régime actuel : <span className="text-slate-200">{gameState.genesis.pillar_1_governance.regime_type}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Stabilité Sénatoriale</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {Math.round(gameState.genesis.pillar_1_governance.senate_stability)}%
                  </div>
                </div>
              </div>

              {/* Factions Cards */}
              <div className="space-y-3">
                {gameState.factions.map((faction) => (
                  <div
                    key={faction.id}
                    className="p-4 bg-slate-900/80 border border-white/10 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: faction.color }}
                        />
                        <span className="font-bold text-sm text-slate-200">{faction.name}</span>
                        <span className="text-xs text-slate-400 font-mono">({faction.doctrine})</span>
                      </div>
                      <span className="text-xs font-mono text-slate-300">
                        {faction.population_pct}% des citoyens
                      </span>
                    </div>

                    {/* Gauges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Taux d'Approbation</span>
                          <span className="text-cyan-300 font-bold">{Math.round(faction.approval_rating)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full transition-all"
                            style={{ width: `${faction.approval_rating}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Indice de Radicalisation</span>
                          <span className="text-amber-400 font-bold">{Math.round(faction.radicalization_level)}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${faction.radicalization_level}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Demands */}
                    <div className="text-[11px] text-slate-400 font-sans pt-1 border-t border-white/5">
                      <span className="font-mono text-slate-500">Revendications actuelles :</span>{" "}
                      {faction.demands.join(" · ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne Droite : Mandat & Prérogatives du Leader */}
          <div className="bg-black/70 border border-white/10 rounded-xl p-4 space-y-4 font-mono text-xs">
            <div className="text-cyan-400 font-bold border-b border-white/10 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4" /> Prérogatives du Primat-Archonte
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg space-y-1.5">
              <div className="text-slate-400">Primat en exercice :</div>
              <div className="font-bold text-sm text-cyan-300">{leader.title}</div>
              <div className="text-[11px] text-slate-400">
                Alignement : <span className="text-slate-200">{leader.philosophical_alignment}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-slate-400 font-bold">Compétences Régaliennes :</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Recherche & Développement :</span>
                  <span className="text-cyan-300 font-bold">{leader.mandate.skills.R_AND_D}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Diplomatie & Persuasion :</span>
                  <span className="text-emerald-300 font-bold">{leader.mandate.skills.DIPLOMATIE}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingénierie Industrielle :</span>
                  <span className="text-amber-300 font-bold">{leader.mandate.skills.INDUSTRIE}/100</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-slate-400 font-bold mb-2">Avantages Actifs :</div>
              <div className="flex flex-wrap gap-1.5">
                {leader.mandate.active_perks.map((perk, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-cyan-950 border border-cyan-500/30 text-cyan-300 rounded text-[10px]"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. INFRASTRUCTURES & PLAN DES 16 SECTEURS                 */}
      {/* ========================================================= */}
      {activeTab === "INFRASTRUCTURES_ARCHE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Grille des 16 Secteurs */}
          <div className="lg:col-span-2 bg-black/70 border border-cyan-500/30 rounded-xl p-4 space-y-4">
            <div className="text-sm font-bold text-cyan-400 font-mono flex items-center justify-between border-b border-white/10 pb-2">
              <span>PLAN DE MASSE DES 16 SECTEURS DE L'ARCHE</span>
              <span className="text-xs text-slate-400">16 / 16 OPÉRATIONNELS</span>
            </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {gameState.sectors.map((sec) => {
                const isSelected = selectedSector?.id === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      proceduralRadio.playUIChime("CLICK");
                      setSelectedSector(sec);
                    }}
                    onMouseEnter={(e) => {
                      showTooltip({
                        title: sec.name,
                        category: "Secteur Arche",
                        status: `Niveau ${sec.techLevel} • ${sec.isOnline ? "En ligne" : "Hors ligne"}`,
                        description: `${sec.description} Personnel assigné: ${sec.personnelAssigned} colons. Intégrité de la coque: ${sec.integrityPct}%.`,
                        modifiers: [
                          `+${sec.techLevel * 5}% Multiplicateur d'efficience locale`,
                          `+${Math.round(sec.integrityPct / 10)}% Résistance thermique du secteur`
                        ]
                      }, e);
                    }}
                    onMouseLeave={hideTooltip}
                    className={`p-3 rounded-xl border font-mono text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                        : "bg-slate-900/70 border-white/10 hover:border-cyan-500/30 text-slate-300"
                    }`}
                  >
                    <div className="font-bold text-[11px] text-cyan-300">{sec.name}</div>
                    <div className="text-[10px] text-slate-400 my-1">{sec.categoryGroup}</div>
                    <div className="flex justify-between text-[10px]">
                      <span>Intégrité:</span>
                      <span
                        className={
                          sec.integrityPct > 70
                            ? "text-emerald-400 font-bold"
                            : "text-amber-400 font-bold"
                        }
                      >
                        {sec.integrityPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fiche d'Inspection du Secteur Sélectionné */}
          {selectedSector && (
            <div className="bg-black/70 border border-white/10 rounded-xl p-4 space-y-4 font-mono text-xs">
              <div className="text-cyan-400 font-bold border-b border-white/10 pb-2 flex items-center justify-between">
                <span>{selectedSector.name}</span>
                <span className="text-[10px] text-slate-400">Code: {selectedSector.code}</span>
              </div>

              <div className="space-y-2">
                <div className="text-slate-300 font-sans">{selectedSector.description}</div>
                <div className="p-3 bg-slate-900/80 rounded-lg space-y-2 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Personnel assigné :</span>
                    <span className="text-slate-200 font-bold">{selectedSector.personnelAssigned} colons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Niveau Technologique :</span>
                    <span className="text-amber-400 font-bold">Niveau {selectedSector.techLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statut Réseau :</span>
                    <span className="text-emerald-400 font-bold">{selectedSector.isOnline ? "EN LIGNE" : "HORS LIGNE"}</span>
                  </div>
                </div>
              </div>

              {/* Ajustement énergétique */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-slate-400 font-bold">Ajustement Énergie :</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAllocateSectorEnergy(selectedSector.id, -10)}
                    onMouseEnter={(e) => {
                      showTooltip({
                        title: "Réduction Énergie (-10 MW)",
                        category: "Réseau Énergétique",
                        status: "Ajustement Électrique",
                        description: "Diminue la charge allouée à ce secteur de 10 MW. Utile pour économiser les réserves de l'Arche en cas de crise majeure.",
                        modifiers: [
                          "-5% Rendement industriel du secteur",
                          "-10% Débit de filtrage de l'air"
                        ]
                      }, e);
                    }}
                    onMouseLeave={hideTooltip}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-white/10 cursor-pointer"
                  >
                    - 10 MW
                  </button>
                  <button
                    onClick={() => onAllocateSectorEnergy(selectedSector.id, 10)}
                    onMouseEnter={(e) => {
                      showTooltip({
                        title: "Augmentation Énergie (+10 MW)",
                        category: "Réseau Énergétique",
                        status: "Ajustement Électrique",
                        description: "Injecte 10 MW supplémentaires dans les bobines thermo-couples de ce secteur pour sur-cadencer la productivité.",
                        modifiers: [
                          "+10% Débit d'impression des nanorobots",
                          "+8% Efficacité de filtrage et recyclage"
                        ]
                      }, e);
                    }}
                    onMouseLeave={hideTooltip}
                    className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded border border-cyan-400 cursor-pointer"
                  >
                    + 10 MW
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DÉCRETS & ARBRE DE MANDAT                              */}
      {/* ========================================================= */}
      {activeTab === "DECRETS" && (
        <div className="space-y-4">
          <div className="bg-black/70 border border-cyan-500/30 rounded-xl p-4">
            <div className="text-sm font-bold text-cyan-400 font-mono mb-4 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Recueil des Décrets & Édits de l'Arche
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Décrets Actifs : {gameState.decrees.filter((d) => d.active).length} / {gameState.decrees.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {gameState.decrees.map((decree) => (
                <div
                  key={decree.id}
                  onClick={() => {
                    proceduralRadio.playUIChime("CONFIRM");
                    onToggleDecree(decree.id);
                  }}
                  className={`p-4 rounded-xl border font-mono text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    decree.active
                      ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                      : "bg-slate-900/60 border-white/10 hover:border-cyan-500/30 text-slate-400"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-200">{decree.title}</span>
                      {decree.active && (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mb-3">{decree.description}</div>
                  </div>

                  <div className="space-y-1 text-[10px] pt-2 border-t border-white/5">
                    <div className="text-cyan-300">
                      Impact : {decree.effectsSummary}
                    </div>
                    <div className="text-amber-400">
                      Coût d'entretien : {decree.costPerSol.energy_gw || 0} GW / Sol
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
