import React from "react";
import { AccessibilityConfig } from "./config.type";

interface AccessibilitySectionProps {
  config: AccessibilityConfig;
  onChange: (next: AccessibilityConfig) => void;
  onResetToDefaults: () => void;
}

export function AccessibilitySection({
  config,
  onChange,
  onResetToDefaults,
}: AccessibilitySectionProps) {
  const handleToggleContrast = () => {
    onChange({
      ...config,
      highContrast: !config.highContrast,
    });
  };

  const handleFontSizeChange = (level: AccessibilityConfig["fontSizeLevel"]) => {
    onChange({
      ...config,
      fontSizeLevel: level,
    });
  };

  const handleToggleTouchTargets = () => {
    onChange({
      ...config,
      enlargedTouchTargets: !config.enlargedTouchTargets,
    });
  };

  const handleHapticChange = (intensity: AccessibilityConfig["hapticIntensity"]) => {
    onChange({
      ...config,
      hapticIntensity: intensity,
    });
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      if (intensity === "SOFT") navigator.vibrate(20);
      else if (intensity === "STRONG") navigator.vibrate([40, 30, 40]);
    }
  };

  const handleToggleReducedMotion = () => {
    onChange({
      ...config,
      forceReducedMotion: !config.forceReducedMotion,
    });
  };

  return (
    <div className="space-y-6 text-xs font-mono">
      {/* 1. Contraste & Lisibilité */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-3">
          1. Contraste & Échelle Typographique
        </h3>

        <div className="space-y-4">
          {/* Contraste Élevé */}
          <label className="flex items-center justify-between p-3 rounded bg-slate-950/70 border border-white/[0.06] cursor-pointer hover:border-white/[0.15]">
            <div>
              <div className="font-semibold text-slate-200 text-xs">Contraste Renforcé (WCAG AAA)</div>
              <div className="text-[10px] text-slate-400">
                Augmente la saturation des bordures et force le fond noir absolu.
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.highContrast}
              onChange={handleToggleContrast}
              className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          {/* Taille de Police (3 crans) */}
          <div className="p-3 rounded bg-slate-950/70 border border-white/[0.06]">
            <div className="font-semibold text-slate-200 text-xs mb-2">Taille du Texte de Bord</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "STANDARD", label: "Standard (100%)" },
                { id: "LARGE", label: "Agrandie (120%)" },
                { id: "MAX", label: "Maximale (140%)" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => handleFontSizeChange(lvl.id as AccessibilityConfig["fontSizeLevel"])}
                  className={`py-2 px-3 rounded text-center text-xs font-semibold transition-all border ${
                    config.fontSizeLevel === lvl.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 ring-1 ring-cyan-400/30"
                      : "bg-slate-900 text-slate-400 border-white/[0.08] hover:text-slate-200"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ergonomie & Cibles Tactiles */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-3">
          2. Contrôles Tactiles & Retours Sensoriels
        </h3>

        <div className="space-y-4">
          {/* Cibles Tactiles Élargies */}
          <label className="flex items-center justify-between p-3 rounded bg-slate-950/70 border border-white/[0.06] cursor-pointer hover:border-white/[0.15]">
            <div>
              <div className="font-semibold text-slate-200 text-xs">Cibles Tactiles Élargies (min 48px)</div>
              <div className="text-[10px] text-slate-400">
                Agrandit la zone cliquable de tous les boutons et curseurs.
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.enlargedTouchTargets}
              onChange={handleToggleTouchTargets}
              className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          {/* Retour Haptique (3 crans) */}
          <div className="p-3 rounded bg-slate-950/70 border border-white/[0.06]">
            <div className="font-semibold text-slate-200 text-xs mb-2">Vibration Haptique Tactique</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "OFF", label: "Désactivée" },
                { id: "SOFT", label: "Douce" },
                { id: "STRONG", label: "Prononcée" },
              ].map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleHapticChange(h.id as AccessibilityConfig["hapticIntensity"])}
                  className={`py-2 px-3 rounded text-center text-xs font-semibold transition-all border ${
                    config.hapticIntensity === h.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 ring-1 ring-cyan-400/30"
                      : "bg-slate-900 text-slate-400 border-white/[0.08] hover:text-slate-200"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mouvements & Animations */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-3">
          3. Mouvements et Effets de Transition
        </h3>

        <label className="flex items-center justify-between p-3 rounded bg-slate-950/70 border border-white/[0.06] cursor-pointer hover:border-white/[0.15]">
          <div>
            <div className="font-semibold text-slate-200 text-xs">Forcer la Réduction de Mouvement</div>
            <div className="text-[10px] text-slate-400">
              Désactive les cinématiques continues, accélérations et oscillations visuelles.
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.forceReducedMotion}
            onChange={handleToggleReducedMotion}
            className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Bouton de réinitialisation */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onResetToDefaults}
          className="px-3 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] uppercase font-semibold transition-all border border-white/[0.06]"
        >
          Rétablir les valeurs canoniques (Accessibilité)
        </button>
      </div>
    </div>
  );
}
