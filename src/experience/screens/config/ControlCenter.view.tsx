import React, { useState, useEffect } from "react";
import { GameState } from "../../../simulation/engine";
import { THEMES, ThemeId, ThemeDefinition } from "../../../theme/themes";
import {
  ConfigTabId,
  DisplayConfig,
  AccessibilityConfig,
} from "./config.type";
import { DisplaySection } from "./DisplaySection.view";
import { AudioSection } from "./AudioSection.view";
import { SimulationSection } from "./SimulationSection.view";
import { RegistrySection } from "./RegistrySection.view";
import { DiagnosticsSection } from "./DiagnosticsSection.view";
import { AccessibilitySection } from "./AccessibilitySection.view";

interface ControlCenterProps {
  gameState: GameState | null;
  currentTheme: ThemeDefinition;
  onThemeChange: (themeId: ThemeId) => void;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  onClose: () => void;
  onResetGame: () => void;
  onLoadState: (state: GameState) => void;
  onReturnToMainMenu?: () => void;
}

const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  themeId: "CYAN_OBSIDIENNE",
  retro: {
    scanlines: false,
    chromaticAberration: false,
    grain: false,
    vignette: false,
  },
  density: "COMPACT",
  autoRedAlertOnCrisis: true,
};

const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  highContrast: false,
  fontSizeLevel: "STANDARD",
  enlargedTouchTargets: false,
  hapticIntensity: "SOFT",
  forceReducedMotion: false,
};

