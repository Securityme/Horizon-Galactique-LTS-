/**
 * HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
 * Module PRNG Déterministe à 4 Niveaux
 * Règle d'or : Fonction pure, zéro I/O, zéro Math.random(), zéro Date.now().
 */

export const MASTER_SEED_DEFAULT = 0x12345678;

/** Mulberry32 — Pour les tirages haute fréquence (production, consommations, micro-aléas) */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function (): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** SplitMix32 — Pour dériver des sous-seeds étanches par sous-système */
export function splitmix32(seed: number): () => number {
  let s = seed | 0;
  return function (): number {
    s = (s + 0x9e3779b9) | 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  };
}

/** PCG32 — Pour les tirages à forte sensibilité (combats 4X, votes serrés au Sénat) */
export function pcg32(seed: number): () => number {
  let state = BigInt(seed >>> 0);
  const multiplier = 6364136223846793005n;
  const increment = 1442695040888963407n;

  return function (): number {
    state = (state * multiplier + increment) & 0xffffffffffffffffn;
    const xorshifted = Number(((state >> 18n) ^ state) >> 27n) >>> 0;
    const rot = Number(state >> 59n);
    const result = (xorshifted >>> rot) | (xorshifted << ((-rot) & 31));
    return (result >>> 0) / 4294967296;
  };
}

/** xxHash32 — Pour le hachage spatial O(1) sans état des coordonnées de grille */
export function xxHash32(input: number, seed: number = MASTER_SEED_DEFAULT): number {
  let h32 = (seed + 374761393) | 0;
  h32 = Math.imul(h32 ^ input, 3266489917);
  h32 = (h32 << 17) | (h32 >>> 15);
  h32 = Math.imul(h32, 668265263);
  return (h32 ^ (h32 >>> 15)) >>> 0;
}

/** Génération canonique d'identifiant déterministe diégétique */
export function getLoreUUID(
  seed: number,
  regimePrefix: string,
  entityType: string,
  entityId: number
): string {
  const hash = xxHash32(seed + entityId, seed);
  const hex = hash.toString(16).padStart(8, "0");
  return `${regimePrefix}-${hex}-${entityType}-${entityId}`;
}
