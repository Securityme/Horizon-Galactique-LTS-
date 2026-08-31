/**
 * HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
 * LOT S1 — Moteur Web Audio & Radio France FIP-Σ
 * 
 * Intègre les flux réels Radio France FIP (Direct, Jazz, Groove, Electro, Rock, Monde)
 * routés dans le graphe Web Audio (Visualiseur FFT, Bus de mixage, DSP climatique réactif),
 * avec bascule automatique sur synthèse procédurale pure hors-ligne.
 */

import {
  RadioStationId,
  RadioStationConfig,
  AudioBuses,
  TrackMetadata,
  RadioEngineState,
} from "./audioTypes";
import { speechNia } from "./speechNia";

export const FIP_STATIONS: RadioStationConfig[] = [
  {
    id: "FIP_DIRECT",
    name: "FIP Direct (Paris / Arche)",
    shortName: "FIP Direct",
    tagline: "L'éclectisme légendaire de Radio France transmis à travers les étoiles.",
    streamUrl: "https://icecast.radiofrance.fr/fip-midfi.mp3",
    frequencyKhz: 104.2,
    genre: "Éclectique · Jazz · Pop · Chanson · World",
    isLiveStream: true,
    synthFallbackType: "TERRE_LEGACY",
  },
  {
    id: "FIP_JAZZ",
    name: "FIP Jazz & Cosmos",
    shortName: "FIP Jazz",
    tagline: "Harmonies nocturnes, contrebasse feutrée et cuivres pour la dérive orbitale.",
    streamUrl: "https://icecast.radiofrance.fr/fipjazz-midfi.mp3",
    frequencyKhz: 101.4,
    genre: "Jazz · Be-bop · Cool Jazz · Néo-Soul",
    isLiveStream: true,
    synthFallbackType: "TERRE_LEGACY",
  },
  {
    id: "FIP_GROOVE",
    name: "FIP Groove & Dômes",
    shortName: "FIP Groove",
    tagline: "Rythmes chauds, funk solaire, afrobeat et tempo pour les secteurs de vie.",
    streamUrl: "https://icecast.radiofrance.fr/fipgroove-midfi.mp3",
    frequencyKhz: 98.8,
    genre: "Funk · Soul · Disco · Afrobeat · R&B",
    isLiveStream: true,
    synthFallbackType: "TERRE_LEGACY",
  },
  {
    id: "FIP_ELECTRO",
    name: "FIP Électro & Réacteurs",
    shortName: "FIP Électro",
    tagline: "Pulsations électroniques, deep house et ondes synthétiques de propulsion.",
    streamUrl: "https://icecast.radiofrance.fr/fipelectro-midfi.mp3",
    frequencyKhz: 106.9,
    genre: "Électro · Deep House · Downtempo · Synthwave",
    isLiveStream: true,
    synthFallbackType: "BRUIT_BLANC_CYBERNETIQUE",
  },
  {
    id: "FIP_MONDE",
    name: "FIP Musiques du Monde",
    shortName: "FIP Monde",
    tagline: "Les mémoires acoustiques des continents de la Terre Mère.",
    streamUrl: "https://icecast.radiofrance.fr/fipworld-midfi.mp3",
    frequencyKhz: 94.5,
    genre: "World Music · Brésil · Orient · Balkans · Afrique",
    isLiveStream: true,
    synthFallbackType: "TERRE_LEGACY",
  },
  {
    id: "FIP_ROCK",
    name: "FIP Rock & Dérive",
    shortName: "FIP Rock",
    tagline: "Énergie brute, guitares et riffs intemporels des archives du XXIe siècle.",
    streamUrl: "https://icecast.radiofrance.fr/fiprock-midfi.mp3",
    frequencyKhz: 92.1,
    genre: "Rock · Indie · Post-Punk · Psyché",
    isLiveStream: true,
    synthFallbackType: "ESPACE_PROFOND",
  },
  {
    id: "FIP_SYNTH_LEGACY",
    name: "FIP-Σ Synthétique : Terre-Legacy",
    shortName: "Synth Terre",
    tagline: "Générateur Web Audio 100% hors-ligne. Nappes douces en Do mineur.",
    frequencyKhz: 104.2,
    genre: "Synthèse Procédurale Pure (Hors-Ligne)",
    isLiveStream: false,
    synthFallbackType: "TERRE_LEGACY",
  },
  {
    id: "FIP_SYNTH_DEEP_SPACE",
    name: "FIP-Σ Synthétique : Espace Profond",
    shortName: "Synth Espace",
    tagline: "Drones sub-basses et respirations gravitationnelles lentes.",
    frequencyKhz: 43.6,
    genre: "Drone Cosmique & Sub-Basses",
    isLiveStream: false,
    synthFallbackType: "ESPACE_PROFOND",
  },
  {
    id: "FIP_SYNTH_CYBER",
    name: "FIP-Σ Synthétique : Bruit Cyber",
    shortName: "Synth Cyber",
    tagline: "Bruit blanc résonant et télémesure des réacteurs de l'Arche.",
    frequencyKhz: 142.9,
    genre: "Télémesure DSP & Bips Fréquentiels",
    isLiveStream: false,
    synthFallbackType: "BRUIT_BLANC_CYBERNETIQUE",
  },
];