export function ControlCenter({
  gameState,
  currentTheme,
  onThemeChange,
  onSpeedChange,
  onClose,
  onResetGame,
  onLoadState,
  onReturnToMainMenu,
}: ControlCenterProps) {
  const [activeTab, setActiveTab] = useState<ConfigTabId>("AFFICHAGE");

  // Configurations chargées depuis la session
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>(() => {
    try {
      const raw = localStorage.getItem("horizon_config_display");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { ...DEFAULT_DISPLAY_CONFIG, themeId: currentTheme.id };
  });

  const [accessibilityConfig, setAccessibilityConfig] = useState<AccessibilityConfig>(() => {
    try {
      const raw = localStorage.getItem("horizon_config_accessibility");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_ACCESSIBILITY_CONFIG;
  });

  // Sauvegarde automatique des réglages
  useEffect(() => {
    localStorage.setItem("horizon_config_display", JSON.stringify(displayConfig));
    if (displayConfig.themeId !== currentTheme.id) {
      onThemeChange(displayConfig.themeId);
    }

    // Injection des classes d'effets rétro dans le root
    const root = document.documentElement;
    if (displayConfig.retro.scanlines) root.classList.add("crt-scanlines");
    else root.classList.remove("crt-scanlines");

    if (displayConfig.retro.chromaticAberration) root.classList.add("crt-aberration");
    else root.classList.remove("crt-aberration");

    if (displayConfig.retro.grain) root.classList.add("crt-grain");
    else root.classList.remove("crt-grain");

    if (displayConfig.retro.vignette) root.classList.add("crt-vignette");
    else root.classList.remove("crt-vignette");
  }, [displayConfig, currentTheme.id, onThemeChange]);

  useEffect(() => {
    localStorage.setItem("horizon_config_accessibility", JSON.stringify(accessibilityConfig));
  }, [accessibilityConfig]);

  // Fermeture à la touche ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const tabs: { id: ConfigTabId; label: string; icon: string }[] = [
    { id: "AFFICHAGE", label: "Affichage & Thèmes", icon: "◩" },
    { id: "AUDIO", label: "Audio & Radio FIP-Σ", icon: "♫" },
    { id: "SIMULATION", label: "Simulation & N.I.A.", icon: "⚙" },
    { id: "REGISTRE", label: "Registre & Lignes", icon: "⌗" },
    { id: "DIAGNOSTIC", label: "Diagnostic Moteur", icon: "◈" },
    { id: "ACCESSIBILITE", label: "Accessibilité", icon: "◉" },
  ];

  const isLight = currentTheme.isLight ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div
        className={`w-full h-full md:max-w-5xl md:h-[90vh] md:rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
          isLight
            ? "bg-slate-50 text-slate-900 border-slate-300 shadow-slate-900/10"
            : `${currentTheme.cardBg} ${currentTheme.cardBorder} text-slate-100`
        }`}
      >
        {/* Header du Centre de Configuration et Paramètres */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? "bg-white border-slate-200" : "bg-slate-900/80 border-white/[0.1]"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm bg-sky-500 animate-pulse shadow-md shadow-sky-500/50" />
            <div>
              <h2 className={`text-sm md:text-base font-extrabold uppercase tracking-wider font-sans ${
                isLight ? "text-slate-900" : "text-slate-100"
              }`}>
                Centre de Configuration et des Paramètres
              </h2>
              <div className={`text-[11px] font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Gestion des paramètres d'affichage, audio, simulation et système
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all border cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                : "bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border-white/[0.08]"
            }`}
            title="Fermer (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Navigation Mobile (Onglets segmentés en haut avec scroll horizontal fluide) */}
        <div className={`md:hidden flex overflow-x-auto border-b p-1 shrink-0 gap-1 scroll-horizontal-touch ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900/50 border-white/[0.08]"
        }`}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 rounded text-[11px] font-mono font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? isLight
                      ? "bg-slate-900 text-white shadow-sm font-bold"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900 hover:bg-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Corps Principal : Rail vertical à gauche (Desktop) + Contenu à droite */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Rail Vertical (Desktop) */}
          <div className={`hidden md:flex flex-col w-64 border-r p-3 gap-1 shrink-0 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/40 border-white/[0.1]"
          }`}>
            <div className={`text-[10px] uppercase font-bold px-3 py-1 font-mono tracking-wider ${
              isLight ? "text-slate-500" : "text-slate-500"
            }`}>
              Rubriques de Configuration
            </div>
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-semibold text-left transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-slate-900 text-white shadow-sm font-bold"
                        : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className={`mt-auto p-3 rounded-lg border text-[10px] font-mono ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-600"
                : "bg-slate-950/60 border-white/[0.06] text-slate-400"
            }`}>
              <div className={`font-bold mb-1 ${isLight ? "text-slate-900" : "text-slate-300"}`}>
                Horizon Galactique
              </div>
              <div>Noyau déterministe v37.0</div>
              <div className={`mt-1 font-semibold ${isLight ? "text-emerald-600" : "text-cyan-400/80"}`}>
                Status: SYSTÈME NOMINAL
              </div>
            </div>
          </div>

          {/* Contenu Défilable avec support Safari touch */}
          <div className={`flex-1 overflow-y-auto overflow-x-auto p-4 md:p-6 scroll-smooth-touch ${
            isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950/40 text-slate-100"
          }`}>
            {activeTab === "AFFICHAGE" && (
              <DisplaySection
                config={displayConfig}
                currentTheme={currentTheme}
                onChange={setDisplayConfig}
                onResetToDefaults={() => setDisplayConfig({ ...DEFAULT_DISPLAY_CONFIG, themeId: currentTheme.id })}
              />
            )}

            {activeTab === "AUDIO" && (
              <AudioSection
                currentTheme={currentTheme}
                onResetToDefaults={() => {}}
              />
            )}

            {activeTab === "SIMULATION" && (
              <SimulationSection
                gameState={gameState}
                onSpeedChange={onSpeedChange}
                onResetToDefaults={() => {}}
              />
            )}

            {activeTab === "REGISTRE" && (
              <RegistrySection
                gameState={gameState}
                onLoadState={onLoadState}
                onResetGame={onResetGame}
              />
            )}

            {activeTab === "DIAGNOSTIC" && (
              <DiagnosticsSection gameState={gameState} />
            )}

            {activeTab === "ACCESSIBILITE" && (
              <AccessibilitySection
                config={accessibilityConfig}
                onChange={setAccessibilityConfig}
                onResetToDefaults={() => setAccessibilityConfig(DEFAULT_ACCESSIBILITY_CONFIG)}
              />
            )}
          </div>
        </div>

        {/* Footer Diégétique */}
        <div className={`p-3 border-t flex items-center justify-between text-[11px] font-mono shrink-0 gap-2 ${
          isLight ? "bg-white border-slate-200 text-slate-600" : "bg-slate-900/60 border-white/[0.1] text-slate-400"
        }`}>
          <div className="hidden sm:block">
            Toute modification prend effet immédiatement et est persistée dans le registre local.
          </div>
          <div className="flex items-center gap-2">
            {onReturnToMainMenu && (
              <button
                onClick={() => {
                  onClose();
                  onReturnToMainMenu();
                }}
                className={`px-3 py-1.5 rounded font-bold uppercase transition-all cursor-pointer border ${
                  isLight
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
                    : "bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-400/40"
                }`}
              >
                ← Menu Principal
              </button>
            )}
            <button
              onClick={onClose}
              className={`px-4 py-1.5 rounded font-bold uppercase transition-all border cursor-pointer ${
                isLight
                  ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/[0.1]"
              }`}
            >
              Fermer les Paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
