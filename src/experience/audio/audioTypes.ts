/**
 * HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
 * LOT S1 — Types Audio & Radio France FIP-Σ
 */

export type RadioStationId = 
  | "FIP_DIRECT"
  | "FIP_JAZZ"
  | "FIP_GROOVE"
  | "FIP_ELECTRO"
  | "FIP_ROCK"
  | "FIP_MONDE"
  | "FIP_SYNTH_LEGACY"
  | "FIP_SYNTH_DEEP_SPACE"
  | "FIP_SYNTH_CYBER";

export type RadioBand = RadioStationId;

export interface RadioStationConfig {
  id: RadioStationId;
  name: string;
  shortName: string;
  tagline: string;
  streamUrl?: string; // Live stream URL (Radio France FIP)
  frequencyKhz: number;
  genre: string;
  isLiveStream: boolean;
  synthFallbackType: "TERRE_LEGACY" | "ESPACE_PROFOND" | "BRUIT_BLANC_CYBERNETIQUE";
}

export interface AudioBuses {
  master: number; // 0 to 1
  music: number;  // 0 to 1
  voice: number;  // 0 to 1
  ambience: number; // 0 to 1
  sfx: number;    // 0 to 1
}

export interface TrackMetadata {
  title: string;
  artist: string;
  station: string;
  frequencyKhz: number;
  isLive: boolean;
  albumArtUrl?: string;
}

export interface RadioEngineState {
  isPlaying: boolean;
  isMuted: boolean;
  stationId: RadioStationId;
  band: RadioStationId; // alias for backwards compat
  isAutoMode: boolean;
  isLiveStreamActive: boolean;
  streamError: string | null;
  buses: AudioBuses;
  currentTrack: TrackMetadata;
  climateFilterActive: boolean;
}

