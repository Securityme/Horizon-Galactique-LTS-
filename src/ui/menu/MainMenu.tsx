import React, { useState } from "react";
import { ThemeDefinition } from "../../theme/themes";
import { GameState } from "../../simulation/engine";
import { proceduralRadio } from "../../audio/radio";
import { RadioWidget } from "../shell/RadioWidget";
import { CinematicCanvas } from "../../platform/boot/CinematicCanvas.view";
import {
  Play,
  Plus,
  FolderOpen,
  Settings,
  BookOpen,
  Sparkles,
  Shield,
  Activity,
  Globe,
  Award,
  Zap,
  Info,
  HelpCircle,
  Eye,
  Database,
  Flame,
  Layers,
  CheckCircle2,
  Compass
} from "lucide-react";

interface MainMenuProps {
  theme: ThemeDefinition;
  savedGame: GameState | null;
  onContinueGame: () => void;
  onNewGame: () => void;
  onLoadGame: () => void;
  onOpenOptions: () => void;
  onClearSave?: () => void;
}

export function MainMenu({
  theme,
  savedGame,
  onContinueGame,
  onNewGame,
  onLoadGame,
  onOpenOptions,
  onClearSave,
}: MainMenuProps) {
  const [showCodexModal, setShowCodexModal] = useState(false);
  const [codexTab, setCodexTab] = useState<"RULES" | "ERAS" | "SURVIVAL" | "GOVERNANCE">("RULES");
  const [showCinematicPreview, setShowCinematicPreview] = useState(false);
  const [cinematicProgress, setCinematicProgress] = useState(0);

  // Trigger starfield zoom cinematic simulation
  const handleTriggerCinematic = () => {
    proceduralRadio.playUIChime("CONFIRM");
    setShowCinematicPreview(true);
    setCinematicProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 0.02;
      setCinematicProgress(Math.min(1, current));
      if (current >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setShowCinematicPreview(false);
        }, 1200);
      }
    }, 40);
  };

  const isLight = theme.isLight ?? false;

  return (
    <div
      className={`min-h-screen min-h-[100dvh] relative flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-y-auto overflow-x-auto scroll-smooth-touch transition-colors duration-300 ${
        theme.bgClass
      } ${theme.ambientGlow || ""} ${theme.id === "AMBER_CRT" ? "crt-scanlines" : ""}`}
    >
      {/* Dynamic Starfield Overlay or Full Cinematic Camera Zoom Effect */}
      {showCinematicPreview ? (
        <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-300 flex items-center justify-center">
          <CinematicCanvas progress={cinematicProgress} completedTasks={7} />
          <div className="absolute bottom-12 z-10 px-6 py-3 rounded-full bg-black/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold uppercase animate-pulse flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>HYPER-ZOOM STELLAIRE EN COURS... {(cinematicProgress * 100).toFixed(0)}%</span>
          </div>
          <button
            onClick={() => setShowCinematicPreview(false)}
            className="absolute top-6 right-6 z-20 px-4 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 font-mono text-xs hover:text-white cursor-pointer"
          >
            ✕ PASSER LA CINÉMATIQUE
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_75%)]" />
        </div>
      )}

      {/* Top Bar: RadioWidget, Options, Starfield Cinematic Preview button */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 z-10 font-mono text-xs py-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* Widget Radio FIP-Σ */}
          <RadioWidget theme={theme} />

          {/* Button: Centre de Configuration */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenOptions();
            }}
            className={`h-9 px-3 rounded-xl border font-mono flex items-center gap-2 font-bold cursor-pointer transition-all ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm"
                : `${theme.cardBg} ${theme.cardBorder} ${theme.textPrimary} hover:border-sky-400`
            }`}
            title="Centre de Configuration (Options, Accessibilité, Préférences)"
          >
            <Settings className={`w-4 h-4 ${theme.accentText}`} />
            <span className="hidden sm:inline text-[11px] uppercase">CONFIGURATION & PARAMÈTRES</span>
          </button>

          {/* Button: Cinematic Starfield Zoom Preview */}
          <button
            onClick={handleTriggerCinematic}
            className={`h-9 px-3 rounded-xl border font-mono flex items-center gap-1.5 font-bold cursor-pointer transition-all ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50"
            }`}
            title="Lancer la cinématique de zoom stellaire"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline text-[10px] uppercase">CINÉMATIQUE STELLAIRE</span>
          </button>
        </div>

        {/* Diégétique Status Tag & Version */}
        <div className="flex items-center gap-2 text-[11px] font-mono opacity-90">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className={`font-semibold tracking-wider ${theme.textSecondary}`}>
            MENU PRINCIPAL · v2.5.0
          </span>
        </div>
      </header>

      {/* Center Hero Banner & Main Title */}
      <div className="w-full max-w-4xl z-10 my-auto py-6 flex flex-col items-center text-center space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Emblem Badge with Theme Accent */}
        <div
          className={`p-3 rounded-2xl border shadow-xl flex items-center gap-3 ${theme.cardBg} ${theme.cardBorder}`}
        >
          <Sparkles className={`w-5 h-5 ${theme.accentText} animate-spin`} style={{ animationDuration: "14s" }} />
          <span className={`font-mono text-xs uppercase font-extrabold tracking-[0.2em] ${theme.textPrimary}`}>
            CENTRE DE COMMANDEMENT DE L'ARCHE
          </span>
        </div>

        {/* Big Main Title */}
        <div className="space-y-3">
          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.2em] font-sans drop-shadow-sm ${theme.textPrimary}`}
          >
            HORIZON GALACTIQUE
          </h1>
          <div className="h-0.5 w-56 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <p className={`text-base sm:text-xl font-light tracking-[0.35em] uppercase font-mono ${theme.accentText}`}>
            L'Arche des Étoiles
          </p>
        </div>

        {/* Subtitle Lore */}
        <p className={`max-w-xl text-xs sm:text-sm font-sans leading-relaxed ${theme.textSecondary}`}>
          Simulateur déterministe de colonie spatiale. Prescrivez la gouvernance, gérez la viabilité des dômes, et menez votre peuple vers la terre promise.
        </p>

        {/* Action Buttons Container */}
        <div className="w-full max-w-md space-y-3.5 pt-2">
          {/* Button 1: Continue Game (If save exists) */}
          {savedGame ? (
            <button
              onClick={() => {
                proceduralRadio.playUIChime("CONFIRM");
                onContinueGame();
              }}
              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group shadow-md ${theme.accentBg} ${theme.accentBorder}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-black/20 text-current">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="font-mono text-sm uppercase font-extrabold tracking-wider">
                    CONTINUER LA PARTIE
                  </div>
                  <div className="text-xs font-sans opacity-90">
                    SOL {savedGame.clock.sol} · Pop: {savedGame.resources.population_active} hab. · {savedGame.genesis.pillar_1_governance.leader_profile.name}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ) : null}

          {/* Button 2: New Game */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onNewGame();
            }}
            className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group ${
              !savedGame
                ? `${theme.accentBg} ${theme.accentBorder} shadow-md`
                : `${theme.cardBg} ${theme.cardBorder} hover:border-cyan-400`
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-black/10 dark:bg-white/10 text-current">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-mono text-sm uppercase font-extrabold tracking-wider ${!savedGame ? "" : theme.textPrimary}`}>
                  CONFIGURATION D'UNE NOUVELLE PARTIE
                </div>
                <div className={`text-xs font-sans ${!savedGame ? "opacity-90" : theme.textSecondary}`}>
                  Gouvernance, environnement, vaisseaux & modificateurs
                </div>
              </div>
            </div>
            <span className="font-mono text-xs group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Button 3: Charger une partie */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onLoadGame();
            }}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group ${theme.cardBg} ${theme.cardBorder} hover:border-cyan-400`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-black/10 dark:bg-white/10 text-current">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-mono text-xs uppercase font-bold tracking-wider ${theme.textPrimary}`}>
                  CHARGER UNE PARTIE
                </div>
                <div className={`text-[11px] font-sans ${theme.textSecondary}`}>
                  Sauvegardes locales & Synchro Cloud Firestore
                </div>
              </div>
            </div>
            <span className="font-mono text-xs group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Button 4: Configuration Center */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onOpenOptions();
            }}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group ${theme.cardBg} ${theme.cardBorder} hover:border-cyan-400`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-black/10 dark:bg-white/10 text-current">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-mono text-xs uppercase font-bold tracking-wider ${theme.textPrimary}`}>
                  CENTRE DE CONFIGURATION ET PARAMÈTRES
                </div>
                <div className={`text-[11px] font-sans ${theme.textSecondary}`}>
                  Thèmes (8 thèmes), options audio, cadence & accessibilité
                </div>
              </div>
            </div>
            <span className="font-mono text-xs group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Button 5: RÈGLES ET CODEX (Replaces former Manuel button) */}
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              setShowCodexModal(true);
            }}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group ${theme.cardBg} ${theme.cardBorder} hover:border-cyan-400`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-black/10 dark:bg-white/10 text-current">
                <BookOpen className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className={`font-mono text-xs uppercase font-bold tracking-wider ${theme.textPrimary}`}>
                  RÈGLES ET CODEX
                </div>
                <div className={`text-[11px] font-sans ${theme.textSecondary}`}>
                  12 Ères stellaires, mécanique déterministe & guide de survie
                </div>
              </div>
            </div>
            <span className="font-mono text-xs group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Footer Info with updated version and live status */}
      <footer className={`w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 z-10 font-mono text-[11px] pt-4 border-t ${isLight ? "border-slate-300 text-slate-600" : "border-white/10 text-slate-400"}`}>
        <div className="flex items-center gap-2">
          <span className="font-bold">Horizon Galactique v2.5.0 (Build 2026.08)</span>
          <span>•</span>
          <span>Moteur Déterministe N.I.A.</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Firestore: Actif</span>
          </div>
          <span>•</span>
          <span className="opacity-80">Projet: gen-lang-client-0264327066</span>
        </div>
      </footer>

      {/* Interactive Rules & Codex Modal */}
      {showCodexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl max-h-[90vh] rounded-2xl border p-5 sm:p-6 flex flex-col overflow-hidden font-sans ${theme.cardBg} ${theme.cardBorder} ${theme.textPrimary} shadow-2xl`}>
            {/* Codex Header */}
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2.5 font-mono font-bold text-sm uppercase">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>RÈGLES ET CODEX DE L'ARCHE STELLAIRE</span>
              </div>
              <button
                onClick={() => setShowCodexModal(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer px-2 py-1 rounded hover:bg-white/10"
              >
                ✕ FERMER
              </button>
            </div>

            {/* Codex Navigation Tabs */}
            <div className="flex overflow-x-auto gap-1 border-b py-2 shrink-0 scroll-horizontal-touch">
              {[
                { id: "RULES", label: "1. Règles & Mécaniques" },
                { id: "ERAS", label: "2. Les 12 Ères Stellaires" },
                { id: "SURVIVAL", label: "3. Guide de Survie & N.I.A." },
                { id: "GOVERNANCE", label: "4. Gouvernance & Décrets" },
              ].map((tab) => {
                const isSelected = codexTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCodexTab(tab.id as any)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.id === "RULES" && <Flame className="w-3.5 h-3.5" />}
                    {tab.id === "ERAS" && <Layers className="w-3.5 h-3.5" />}
                    {tab.id === "SURVIVAL" && <Shield className="w-3.5 h-3.5" />}
                    {tab.id === "GOVERNANCE" && <Award className="w-3.5 h-3.5" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Codex Content Scroll Area */}
            <div className="flex-1 overflow-y-auto pt-4 space-y-4 text-xs leading-relaxed font-sans pr-1">
              {codexTab === "RULES" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono space-y-1">
                    <div className="font-bold uppercase text-xs">Moteur Déterministe PRNG Pure-Function</div>
                    <p className="text-[11px] text-slate-300">
                      Toute la simulation d'Horizon Galactique est régie par un moteur 100% déterministe. Une même seed PRNG et les mêmes choix de gouvernance produiront exactement les mêmes événements, météo spatiale et résultats de simulation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-3 rounded-xl border bg-slate-900/60 border-slate-700 space-y-1">
                      <div className="font-bold text-cyan-400 uppercase">1. Oxygène (O₂) & Biomasse</div>
                      <p className="text-slate-300 text-[10px]">
                        L'Oxygène est consommé chaque sol par la population. Les dômes Agro-Serres génèrent l'O₂ et la Biomasse alimentaire.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border bg-slate-900/60 border-slate-700 space-y-1">
                      <div className="font-bold text-amber-400 uppercase">2. Énergie Réseau (GW)</div>
                      <p className="text-slate-300 text-[10px]">
                        Alimente les réacteurs à fusion, boucliers et dômes. Un déficit énergétique coupe les filtres atmosphériques.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border bg-slate-900/60 border-slate-700 space-y-1">
                      <div className="font-bold text-emerald-400 uppercase">3. Stabilité Sénatoriale</div>
                      <p className="text-slate-300 text-[10px]">
                        Maintenez la cohésion entre les Factions (Rationalistes, Biophiliques, Ingénieurs) pour éviter un coup d'État.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border bg-slate-900/60 border-slate-700 space-y-1">
                      <div className="font-bold text-rose-400 uppercase">4. Dômes SimCity 2.5D</div>
                      <p className="text-slate-300 text-[10px]">
                        Construisez et réparez les dômes d'habitat, usines d'alliage et centres R&D sur la grille tactique.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {codexTab === "ERAS" && (
                <div className="space-y-3 font-mono">
                  <div className="font-bold uppercase text-xs text-cyan-400">
                    Les 12 Ères Stellaires de la Progression
                  </div>
                  <p className="text-[11px] text-slate-300">
                    L'avancée technologique et sociétale débloque de nouvelles fonctionnalités, bâtiments et décrets au fil des 12 Ères et 12 Sous-Ères :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    {[
                      { num: "01", name: "L'Arrivée de l'Arche", desc: "Premier dôme & réacteur de secours" },
                      { num: "02", name: "Fondations & Première Pierre", desc: "Forage de glace & serres primaires" },
                      { num: "03", name: "Le Maillage des Dômes", desc: "Tubulures Maglev & réseau d'énergie" },
                      { num: "04", name: "Stabilisation Atmosphérique", desc: "Filtres à silice & pompes à gaz" },
                      { num: "05", name: "Souveraineté N.I.A.", desc: "Autonomie de construction de la N.I.A." },
                      { num: "06", name: "Premier Contact & Anomale", desc: "Sondes profondes & reliques spatiales" },
                      { num: "07", name: "L'Expansion Intrasystème", desc: "Exploitation minière d'astéroïdes" },
                      { num: "08", name: "L'Âge de la Matrice Quantum", desc: "Processeurs quantiques avancés" },
                      { num: "09", name: "Terreformation Stellaire", desc: "Canons à ions & réchauffement climatique" },
                      { num: "10", name: "Diplomatie des Archontes", desc: "Pactes, échanges & sanctions 4X" },
                      { num: "11", name: "La Singularité Biophilique", desc: "Dômes vivants & symbiose végétale" },
                      { num: "12", name: "L'Éden Galactique Final", desc: "Ascension de la civilisation" },
                    ].map((era) => (
                      <div key={era.num} className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">{era.num}</span>
                        <div>
                          <div className="font-bold text-white">{era.name}</div>
                          <div className="text-slate-400 text-[9px]">{era.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {codexTab === "SURVIVAL" && (
                <div className="space-y-3 font-mono">
                  <div className="font-bold uppercase text-xs text-emerald-400">
                    Guide de Survie et Moteur Autonome N.I.A.
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-300">
                    <p>
                      • <strong>Mode Autonome N.I.A. :</strong> L'intelligence artificielle N.I.A. surveille les surplus de ressources et peut construire automatiquement des structures prioritaires. Vous pouvez régler son niveau d'autonomie (AUTO, RÉGULÉ, SEMI-MANUEL, OFF).
                    </p>
                    <p>
                      • <strong>Gestion des Tempêtes de Silice :</strong> Lors des alertes météo, coupez les secteurs non essentiels pour redistribuer le flux électrique vers les boucliers de coque.
                    </p>
                    <p>
                      • <strong>Rareté des Alliages :</strong> Déployez des sondes dans la ceinture d'astéroïdes pour sécuriser les gisements métalliques indispensables aux réparations.
                    </p>
                  </div>
                </div>
              )}

              {codexTab === "GOVERNANCE" && (
                <div className="space-y-3 font-mono">
                  <div className="font-bold uppercase text-xs text-purple-400">
                    Gouvernance, Décrets et Permadeath
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-300">
                    <p>
                      • <strong>Décrets Politique (H3) :</strong> Promulguez des lois temporaires (Rationnement d'O₂, Travail forcé dans les mines, Fête de la Victoire) pour manipuler le moral et la production.
                    </p>
                    <p>
                      • <strong>Santé du Leader :</strong> Votre Primat-Archonte possède des indicateurs d'organes (cœur, fatigue, exposition à la silice). Une crise cardiaque ou une destitution entraîne une succession politique ou la fin de partie.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Close */}
            <div className="pt-3 border-t mt-auto shrink-0 flex justify-end">
              <button
                onClick={() => setShowCodexModal(false)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs rounded-xl cursor-pointer transition-colors"
              >
                COMPRIS, FERMER LE CODEX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

