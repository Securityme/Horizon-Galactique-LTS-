export type ThemeId =
  | "LIGHT_MODE"
  | "MODE_CLAIR_STELLAIRE"
  | "SOLAR_ALBATRE"
  | "CYAN_OBSIDIENNE"
  | "ALERTE_ROUGE"
  | "AMBER_CRT"
  | "GLASSMORPHIC"
  | "CARTESIEN_HC";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  bgClass: string;
  cardBg: string;
  cardBorder: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  textPrimary: string;
  textSecondary: string;
  fontFamily: string;
  isLight?: boolean;
  ambientGlow?: string;
  panelBg?: string;
  tagColor?: string;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  LIGHT_MODE: {
    id: "LIGHT_MODE",
    name: "Clair Épuré (Off-White & Dark Glass)",
    description: "Fond blanc cassé (#F8FAFC), typographie sombre neutre, accents foncés et verres dépolis pour un contraste idéal.",
    bgClass: "bg-[#F8FAFC] text-slate-900",
    cardBg: "bg-white/85 backdrop-blur-xl shadow-md shadow-slate-200/80",
    cardBorder: "border-slate-300/80",
    accentText: "text-slate-900 font-bold",
    accentBg: "bg-slate-900 text-white hover:bg-slate-800",
    accentBorder: "border-slate-400",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    fontFamily: "font-sans",
    isLight: true,
    ambientGlow: "bg-gradient-to-br from-slate-50 via-sky-50/30 via-indigo-50/20 to-slate-100",
    panelBg: "bg-slate-900/5 text-slate-900 backdrop-blur-md",
    tagColor: "bg-slate-900 text-white",
  },
  MODE_CLAIR_STELLAIRE: {
    id: "MODE_CLAIR_STELLAIRE",
    name: "Mode Clair Stellaire (Jour)",
    description: "Fond clair épuré, typographie noir profond et contrastes optimaux de jour.",
    bgClass: "bg-slate-100 text-slate-900",
    cardBg: "bg-white/95 backdrop-blur-md",
    cardBorder: "border-slate-300 shadow-md shadow-slate-300/40",
    accentText: "text-sky-700",
    accentBg: "bg-sky-100 text-sky-900",
    accentBorder: "border-sky-300",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-600",
    fontFamily: "font-sans",
    isLight: true,
    ambientGlow: "bg-gradient-to-b from-sky-50/60 via-slate-100 to-indigo-50/40",
    panelBg: "bg-slate-50/90",
    tagColor: "bg-sky-600 text-white",
  },
  SOLAR_ALBATRE: {
    id: "SOLAR_ALBATRE",
    name: "Solaire Albâtre & Or",
    description: "Mode clair chaud, accents dorés et blanc cassé reposant pour les yeux.",
    bgClass: "bg-stone-100 text-stone-900",
    cardBg: "bg-white/95 backdrop-blur-md",
    cardBorder: "border-stone-300 shadow-md shadow-stone-300/40",
    accentText: "text-amber-700",
    accentBg: "bg-amber-100 text-amber-900",
    accentBorder: "border-amber-300",
    textPrimary: "text-stone-900",
    textSecondary: "text-stone-600",
    fontFamily: "font-sans",
    isLight: true,
    ambientGlow: "bg-gradient-to-b from-amber-50/70 via-stone-100 to-orange-50/30",
    panelBg: "bg-stone-50/90",
    tagColor: "bg-amber-600 text-white",
  },
  CYAN_OBSIDIENNE: {
    id: "CYAN_OBSIDIENNE",
    name: "Obsidienne & Acier Tactique",
    description: "Noir ardoise profond, contrastes équilibrés et accents cyan doux anti-fatigue.",
    bgClass: "bg-slate-950 text-slate-100",
    cardBg: "bg-slate-900/85 backdrop-blur-xl",
    cardBorder: "border-slate-800/80 shadow-slate-950/60",
    accentText: "text-sky-400",
    accentBg: "bg-sky-500/15 text-sky-200",
    accentBorder: "border-sky-500/30",
    textPrimary: "text-slate-100",
    textSecondary: "text-slate-400",
    fontFamily: "font-sans",
    isLight: false,
    ambientGlow: "bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950",
    panelBg: "bg-slate-950/60",
    tagColor: "bg-sky-500/20 text-sky-300",
  },
  ALERTE_ROUGE: {
    id: "ALERTE_ROUGE",
    name: "Alerte Rouge / Combat",
    description: "Noir carbonisé, rouge écarlate et ambre d'urgence tactique.",
    bgClass: "bg-zinc-950 text-red-100",
    cardBg: "bg-zinc-900/90 backdrop-blur-xl",
    cardBorder: "border-red-900/50 shadow-red-950/50",
    accentText: "text-red-400",
    accentBg: "bg-red-600/20 text-red-300",
    accentBorder: "border-red-600/40",
    textPrimary: "text-red-100",
    textSecondary: "text-red-400/80",
    fontFamily: "font-mono",
    isLight: false,
    ambientGlow: "bg-gradient-to-b from-red-950/20 via-zinc-950 to-black",
    panelBg: "bg-black/60",
    tagColor: "bg-red-500/20 text-red-300",
  },
  CARTESIEN_HC: {
    id: "CARTESIEN_HC",
    name: "Cartésien High-Contrast",
    description: "Monochrome pur, géométrie cartésienne et contraste absolu.",
    bgClass: "bg-black text-white",
    cardBg: "bg-neutral-900/95 border-2 border-white",
    cardBorder: "border-white",
    accentText: "text-white font-bold underline",
    accentBg: "bg-white text-black",
    accentBorder: "border-white",
    textPrimary: "text-white",
    textSecondary: "text-neutral-300",
    fontFamily: "font-mono",
    isLight: false,
    ambientGlow: "bg-black",
    panelBg: "bg-neutral-950",
    tagColor: "bg-white text-black",
  },
  AMBER_CRT: {
    id: "AMBER_CRT",
    name: "Amber CRT Retro 1980",
    description: "Phosphore ambre diégétique, scanlines et lueur cathodique feutrée.",
    bgClass: "bg-stone-950 text-amber-300 font-mono",
    cardBg: "bg-stone-900/90 backdrop-blur-md",
    cardBorder: "border-amber-600/30 shadow-amber-950/60",
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/20 text-amber-200",
    accentBorder: "border-amber-500/40",
    textPrimary: "text-amber-200",
    textSecondary: "text-amber-500/80",
    fontFamily: "font-mono",
    isLight: false,
    ambientGlow: "bg-gradient-to-b from-stone-950 via-amber-950/15 to-stone-950",
    panelBg: "bg-stone-950/70",
    tagColor: "bg-amber-500/20 text-amber-300",
  },
  GLASSMORPHIC: {
    id: "GLASSMORPHIC",
    name: "Glassmorphic Améthyste",
    description: "Verre feuilleté multicouche, teintes violettes et flou d'arrière-plan.",
    bgClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100",
    cardBg: "bg-slate-900/60 backdrop-blur-2xl",
    cardBorder: "border-indigo-500/20 shadow-2xl",
    accentText: "text-indigo-300",
    accentBg: "bg-indigo-500/20 text-indigo-200",
    accentBorder: "border-indigo-400/30",
    textPrimary: "text-slate-50",
    textSecondary: "text-slate-300",
    fontFamily: "font-sans",
    isLight: false,
    ambientGlow: "bg-gradient-to-b from-indigo-950/20 via-slate-950 to-black",
    panelBg: "bg-indigo-950/40",
    tagColor: "bg-indigo-500/20 text-indigo-300",
  },
};
