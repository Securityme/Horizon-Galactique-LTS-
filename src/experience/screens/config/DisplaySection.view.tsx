import React from "react";
import { THEMES, ThemeId, ThemeDefinition } from "../../../theme/themes";
import { DisplayConfig } from "./config.type";

interface DisplaySectionProps {
  config: DisplayConfig;
  currentTheme: ThemeDefinition;
  onChange: (next: DisplayConfig) => void;
  onResetToDefaults: () => void;
}

export function DisplaySection({
  config,
  currentTheme,
  onChange,
  onResetToDefaults,
}: DisplaySectionProps) {
  const isLight = currentTheme.isLight ?? false;

  const handleSelectTheme = (tid: ThemeId) => {
    onChange({
      ...config,
      themeId: tid,
    });
  };

  const handleToggleRetro = (key: keyof DisplayConfig["retro"]) => {
    onChange({
      ...config,
      retro: {
        ...config.retro,
        [key]: !config.retro[key],
      },
    });
  };

  const handleToggleDensity = () => {
    onChange({
      ...config,
      density: config.density === "COMPACT" ? "COMFORTABLE" : "COMPACT",
    });
  };

  const handleToggleAutoRedAlert = () => {
    onChange({
      ...config,
      autoRedAlertOnCrisis: !config.autoRedAlertOnCrisis,
    });
  };

  return (
    <div className="space-y-6 text-xs font-mono">
      {/* 1. Sélection du Thème Diégétique */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs uppercase tracking-wider font-bold ${isLight ? "text-slate-900" : "text-sky-400"}`}>
            1. Thèmes Visuels & Modes Clair / Sombre
          </h3>
          <span className={`text-[10px] ${isLight ? "text-slate-500 font-semibold" : "text-slate-400"}`}>
            Actif : {THEMES[config.themeId]?.name || config.themeId}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(THEMES) as ThemeId[]).map((tid) => {
            const t = THEMES[tid];
            const isSelected = config.themeId === tid;
            return (
              <button
                key={tid}
                onClick={() => handleSelectTheme(tid)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? isLight
                      ? "border-slate-900 ring-2 ring-slate-900/30 bg-white shadow-md"
                      : "border-sky-400 ring-2 ring-sky-400/40 bg-slate-900/90 shadow-lg"
                    : isLight
                    ? "border-slate-300 bg-white/70 hover:border-slate-400 hover:bg-white"
                    : "border-white/[0.1] bg-slate-950/60 hover:border-white/[0.25]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-slate-100"}`}>{t.name}</span>
                      {t.isLight ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-400 text-black">
                          CLAIR
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-300">
                          SOMBRE
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? "bg-slate-900" : "bg-sky-400"}`} />
                    )}
                  </div>
                  <p className={`text-[10px] leading-relaxed mb-3 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    {t.description}
                  </p>
                </div>

                {/* Vignette de prévisualisation live */}
                <div className={`w-full h-8 rounded-lg border flex items-center justify-between px-2.5 text-[9px] font-mono font-semibold ${t.bgClass} ${t.cardBorder}`}>
                  <span className={t.accentText}>TEXTE & ACCENTS</span>
                  <span className={`px-1.5 py-0.5 rounded ${t.isLight ? "bg-slate-200 text-slate-800" : "bg-white/10 text-white"}`}>APERÇU</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Effets Rétro Cathodiques Diégétiques */}
      <div className={`p-4 rounded-xl border ${
        isLight ? "bg-white border-slate-200 shadow-sm" : "border-white/[0.1] bg-slate-900/50"
      }`}>
        <h3 className={`text-xs uppercase tracking-wider font-bold mb-3 ${
          isLight ? "text-slate-900" : "text-cyan-400"
        }`}>
          2. Filtres Rétro-Optiques & Lentilles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight
              ? "bg-slate-50 border-slate-200 hover:border-slate-300"
              : "bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15]"
          }`}>
            <div>
              <div className={`font-semibold text-xs ${isLight ? "text-slate-800" : "text-slate-200"}`}>Balayage Scanlines CRT</div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>Lignes d'entrelacement cathodique</div>
            </div>
            <input
              type="checkbox"
              checked={config.retro.scanlines}
              onChange={() => handleToggleRetro("scanlines")}
              className="accent-sky-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight
              ? "bg-slate-50 border-slate-200 hover:border-slate-300"
              : "bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15]"
          }`}>
            <div>
              <div className={`font-semibold text-xs ${isLight ? "text-slate-800" : "text-slate-200"}`}>Aberration Chromatique</div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>Décalage RVB sur les bordures d'écran</div>
            </div>
            <input
              type="checkbox"
              checked={config.retro.chromaticAberration}
              onChange={() => handleToggleRetro("chromaticAberration")}
              className="accent-sky-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight
              ? "bg-slate-50 border-slate-200 hover:border-slate-300"
              : "bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15]"
          }`}>
            <div>
              <div className={`font-semibold text-xs ${isLight ? "text-slate-800" : "text-slate-200"}`}>Grain Argentique / Silicium</div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>Micro-bruit de capteur photonique</div>
            </div>
            <input
              type="checkbox"
              checked={config.retro.grain}
              onChange={() => handleToggleRetro("grain")}
              className="accent-sky-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight
              ? "bg-slate-50 border-slate-200 hover:border-slate-300"
              : "bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15]"
          }`}>
            <div>
              <div className={`font-semibold text-xs ${isLight ? "text-slate-800" : "text-slate-200"}`}>Vignettage Optique</div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>Assombrissement progressif des coins</div>
            </div>
            <input
              type="checkbox"
              checked={config.retro.vignette}
              onChange={() => handleToggleRetro("vignette")}
              className="accent-sky-600 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. Densité & Comportement d'Urgence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "border-white/[0.1] bg-slate-900/50"
        }`}>
          <div>
            <div className={`font-bold mb-1 ${isLight ? "text-slate-900" : "text-slate-200"}`}>Densité d'Information</div>
            <p className={`text-[10px] mb-3 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Ajuste l'espacement et la compacité des tableaux et jauges.
            </p>
          </div>
          <button
            onClick={handleToggleDensity}
            className={`px-3 py-2 rounded-lg border font-semibold text-xs transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/[0.1]"
            }`}
          >
            Mode Actuel : {config.density === "COMPACT" ? "COMPACT (DENSE)" : "CONFORTABLE (AÉRÉ)"}
          </button>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "border-white/[0.1] bg-slate-900/50"
        }`}>
          <div>
            <div className={`font-bold mb-1 ${isLight ? "text-slate-900" : "text-slate-200"}`}>Alerte Rouge Automatique</div>
            <p className={`text-[10px] mb-3 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Bascule automatique en thème de crise lors d'un événement critique.
            </p>
          </div>
          <label className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-white/[0.06]"
          }`}>
            <span className={`text-[11px] font-semibold ${isLight ? "text-slate-800" : "text-slate-300"}`}>
              {config.autoRedAlertOnCrisis ? "ACTIVÉ (BASCULE IMMÉDIATE)" : "DÉSACTIVÉ"}
            </span>
            <input
              type="checkbox"
              checked={config.autoRedAlertOnCrisis}
              onChange={handleToggleAutoRedAlert}
              className="accent-rose-500 w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Bouton de réinitialisation de la section */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onResetToDefaults}
          className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-semibold transition-all border cursor-pointer ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
              : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-white/[0.06]"
          }`}
        >
          Rétablir les valeurs par défaut (Affichage)
        </button>
      </div>
    </div>
  );
}
