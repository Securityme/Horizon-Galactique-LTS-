import React, { useState, useRef, useEffect } from "react";
import {
  JournalItem,
  SuperEventItem,
  ChoiceOption,
  MicroLogItem,
  EventResolutionItem,
} from "../../../types/journal";
import { ThemeDefinition } from "../../../theme/themes";
import { proceduralRadio } from "../../../audio/radio";
import {
  Zap,
  CheckCircle,
  AlertTriangle,
  Flame,
  Shield,
  Bot,
  Activity,
  Compass,
  Cpu,
  Radio,
  Dices,
  Lock,
  Sparkles,
  Terminal,
  Filter,
  ArrowDownCircle,
  RadioTower,
  Wrench,
  Users,
  Feather,
} from "lucide-react";

interface JournalFeedProps {
  items: JournalItem[];
  playerStats: Record<string, number>;
  playerRoles?: string[];
  theme: ThemeDefinition;
  onExecuteChoice: (superEvent: SuperEventItem, choice: ChoiceOption) => void;
}

export function JournalFeed({
  items,
  playerStats,
  playerRoles = [],
  theme,
  onExecuteChoice,
}: JournalFeedProps) {
  const [filterType, setFilterType] = useState<"ALL" | "SUPER_EVENT" | "MICRO_LOG" | "EVENT_RESOLUTION" | "CRITICAL">("ALL");
  const [rollingChoiceId, setRollingChoiceId] = useState<string | null>(null);
  const [diceAnimValue, setDiceAnimValue] = useState<number | null>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll on new items
  useEffect(() => {
    if (autoScroll) {
      feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items, autoScroll]);

  // Filtrage des éléments
  const filteredItems = items.filter((item) => {
    if (filterType === "SUPER_EVENT") return item.type === "SUPER_EVENT";
    if (filterType === "MICRO_LOG") return item.type === "MICRO_LOG";
    if (filterType === "EVENT_RESOLUTION") return item.type === "EVENT_RESOLUTION";
    if (filterType === "CRITICAL") {
      if (item.type === "MICRO_LOG") return item.importance >= 4;
      if (item.type === "SUPER_EVENT") return item.status === "PENDING";
      return false;
    }
    return true;
  });

  const handleChoiceClick = (superEvent: SuperEventItem, choice: ChoiceOption) => {
    if (superEvent.status === "RESOLVED") return;

    if (choice.resolutionType === "SKILL_CHECK") {
      proceduralRadio.playUIChime("CLICK");
      setRollingChoiceId(choice.choiceId);

      // Animation rapide du jet de dé
      let counter = 0;
      const interval = setInterval(() => {
        setDiceAnimValue(Math.floor(Math.random() * 20) + 1);
        counter++;
        if (counter > 8) {
          clearInterval(interval);
          setRollingChoiceId(null);
          setDiceAnimValue(null);
          proceduralRadio.playUIChime("CONFIRM");
          onExecuteChoice(superEvent, choice);
        }
      }, 50);
    } else {
      proceduralRadio.playUIChime("CONFIRM");
      onExecuteChoice(superEvent, choice);
    }
  };

  const getMicroCategoryBadge = (cat: MicroLogItem["category"]) => {
    switch (cat) {
      case "SYSTEM":
        return {
          icon: Cpu,
          bg: theme.isLight ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-amber-950/60 text-amber-400 border-amber-800",
          label: "SYSTÈME",
        };
      case "CREW":
        return {
          icon: Users,
          bg: theme.isLight ? "bg-sky-100 text-sky-900 border-sky-300" : "bg-sky-950/60 text-sky-400 border-sky-800",
          label: "ÉQUIPAGE",
        };
      case "ENVIRONMENT":
        return {
          icon: Compass,
          bg: theme.isLight ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-emerald-950/60 text-emerald-400 border-emerald-800",
          label: "ENVIRONNEMENT",
        };
      case "COMBAT":
        return {
          icon: Shield,
          bg: theme.isLight ? "bg-rose-100 text-rose-900 border-rose-300" : "bg-rose-950/60 text-rose-400 border-rose-800",
          label: "COMBAT",
        };
      case "RESOURCE":
        return {
          icon: Zap,
          bg: theme.isLight ? "bg-purple-100 text-purple-900 border-purple-300" : "bg-purple-950/60 text-purple-400 border-purple-800",
          label: "RESSOURCE",
        };
      default:
        return {
          icon: Activity,
          bg: "bg-slate-800 text-slate-300 border-slate-700",
          label: "LOG",
        };
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-mono">
      {/* Header & Filtres du Journal */}
      <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
        theme.isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-slate-950/80 border-white/10 text-slate-200"
      }`}>
        <div className="flex items-center gap-2 font-bold tracking-wider">
          <Terminal className="w-4 h-4 text-sky-500" />
          <span>LE JOURNAL DE BORD UNIFIÉ — REGISTRE CONTINU & ÉVÉNEMENTS</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { id: "ALL", label: "Tous" },
            { id: "SUPER_EVENT", label: "⚡ Super-Événements" },
            { id: "MICRO_LOG", label: "Micro-Logs" },
            { id: "EVENT_RESOLUTION", label: "🎲 Résolutions" },
            { id: "CRITICAL", label: "Critiques" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                proceduralRadio.playUIChime("CLICK");
                setFilterType(tab.id as any);
              }}
              className={`px-2 py-1 rounded text-[10px] cursor-pointer transition-all border ${
                filterType === tab.id
                  ? theme.isLight
                    ? "bg-sky-600 text-white border-sky-700 font-bold shadow-xs"
                    : "bg-sky-500/20 border-sky-400 text-sky-300 font-bold"
                  : theme.isLight
                    ? "bg-white border-slate-300 text-slate-600 hover:text-slate-900"
                    : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fil de discussion unique */}
      <div className={`flex-1 overflow-y-auto scroll-smooth-touch p-3 md:p-4 rounded-xl border space-y-3 transition-colors ${
        theme.isLight ? "bg-white/90 border-slate-300 text-slate-900 shadow-inner" : "bg-slate-950/90 border-sky-500/20 text-slate-100"
      }`}>
        {filteredItems.length === 0 ? (
          <div className={`p-8 text-center text-xs opacity-60 italic border border-dashed rounded-lg ${
            theme.isLight ? "border-slate-300 text-slate-500" : "border-slate-800 text-slate-500"
          }`}>
            Aucun enregistrement correspondant au filtre actif dans les registres.
          </div>
        ) : (
          filteredItems.map((item) => {
            switch (item.type) {
              // =========================================================
              // 1. MICRO-LOG BRUT DÉTERMINISTE (Moteur de Jeu)
              // =========================================================
              case "MICRO_LOG": {
                const catBadge = getMicroCategoryBadge(item.category);
                const Icon = catBadge.icon;
                const isHighImportance = item.importance >= 4;

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 text-xs py-1 px-2 rounded-lg transition-all ${
                      isHighImportance
                        ? theme.isLight
                          ? "bg-rose-50 border border-rose-200 text-rose-950"
                          : "bg-rose-950/30 border border-rose-500/40 text-rose-200"
                        : theme.isLight
                          ? "hover:bg-slate-50 text-slate-700"
                          : "hover:bg-slate-900/60 text-slate-300 opacity-90 hover:opacity-100"
                    }`}
                  >
                    {/* Timestamp */}
                    <span className={`text-[10px] font-bold whitespace-nowrap pt-0.5 ${
                      theme.isLight ? "text-sky-700" : "text-cyan-400"
                    }`}>
                      [{item.timestamp.stardateLabel}]
                    </span>

                    {/* Category badge */}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 font-bold whitespace-nowrap ${catBadge.bg}`}>
                      <Icon className="w-2.5 h-2.5" />
                      {catBadge.label}
                    </span>

                    {/* Message */}
                    <span className="flex-1 font-sans text-xs leading-relaxed">
                      {item.message}
                    </span>

                    {/* Deltas if any */}
                    {item.deltas && Object.keys(item.deltas).length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        theme.isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300"
                      }`}>
                        {Object.entries(item.deltas)
                          .map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k}`)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                );
              }

              // =========================================================
              // 2. CARTE SUPER-ÉVÉNEMENT (LLM + 4 CHOIX STRICTS & ORACLE LIVRE-JEU)
              // =========================================================
              case "SUPER_EVENT": {
                const isResolved = item.status === "RESOLVED";

                return (
                  <div
                    key={item.id}
                    className={`p-4 md:p-5 rounded-2xl border-2 transition-all my-2.5 shadow-lg ${
                      isResolved
                        ? theme.isLight
                          ? "bg-slate-100/80 border-slate-300 opacity-80 text-slate-700"
                          : "bg-slate-900/50 border-slate-800/80 opacity-75"
                        : theme.isLight
                          ? "bg-sky-50/80 border-sky-500 text-slate-900 shadow-sky-100"
                          : "bg-slate-900/90 border-cyan-500/70 shadow-cyan-950/50"
                    }`}
                  >
                    {/* Header avec Encart Livre-Jeu & Oracle */}
                    <div className={`flex flex-wrap justify-between items-center text-xs pb-2.5 mb-3 border-b ${
                      theme.isLight ? "border-slate-300 text-sky-900" : "border-cyan-900/50 text-cyan-400"
                    }`}>
                      <div className="flex items-center gap-2 font-bold tracking-wider">
                        <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="font-mono">LIVRE-JEU & ORACLES — TOUR {item.timestamp.turn}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          theme.isLight ? "bg-sky-200 text-sky-900" : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                        }`}>
                          {item.category.replace("_", " ")}
                        </span>
                        {item.tier && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/40">
                            {item.tier}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-semibold font-mono">
                        <span>SOL {item.timestamp.sol.toFixed(1)}</span>
                        {isResolved ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Résolu
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold flex items-center gap-1 text-[11px] animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Décision Requise
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Synthèse narrative des Sols écoulés / Oracle info */}
                    <div className={`mb-3 p-3 rounded-xl border text-xs leading-relaxed italic ${
                      theme.isLight
                        ? "bg-white/90 border-slate-200 text-slate-600 shadow-xs"
                        : "bg-slate-950/70 border-slate-800 text-slate-400"
                    }`}>
                      <div className="font-bold text-[10px] not-italic uppercase text-sky-600 dark:text-cyan-400 mb-1 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Synthèse Diégétique N.I.A. & Oracles :
                      </div>
                      "{item.narrativeSummary}"
                    </div>

                    {/* Titre & Description du Dilemme */}
                    <h4 className={`text-base font-bold mb-1.5 flex items-center gap-2 ${
                      theme.isLight ? "text-amber-900" : "text-amber-400"
                    }`}>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {item.title}
                    </h4>

                    <p className={`text-xs font-sans leading-relaxed mb-3 ${
                      theme.isLight ? "text-slate-700" : "text-slate-300"
                    }`}>
                      {item.loreDescription}
                    </p>

                    {item.environmentalContext && (
                      <div className={`text-[11px] font-mono px-2.5 py-1 rounded-lg mb-4 border ${
                        theme.isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-black/40 border-white/5 text-slate-400"
                      }`}>
                        <strong>Contexte :</strong> {item.environmentalContext}
                      </div>
                    )}

                    {/* Les 4 Choix Stricts avec Matrice de Transition d'État */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {item.choices.map((choice, idx) => {
                        // Check prérequis de stats
                        let isReqMet = true;
                        let lockText = "";

                        if (choice.requirements?.stats) {
                          for (const [statKey, reqVal] of Object.entries(choice.requirements.stats)) {
                            const currentVal = playerStats[statKey] || 0;
                            if (currentVal < reqVal) {
                              isReqMet = false;
                              lockText = `${statKey} ${reqVal} (actuel: ${currentVal})`;
                            }
                          }
                        }

                        const isSelectedChoice = item.selectedChoiceId === choice.choiceId;
                        const isRollingThis = rollingChoiceId === choice.choiceId;

                        return (
                          <button
                            key={choice.choiceId}
                            disabled={isResolved || !isReqMet || rollingChoiceId !== null}
                            onClick={() => handleChoiceClick(item, choice)}
                            className={`text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center gap-3 cursor-pointer ${
                              isResolved
                                ? isSelectedChoice
                                  ? theme.isLight
                                    ? "bg-sky-100 border-sky-500 text-sky-950 font-bold shadow-xs"
                                    : "bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold ring-1 ring-cyan-500"
                                  : theme.isLight
                                    ? "bg-slate-100/50 border-slate-200 text-slate-500 opacity-60 cursor-not-allowed"
                                    : "bg-slate-950/40 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed"
                                : !isReqMet
                                  ? theme.isLight
                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed"
                                  : isRollingThis
                                    ? "bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse"
                                    : theme.isLight
                                      ? "bg-white hover:bg-sky-50/80 border-slate-300 hover:border-sky-500 text-slate-800 shadow-xs"
                                      : "bg-slate-900/80 hover:bg-slate-850 border-slate-700 hover:border-cyan-400 text-slate-200 shadow-md"
                            }`}
                          >
                            {/* Label & Flavor */}
                            <div className="flex flex-col space-y-0.5 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-bold ${
                                  isSelectedChoice ? "text-cyan-400" : ""
                                }`}>
                                  [{idx + 1}] {choice.label}
                                </span>
                                {choice.philosophicalAlignment && (
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                    theme.isLight ? "bg-slate-200 text-slate-700" : "bg-slate-800 text-slate-400"
                                  }`}>
                                    {choice.philosophicalAlignment}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[11px] font-sans ${
                                theme.isLight ? "text-slate-500" : "text-slate-400"
                              }`}>
                                {choice.flavorText}
                              </span>
                            </div>

                            {/* Badge type de résolution / Stat requirement */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {!isReqMet ? (
                                <span className="text-[10px] text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Requis : {lockText}
                                </span>
                              ) : isRollingThis ? (
                                <span className="text-[10px] text-amber-300 bg-amber-950 border border-amber-600 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold animate-pulse">
                                  <Dices className="w-4 h-4 text-amber-400 animate-spin" /> Test D20 en cours...
                                </span>
                              ) : choice.resolutionType === "SKILL_CHECK" && choice.skillCheck ? (
                                <span className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap flex items-center gap-1 font-semibold font-mono ${
                                  theme.isLight
                                    ? "bg-amber-100 border-amber-300 text-amber-900"
                                    : "bg-amber-950/60 border-amber-700 text-amber-300"
                                }`}>
                                  <Dices className="w-3 h-3 text-amber-500" />
                                  D20 vs DC {choice.skillCheck.difficultyClass} ({choice.skillCheck.statUsed})
                                </span>
                              ) : (
                                <span className={`text-[10px] px-2 py-0.5 rounded border whitespace-nowrap font-semibold font-mono ${
                                  theme.isLight
                                    ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                                    : "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                                }`}>
                                  Déterministe
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // =========================================================
              // 3. LOG DE RÉSOLUTION (Post-choix avec Paragraphe de résultat)
              // =========================================================
              case "EVENT_RESOLUTION": {
                const isSuccess = item.diceRollResult ? item.diceRollResult.isSuccess : true;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border-l-4 my-2.5 text-xs space-y-2.5 transition-all shadow-md ${
                      isSuccess
                        ? theme.isLight
                          ? "bg-emerald-50/90 border-emerald-600 border border-slate-200 text-slate-800"
                          : "bg-emerald-950/40 border-emerald-500 border border-white/5 text-slate-200"
                        : theme.isLight
                          ? "bg-rose-50/90 border-rose-600 border border-slate-200 text-slate-800"
                          : "bg-rose-950/40 border-rose-500 border border-white/5 text-slate-200"
                    }`}
                  >
                    {/* Header de Résolution */}
                    <div className="flex justify-between items-center font-bold">
                      <span className={`text-xs flex items-center gap-1.5 ${isSuccess ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                        <CheckCircle className="w-4 h-4" />
                        RÉSULTAT DU CHOIX :: {item.selectedChoiceLabel}
                      </span>
                      <span className={`text-[10px] font-mono ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>
                        [{item.timestamp.stardateLabel}]
                      </span>
                    </div>

                    {/* Jet de dés D20 si présent */}
                    {item.diceRollResult && (
                      <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                        theme.isLight ? "bg-white border-slate-200 text-slate-800 shadow-xs" : "bg-slate-900/80 border-white/10 text-amber-300"
                      }`}>
                        <div className="flex items-center gap-2">
                          <Dices className="w-4 h-4 text-amber-500" />
                          <span>
                            Jet ({item.diceRollResult.statUsed}) : <strong>{item.diceRollResult.rolledValue}</strong> (D20) + {item.diceRollResult.statValue} (Stat) ={" "}
                            <strong className="text-amber-500">{item.diceRollResult.totalScore}</strong> vs DC {item.diceRollResult.difficultyClass}
                          </span>
                        </div>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          item.diceRollResult.isSuccess
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40"
                        }`}>
                          {item.diceRollResult.isSuccess ? "SUCCÈS DE L'OPÉRATION" : "ÉCHEC CRITIQUE"}
                        </span>
                      </div>
                    )}

                    {/* Paragraphe de dénouement narratif (Livre-Jeu §Section résolue) */}
                    <div className={`p-3 rounded-xl border leading-relaxed text-xs ${
                      theme.isLight ? "bg-white/80 border-slate-200/80 text-slate-800" : "bg-black/30 border-white/5 text-slate-200"
                    }`}>
                      <div className="font-bold text-[10px] font-mono uppercase text-sky-600 dark:text-cyan-400 mb-1 flex items-center gap-1">
                        <Terminal className="w-3 h-3" /> Paragraphe Conséquentiel :
                      </div>
                      <p className="font-sans leading-relaxed text-xs">
                        {item.narrativeOutcome}
                      </p>
                    </div>

                    {/* Deltas & Flags Débloqués */}
                    <div className={`flex flex-wrap gap-3 text-[10px] font-mono pt-2 border-t ${
                      theme.isLight ? "border-slate-200 text-slate-600" : "border-white/10 text-slate-400"
                    }`}>
                      {item.appliedDeltas && Object.keys(item.appliedDeltas).length > 0 && (
                        <span>
                          Deltas de ressources :{" "}
                          <strong className={theme.isLight ? "text-slate-900" : "text-slate-100"}>
                            {Object.entries(item.appliedDeltas)
                              .map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k}`)
                              .join(", ")}
                          </strong>
                        </span>
                      )}

                      {item.unlockedFlags && item.unlockedFlags.length > 0 && (
                        <span>
                          Concordance / Mots-clés :{" "}
                          <span className="text-sky-600 dark:text-cyan-300 font-bold">
                            {item.unlockedFlags.map((f) => `[${f}]`).join(" ")}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              default:
                return null;
            }
          })
        )}

        <div ref={feedEndRef} />
      </div>

      {/* Player Stats Matrix Footer HUD */}
      <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
        theme.isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-slate-950/90 border-white/10 text-slate-300"
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[11px] text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> STATISTIQUES DU PRIMAT-ARCHONTE :
          </span>
          <div className="flex gap-2 flex-wrap text-[11px] font-mono">
            {Object.entries(playerStats).map(([k, v]) => (
              <span
                key={k}
                className={`px-2 py-0.5 rounded border ${
                  theme.isLight ? "bg-white border-slate-300 text-slate-800" : "bg-slate-900 border-white/10 text-slate-200"
                }`}
              >
                <strong className={theme.isLight ? "text-sky-800" : "text-sky-300"}>{k}</strong>: {v}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => feedEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className={`px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer border ${
            theme.isLight
              ? "bg-white hover:bg-slate-200 border-slate-300 text-slate-700"
              : "bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-300"
          }`}
        >
          <ArrowDownCircle className="w-3.5 h-3.5" />
          <span>Bas de page</span>
        </button>
      </div>
    </div>
  );
}
