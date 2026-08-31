import React, { useState, useEffect } from "react";
import { RadioStationId, RadioEngineState } from "./audioTypes";
import { proceduralRadio, FIP_STATIONS } from "./proceduralAudioEngine";
import { SpectrumVisualizer } from "./SpectrumVisualizer.view";
import { ThemeDefinition } from "../../theme/themes";

interface RadioWidgetH3Props {
  theme: ThemeDefinition;
}

export function RadioWidgetH3({ theme }: RadioWidgetH3Props) {
  const [radioState, setRadioState] = useState<RadioEngineState>(proceduralRadio.getState());

  useEffect(() => {
    const unsub = proceduralRadio.subscribe((st) => {
      setRadioState(st);
    });
    return () => unsub();
  }, []);

  const handleSelectStation = (id: RadioStationId) => {
    proceduralRadio.setStation(id, true);
  };

  const handleTogglePlay = () => {
    proceduralRadio.togglePlay();
  };

  const handleToggleMute = () => {
    proceduralRadio.toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    proceduralRadio.setBusVolume("master", val);
  };

  const handleToggleAuto = () => {
    proceduralRadio.setAutoMode(!radioState.isAutoMode);
  };

  const featuredStations: RadioStationId[] = ["FIP_DIRECT", "FIP_JAZZ", "FIP_ELECTRO", "FIP_SYNTH_LEGACY"];

  return (
    <div className={`p-3 rounded-lg border border-white/[0.12] bg-slate-950/70 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs font-mono`}>
      {/* 1. Station info & Track Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={handleTogglePlay}
          className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer ${
            radioState.isPlaying
              ? "bg-cyan-500 text-slate-950 shadow-cyan-500/30"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
          title={radioState.isPlaying ? "Arrêter la radio" : "Écouter Radio France FIP"}
        >
          {radioState.isPlaying ? "■" : "▶"}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
              {radioState.currentTrack.station}
            </span>
            <span className="text-[10px] text-slate-500 tabular-nums">
              {radioState.currentTrack.frequencyKhz} MHz
            </span>
            {radioState.isLiveStreamActive ? (
              <span className="px-1 py-0.5 rounded text-[8px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                EN DIRECT PARIS
              </span>
            ) : (
              <span className="px-1 py-0.5 rounded text-[8px] bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                SYNTHÈSE DIGITALE
              </span>
            )}
          </div>
          <p className="text-slate-100 font-medium truncate text-xs">
            {radioState.currentTrack.title}
          </p>
        </div>
      </div>

      {/* 2. Visualiseur de spectre FFT temps réel */}
      <div className="w-full md:w-36 h-6 shrink-0 bg-slate-900/60 rounded px-1 flex items-center border border-white/[0.06]">
        <SpectrumVisualizer height={20} barColor={theme.id === "ALERTE_ROUGE" ? "#ef4444" : "#00d4ff"} />
      </div>

      {/* 3. Sélecteur de Canaux FIP */}
      <div className="flex items-center gap-1.5 shrink-0">
        {featuredStations.map((sid) => {
          const cfg = FIP_STATIONS.find((s) => s.id === sid);
          if (!cfg) return null;
          const isSelected = radioState.stationId === sid;
          return (
            <button
              key={sid}
              onClick={() => handleSelectStation(sid)}
              className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              {cfg.shortName}
            </button>
          );
        })}
      </div>

      {/* 4. Commandes Volume & Mute */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggleMute}
          className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
            radioState.isMuted
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
          title="Coupure immédiate du signal"
        >
          {radioState.isMuted ? "MUTÉ" : "SON"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={radioState.buses.master}
          onChange={handleVolumeChange}
          className="w-16 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          title="Volume Principal FIP-Σ"
        />

        <button
          onClick={handleToggleAuto}
          className={`px-2 py-1 rounded text-[10px] uppercase transition-all cursor-pointer ${
            radioState.isAutoMode
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
          title="Basculer le mode Auto FIP-Σ"
        >
          {radioState.isAutoMode ? "AUTO" : "MAN"}
        </button>
      </div>
    </div>
  );
}