export class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  // Bus de Gain
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Filtrage climatique
  private weatherFilter: BiquadFilterNode | null = null;
  private weatherDistortion: WaveShaperNode | null = null;

  // Élément audio pour le flux réel Radio France
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private isLiveStreamActive: boolean = false;
  private streamError: string | null = null;

  // État du moteur
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private isAutoMode: boolean = false;
  private currentStationId: RadioStationId = "FIP_DIRECT";
  private climateFilterActive: boolean = true;

  private buses: AudioBuses = {
    master: 0.75,
    music: 0.7,
    voice: 0.85,
    ambience: 0.5,
    sfx: 0.7,
  };

  private currentTrack: TrackMetadata = {
    title: "Radio France FIP — En Direct",
    artist: "Programmation Musicale Éclectique",
    station: "FIP Direct // 104.2 MHz",
    frequencyKhz: 104.2,
    isLive: true,
  };

  // Nœuds actifs de synthèse procédurale
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private melodyInterval: number | null = null;
  private fipJingleInterval: number | null = null;

  private listeners: Set<(state: RadioEngineState) => void> = new Set();

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          // Pause / suspension douce
          if (this.ctx && this.ctx.state === "running") {
            this.ctx.suspend().catch(() => {});
          }
          if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
          }
        } else {
          if (this.isPlaying && !this.isMuted) {
            if (this.ctx && this.ctx.state === "suspended") {
              this.ctx.resume().catch(() => {});
            }
            if (this.audioElement && this.isLiveStreamActive) {
              this.audioElement.play().catch(() => {});
            }
          }
        }
      });
    }
  }

  public subscribe(cb: (state: RadioEngineState) => void) {
    this.listeners.add(cb);
    cb(this.getState());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((cb) => cb(s));
  }

  public getState(): RadioEngineState {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      stationId: this.currentStationId,
      band: this.currentStationId, // compat
      isAutoMode: this.isAutoMode,
      isLiveStreamActive: this.isLiveStreamActive,
      streamError: this.streamError,
      buses: { ...this.buses },
      currentTrack: { ...this.currentTrack },
      climateFilterActive: this.climateFilterActive,
    };
  }

  public getStationConfig(id: RadioStationId = this.currentStationId): RadioStationConfig {
    const found = FIP_STATIONS.find((s) => s.id === id);
    return found || FIP_STATIONS[0];
  }

  public getAvailableStations(): RadioStationConfig[] {
    return FIP_STATIONS;
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.buses.master, this.ctx.currentTime);

      // FFT Analyser pour le visualiseur spectral
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.82;

      // Bus de gains individuels
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.buses.music, this.ctx.currentTime);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(this.buses.ambience, this.ctx.currentTime);

      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.setValueAtTime(this.buses.voice, this.ctx.currentTime);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.buses.sfx, this.ctx.currentTime);

      // Filtre climatique DSP
      this.weatherFilter = this.ctx.createBiquadFilter();
      this.weatherFilter.type = "lowpass";
      this.weatherFilter.frequency.setValueAtTime(16000, this.ctx.currentTime);

      // Distorsion climatique
      this.weatherDistortion = this.ctx.createWaveShaper();
      this.weatherDistortion.curve = this.makeDistortionCurve(0);

      // Routing du graphe audio :
      // Musique + Ambiance -> WeatherFilter -> WeatherDistortion -> Master -> Analyser -> Destination
      this.musicGain.connect(this.weatherFilter);
      this.ambienceGain.connect(this.weatherFilter);
      this.weatherFilter.connect(this.weatherDistortion);
      this.weatherDistortion.connect(this.masterGain);

      // SFX et Voice vont directement au Master pour rester audibles même en tempête
      this.voiceGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Initialisation de l'élément Audio HTML pour les flux en direct Radio France
      if (typeof window !== "undefined" && !this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = "anonymous";
        this.audioElement.preload = "none";

        try {
          this.mediaSourceNode = this.ctx.createMediaElementSource(this.audioElement);
          this.mediaSourceNode.connect(this.musicGain);
        } catch (err) {
          console.warn("MediaElementAudioSourceNode attach deferred:", err);
        }

        this.audioElement.addEventListener("playing", () => {
          this.isLiveStreamActive = true;
          this.streamError = null;
          this.notify();
        });

        this.audioElement.addEventListener("error", () => {
          console.warn("Radio France stream offline/blocked, fallbacking to procedural synth.");
          this.isLiveStreamActive = false;
          this.streamError = "Flux externe indisponible · Bascule synthétique locale";
          this.notify();
          // Bascule douce sur le moteur synthétique
          this.teardownStationNodes();
          this.buildProceduralNodes(this.getStationConfig().synthFallbackType);
        });
      }
    } catch (e) {
      console.warn("AudioContext setup failed:", e);
    }
  }

  private makeDistortionCurve(amount: number) {
    const k = amount;
    const n_samples = 256;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getByteFrequencyData(array: Uint8Array) {
    if (this.analyser && this.isPlaying && !this.isMuted) {
      this.analyser.getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.buses.master;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.04);
    }
    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
    }
    this.notify();
  }

  public setBusVolume(bus: keyof AudioBuses, val: number) {
    if (!this.ctx) {
      this.init();
    }
    const clamped = Math.max(0, Math.min(1, val));
    this.buses[bus] = clamped;

    if (bus === "voice") {
      speechNia.setVolume(clamped);
    }

    if (this.ctx) {
      const t = this.ctx.currentTime;
      if (bus === "master" && this.masterGain && !this.isMuted) {
        this.masterGain.gain.setTargetAtTime(clamped, t, 0.05);
      } else if (bus === "music" && this.musicGain) {
        this.musicGain.gain.setTargetAtTime(clamped, t, 0.05);
      } else if (bus === "ambience" && this.ambienceGain) {
        this.ambienceGain.gain.setTargetAtTime(clamped, t, 0.05);
      } else if (bus === "voice" && this.voiceGain) {
        this.voiceGain.gain.setTargetAtTime(clamped, t, 0.05);
      } else if (bus === "sfx" && this.sfxGain) {
        this.sfxGain.gain.setTargetAtTime(clamped, t, 0.05);
      }
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.setBusVolume("master", vol);
  }

  public getVolume(): number {
    return this.buses.master;
  }

  public getBand(): RadioStationId {
    return this.currentStationId;
  }

  public getStation(): RadioStationId {
    return this.currentStationId;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsAutoMode(): boolean {
    return this.isAutoMode;
  }

  public setClimateFilterActive(active: boolean) {
    this.climateFilterActive = active;
    if (!active && this.weatherFilter && this.ctx) {
      this.weatherFilter.frequency.setTargetAtTime(16000, this.ctx.currentTime, 0.2);
    }
    this.notify();
  }

  public setBand(stationId: RadioStationId, disableAuto: boolean = true) {
    this.setStation(stationId, disableAuto);
  }

  public setStation(stationId: RadioStationId, disableAuto: boolean = true) {
    if (disableAuto) {
      this.isAutoMode = false;
    }
    this.currentStationId = stationId;
    this.updateTrackMetadata(stationId);

    if (this.isPlaying) {
      this.playStation(stationId);
    } else {
      this.notify();
    }
  }

  public setAutoMode(auto: boolean) {
    this.isAutoMode = auto;
    this.notify();
  }

  private updateTrackMetadata(stationId: RadioStationId) {
    const config = this.getStationConfig(stationId);
    if (config.isLiveStream) {
      this.currentTrack = {
        title: config.name,
        artist: "Radio France · Flux Direct Mondial",
        station: `${config.shortName} // ${config.frequencyKhz} MHz`,
        frequencyKhz: config.frequencyKhz,
        isLive: true,
      };
    } else {
      const synthsTitles = {
        FIP_SYNTH_LEGACY: [
          { title: "Élégie des Terres Lointaines", artist: "Archives Orchestrales 2110" },
          { title: "Nostalgie d'un Ciel d'Été", artist: "Chambre Acoustique de Kyoto" },
          { title: "Mémoire des Océans Bleus", artist: "Quatuor de la Mer Baltique" },
        ],
        FIP_SYNTH_DEEP_SPACE: [
          { title: "Résonance du Pulsar PSR-J1748", artist: "Radiotélescope d'Atacama" },
          { title: "Harmoniques du Grand Vide", artist: "Écouteurs du Bras d'Orion" },
          { title: "Chant Gravitationnel de Proxima", artist: "Sonde Pioneer-XII" },
        ],
        FIP_SYNTH_CYBER: [
          { title: "Télémétrie du Cœur Alpha", artist: "Sous-Système Réacteur S-01" },
          { title: "Flux Binaire de Cryostase", artist: "Matrice N.I.A. Superviseur" },
        ],
      };
      const list = (synthsTitles as any)[stationId] || synthsTitles.FIP_SYNTH_LEGACY;
      const pick = list[Math.floor(Math.random() * list.length)];
      this.currentTrack = {
        title: pick.title,
        artist: pick.artist,
        station: `${config.shortName} // ${config.frequencyKhz} kHz`,
        frequencyKhz: config.frequencyKhz,
        isLive: false,
      };
    }
  }

  // Filtrage réactif au climat de l'Arche
  public applyWeatherDSP(silicaStorm: boolean, ionStorm: boolean) {
    if (!this.climateFilterActive || !this.ctx || !this.weatherFilter) return;

    const t = this.ctx.currentTime;
    if (silicaStorm) {
      // Tempête de silice : passe-bas étouffant à 1200Hz
      this.weatherFilter.frequency.setTargetAtTime(1200, t, 0.4);
      this.weatherFilter.Q.setTargetAtTime(3.0, t, 0.4);
    } else if (ionStorm) {
      // Orage ionique : distorsion résonante à 4500Hz
      this.weatherFilter.frequency.setTargetAtTime(4500, t, 0.2);
      this.weatherFilter.Q.setTargetAtTime(6.0, t, 0.2);
      if (this.weatherDistortion) {
        this.weatherDistortion.curve = this.makeDistortionCurve(18);
      }
    } else {
      // Nominal : son cristallin
      this.weatherFilter.frequency.setTargetAtTime(16000, t, 0.6);
      this.weatherFilter.Q.setTargetAtTime(0.7, t, 0.6);
      if (this.weatherDistortion) {
        this.weatherDistortion.curve = this.makeDistortionCurve(0);
      }
    }
  }

  public triggerBreachMuffle() {
    if (!this.ctx || !this.weatherFilter) return;
    const t = this.ctx.currentTime;
    this.weatherFilter.frequency.setValueAtTime(300, t);
    this.weatherFilter.frequency.exponentialRampToValueAtTime(14000, t + 3.0);
  }

  public start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    this.isPlaying = true;
    this.playStation(this.currentStationId);
    this.notify();
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.teardownStationNodes();
    this.isPlaying = false;
    this.isLiveStreamActive = false;
    this.notify();
  }

  private playStation(stationId: RadioStationId) {
    this.teardownStationNodes();
    const config = this.getStationConfig(stationId);

    if (config.isLiveStream && config.streamUrl && this.audioElement) {
      // Lecture du flux en direct Radio France
      this.audioElement.src = config.streamUrl;
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.load();
      
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isLiveStreamActive = true;
            this.streamError = null;
            this.notify();
          })
          .catch((err) => {
            console.warn("Live stream autoplay prevented or failed, playing procedural synth fallback:", err);
            this.isLiveStreamActive = false;
            this.streamError = "Lecture locale activée (Flux Radio France sécurisé)";
            this.buildProceduralNodes(config.synthFallbackType);
            this.notify();
          });
      }
    } else {
      // Lecture synthétique pure
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.isLiveStreamActive = false;
      this.buildProceduralNodes(config.synthFallbackType);
      this.notify();
    }
  }

  private teardownStationNodes() {
    if (this.melodyInterval) {
      window.clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
    this.activeGains.forEach((g) => {
      try {
        g.disconnect();
      } catch (e) {}
    });
    this.activeGains = [];
  }

  private buildProceduralNodes(synthType: "TERRE_LEGACY" | "ESPACE_PROFOND" | "BRUIT_BLANC_CYBERNETIQUE") {
    if (!this.ctx || !this.musicGain) return;

    if (synthType === "TERRE_LEGACY") {
      this.synthesizeTerreLegacy();
    } else if (synthType === "ESPACE_PROFOND") {
      this.synthesizeEspaceProfond();
    } else {
      this.synthesizeBruitBlancCyber();
    }
  }

  // 1. TERRE-LEGACY : Nappes chaudes en Do mineur, vinyle et cordes lentes
  private synthesizeTerreLegacy() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const baseGain = this.ctx.createGain();
    baseGain.gain.setValueAtTime(0.22, t);
    baseGain.connect(this.musicGain);
    this.activeGains.push(baseGain);

    // Accord mineur jazz chaleureux (C3, Eb3, G3, Bb3, D4)
    const chord = [130.81, 155.56, 196.0, 233.08, 293.66];
    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.connect(baseGain);
      osc.start(t);
      this.activeOscillators.push(osc);
    });

    // Ligne mélodique feutrée
    const melody = [261.63, 311.13, 392.0, 466.16, 523.25, 392.0, 349.23];
    let step = 0;
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || this.isLiveStreamActive) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(melody[step % melody.length], this.ctx.currentTime);

      g.gain.setValueAtTime(0, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + 1.2);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 4.8);

      osc.connect(g);
      g.connect(baseGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 4.9);
      step++;
    }, 5000);
  }

  // 2. ESPACE-PROFOND : Drones sub-basses
  private synthesizeEspaceProfond() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const baseGain = this.ctx.createGain();
    baseGain.gain.setValueAtTime(0.3, t);
    baseGain.connect(this.musicGain);
    this.activeGains.push(baseGain);

    const subOsc = this.ctx.createOscillator();
    subOsc.type = "sawtooth";
    subOsc.frequency.setValueAtTime(43.65, t);
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = "lowpass";
    subFilter.frequency.setValueAtTime(140, t);

    subOsc.connect(subFilter);
    subFilter.connect(baseGain);
    subOsc.start(t);
    this.activeOscillators.push(subOsc);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, t);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.12, t);
    lfo.connect(lfoGain);
    lfoGain.connect(baseGain.gain);
    lfo.start(t);
    this.activeOscillators.push(lfo);
  }

  // 3. BRUIT BLANC CYBERNÉTIQUE
  private synthesizeBruitBlancCyber() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const baseGain = this.ctx.createGain();
    baseGain.gain.setValueAtTime(0.16, t);
    baseGain.connect(this.musicGain);
    this.activeGains.push(baseGain);

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandFilter = this.ctx.createBiquadFilter();
    bandFilter.type = "bandpass";
    bandFilter.frequency.setValueAtTime(2400, t);
    bandFilter.Q.setValueAtTime(4.0, t);

    noiseSource.connect(bandFilter);
    bandFilter.connect(baseGain);
    noiseSource.start(t);

    const freqs = [659.25, 880.0, 1318.51, 1760.0];
    let count = 0;
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || this.isLiveStreamActive) return;
      const beep = this.ctx.createOscillator();
      const bg = this.ctx.createGain();

      beep.type = "sine";
      beep.frequency.setValueAtTime(freqs[count % freqs.length], this.ctx.currentTime);

      bg.gain.setValueAtTime(0.06, this.ctx.currentTime);
      bg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      beep.connect(bg);
      bg.connect(baseGain);

      beep.start();
      beep.stop(this.ctx.currentTime + 0.13);
      count++;
    }, 700);
  }

  /**
   * Jingles et Annonces Vocales FIP
   * Joue le carillon mythique de FIP puis déclenche la voix douce de l'animatrice
   */
  public triggerFipJingleAndVoice(sol: number = 1) {
    this.playFipTonalJingle();
    setTimeout(() => {
      speechNia.speakFipAnnouncement(sol);
    }, 1200);
  }

  public playFipTonalJingle() {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain) return;
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});

      const t = this.ctx.currentTime;
      // Carillon doux 3 tons emblématique (Mi5 -> Sol#5 -> Si5)
      const notes = [659.25, 830.61, 987.77];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t + idx * 0.28);

        g.gain.setValueAtTime(0, t + idx * 0.28);
        g.gain.linearRampToValueAtTime(0.12, t + idx * 0.28 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.28 + 0.55);

        osc.connect(g);
        g.connect(this.sfxGain!);

        osc.start(t + idx * 0.28);
        osc.stop(t + idx * 0.28 + 0.6);
      });
    } catch (e) {
      console.warn("FIP Jingle error:", e);
    }
  }

  // SFX Bus
  public playUIChime(type: "CLICK" | "CONFIRM" | "ALARM" | "ERROR") {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain) return;
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      if (type === "CLICK") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.04);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
      } else if (type === "CONFIRM") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, t);
        osc.frequency.setValueAtTime(880.0, t + 0.06);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.start(t);
        osc.stop(t + 0.22);
      } else if (type === "ALARM") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.linearRampToValueAtTime(440, t + 0.25);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        osc.start(t);
        osc.stop(t + 0.26);
      } else if (type === "ERROR") {
        osc.type = "square";
        osc.frequency.setValueAtTime(220, t);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.start(t);
        osc.stop(t + 0.16);
      }
    } catch (e) {
      // Ignoré
    }
  }

  // TIP 4 : Sonde Audio d'Interférence Spatiale (Sweep de fréquence + Bruit cosmologique)
  public playSpatialProbeSweep() {
    try {
      this.init();
      if (!this.ctx || !this.sfxGain) return;
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});

      const t = this.ctx.currentTime;
      // Oscillator 1: Frequency sweep from high to low with sine harmonics
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(2400, t);
      osc1.frequency.exponentialRampToValueAtTime(320, t + 0.45);
      osc1.frequency.linearRampToValueAtTime(1200, t + 0.7);

      gain1.gain.setValueAtTime(0.01, t);
      gain1.gain.linearRampToValueAtTime(0.18, t + 0.15);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      // Oscillator 2: Sub-cosmic resonance carrier
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(180, t);
      osc2.frequency.linearRampToValueAtTime(440, t + 0.5);

      gain2.gain.setValueAtTime(0.05, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc1.connect(gain1);
      gain1.connect(this.sfxGain);

      osc2.connect(gain2);
      gain2.connect(this.sfxGain);

      osc1.start(t);
      osc1.stop(t + 0.75);

      osc2.start(t);
      osc2.stop(t + 0.6);
    } catch (e) {
      console.warn("Spatial probe sound error:", e);
    }
  }
}

export const proceduralRadio = new ProceduralAudioEngine();
