import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import {
  Layers,
  Zap,
  Droplets,
  Wind,
  Leaf,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Boxes,
  Activity,
  BarChart3,
  TrendingUp,
  Cpu,
  Building2,
  X,
} from "lucide-react";

interface LogisticsSideDrawerProps {
  isOpen: boolean;
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
  onAllocateSectorEnergy?: (sectorId: string, delta: number) => void;
  onOpenNiaModal?: () => void;
}

export function LogisticsSideDrawer({
  isOpen,
  gameState,
  theme,
  onClose,
  onAllocateSectorEnergy,
  onOpenNiaModal,
}: LogisticsSideDrawerProps) {
  const isLight = theme.isLight ?? false;
  const [activeTab, setActiveTab] = useState<"SECTORS" | "QUEUE" | "BALANCES">("SECTORS");

  if (!isOpen) return null;

  const res = gameState.resources;
  const sectors = gameState.sectors || [];
  const buildQueue = gameState.buildQueue || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex flex-row-reverse select-none animate-in slide-in-from-right duration-250">
      <div
        className={`w-80 sm:w-96 h-full border-l flex flex-col shadow-2xl font-mono ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/20"
            : "bg-slate-950/95 border-sky-500/40 text-slate-100 backdrop-blur-md shadow-sky-500/10"
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/80 border-white/10"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>POSTE LOGISTIQUE R1</span>
              </div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Réseaux, Secteurs & Chantiers
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
                ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900"
                : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* SubTab Navigation */}
        <div className={`flex border-b text-xs ${isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-black/40"}`}>
          {[
            { id: "SECTORS" as const, label: "16 Secteurs", count: sectors.length },
            { id: "QUEUE" as const, label: "Files Chantiers", count: buildQueue.length },
            { id: "BALANCES" as const, label: "Bilan Énergie", count: null },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setActiveTab(tab.id);
                }}
                className={`flex-1 py-2 text-[11px] font-bold transition-all border-b-2 cursor-pointer relative ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scroll-smooth-touch">
          {activeTab === "SECTORS" && (
            <div className="space-y-3">
              <div className="font-bold text-emerald-400 text-[11px] uppercase flex items-center justify-between">
                <span>Attribution Électrique des Secteurs</span>
                <span className="text-[10px] text-sky-400">Total : {Math.round(res.energy_gw)} GW</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {sectors.slice(0, 8).map((sec) => (
                  <div
                    key={sec.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-white/10"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${sec.isOnline ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {sec.name} [{sec.code}]
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Intégrité : {sec.integrityPct}% · Personnel : {sec.personnelAssigned} hab.
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          proceduralRadio.playUIChime("CLICK");
                          onAllocateSectorEnergy?.(sec.id, -5);
                        }}
                        className="w-6 h-6 rounded border border-white/10 bg-black/40 text-slate-300 font-bold hover:bg-white/10 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          proceduralRadio.playUIChime("CLICK");
                          onAllocateSectorEnergy?.(sec.id, 5);
                        }}
                        className="w-6 h-6 rounded border border-white/10 bg-black/40 text-slate-300 font-bold hover:bg-white/10 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "QUEUE" && (
            <div className="space-y-3">
              <div className="font-bold text-sky-400 text-[11px] uppercase flex items-center justify-between">
                <span>Chantiers en Cours ({buildQueue.length})</span>
                <button
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    onOpenNiaModal?.();
                  }}
                  className="text-[10px] text-purple-400 underline cursor-pointer"
                >
                  N.I.A. Matrix
                </button>
              </div>

              {buildQueue.length === 0 ? (
                <div className="p-4 text-center text-slate-400 italic bg-black/20 rounded-xl border border-white/5">
                  Aucun bâtiment en file d'attente de construction.
                </div>
              ) : (
                buildQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-900/80 border border-sky-500/30 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-sky-300 text-xs">
                      <span>{item.name}</span>
                      {item.auto_built_by_nia && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-600 text-white uppercase font-extrabold">
                          N.I.A. AUTO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Secteur {item.position.sector_id} [{item.position.z}]
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-sky-400"
                        style={{
                          width: `${Math.round(
                            (item.progress_ticks / Math.max(1, item.total_duration_ticks)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "BALANCES" && (
            <div className="space-y-3">
              <div className="font-bold text-amber-400 text-[11px] uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Bilan de Consommation Flux
              </div>

              <div className="space-y-2">
                {[
                  { label: "Énergie (GW)", val: Math.round(res.energy_gw), icon: Zap, color: "text-amber-400" },
                  { label: "Oxygène (L)", val: Math.round(res.oxygen_l), icon: Wind, color: "text-sky-400" },
                  { label: "Eau Douce (L)", val: Math.round(res.water_l), icon: Droplets, color: "text-blue-400" },
                  { label: "Biomasse (kg)", val: Math.round(res.biomass_kg), icon: Leaf, color: "text-emerald-400" },
                  { label: "Alliages (t)", val: Math.round(res.alloys_tonnes), icon: Boxes, color: "text-orange-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="p-2.5 bg-slate-900/60 border border-white/10 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-slate-300">{item.label}</span>
                      </div>
                      <span className="font-bold text-xs">{item.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="flex-1 bg-black/50 backdrop-blur-xs cursor-pointer"
      />
    </div>
  );
}
