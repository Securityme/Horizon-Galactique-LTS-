import React, { useState } from "react";
import { GameState } from "../../../simulation/engine";
import { ThemeDefinition } from "../../../theme/themes";
import { CelestialBody, RivalArchon } from "../../../types/simulation";
import { proceduralRadio } from "../../../audio/radio";
import {
  Compass,
  Globe,
  Radio,
  Rocket,
  Shield,
  Zap,
  Crosshair,
  Handshake,
  DollarSign,
  Sword,
  AlertTriangle,
} from "lucide-react";

interface Spatial4XViewProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onLaunchProbe: (bodyId: string) => void;
  onMineAsteroid: (bodyId: string) => void;
  onDiplomaticAction: (rivalId: string, actionType: "PACT" | "TRADE" | "SANCTION") => void;
}

export function Spatial4XView({
  gameState,
  theme,
  onLaunchProbe,
  onMineAsteroid,
  onDiplomaticAction,
}: Spatial4XViewProps) {
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(
    gameState.celestialBodies[0] || null
  );
  const [selectedRival, setSelectedRival] = useState<RivalArchon | null>(
    gameState.rivalArchons[0] || null
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-full p-2 md:p-4 max-w-7xl mx-auto overflow-y-auto overscroll-y-contain webkit-overflow-scrolling-touch touch-pan-y">
      {/* Colonne Gauche & Centre : Carte Stellaire & Corps Célestes */}
      <div className="flex-1 space-y-4">
        {/* Radar Système Solaire */}
        <div className="bg-black/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[340px]">
          <div className="w-full flex items-center justify-between text-xs font-mono text-cyan-400 mb-2 border-b border-white/10 pb-2">
            <span>SYSTÈME : {gameState.genesis.pillar_2_environment.star_system}</span>
            <span>RADAR TACTIQUE 4X ACTIF</span>
          </div>

          {/* Visualization Canvas / Orbit Nodes */}
          <div className="relative w-72 h-72 rounded-full border border-cyan-500/20 flex items-center justify-center">
            {/* Sun Core */}
            <div className="w-8 h-8 rounded-full bg-amber-400/90 shadow-[0_0_20px_#f59e0b] animate-pulse flex items-center justify-center text-[9px] font-bold text-black">
              ★
            </div>

            {/* Orbit 1 */}
            <div className="absolute w-36 h-36 rounded-full border border-dashed border-cyan-500/30" />
            {/* Orbit 2 */}
            <div className="absolute w-56 h-56 rounded-full border border-dashed border-cyan-500/20" />
            {/* Orbit 3 */}
            <div className="absolute w-72 h-72 rounded-full border border-dashed border-cyan-500/10" />

            {/* Celestial Nodes on Orbit */}
            {gameState.celestialBodies.map((body, idx) => {
              const angle = (idx * (360 / gameState.celestialBodies.length) * Math.PI) / 180;
              const radius = 30 + idx * 30;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isSelected = selectedBody?.id === body.id;

              return (
                <div
                  key={body.id}
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    setSelectedBody(body);
                  }}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_#00d4ff] scale-125"
                      : body.type === "PLANET"
                      ? "bg-blue-600 text-white border border-cyan-400"
                      : "bg-stone-700 text-stone-200 border border-stone-400"
                  }`}
                  title={body.name}
                >
                  {body.name.substring(0, 2)}
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-400 mt-3 text-center">
            Cliquez sur un corps céleste pour initialiser le balayage orbital ou déployer une sonde.
          </div>
        </div>

        {/* Fiche d'Inspection Corps Céleste */}
        {selectedBody && (
          <div className="bg-black/70 border border-white/10 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="font-bold text-cyan-300 text-sm">{selectedBody.name} ({selectedBody.type})</div>
              <span className="text-[10px] text-slate-400">Scan : {selectedBody.scanned ? "COMPLET" : "NON BALAYÉ"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                <div className="text-[10px] text-slate-400">Score d'Habitabilité</div>
                <div className="text-sm font-bold text-emerald-400">{selectedBody.habitabilityScore}/100</div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                <div className="text-[10px] text-slate-400">Distance Orbitale</div>
                <div className="text-sm font-bold text-cyan-300">{selectedBody.orbitRadius} AU</div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                <div className="text-[10px] text-slate-400">Réserves Détectées</div>
                <div className="text-xs font-bold text-amber-300 truncate">
                  {Object.keys(selectedBody.resources).join(", ") || "Minerais bruts"}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {!selectedBody.scanned ? (
                <button
                  onClick={() => {
                    proceduralRadio.playSpatialProbeSweep();
                    onLaunchProbe(selectedBody.id);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 text-black font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_#00d4ff]"
                >
                  <Rocket className="w-4 h-4" /> Lancer une Sonde d'Exploration (20 GW)
                </button>
              ) : (
                <button
                  onClick={() => {
                    proceduralRadio.playSpatialProbeSweep();
                    onMineAsteroid(selectedBody.id);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_#f59e0b]"
                >
                  <Zap className="w-4 h-4" /> Extraction Laser Orbitale
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Colonne Droite : Les Gouverneurs IA Rivaux */}
      <div className="w-full lg:w-84 space-y-4">
        <div className="bg-black/70 border border-white/10 rounded-xl p-4 font-mono text-xs space-y-3">
          <div className="text-cyan-400 font-bold border-b border-white/10 pb-2 flex items-center justify-between">
            <span>GOUVERNANCE DES RIVAUX ({gameState.rivalArchons.length})</span>
            <span className="text-[10px] text-slate-400">ÉMULATEUR 4X</span>
          </div>

          <div className="space-y-2">
            {gameState.rivalArchons.map((rival) => {
              const isSelected = selectedRival?.id === rival.id;
              return (
                <div
                  key={rival.id}
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    setSelectedRival(rival);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(0,212,255,0.25)]"
                      : "bg-slate-900/70 border-white/5 hover:border-cyan-500/30 text-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-200">{rival.name}</span>
                    <span className="text-[10px] text-cyan-300 font-bold">{rival.archetype}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{rival.colonyName} · {rival.systemLocation}</div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-white/5">
                    <span>Pop: {rival.population}</span>
                    <span>Puissance: {rival.militaryPower}</span>
                    <span className={rival.pactStatus === "ALLIANCE" ? "text-emerald-400" : "text-amber-400"}>
                      {rival.pactStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions Diplomatiques avec le Rival Sélectionné */}
          {selectedRival && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="font-bold text-slate-300">Canal Diplomatique avec {selectedRival.name} :</div>
              <div className="text-[10px] text-slate-400 italic">"{selectedRival.lastAction}"</div>

              <div className="grid grid-cols-3 gap-1.5 pt-2">
                <button
                  onClick={() => onDiplomaticAction(selectedRival.id, "PACT")}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-emerald-500/30 flex flex-col items-center gap-0.5 cursor-pointer text-[10px]"
                >
                  <Handshake className="w-3.5 h-3.5" /> Pacte
                </button>
                <button
                  onClick={() => onDiplomaticAction(selectedRival.id, "TRADE")}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-amber-500/30 flex flex-col items-center gap-0.5 cursor-pointer text-[10px]"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Échange
                </button>
                <button
                  onClick={() => onDiplomaticAction(selectedRival.id, "SANCTION")}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded border border-red-500/30 flex flex-col items-center gap-0.5 cursor-pointer text-[10px]"
                >
                  <Sword className="w-3.5 h-3.5" /> Sanction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
