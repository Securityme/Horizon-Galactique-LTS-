/**
 * Strates Constants
 * Constants related to the 3136 strates matrix
 */

// Roles definition
export const ROLES = [
  'Base',
  'Entree', 
  'Mesure',
  'Agregat',
  'Signal',
  'Norme',
  'Conteneur',
] as const;

// Priority levels
export const PRIORITY_LEVELS = {
  P0: {
    name: 'Critical',
    range: [0, 13],
    color: '#ef4444',
    description: 'Infrastructure and core components',
    estimatedHours: 42,
  },
  P1: {
    name: 'High',
    range: [14, 95],
    color: '#f97316',
    description: 'CANON and EXTENSION components',
    estimatedHours: 246,
  },
  P2: {
    name: 'Medium',
    range: [96, 195],
    color: '#3b82f6',
    description: 'L2 maturity components',
    estimatedHours: 588,
    blocked: true,
    blockedReason: 'Requires L3 maturity',
  },
  P3: {
    name: 'Low',
    range: [196, 3135],
    color: '#64748b',
    description: 'Remaining components',
    estimatedHours: 5856,
  },
};

// Maturity levels
export const MATURITY_LEVELS = {
  L1: {
    name: 'Foundations',
    description: 'P0 strates complete',
    targetDate: '2026-09-15',
  },
  L2: {
    name: 'Core Components',
    description: 'P0 + P1 strates complete',
    targetDate: '2026-10-15',
  },
  L3: {
    name: 'Extensions and Resilience',
    description: 'P0 + P1 + P2 strates complete',
    targetDate: '2026-11-15',
  },
  PRODUCTION: {
    name: 'Production Ready',
    description: 'All 3136 strates complete',
    targetDate: '2027-01-15',
  },
};

// Total counts
export const TOTALS = {
  STRATES: 3136,
  SECTORS: 16,
  RANGS: 4,
  FAMILIES: 7,
  ROLES: 7,
};

// GitHub integration constants
export const GITHUB_CONFIG = {
  REPOSITORY: 'Securityme/Horizon-Galactique-LTS-',
  BRANCHES: ['main', 'dev', 'staging'],
  DEFAULT_BRANCH: 'dev',
};

// Calculation formulas
export function getStrateCode(id: number): string {
  const S = Math.floor(id / 196);
  const R = Math.floor((id % 196) / 49);
  const F = Math.floor((id % 49) / 7);
  const P = id % 7;
  return 'STR-' + (S + 1).toString().padStart(2, '0') + '.' +
         R.toString().padStart(2, '0') + '.' +
         F.toString().padStart(2, '0') + '.' +
         P.toString().padStart(2, '0');
}
