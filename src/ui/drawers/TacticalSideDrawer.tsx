import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import {
  Shield,
  Zap,
  Radio,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Activity,
  Cpu,
  Eye,
  Crosshair,
  Sliders,
  CheckCircle2,
  X,
  Compass,
} from "lucide-react";

interface TacticalSideDrawerProps {
  isOpen: boolean;
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
  onToggleDecree?: (decreeId: string) => void;
  onResolveEvent?: (eventId: string, choiceId: string) => void;
  onOpenNiaModal?: () => void;
}

export function TacticalSideDrawer({
  isOpen,
  gameState,
  theme,
  onClose,
  onToggleDecree,
  onResolveEvent,
  onOpenNiaModal,
}: TacticalSideDrawerProps) {
  const isLight = theme.isLight ?? false;
  const [activeTab, setActiveTab] = useState<"DIRECTIVES" | "CRISIS" | "SCANNER">("DIRECTIVES");

  if (!isOpen) return null;

  const leader = gameState.genesis.pillar_1_governance.leader_profile;
  const activeEvents = gameState.events || [];
  const urgentEvents = activeEvents.filter((e) => !e.resolved);

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex select-none animate-in slide-in-from-left duration-250">
      <div
        className={`w-80 sm:w-96 h-full border-r flex flex-col shadow-2xl font-mono ${
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
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400">
              <Crosshair className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <span>POSTE TACTIQUE L1</span>
              </div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Directives & Réponse de Crise Rapide
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
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b text-xs ${isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-black/40"}`}>
          {[
            { id: "DIRECTIVES" as const, label: "Directives", count: null },
            { id: "CRISIS" as const, label: "Crises", count: urgentEvents.length },
            { id: "SCANNER" as const, label: "Radar Sol", count: null },
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
                    ? "border-sky-500 text-sky-400 bg-sky-500/10 font-extrabold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scroll-smooth-touch">
          {activeTab === "DIRECTIVES" && (
            <div className="space-y-3">
              <div className="font-bold text-sky-400 flex items-center justify-between text-[11px] uppercase">
                <span>Directives du Gouverneur</span>
                <span className="text-[10px] text-amber-400">Fatigue : {Math.round(leader.fatigue_pct)}%</span>
              </div>

              {[
                {
                  id: "D1_EMERGENCY_RATIONING",
                  title: "Rationnement d'Urgence",
                  desc: "-20% Conso Biomasse, -10% Bonheur Colonial",
                  active: (gameState.decrees || []).some((d) => d.id === "D1_EMERGENCY_RATIONING" && d.active),
                },
                {
                  id: "D2_POWER_OVERDRIVE",
                  title: "Surchauffe Générateurs",
                  desc: "+25% Production MW, +5% Risque d'Avarie",
                  active: (gameState.decrees || []).some((d) => d.id === "D2_POWER_OVERDRIVE" && d.active),
                },
                {
                  id: "D3_RECYCLING_MANDATE",
                  title: "Protocole Zéro Gaspillage H₂O",
                  desc: "+15% Récupération Eau Douce",
                  active: (gameState.decrees || []).some((d) => d.id === "D3_RECYCLING_MANDATE" && d.active),
                },
              ].map((directive) => (
                <div
                  key={directive.id}
                  onClick={() => {
                    proceduralRadio.playUIChime("CLICK");
                    onToggleDecree?.(directive.id);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    directive.active
                      ? isLight
                        ? "bg-sky-50 border-sky-400 text-sky-950 font-bold"
                        : "bg-sky-950/40 border-sky-500 text-sky-200 font-bold shadow-sky-500/10"
                      : isLight
                      ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="text-xs flex items-center gap-1.5">
                      <span>{directive.title}</span>
                      {directive.active && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500 text-white uppercase font-extrabold">
                          ACTIF
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] opacity-80 font-normal">{directive.desc}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      directive.active ? "bg-sky-500 border-sky-400 text-white" : "border-slate-600"
                    }`}
                  >
                    {directive.active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  onOpenNiaModal?.();
                }}
                className="w-full py-2 px-3 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-900/40 transition-colors"
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                Délégué N.I.A. & Ordres Prioritaires
              </button>
            </div>
          )}

          {activeTab === "CRISIS" && (
            <div className="space-y-3">
              <div className="font-bold text-amber-400 text-[11px] uppercase">
                Événements & Alertes Actives ({urgentEvents.length})
              </div>

              {urgentEvents.length === 0 ? (
                <div className="p-4 text-center text-slate-400 italic bg-black/20 rounded-xl border border-white/5">
                  Aucune crise non résolue. Statut spatial nominal.
                </div>
              ) : (
                urgentEvents.map((evt) => (
                  <div
                    key={evt.event_id}
                    className="p-3 bg-slate-900 border border-amber-500/40 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {evt.category}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded uppercase font-bold">
                        {evt.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {evt.narrative.message}
                    </p>

                    {evt.roguelike_choices.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {evt.roguelike_choices.map((choice) => (
                          <button
                            key={choice.choice_id}
                            onClick={() => {
                              proceduralRadio.playUIChime("CONFIRM");
                              onResolveEvent?.(evt.event_id, choice.choice_id);
                            }}
                            className="w-full p-2 text-left rounded-lg bg-sky-950/60 border border-sky-500/40 text-sky-200 hover:bg-sky-900/60 transition-colors text-[10px] font-bold cursor-pointer"
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "SCANNER" && (
            <div className="space-y-3">
              <div className="font-bold text-emerald-400 text-[11px] uppercase flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Radar Environnemental & Atmosphère
              </div>

              <div className="p-3 bg-slate-900/60 border border-white/10 rounded-xl space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Pression Atmosphérique :</span>
                  <span className="font-bold text-sky-300">0.42 atm</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Pression O₂ au Sol :</span>
                  <span className="font-bold text-emerald-300">0.14 bar</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Radiations Gammas :</span>
                  <span className="font-bold text-amber-300">12.4 mSv/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stabilité Banquise / H₂O :</span>
                  <span className="font-bold text-blue-300">88%</span>
                </div>
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
