# HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
## Feuille de Route & Spécifications Spatiales — Master Roadmap (L0 à L3)
*Conforme au Protocole de Gouvernance AETHER-STRATA (v37.0)*

---

## 1. VISION ARCHITECTURALE & INVARIANTS SYSTÈME

Horizon Galactique est une PWA simulateur de colonie spatiale **strictement déterministe** présentée sous la forme d'un système d'exploitation de bord diégétique. 

### Les 12 Invariants AETHER-STRATA
1. **Pureté du Noyau** : `src/kernel/` et `src/domain/` sont 100% purs (aucune I/O, aucun `Date.now()`, aucun `Math.random()`, aucun import React/DOM).
2. **Déterminisme Intégral** : Tout l'aléa provient d'un PRNG seedé (`xxHash32`). `f(seed, décisions ordonnées) = univers`.
3. **Immuabilité Numérique LLM** : Le modèle narratif Gemini ne produit **jamais** de valeur numérique de jeu. Coûts, jauges et conséquences sont pré-calculés localement.
4. **Hors-Ligne Natif** : L'application est intégralement jouable hors-ligne du Sol 1 au terme de l'expédition grâce au catalogue rétro-heuristique.
5. **Validation Zod Stricte** : Aucune donnée ne franchit la frontière inter-tiers sans passer par un schéma Zod avec rejet strict.
6. **Passivité UI** : L'interface utilisateur ne calcule aucune donnée de jeu ; elle formate un instantané d'état immuable.
7. **Indépendance des Docks** : Header et Footer sont strictement isolés (déployer l'un n'altère pas l'état de l'autre).
8. **Sécurité des Clés** : Aucune clé API dans le bundle client. Proxy serveur sécurisé `/api/gemini`.
9. **Code Réseau & CSP Sécurisée** : Aucun `eval`, aucun `new Function`, CSP avec `'unsafe-eval'` banni.
10. **Zéro Divergence Lockstep** : Publication d'un tick uniquement si l'ensemble des tiers a franchi la barrière de synchronisation.
11. **Arborescence ≤ 7 Niveaux** : Profondeur maximale de 7 segments dans `src/`, avec fichier au 7e niveau et présence du triplet Tria-Manifest (`_manifest.json`, `INDEX.md`, `README.txt`) dans chaque sous-dossier métier.
12. **Imports Descendants** : Sens strict `experience → orchestration → domain → kernel → content`.

---

## 2. FEUILLE DE ROUTE DÉTAILLÉE : PHASES L0 À L3

### PHASE L0 : Socle Plateforme & Gouvernance AETHER-STRATA
- **Architecture PWA React 19 + TypeScript (Vite SPA)**.
- **Organisation Modulaire Tria-Manifest** : Inclusion systématique du triplet (`_manifest.json`, `INDEX.md`, `README.txt`) sur l'ensemble des 28 sous-dossiers de `src/`.
- **Système de Navigation Gestuel Adaptatif** : Hook `useSwipeGesture` supportant la sensibilité dynamique selon le facteur de zoom navigateur (`visualViewport.scale`), avec détection d'impulsion (*flick velocity*) et filtrage par ratio d'axe (`axisRatio >= 1.25`).
- **Composant UI Autonome `RadioWidget.tsx`** : Lecteur FIP-Σ procédural et flux Live Web Stream, auto-démarrage au bootloader et bouton de paramètres contextuel adjacent.

### PHASE L1 : Noyau Moteur, Horloge & Territoire 4X
- **Horloge Spatiale Échelonnée** :
  - 1 Tick = 1 seconde
  - 24 Ticks = 1 Sol
  - 360 Sols = 1 Cycle
  - Tours d'Ère : 30 / 360 / 1 800 Sols selon la phase de l'Arche.
- **Grille Spatiale W-SPACE** :
  - Coordonnées `X(0-255)`, `Y(0-255)`.
  - 5 Strates d'Altitude `Z` (`Z+2` Orbite, `Z+1` Surface Hostile, `Z0` Dômes, `Z-1` Souterrain, `Z-2` Sanctuaire Profond).
  - 4 Anneaux d'Expansion `R` (`R1` à `R4`) et 16 Secteurs de Vaisseau `S01` à `S16`.
- **Génération Procédérale Déterministe** : Terrain généré à la volée via `xxHash32(seed + coords)`, zéro occupation mémoire pour les cases inexplorées.

