/**
 * HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
 * LOT S1 — Types du Centre de Contrôle / Matrice de Configuration
 */

import { ThemeId } from "../../../theme/themes";

export type ConfigTabId =
  | "AFFICHAGE"
  | "AUDIO"
  | "SIMULATION"
  | "REGISTRE"
  | "DIAGNOSTIC"
  | "ACCESSIBILITE";

export type NiaOperatingMode = "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF";

export interface NiaDomainDelegation {
  energy: boolean;
  biosphere: boolean;
  population: boolean;
  industry: boolean;
  defense: boolean;
}

export interface RetroEffectsConfig {
  scanlines: boolean;
  chromaticAberration: boolean;
  grain: boolean;
  vignette: boolean;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  fontSizeLevel: "STANDARD" | "LARGE" | "MAX";
  enlargedTouchTargets: boolean;
  hapticIntensity: "OFF" | "SOFT" | "STRONG";
  forceReducedMotion: boolean;
}

export interface DisplayConfig {
  themeId: ThemeId;
  retro: RetroEffectsConfig;
  density: "COMPACT" | "COMFORTABLE";
  autoRedAlertOnCrisis: boolean;
}
