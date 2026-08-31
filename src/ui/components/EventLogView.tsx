import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { JournalItem, MicroLogItem, EventResolutionItem, SuperEventItem } from "../../types/journal";
import { ThemeDefinition } from "../../theme/themes";
import {
  Terminal,
  Search,
  Filter,
  Flame,
  User,
  Shield,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Cpu,
  Bookmark,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface EventLogViewProps {
  gameState: GameState;
  theme: ThemeDefinition;
}

export function EventLogView({ gameState, theme }: EventLogViewProps) {
  const isLight = theme.isLight ?? false;
  const [filter, setFilter] = useState<"ALL" | "DECISIONS" | "INCIDENTS" | "NIA">("ALL");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const journalItems = gameState.journalItems || [];

  // Sort items descending (newest first)
  const sortedItems = [...journalItems].sort((a, b) => {
    // Compares continuous Sol values
    return (b.timestamp?.sol || 0) - (a.timestamp?.sol || 0);
  });

  // Filter items based on selected category and search query
  const filteredItems = sortedItems.filter((item) => {
    // 1. Category Filter
    if (filter === "DECISIONS") {
      if (item.type !== "EVENT_RESOLUTION" && item.type !== "SUPER_EVENT") return false;
    } else if (filter === "INCIDENTS") {
      if (item.type !== "MICRO_LOG") return false;
      // Filter warnings/combat/errors
      const category = (item as MicroLogItem).category;
      if (category !== "ENVIRONMENT" && category !== "COMBAT" && category !== "SYSTEM") return false;
    } else if (filter === "NIA") {
      // Filter NIA built actions
      if (item.type !== "MICRO_LOG") return false;
      const micro = item as MicroLogItem;
      if (!micro.code.includes("NIA") && !micro.message.includes("N.I.A.")) return false;
    }

    // 2. Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      let textToSearch = "";
      if (item.type === "MICRO_LOG") {
        textToSearch = (item as MicroLogItem).message + " " + (item as MicroLogItem).code;
      } else if (item.type === "SUPER_EVENT") {
        textToSearch = (item as SuperEventItem).title + " " + (item as SuperEventItem).loreDescription;
      } else if (item.type === "EVENT_RESOLUTION") {
        textToSearch = (item as EventResolutionItem).selectedChoiceLabel + " " + (item as EventResolutionItem).narrativeOutcome;
      }
      if (!textToSearch.toLowerCase().includes(q)) return false;
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to render log types & icons
  const getLogMeta = (item: JournalItem) => {
    switch (item.type) {
      case "SUPER_EVENT":
        return {
          bg: isLight ? "bg-purple-50 border-purple-200" : "bg-purple-950/25 border-purple-500/40",
          text: "text-purple-400",
          icon: Sparkles,
          label: "Dilemme LLM",
        };
      case "EVENT_RESOLUTION":
        return {
          bg: isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/25 border-emerald-500/40",
          text: "text-emerald-400",
          icon: Sliders,
          label: "Décision",
        };
      case "MICRO_LOG":
        const cat = (item as MicroLogItem).category;
        switch (cat) {
          case "SYSTEM":
            const isNia = (item as MicroLogItem).code.includes("NIA");
            return {
              bg: isLight ? "bg-sky-50 border-sky-200" : "bg-sky-950/25 border-sky-500/30",
              text: isNia ? "text-purple-400" : "text-sky-400",
              icon: isNia ? Cpu : Terminal,
              label: isNia ? "N.I.A. Engine" : "Système",
            };
          case "ENVIRONMENT":
            return {
              bg: isLight ? "bg-amber-50 border-amber-200" : "bg-amber-950/25 border-amber-500/30",
              text: "text-amber-400",
              icon: Flame,
              label: "Incident",
            };
          case "COMBAT":
            return {
              bg: isLight ? "bg-rose-50 border-rose-200" : "bg-rose-950/25 border-rose-500/30",
              text: "text-rose-400",
              icon: Shield,
              label: "Sécurité",
            };
          default:
            return {
              bg: isLight ? "bg-slate-100 border-slate-300" : "bg-slate-900/60 border-white/5",
              text: "text-slate-400",
              icon: Activity,
              label: "Status",
            };
        }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-mono">
      {/* Search & Filter Header */}
      <div className="space-y-2 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-sky-500 ${
              isLight
                ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                : "bg-slate-950/80 border-sky-500/20 text-slate-100 placeholder-slate-500"
            }`}
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Quick Filter Pill Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
          {[
            { id: "ALL" as const, label: "Tous" },
            { id: "DECISIONS" as const, label: "Décisions" },
            { id: "INCIDENTS" as const, label: "Incidents" },
            { id: "NIA" as const, label: "N.I.A." },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-2 py-1 rounded-md border font-bold cursor-pointer whitespace-nowrap transition-all ${
                filter === btn.id
                  ? "bg-sky-500/10 border-sky-500 text-sky-400 font-extrabold"
                  : isLight
                  ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                  : "bg-slate-900 border-white/5 text-slate-400 hover:border-white/10"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Stream Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic bg-black/10 rounded-xl border border-white/5 text-xs">
            Aucun événement enregistré dans les journaux de bord.
          </div>
        ) : (
          filteredItems.map((item) => {
            const meta = getLogMeta(item);
            const Icon = meta.icon;
            const isExpanded = !!expandedItems[item.id];
            const timestamp = item.timestamp?.stardateLabel || `SOL ${item.timestamp?.sol?.toFixed(2) || "0.00"}`;

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col space-y-1.5 ${meta.bg}`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${meta.text}`} />
                    <span className={`text-[10px] font-extrabold uppercase ${meta.text}`}>
                      {meta.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 tracking-wider font-semibold">
                    {timestamp}
                  </span>
                </div>

                {/* Content Body */}
                <div className="leading-relaxed">
                  {item.type === "MICRO_LOG" && (
                    <div className="text-slate-200 text-[11px] font-sans">
                      {(item as MicroLogItem).message}
                    </div>
                  )}

                  {item.type === "SUPER_EVENT" && (
                    <div className="space-y-1">
                      <div className="font-bold text-purple-300">
                        {(item as SuperEventItem).title}
                      </div>
                      <div className="text-slate-400 text-[10px] italic leading-tight line-clamp-2 font-sans">
                        {(item as SuperEventItem).loreDescription}
                      </div>
                    </div>
                  )}

                  {item.type === "EVENT_RESOLUTION" && (
                    <div className="space-y-1">
                      <div className="text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        Choix : {(item as EventResolutionItem).selectedChoiceLabel}
                      </div>
                      <div className="text-slate-300 text-[11px] leading-relaxed font-sans line-clamp-3">
                        {(item as EventResolutionItem).narrativeOutcome}
                      </div>
                    </div>
                  )}
                </div>

                {/* Micro Deltas Badge Row (for actions/resolutions affecting resources) */}
                {item.type === "EVENT_RESOLUTION" && (item as EventResolutionItem).appliedDeltas && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Object.entries((item as EventResolutionItem).appliedDeltas).map(([resKey, val]) => {
                      if (val === 0) return null;
                      const isPos = val > 0;
                      return (
                        <span
                          key={resKey}
                          className={`px-1 rounded text-[9px] font-semibold tracking-tight border ${
                            isPos
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                          }`}
                        >
                          {resKey.split("_")[0].toUpperCase()} {isPos ? "+" : ""}
                          {val}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Expand Details Button */}
                {(item.type === "SUPER_EVENT" || item.type === "EVENT_RESOLUTION") && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                  >
                    <span>{isExpanded ? "Replier les détails" : "Développer le rapport complet"}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                {/* Expanded Drawer Details Block */}
                {isExpanded && (
                  <div className="pt-2 border-t border-white/10 space-y-2 animate-in fade-in duration-200 font-sans text-slate-300 text-[11px] leading-relaxed">
                    {item.type === "SUPER_EVENT" && (
                      <div className="space-y-1.5">
                        <p className="italic text-slate-400">{(item as SuperEventItem).environmentalContext}</p>
                        <div className="p-2 bg-black/40 rounded-lg border border-white/5 text-[10px] space-y-1">
                          <div className="font-semibold text-purple-400 font-mono">OPTIONS DE DILEMME :</div>
                          {(item as SuperEventItem).choices.map((choice, idx) => (
                            <div key={idx} className="flex gap-1 text-[10px] leading-tight">
                              <span className="text-purple-500 font-mono font-bold">•</span>
                              <div>
                                <span className="font-bold text-slate-200">{choice.label}</span> : {choice.flavorText}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.type === "EVENT_RESOLUTION" && (
                      <div className="space-y-1.5">
                        {/* If there was a dice roll, display it */}
                        {(item as EventResolutionItem).diceRollResult && (
                          <div className="p-1.5 bg-sky-950/30 border border-sky-500/20 rounded-md flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400">Jet de dés ({(item as EventResolutionItem).diceRollResult?.statUsed.toUpperCase()}) :</span>
                            <span className={`font-bold flex items-center gap-1 ${(item as EventResolutionItem).diceRollResult?.isSuccess ? "text-emerald-400" : "text-rose-400"}`}>
                              {(item as EventResolutionItem).diceRollResult?.isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {(item as EventResolutionItem).diceRollResult?.totalScore} vs DC {(item as EventResolutionItem).diceRollResult?.difficultyClass}
                            </span>
                          </div>
                        )}
                        <p className="font-sans text-slate-300">
                          {(item as EventResolutionItem).narrativeOutcome}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
