import React, { useState, useRef, useEffect } from "react";
import { GameState } from "../../../simulation/engine";
import { ThemeDefinition } from "../../../theme/themes";
import { RoguelikeEvent } from "../../../types/simulation";
import { proceduralRadio } from "../../../audio/radio";
import {
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle,
  FileText,
  HelpCircle,
  Radio,
  Send,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Clock,
  TrendingUp,
  Terminal,
} from "lucide-react";
import { TelemetryChart } from "./TelemetryChart";
import { JournalFeed } from "./JournalFeed";

interface JournalViewProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onResolveEvent: (eventId: string, choiceId: string) => void;
  onResolveSuperEventChoice?: (eventId: string, choiceId: string) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
  isThinking?: boolean;
  thoughtSummary?: string;
}

export function JournalView({
  gameState,
  theme,
  onResolveEvent,
  onResolveSuperEventChoice,
}: JournalViewProps) {
  const [activeTab, setActiveTab] = useState<"JOURNAL_FEED" | "CHAT_NIA" | "PSYCHOLOGIE" | "TELEMETRIE">("JOURNAL_FEED");
  const [eventFilter, setEventFilter] = useState<"ALL" | "UNRESOLVED" | "CRITICAL">("ALL");

  // N.I.A. Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "INIT",
      role: "model",
      text: `Salutations, ${gameState.genesis.pillar_1_governance.leader_profile.title}. Je suis ${gameState.genesis.pillar_3_specialization.ai_acronym}. Tous les dômes du secteur ${gameState.genesis.pillar_3_specialization.territory_layout} sont sous surveillance nominale. Quelles sont vos directives pour le Sol ${gameState.clock.sol} ?`,
      timestamp: `SOL ${gameState.clock.sol} 00:00`,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isLowLatency, setIsLowLatency] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  // Filtrage des événements
  const filteredEvents = gameState.events.filter((e) => {
    if (eventFilter === "UNRESOLVED") return !e.resolved;
    if (eventFilter === "CRITICAL") return e.severity === "CRITICAL" || e.severity === "FATAL";
    return true;
  });

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isChatLoading) return;

    proceduralRadio.playUIChime("CLICK");
    const userMsg: ChatMessage = {
      id: `USER-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: `SOL ${gameState.clock.sol} ${gameState.clock.tickInSol}:00`,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsChatLoading(true);

    try {
      if (isThinkingMode) {
        // High-thinking mode via gemini-3.1-pro-preview
        const response = await fetch("/api/gemini/thinking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: textToSend,
            systemContext: {
              sol: gameState.clock.sol,
              era: gameState.genesis.pillar_4_lore_refinement.starting_era,
              population: gameState.resources.population_active,
              resources: gameState.resources,
              factions: gameState.factions,
              leader: gameState.genesis.pillar_1_governance.leader_profile,
            },
          }),
        });
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `MODEL-${Date.now()}`,
            role: "model",
            text: data.analysis || data.text || "Analyse stratégique haute pensée complétée.",
            timestamp: `SOL ${gameState.clock.sol} ${gameState.clock.tickInSol}:00`,
            isThinking: true,
            thoughtSummary: data.thoughtSummary || "Raisonnement stratégique approfondi (High Thinking Level)",
          },
        ]);
      } else {
        // General Chat via gemini-3.5-flash / gemini-3.1-flash-lite
        const historyForApi = messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));
        historyForApi.push({ role: "user", parts: [{ text: textToSend }] });

        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: historyForApi,
            isLowLatency,
          }),
        });
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `MODEL-${Date.now()}`,
            role: "model",
            text: data.text || "Directives reçues et synchronisées dans les registres.",
            timestamp: `SOL ${gameState.clock.sol} ${gameState.clock.tickInSol}:00`,
          },
        ]);
      }
    } catch (e) {
      console.warn("Backend chat failed, using local deterministic fallback:", e);
      // Fallback local diégétique
      setMessages((prev) => [
        ...prev,
        {
          id: `MODEL-${Date.now()}`,
          role: "model",
          text: `[RELAIS LOCAL N.I.A.] Directives enregistrées. État des dômes au Sol ${gameState.clock.sol} : Oxygène à ${Math.round(gameState.resources.oxygen_l)}L, Énergie à ${Math.round(gameState.resources.energy_gw)}GW. Cohésion civique stable.`,
          timestamp: `SOL ${gameState.clock.sol} ${gameState.clock.tickInSol}:00`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full p-2 md:p-4 max-w-7xl mx-auto space-y-3 overflow-y-auto overscroll-y-contain webkit-overflow-scrolling-touch touch-pan-y">
      {/* Sub-Tabs Header */}
      <div className={`flex items-center justify-between border p-1.5 rounded-xl font-mono text-xs ${
        theme.isLight ? "bg-slate-100 border-slate-300" : "bg-black/40 border-white/10"
      }`}>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: "JOURNAL_FEED", label: "Le Journal (Fil Unifié)", icon: Terminal },
            { id: "CHAT_NIA", label: `Canal N.I.A. [${gameState.genesis.pillar_3_specialization.ai_acronym}]`, icon: Bot },
            { id: "PSYCHOLOGIE", label: "Psychologie & Suspicion", icon: BrainCircuit },
            { id: "TELEMETRIE", label: "Télémétrie & Logs Bruts", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? theme.isLight
                      ? "bg-sky-200 border-sky-500 text-sky-950 font-bold shadow-sm"
                      : "bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm"
                    : theme.isLight
                      ? "bg-white border-slate-300 text-slate-700 hover:text-slate-900"
                      : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* VUE 1 : LE JOURNAL (FIL UNIFIÉ : MICRO-LOGS & SUPER-EVTS) */}
      {/* ========================================================= */}
      {activeTab === "JOURNAL_FEED" && (
        <div className="flex-1 min-h-[520px]">
          <JournalFeed
            items={gameState.journalItems || []}
            playerStats={gameState.playerStats || {}}
            theme={theme}
            onExecuteChoice={(superEvt, choice) => {
              if (onResolveSuperEventChoice) {
                onResolveSuperEventChoice(superEvt.eventId, choice.choiceId);
              } else {
                onResolveEvent(superEvt.eventId, choice.choiceId);
              }
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* VUE 2 : CANAL DE CHAT N.I.A. (GEMINI SDK MULTI-TURN)      */}
      {/* ========================================================= */}
      {activeTab === "CHAT_NIA" && (
        <div className={`flex-1 flex flex-col border rounded-xl overflow-hidden ${
          theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-md" : "bg-black/70 border-sky-500/30 text-slate-100"
        }`}>
          {/* Chat Controls Header */}
          <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
            theme.isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-white/10"
          }`}>
            <div className={`flex items-center gap-2 font-bold ${theme.isLight ? "text-sky-900" : "text-sky-300"}`}>
              <Bot className="w-4 h-4 text-sky-500" />
              <span>N.I.A. SYSTÈME CONVERSATIONNEL : {gameState.genesis.pillar_3_specialization.ai_acronym}</span>
            </div>

            {/* AI Model Switches */}
            <div className="flex items-center gap-3">
              {/* Thinking Mode Toggle */}
              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setIsThinkingMode(!isThinkingMode);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer border ${
                  isThinkingMode
                    ? theme.isLight
                      ? "bg-purple-100 border-purple-400 text-purple-900 font-bold"
                      : "bg-purple-500/25 border-purple-400 text-purple-200 font-bold"
                    : theme.isLight
                      ? "bg-white border-slate-300 text-slate-700"
                      : "bg-slate-900 border-white/10 text-slate-400"
                }`}
                title="Active le mode pensée approfondie pour l'analyse stratégique"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                <span>Mode Haute Pensée</span>
              </button>

              {/* Low Latency Toggle */}
              <button
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setIsLowLatency(!isLowLatency);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 cursor-pointer border ${
                  isLowLatency
                    ? theme.isLight
                      ? "bg-sky-100 border-sky-400 text-sky-900 font-bold"
                      : "bg-sky-500/25 border-sky-400 text-sky-200 font-bold"
                    : theme.isLight
                      ? "bg-white border-slate-300 text-slate-700"
                      : "bg-slate-900 border-white/10 text-slate-400"
                }`}
                title="Bascule vers une latence ultra-faible"
              >
                <Zap className="w-3.5 h-3.5 text-sky-500" />
                <span>Basse Latence</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`text-[10px] mb-0.5 ${theme.isLight ? "text-slate-500 font-medium" : "text-slate-500"}`}>
                  {msg.role === "user" ? "Gouverneur d'Expédition" : gameState.genesis.pillar_3_specialization.ai_acronym} · {msg.timestamp}
                </div>

                {msg.isThinking && msg.thoughtSummary && (
                  <div className={`mb-1 p-2 rounded text-[11px] border max-w-xl ${
                    theme.isLight ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-purple-950/40 border-purple-500/30 text-purple-300"
                  }`}>
                    <span className="font-bold flex items-center gap-1">
                      <BrainCircuit className="w-3.5 h-3.5" /> {msg.thoughtSummary}
                    </span>
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl max-w-2xl font-sans text-sm leading-relaxed border ${
                    msg.role === "user"
                      ? theme.isLight
                        ? "bg-sky-600 text-white border-sky-700 shadow-sm"
                        : "bg-sky-600/30 border-sky-400/40 text-sky-100"
                      : theme.isLight
                        ? "bg-slate-100 border-slate-300 text-slate-900"
                        : "bg-slate-900 border-white/10 text-slate-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-mono animate-pulse">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Calculs tensoriels quantiques en cours...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className={`px-3 py-1.5 border-t flex gap-1.5 overflow-x-auto text-[10px] font-mono ${
            theme.isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-white/5"
          }`}>
            {[
              "Rapport global de survie des dômes",
              "Analyse des tensions entre les factions",
              "Optimisation de la consommation d'énergie",
              "Évaluation de la menace des Gouverneurs rivaux",
            ].map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className={`px-2 py-1 rounded border whitespace-nowrap cursor-pointer transition-colors ${
                  theme.isLight
                    ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/5"
                }`}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className={`p-3 border-t flex items-center gap-2 ${
            theme.isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-white/10"
          }`}>
            <input
              type="text"
              placeholder={`Adresser une directive à ${gameState.genesis.pillar_3_specialization.ai_acronym}...`}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-sans outline-none border ${
                theme.isLight
                  ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500"
                  : "bg-slate-900 border-white/10 text-slate-100 placeholder:text-slate-500 focus:border-sky-400"
              }`}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isChatLoading || !inputPrompt.trim()}
              className={`px-4 py-2 disabled:opacity-50 font-bold rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors ${
                theme.isLight
                  ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                  : "bg-sky-500 hover:bg-sky-400 text-black font-bold"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmettre</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VUE 3 : PSYCHOLOGIE DES COLONS & SUSPICION (TIP 3)        */}
      {/* ========================================================= */}
      {activeTab === "PSYCHOLOGIE" && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Diagnostic Synthétique N.I.A. */}
          <div className={`p-4 rounded-xl border font-mono text-xs space-y-3 ${
            theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-sm" : "bg-black/80 border-white/10 text-slate-100"
          }`}>
            <div className={`font-bold border-b pb-2 flex items-center justify-between ${
              theme.isLight ? "text-sky-900 border-slate-200" : "text-sky-400 border-white/10"
            }`}>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-500" />
                <span>DIAGNOSTIC PSYCHOLOGIQUE COLONIAL (MATRICE SENSORIELLE N.I.A.)</span>
              </div>
              <span className="text-[10px] text-slate-400">ÉVALUATION CONTINUATEUR SOL {gameState.clock.sol}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Suspicion envers le Gouverneur */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                theme.isLight ? "bg-rose-50 border-rose-200" : "bg-rose-950/20 border-rose-500/30"
              }`}>
                <div>
                  <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                    Indice de Suspicion Populaire
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300">
                    {Math.max(0, Math.min(100, 100 - gameState.genesis.pillar_1_governance.senate_stability + Math.round(gameState.genesis.pillar_1_governance.leader_profile.stress_level / 2)))}%
                  </div>
                  <div className="text-[11px] font-sans text-slate-600 dark:text-slate-400 mt-1">
                    Mesure du scepticisme des factions envers les décrets du Gouverneur d'Expédition.
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, Math.min(100, 100 - gameState.genesis.pillar_1_governance.senate_stability + Math.round(gameState.genesis.pillar_1_governance.leader_profile.stress_level / 2)))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Moral Collectif */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                theme.isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/30"
              }`}>
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Moral & Cohésion des Colons
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    {Math.round(gameState.genesis.pillar_1_governance.senate_stability * 0.8 + gameState.genesis.pillar_1_governance.leader_profile.happiness_pct * 0.2)}%
                  </div>
                  <div className="text-[11px] font-sans text-slate-600 dark:text-slate-400 mt-1">
                    Équilibre psychique moyen calculé sur les 16 secteurs agro-résidentiels.
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.round(gameState.genesis.pillar_1_governance.senate_stability * 0.8 + gameState.genesis.pillar_1_governance.leader_profile.happiness_pct * 0.2)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Fatigue Neuro-Cognitive */}
              <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                theme.isLight ? "bg-amber-50 border-amber-200" : "bg-amber-950/20 border-amber-500/30"
              }`}>
                <div>
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Fatigue Collective & Stress Oxydatif
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">
                    {Math.round(gameState.genesis.pillar_1_governance.leader_profile.fatigue_pct)}%
                  </div>
                  <div className="text-[11px] font-sans text-slate-600 dark:text-slate-400 mt-1">
                    Épuisement neuro-musculaire attribuable aux rotations de quarts de travail.
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.round(gameState.genesis.pillar_1_governance.leader_profile.fatigue_pct)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registre des Rumeurs & Tensions Sub-Dômiques */}
          <div className={`p-4 rounded-xl border font-mono text-xs space-y-3 ${
            theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-sm" : "bg-black/80 border-white/10 text-slate-100"
          }`}>
            <div className="font-bold border-b pb-2 text-purple-600 dark:text-purple-400 flex items-center justify-between">
              <span>SISMOGRAPHIE DES OPINIONS ET CLIMAT SOCIOLOGIQUE</span>
              <span className="text-[10px] text-slate-400">16 SECTEURS MONITORÉS</span>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                theme.isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-white/5"
              }`}>
                <div>
                  <div className="font-bold text-sky-700 dark:text-sky-300 mb-0.5">Secteur Dôme 01-04 (Support de Vie)</div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] font-sans">
                    Confiance modérée. Les colons s'inquiètent de la régularité du rationnement en biomasse et demandent un audit des régulateurs d'oxygène.
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">STABLE</span>
              </div>

              <div className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                theme.isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-white/5"
              }`}>
                <div>
                  <div className="font-bold text-sky-700 dark:text-sky-300 mb-0.5">Secteur Cryostase & Résidentiel (S09-12)</div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] font-sans">
                    Suspicion en hausse. Des rumeurs circulent sur les critères de sélection des colons éveillés en priorité par le Gouverneur.
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">VIGILANCE</span>
              </div>

              <div className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                theme.isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-white/5"
              }`}>
                <div>
                  <div className="font-bold text-sky-700 dark:text-sky-300 mb-0.5">Secteur Fabrication & Armement (S13-16)</div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px] font-sans">
                    Adhésion forte aux décrets martiaux. Exigence d'un renforcement des boucliers thermiques pour parer aux tempêtes solaires.
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300 font-mono text-[10px] font-bold">ALIGNÉ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VUE 4 : TÉLÉMÉTRIE & LOGS BRUTS                           */}
      {/* ========================================================= */}
      {activeTab === "TELEMETRIE" && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Visual D3 Chart */}
          <TelemetryChart data={gameState.historyDeltas} />

          {/* Raw Log Table */}
          <div className={`border rounded-xl p-4 font-mono text-xs space-y-2 ${
            theme.isLight ? "bg-white border-slate-300 text-slate-900 shadow-md" : "bg-black/80 border-white/10 text-slate-100"
          }`}>
            <div className={`font-bold border-b pb-2 flex items-center justify-between ${
              theme.isLight ? "text-sky-900 border-slate-200" : "text-sky-400 border-white/10"
            }`}>
              <span>HISTORIQUE CHRONOLOGIQUE DES CYCLES ET SOLS (PRNG SÉQUENTIEL)</span>
              <span className={`text-[10px] ${theme.isLight ? "text-slate-600" : "text-slate-400"}`}>{gameState.historyDeltas.length} SOLS ENREGISTRÉS</span>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {gameState.historyDeltas.map((h, i) => (
                <div key={i} className={`flex justify-between py-1 border-b text-[11px] ${
                  theme.isLight ? "border-slate-100 text-slate-800" : "border-white/5 text-slate-300"
                }`}>
                  <span className="font-bold">SOL {h.sol}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Pop: {h.population}</span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">Énergie: {h.energy} GW</span>
                  <span className="text-sky-700 dark:text-sky-400 font-semibold">O₂: {h.o2} L</span>
                  <span className="text-purple-700 dark:text-purple-400 font-semibold">Stabilité: {h.stability}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
