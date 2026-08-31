import React, { useState, useEffect } from "react";
import { RadioBand, RadioEngineState, AudioBuses, RadioStationId } from "../../audio/audioTypes";
import { proceduralRadio, FIP_STATIONS } from "../../audio/proceduralAudioEngine";
import { SpectrumVisualizer } from "../../audio/SpectrumVisualizer.view";
import { ThemeDefinition } from "../../../theme/themes";

interface AudioSectionProps {
  currentTheme: ThemeDefinition;
  onResetToDefaults: () => void;
}

export function AudioSection({ currentTheme, onResetToDefaults }: AudioSectionProps) {
  const [radioState, setRadioState] = useState<RadioEngineState>(proceduralRadio.getState());
  const isLight = currentTheme.isLight ?? false;

  useEffect(() => {
    const unsub = proceduralRadio.subscribe((st) => {
      setRadioState(st);
    });
    return () => unsub();
  }, []);

  const handleBusChange = (bus: keyof AudioBuses, val: number) => {
    proceduralRadio.setBusVolume(bus, val);
  };

  const handleStationSelect = (id: RadioStationId) => {
    proceduralRadio.setStation(id, true);
  };

  const handleTogglePlay = () => {
    proceduralRadio.togglePlay();
  };

  const handleToggleMute = () => {
    proceduralRadio.toggleMute();
  };

  const handleToggleClimateDSP = () => {
    proceduralRadio.setClimateFilterActive(!radioState.climateFilterActive);
  };

  const handleTriggerFipVoice = () => {
    proceduralRadio.triggerFipJingleAndVoice();
  };

  return (
    <div className="space-y-6 text-xs font-mono">
      {/* 1. Radio France FIP-Σ : Station & Direct */}
      <div className={`p-4 rounded-xl border shadow-md ${
        isLight ? "bg-white border-slate-200" : "border-cyan-500/30 bg-slate-900/60"
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-4 ${
          isLight ? "border-slate-200" : "border-white/[0.08]"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-md shadow-cyan-500/50" />
            <div>
              <h3 className={`text-sm uppercase tracking-wider font-extrabold ${
                isLight ? "text-slate-900" : "text-cyan-300"
              }`}>
                RADIO FRANCE FIP // L'ARCHE DES ÉTOILES
              </h3>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Onde continue · Flux réels Radio France & Synthèse procédurale de secours
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerFipVoice}
              className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase transition-all shadow cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? "bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300"
                  : "bg-purple-950/80 hover:bg-purple-900 border-purple-400/50 text-purple-200"
              }`}
              title="Déclencher le carillon et l'annonce de la voix FIP"
            >
              <span>♫ Voix FIP</span>
            </button>

            <button
              onClick={handleTogglePlay}
              className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all cursor-pointer shadow-md ${
                radioState.isPlaying
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-900/30"
              }`}
            >
              {radioState.isPlaying ? "■ Couper FIP" : "▶ Écouter FIP"}
            </button>
          </div>
        </div>

        {/* Lecteur Actif & Spectre FFT */}
        <div className={`p-3 rounded-lg border mb-4 ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-white/[0.08]"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <div className={`font-bold text-xs flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                <span>{radioState.currentTrack.title}</span>
                {radioState.isLiveStreamActive ? (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 text-[9px] font-bold">
                    DIRECT PARIS (RADIO FRANCE)
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/40 text-[9px] font-bold">
                    SYNTHÈSE HORS-LIGNE
                  </span>
                )}
              </div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {radioState.currentTrack.artist} · Fréquence : {radioState.currentTrack.frequencyKhz} MHz
              </div>
            </div>

            <div className={`text-[10px] text-right ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              État : <strong className={isLight ? "text-sky-700" : "text-cyan-400"}>{radioState.isPlaying ? (radioState.isMuted ? "MUTÉ" : "EN DIFFUSION") : "VEILLE"}</strong>
            </div>
          </div>

          <div className={`h-10 rounded p-1 flex items-center ${isLight ? "bg-white border border-slate-200" : "bg-slate-900/90"}`}>
            <SpectrumVisualizer height={32} barColor={isLight ? "#0284c7" : "#00d4ff"} />
          </div>
        </div>

        {/* Grille des Stations Radio France FIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FIP_STATIONS.map((station) => {
            const isSelected = radioState.stationId === station.id;
            return (
              <button
                key={station.id}
                onClick={() => handleStationSelect(station.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? "border-sky-600 bg-sky-50 text-slate-900 ring-1 ring-sky-500 shadow-sm"
                      : "border-cyan-400 bg-cyan-950/40 text-slate-100 ring-1 ring-cyan-400/40 shadow-sm"
                    : isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    : "border-white/[0.08] bg-slate-950/40 text-slate-400 hover:border-white/[0.2] hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{station.shortName}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${
                    isLight ? "bg-slate-100 border-slate-200 text-sky-700" : "bg-slate-900 border-white/[0.06] text-cyan-300"
                  }`}>
                    {station.frequencyKhz} MHz
                  </span>
                </div>
                <div className={`text-[10px] line-clamp-1 mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{station.tagline}</div>
                <div className={`text-[9px] font-sans ${isLight ? "text-slate-500" : "text-slate-500"}`}>{station.genre}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mixeur Général & Bus Dédiés */}
      <div className={`p-4 rounded-xl border ${
        isLight ? "bg-white border-slate-200 shadow-sm" : "border-white/[0.1] bg-slate-900/50"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xs uppercase tracking-wider font-bold ${
            isLight ? "text-slate-900" : "text-cyan-400"
          }`}>
            2. Mixeur de Gain & Bus Audio
          </h3>
          <button
            onClick={handleToggleMute}
            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-all cursor-pointer ${
              radioState.isMuted
                ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40"
                : isLight
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/[0.08]"
            }`}
          >
            {radioState.isMuted ? "MUTÉ (SIGNAL COUPÉ)" : "ACTIF (SIGNAL ON)"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Master */}
          <div className={`p-2.5 rounded-lg border ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-white/[0.06]"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Volume Général (Master)</span>
              <span className={`tabular-nums font-bold ${isLight ? "text-sky-700" : "text-cyan-400"}`}>
                {Math.round(radioState.buses.master * 100)} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={radioState.buses.master}
              onChange={(e) => handleBusChange("master", parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded"
            />
          </div>

          {/* Musique FIP */}
          <div className={`p-2.5 rounded-lg border ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-white/[0.06]"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Bus Musique (Radio FIP-Σ)</span>
              <span className={`tabular-nums font-bold ${isLight ? "text-sky-700" : "text-cyan-400"}`}>
                {Math.round(radioState.buses.music * 100)} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={radioState.buses.music}
              onChange={(e) => handleBusChange("music", parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded"
            />
          </div>

          {/* Voix FIP & N.I.A. */}
          <div className={`p-2.5 rounded-lg border ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-white/[0.06]"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Bus Voix (Fipettes & N.I.A.)</span>
              <span className={`tabular-nums font-bold ${isLight ? "text-sky-700" : "text-cyan-400"}`}>
                {Math.round(radioState.buses.voice * 100)} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={radioState.buses.voice}
              onChange={(e) => handleBusChange("voice", parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded"
            />
          </div>

          {/* Ambiance Réacteur */}
          <div className={`p-2.5 rounded-lg border ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-white/[0.06]"
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>Bus Ambiance & Drones Coque</span>
              <span className={`tabular-nums font-bold ${isLight ? "text-sky-700" : "text-cyan-400"}`}>
                {Math.round(radioState.buses.ambience * 100)} %
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={radioState.buses.ambience}
              onChange={(e) => handleBusChange("ambience", parseFloat(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded"
            />
          </div>
        </div>
      </div>

      {/* 3. Filtrage Climatique DSP */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        isLight ? "bg-white border-slate-200 shadow-sm" : "border-white/[0.1] bg-slate-900/50"
      }`}>
        <div>
          <div className={`font-bold mb-1 ${isLight ? "text-slate-900" : "text-slate-200"}`}>Filtrage Climatique DSP du Signal</div>
          <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            Atténuation passe-bas et distorsions cosmiques automatiques lors des tempêtes de silice et orages ioniques.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className={`text-[11px] font-semibold ${isLight ? "text-slate-800" : "text-slate-300"}`}>
            {radioState.climateFilterActive ? "ACTIVÉ" : "DÉSACTIVÉ"}
          </span>
          <input
            type="checkbox"
            checked={radioState.climateFilterActive}
            onChange={handleToggleClimateDSP}
            className="accent-sky-600 w-4 h-4 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Bouton de réinitialisation */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onResetToDefaults}
          className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-semibold transition-all border cursor-pointer ${
            isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
              : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-white/[0.06]"
          }`}
        >
          Rétablir les réglages par défaut (Audio)
        </button>
      </div>
    </div>
  );
}
