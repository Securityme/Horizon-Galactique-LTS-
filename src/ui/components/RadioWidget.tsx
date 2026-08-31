import React, { useEffect, useState, useRef } from "react";
import { proceduralRadio, FIP_STATIONS } from "../../audio/radio";
import { RadioEngineState, RadioStationId } from "../../experience/audio/audioTypes";
import { ThemeDefinition } from "../../theme/themes";
import { Play, Pause, Volume2, VolumeX, ChevronDown, Radio as RadioIcon, Music, Settings, Sparkles, Activity } from "lucide-react";

export interface RadioWidgetProps {
  theme: ThemeDefinition;
  compact?: boolean;
  onOpenSettings?: () => void;
}

export function RadioWidget({ theme, compact = false, onOpenSettings }: RadioWidgetProps) {
  const [radioState, setRadioState] = useState<RadioEngineState>(proceduralRadio.getState());
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      proceduralRadio.start();
    } catch (err) {
      console.warn("Auto-start radio context:", err);
    }

    const unsubscribe = proceduralRadio.subscribe((newState) => {
      setRadioState({ ...newState });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentStation = FIP_STATIONS.find((s) => s.id === radioState.stationId) || FIP_STATIONS[0];
  const isLight = theme.isLight ?? true;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    proceduralRadio.togglePlay();
  };

  const handleSelectStation = (stationId: RadioStationId) => {
    proceduralRadio.setStation(stationId);
    proceduralRadio.playUIChime("CLICK");
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    proceduralRadio.setVolume(val);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    proceduralRadio.toggleMute();
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 font-mono text-xs select-none" ref={popoverRef}>
      {/* Modern Capsule Pill Control */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all duration-200 shadow-sm ${
          radioState.isPlaying
            ? isLight
              ? "bg-slate-900 text-white border-slate-800 ring-2 ring-emerald-500/20 shadow-md"
              : "bg-slate-900/90 text-slate-100 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            : isLight
            ? "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300"
            : "bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20 hover:bg-slate-800/80"
        }`}
        title="Système de transmission spatiale & ambiance procédurale FIP"
      >
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
            radioState.isPlaying
              ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
              : isLight
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
          title={radioState.isPlaying ? "Suspendre la transmission" : "Activer la transmission"}
        >
          {radioState.isPlaying ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current ml-0.5" />
          )}
        </button>

        {/* Station Frequency and Title */}
        <div className="flex items-center gap-2 max-w-[170px] truncate">
          <div className="flex flex-col text-left leading-tight truncate">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-sky-400 truncate flex items-center gap-1">
              <Activity className="w-3 h-3 inline" />
              {currentStation.frequencyKhz} MHz
            </span>
            <span className={`text-[11px] font-sans font-semibold truncate ${radioState.isPlaying ? "text-slate-100" : isLight ? "text-slate-800" : "text-slate-200"}`}>
              {currentStation.name}
            </span>
          </div>
        </div>

        {/* Dynamic Spectrum Waveform Visualizer */}
        {radioState.isPlaying ? (
          <div className="flex items-end gap-0.5 h-3.5 px-1 bg-black/20 rounded py-0.5 shrink-0">
            <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDuration: "0.5s" }} />
            <span className="w-0.5 bg-teal-300 rounded-full animate-bounce h-3.5" style={{ animationDuration: "0.7s" }} />
            <span className="w-0.5 bg-sky-400 rounded-full animate-bounce h-2.5" style={{ animationDuration: "0.6s" }} />
            <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-1.5" style={{ animationDuration: "0.4s" }} />
          </div>
        ) : (
          <RadioIcon className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60" />
        )}

        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Optional Adjacent Settings Button */}
      {onOpenSettings && (
        <button
          onClick={() => {
            proceduralRadio.playUIChime("CLICK");
            onOpenSettings();
          }}
          className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 font-bold cursor-pointer transition-all duration-150 ${
            isLight
              ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              : "bg-slate-900/80 border-white/10 text-slate-300 hover:border-sky-400 hover:text-white"
          }`}
          title="Paramètres & Configuration"
        >
          <Settings className="w-3.5 h-3.5 text-sky-500" />
          <span className="hidden sm:inline text-[11px]">PARAMÈTRES</span>
        </button>
      )}

      {/* Modern Popover Panel */}
      {isOpen && (
        <div
          className={`absolute left-0 top-11 z-50 w-80 p-4 rounded-2xl border shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3.5 ${
            isLight
              ? "bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/70"
              : "bg-slate-950/95 border-sky-500/20 text-slate-100 shadow-black/90"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-xs tracking-wider uppercase text-sky-600 dark:text-sky-400">
              <Sparkles className="w-4 h-4 text-amber-400" /> CANAUX RADIO & ATMOSPHÈRE
            </div>
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                radioState.isMuted
                  ? "bg-rose-500/10 border-rose-400/40 text-rose-600 dark:text-rose-400"
                  : isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
              title={radioState.isMuted ? "Rétablir le son" : "Couper le son"}
            >
              {radioState.isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
          </div>

          {/* Station List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {FIP_STATIONS.map((st) => {
              const isSelected = st.id === radioState.stationId;
              return (
                <div
                  key={st.id}
                  onClick={() => handleSelectStation(st.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? isLight
                        ? "bg-sky-50 border-sky-300 text-sky-950 font-bold shadow-sm"
                        : "bg-sky-500/15 border-sky-400/60 text-sky-200 font-bold shadow-[0_0_12px_rgba(56,189,248,0.15)]"
                      : isLight
                      ? "bg-slate-50/70 hover:bg-slate-100 border-slate-200/70 text-slate-800"
                      : "bg-slate-900/50 hover:bg-slate-900 border-white/5 text-slate-300 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-sky-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                      <Music className="w-3 h-3" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[12px] truncate">{st.name}</div>
                      <div className="text-[10px] opacity-75 font-sans truncate">{st.tagline}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono shrink-0 ml-2 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 font-semibold text-sky-600 dark:text-sky-400">
                    {st.frequencyKhz} MHz
                  </span>
                </div>
              );
            })}
          </div>

          {/* Master Volume Slider */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>VOLUME GÉNÉRAL</span>
              <span className="font-bold">{Math.round(radioState.buses.master * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={radioState.buses.master}
              onChange={handleVolumeChange}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
          </div>

          {/* Procedural synthesis footer status */}
          <div className="text-[10px] text-center font-sans opacity-80 text-slate-500 dark:text-slate-400">
            {radioState.isLiveStreamActive ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Flux Radio Spatial Connecté
              </span>
            ) : (
              <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" /> Synthèse Procédurale Déterministe
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
