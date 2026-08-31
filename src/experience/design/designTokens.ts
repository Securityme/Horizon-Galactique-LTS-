/**
 * HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
 * LOT S1 — Direction Artistique & Design Tokens
 * 
 * 4.1 Modèle de profondeur (3 niveaux de verre)
 * 4.2 Lumière spéculaire (source unique haut-gauche)
 * 4.3 Discipline chromatique et sévérité stricte
 * 4.4 Typographie et chiffres tabulaires
 */

export const GLASS_LEVELS = {
  L1_BACKGROUND: {
    name: "Fond / Plateforme",
    className: "backdrop-blur-sm bg-slate-950/35 border border-white/[0.08]",
    style: {
      backgroundColor: "rgba(2, 6, 23, 0.35)",
      backdropFilter: "blur(8px)",
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
  },
  L2_CARD: {
    name: "Carte / Module",
    className: "backdrop-blur-md bg-slate-950/55 border border-white/[0.14] shadow-lg shadow-black/40",
    style: {
      backgroundColor: "rgba(2, 6, 23, 0.55)",
      backdropFilter: "blur(20px)",
      borderColor: "rgba(255, 255, 255, 0.14)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
    },
  },
  L3_SHEET: {
    name: "Feuille / Panneau Modal",
    className: "backdrop-blur-xl bg-slate-950/85 border border-white/[0.22] shadow-2xl shadow-black/80",
    style: {
      backgroundColor: "rgba(2, 6, 23, 0.85)",
      backdropFilter: "blur(40px)",
      borderColor: "rgba(255, 255, 255, 0.22)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
    },
  },
} as const;

export const SEVERITY_COLORS = {
  INFO: {
    text: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/40",
    hex: "#38bdf8",
    label: "INFORMATION",
  },
  WARNING: {
    text: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    hex: "#f59e0b",
    label: "AVERTISSEMENT",
  },
  CRITICAL: {
    text: "text-rose-500",
    bg: "bg-rose-600/20",
    border: "border-rose-500/50",
    hex: "#f43f5e",
    label: "CRITIQUE",
  },
  FATAL: {
    text: "text-red-600",
    bg: "bg-red-950/40",
    border: "border-red-600/70",
    hex: "#dc2626",
    label: "PERTE IMMINENTE",
  },
} as const;

export const MOTION_TIMINGS = {
  standard: "duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
  expand: "duration-240 ease-[cubic-bezier(0.4,0,0.2,1)]",
  tabSwitch: "duration-180 ease-out",
} as const;