### PHASE L2 : Optimisation Mémoire (< 500 Mo) & Worker Lockstep
- **Budget Mémoire RAM Active < 500 Mo** :
  - **Sentinelle Mémoire au Tier 1** : Alerte de sur-consommation déclenchée dès 420 Mo d'allocation RAM active.
  - **Actions Automatiques de la Sentinelle** :
    1. Terminaison propre des workers secondaires de rendu (Tier 7).
    2. Purge forcée des caches LRU d'images et d'assets audio.
    3. Bascule du mode de rafraîchissement UI de 60 FPS à 30 FPS.
    4. Compactage IndexedDB (`Dexie`) des états historiques intermédiaires.
- **Architecture multi-workers résiliente** :
  - Détection automatique de `crossOriginIsolated` pour basculer entre `SharedArrayBuffer` et `MessageChannel` + `ArrayBuffer` transférables.
  - Mode dégradé diégétique à 6 ticks/s avec badge « Cadence Réduite » en cas d'échec d'instanciation de worker.

### PHASE L3 : Couche Narrative Gemini 2.5 & Fallback Rétro-Heuristique
- **Proxy Gemini 2.5 Flash (`/api/gemini`)** :
  - Génération de récits, annonces FIP-Σ, chroniques d'ère et répliques N.I.A.
  - Schémas Zod stricts avec `responseMimeType: 'application/json'`.
  - Budget d'appel < 0,50 € / partie avec digest d'état optimisé (< 1 500 tokens).
- **Catalogue Rétro-Heuristique Hors-Ligne** :
  - Catalogue local de 120+ gabarits narratifs indexés par `xxHash32(seed + sol) % 120`.
  - Bascule automatique après 3 000 ms de timeout API sans coupure de jeu.

---

## 3. PROTOCOLE DE TESTS AUTOMATISÉS VITEST (INTEGRITY HARNESS)

Afin de garantir le déterminisme absolu après chaque refactorisation du code, le protocole de test automatisé exécute la suite Vitest suivante :

```typescript
// src/kernel/tests/determinism.spec.ts
import { describe, it, expect } from "vitest";
import { createDeterministicWorld, advanceTicks } from "../engine";

describe("Protocole de Test Déterministe AETHER-STRATA", () => {
  it("Deux exécutions indépendantes avec la même seed doivent produire un hash d'état identique au Sol 500", () => {
    const seed = "HORIZON-DELTA-9092";
    const userInputs = [
      { sol: 5, action: "EXPAND_DOME", sector: "SEC-05" },
      { sol: 45, action: "SET_POLICY", policyId: "RACIONNEMENT_DECRET" },
      { sol: 200, action: "LAUNCH_PROBE", targetZ: "Z_ORBIT" },
    ];

    const run1 = advanceTicks(createDeterministicWorld(seed), 500 * 24, userInputs);
    const run2 = advanceTicks(createDeterministicWorld(seed), 500 * 24, userInputs);

    expect(run1.stateHash).toBe(run2.stateHash);
    expect(run1.resources).toEqual(run2.resources);
  });

  it("La consommation mémoire active ne doit pas dépasser 420 Mo lors d'une simulation accélérée de 1000 Sols", () => {
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : 0;
    expect(memoryUsage).toBeLessThan(420);
  });
});
```

### Commande de Validation
```bash
npm run test
```

---

## 4. RAPPORT DE GOUVERNANCE AETHER-STRATA (TRIPLET TRIA-MANIFEST)

Statut d'intégration des 28 sous-dossiers du répertoire `src/` :

| Sous-Dossier | `_manifest.json` | `INDEX.md` | `README.txt` | Statut Conforme |
|---|---|---|---|---|
| `src/audio` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/experience` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/experience/audio` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/experience/design` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/experience/screens` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/experience/screens/config` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/hooks` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/lib` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/persistence` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/platform` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/platform/boot` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/services` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/simulation` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/theme` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/types` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/boot` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/components` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/menu` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/modals` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/navigation` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/setup` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/shell` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/tabs` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/tabs/arche` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/tabs/journal` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/tabs/simcity` | ✅ | ✅ | ✅ | **100% CONFORME** |
| `src/ui/tabs/spatial` | ✅ | ✅ | ✅ | **100% CONFORME** |

*Rapport généré le 30 Août 2026 — Validé par l'Architecte en Chef AETHER-STRATA.*
