/**
 * Strate Type Definitions
 * Core types for the 3136 strates matrix system
 */

export interface GitHubStatus {
  implementation: 'PARTIAL' | 'NOT_IMPLEMENTED' | 'IMPLEMENTED' | 'BLOCKED' | 'NOT_DEFINED';
  file: string | null;
  commit: string | null;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  estimated_hours: number;
  assigned_to: string | null;
  start_date: string | null;
  due_date: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'BACKLOG';
  blocked_by: string | null;
  dependencies: string[];
}

export interface Strate {
  id: number;
  str: string;
  quadrant: string;
  master: string;
  secteur: string;
  sous_quadrant: string;
  rang: string;
  rang_nom: string;
  famille: string;
  famille_abstraite: string;
  role: 'Base' | 'Entree' | 'Mesure' | 'Agregat' | 'Signal' | 'Norme' | 'Conteneur';
  designation: string;
  mission_rang: string;
  theme_activation: string | null;
  lot: string;
  ere: number;
  maturite: string;
  activation: string;
  origine_v402: string | null;
  chemin_src: string | null;
  proprietaire: string | null;
  tags: string[];
  github_status: GitHubStatus;
}

export interface StratesMatrix {
  reference: string;
  revision: string;
  total: number;
  adresse: string;
  loi: {
    S: string;
    R: string;
    F: string;
    P: string;
  };
  cadence_hz: number;
  github_integration: {
    repository: string;
    analysis_date: string;
    current_status: {
      maturity: string;
      branches: number;
      commits: number;
      issues: number;
      coverage: number;
      compliance_score: number;
      target_maturity: string;
      estimated_completion: string;
    };
    technical_stack: {
      frontend: Record<string, string>;
      backend: Record<string, string>;
      ai: Record<string, string>;
    };
  };
  strates: Strate[];
}

// Utility type for component props
export interface StrateComponentProps {
  strate?: Strate;
  id?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Priority colors mapping
export const PRIORITY_COLORS: Record<'P0' | 'P1' | 'P2' | 'P3', string> = {
  P0: 'text-red-600 bg-red-50',
  P1: 'text-orange-600 bg-orange-50',
  P2: 'text-blue-600 bg-blue-50',
  P3: 'text-gray-600 bg-gray-50',
};

// Status colors mapping
export const STATUS_COLORS: Record<string, string> = {
  TODO: 'text-gray-700 bg-gray-100',
  IN_PROGRESS: 'text-blue-700 bg-blue-100',
  DONE: 'text-green-700 bg-green-100',
  BLOCKED: 'text-red-700 bg-red-100',
  BACKLOG: 'text-purple-700 bg-purple-100',
};

// Role colors mapping
export const ROLE_COLORS: Record<string, string> = {
  Base: 'bg-cyan-100 text-cyan-800',
  Entree: 'bg-emerald-100 text-emerald-800',
  Mesure: 'bg-violet-100 text-violet-800',
  Agregat: 'bg-amber-100 text-amber-800',
  Signal: 'bg-rose-100 text-rose-800',
  Norme: 'bg-indigo-100 text-indigo-800',
  Conteneur: 'bg-slate-100 text-slate-800',
};
