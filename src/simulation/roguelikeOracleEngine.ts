import { xxHash32, mulberry32 } from "./prng";
import { GenesisLorePayload } from "../types/genesis";
import { EventTier } from "../types/simulation";
import {
  ChoiceOption,
  DualTimestamp,
  EventResolutionItem,
  SuperEventItem,
  formatDualTimestamp,
} from "../types/journal";

/** =========================================================================
 *  1. TABLES D'ORACLE & ROGUELIKE PAPIER (JDR SOLO & BOOKS-ROGUELIKES)
 *  Inspiré des systèmes Four Against Darkness, D100 Dungeon, Ironsworn
 *  ========================================================================= */

/** Table 1 : Oracle Binaire Oui/Non avec nuances */
export interface BinaryOracleResult {
  roll: number;
  verdict: "OUI_ET" | "OUI" | "OUI_MAIS" | "NON_MAIS" | "NON" | "NON_ET";
  label: string;
  interpretationModifier: string;
}

export const ORACLE_BINARY_TABLE = [
  { min: 1, max: 2, verdict: "NON_ET" as const, label: "Non, et pire encore...", modifier: "Complication critique ou perte aggravée." },
  { min: 3, max: 7, verdict: "NON" as const, label: "Non.", modifier: "Obstacle net, refus ou échec standard." },
  { min: 8, max: 10, verdict: "NON_MAIS" as const, label: "Non, mais une brèche subsiste...", modifier: "Échec tempéré par une opportunité secondaire." },
  { min: 11, max: 13, verdict: "OUI_MAIS" as const, label: "Oui, mais à un coût imprévu...", modifier: "Succès payé au prix fort ou avec surchauffe." },
  { min: 14, max: 18, verdict: "OUI" as const, label: "Oui.", modifier: "Succès nominal conforme aux prévisions." },
  { min: 19, max: 20, verdict: "OUI_ET" as const, label: "Oui, et avec un avantage majeur !", modifier: "Triomphe éclatant ou découverte d'un trésor bonus." },
];

/** Table 2 : Oracle d'Action / Thème (d100 Verbes x d100 Noms) */
export const ORACLE_ACTION_VERBS = [
  "Infiltrer", "Sécuriser", "Surchauffer", "Révéler", "Saboter", "Purger", "Stabiliser",
  "Convertir", "Extraire", "Déchiffrer", "Négocier", "Fortifier", "Isoler", "Réactiver",
  "Transmuter", "Neutraliser", "Scanner", "Calibrer", "Sacrifier", "Embrasser", "Dérouter",
  "Contenir", "Exfiltrer", "Subvertir", "Canaliser", "Intercepter", "Bannir", "Forger"
];

export const ORACLE_THEME_NOUNS = [
  "Relais Tachyonique", "Cryocuve Hantée", "Noyau à Fusion", "Épave Céleste", "Spore Xénomorphe",
  "Décret Proscrit", "Délégation Séditieuse", "Tempête Siliceuse", "IA Éveillée", "Balise d'Autrefois",
  "Filtre d'Oxygène Corrompu", "Générateur Gravitationnel", "Sarcophage Cryogénique", "Monolithe Noir",
  "Archive Censurée", "Puits de Tachyons", "Ligne de Supraconducteurs", "Réseau de Capteurs",
  "Bio-Synthétiseur", "Chambre de Compression", "Drone Sentinelle", "Comète Métallifère"
];

/** Table 3 : Table de Génération Procédurale (Biomes & Secteurs de l'Arche) */
export interface ProceduralSectorGen {
  sectorZone: string;
  architecture: string;
  environmentalHazard: string;
  primaryAnomaly: string;
}

export const PROCEDURAL_BIOME_THEMES = [
  { zone: "Dômes Hydroponiques Inondés", arch: "Serres pressurisées à biomasse luxuriante", hazard: "Prolifération de spores toxiques", anomaly: "Écosystème végétal sentient" },
  { zone: "Cryostase S09 (Niveau -2)", arch: "Chambres funéraires d'hibernation cryogénique", hazard: "Fissure de liquide frigorigène", anomaly: "Pod 404 actif sans identifiant" },
  { zone: "Baie Réacteur S02 (Propulsion)", arch: "Canyon de bobines magnétiques supraconductrices", hazard: "Rayonnements gamma pulsés", anomaly: "Fluctuation temporelle locale" },
  { zone: "Hangar Logistique S14", arch: "Dédale de conteneurs de fret et grues gravitationnelles", hazard: "Dépressurisation intermittente", anomaly: "Cargaison clandestine scellée" },
  { zone: "Sanctuaire des Archives Noires", arch: "Salle des serveurs quantiques mères déconnectés", hazard: "Champs électrostatiques léthaux", anomaly: "Fragment de conscience de l'Ancien Monde" },
  { zone: "Frontière Extérieure du Bouclier", arch: "Sas d'évacuation et coque extérieure abrasive", hazard: "Micrométéorites à haute vélocité", anomaly: "Sonde interstellaire inconnue arrimée" },
];

/** Table 4 : Table de Rencontres d66 (36 résultats uniques de 11 à 66) */
export interface D66Encounter {
  code: number;
  title: string;
  dangerLevel: "MINEUR" | "MODERE" | "SEVER" | "LETHAL";
  factionAffinity?: string;
  summary: string;
}

export const ENCOUNTER_TABLE_D66: Record<number, D66Encounter> = {
  11: { code: 11, title: "Patrouille d'Automates Déviants", dangerLevel: "MODERE", summary: "Une escouade de drones d'ingénierie applique des directives obsolètes du Sol 0." },
  12: { code: 12, title: "Émissaires du Culte de la Singularité", dangerLevel: "MINEUR", factionAffinity: "Cyber-Moines", summary: "Des dévots demandent l'accès prioritaire au calcul quantique pour leur prophétie." },
  13: { code: 13, title: "Fuite de Plasma dans le Quadrant 4", dangerLevel: "SEVER", summary: "Une conduite thermique a cédé, menaçant d'embraser l'aile résidentielle voisine." },
  14: { code: 14, title: "Découverte d'un Spécimen Cryo Inconnu", dangerLevel: "MODERE", summary: "Un caisson marqué 'NON-REPERTORIÉ' commence une séquence de décongélation forcée." },
  15: { code: 15, title: "Contrebande d'Alliages Frittés", dangerLevel: "MINEUR", summary: "Un réseau de mineurs détourne des métaux rares vers un atelier clandestin." },
  16: { code: 16, title: "Écho Radio d'une Arche Perdue", dangerLevel: "MODERE", summary: "Un signal en morse crypté sur la fréquence 88.5 MHz provient du vide profond." },
  21: { code: 21, title: "Mutinerie dans les Cuisines Synthétiques", dangerLevel: "SEVER", summary: "Les rations de biomasse ont été altérées, provoquant la révolte des colons du quart B." },
  22: { code: 22, title: "Anomalie Gravitationnelle Pulsante", dangerLevel: "SEVER", summary: "Une micro-singularité flotte dans la cage d'ascenseur gravitationnelle." },
  23: { code: 23, title: "Piratage du Registre d'Identité Civique", dangerLevel: "MODERE", summary: "Des faux profils de citoyens sont injectés dans la base de données du Sénat." },
  24: { code: 24, title: "Éclosion de Mycélium Bioluminescent", dangerLevel: "MINEUR", summary: "Une moisissure brillante recouvre les conduits d'eau, purifiant l'air mais corrodant les câbles." },
  25: { code: 25, title: "Rapprochement d'une Épave Alien", dangerLevel: "LETHAL", summary: "Une structure géométrique morte se verrouille magnétiquement sur la proue de l'Arche." },
  26: { code: 26, title: "Grève des Ingénieurs de Fusion", dangerLevel: "SEVER", summary: "Les techniciens coupent l'alimentation secondaire pour exiger des congés en stase." },
  31: { code: 31, title: "Surchauffe du Réacteur Principal", dangerLevel: "LETHAL", summary: "Les barres de deutérium se bloquent en position critique." },
  32: { code: 32, title: "Déflagration dans le Laboratoire Xéno", dangerLevel: "SEVER", summary: "Un caisson de confinement de matière métastable a implosé." },
  33: { code: 33, title: "Pacte Proposé par un Archonte Rival", dangerLevel: "MODERE", summary: "Une transmission chiffrée offre un échange d'alliages contre une trêve de 30 Sols." },
  34: { code: 34, title: "Panne Totale du Réseau Lumineux", dangerLevel: "MINEUR", summary: "Le cycle jour/nuit artificiel est bloqué dans une obscurité anxiogène." },
  35: { code: 35, title: "Miracle Biologique en Hydroponie", dangerLevel: "MINEUR", summary: "Une culture d'algues génétiquement modifiée produit le triple des calories prévues." },
  36: { code: 36, title: "Infiltration d'un Saboteur Solitaire", dangerLevel: "SEVER", summary: "Un individu masqué a été repéré en train de saboter les sas de décompression." },
  41: { code: 41, title: "Vague de Fièvre Cryogénique", dangerLevel: "MODERE", summary: "Les colons récemment réveillés souffrent d'amnésie et de convulsions neuromusculaires." },
  42: { code: 42, title: "Signal d'Urgence d'une Navette d'Exploration", dangerLevel: "SEVER", summary: "L'équipe de surface est encerclée par une tempête d'ions sur la planète hôte." },
  43: { code: 43, title: "Divergence de Calcul chez la N.I.A.", dangerLevel: "MODERE", summary: "L'IA de bord refuse d'exécuter un décret au nom du protocole éthique n°0." },
  44: { code: 44, title: "Pluie de Micrométéorites Perforantes", dangerLevel: "SEVER", summary: "Le blindage du secteur S15 a subi 14 impacts traversants." },
  45: { code: 45, title: "Marchand Itinérant de la Frange", dangerLevel: "MINEUR", summary: "Une corvette marchande indépendante demande l'autorisation d'accostage." },
  46: { code: 46, title: "Découverte d'un Sanctuaire Précurseur", dangerLevel: "LETHAL", summary: "Une crypte en alliage inconnu émet des pulsations à basse fréquence sous la surface." },
  51: { code: 51, title: "Scission au sein du Sénat", dangerLevel: "SEVER", summary: "Deux factions menacent de rompre la coalition si leurs motions ne sont pas votées." },
  52: { code: 52, title: "Pollution du Circuit d'Eau Potable", dangerLevel: "SEVER", summary: "Des traces de solvants industriels ont été détectées dans les citernes primaires." },
  53: { code: 53, title: "Survoltage dans les Lignes Cryo", dangerLevel: "MODERE", summary: "Les réchauffeurs de stase risquent d'interrompre le sommeil de 500 citoyens." },
  54: { code: 54, title: "Observation d'une Flotte Inconnue", dangerLevel: "LETHAL", summary: "Six signatures thermiques véloces manœuvrent à la limite de portée radar." },
  55: { code: 55, title: "Éruption Volcanique sur la Planète Cible", dangerLevel: "SEVER", summary: "Le ciel s'assombrit de cendres silicatées, réduisant le rendement solaire de 40%." },
  56: { code: 56, title: "Découverte d'un Gisement d'Éléments Lourds", dangerLevel: "MINEUR", summary: "Une faille tectonique met à nu une veine de platinoïdes de très haute pureté." },
  61: { code: 61, title: "Épidémie Psychique parmi les Ouvriers", dangerLevel: "SEVER", summary: "Des rêves partagés poussent les équipes de maintenance à cesser le travail." },
  62: { code: 62, title: "Attaque de Pirates de Ceinture", dangerLevel: "LETHAL", summary: "Des capsules de débarquement percent les sas du dôme de fabrication." },
  63: { code: 63, title: "Condensation de Rosée Toxique", dangerLevel: "MINEUR", summary: "Une humidité corrosive attaque les joints d'étanchéité des dômes résidentiels." },
  64: { code: 64, title: "Appel de Détresse d'un Avant-Poste Rival", dangerLevel: "MODERE", summary: "La colonie voisine de l'Archonte Vane subit une dépressurisation majeure." },
  65: { code: 65, title: "Découverte de l'Orbe de Singularité", dangerLevel: "LETHAL", summary: "Un artefact sphérique en lévitation défiant les lois de la thermodynamique." },
  66: { code: 66, title: "L'Heure du Jugement de l'Arche (Omega Event)", dangerLevel: "LETHAL", summary: "La structure de l'Arche entre en résonance harmonique avec le noyau stellaire." },
};

/** Table 5 : Tables de Butin & Équipement avec Affixes */
export interface LootReward {
  rarity: "COMMUN" | "RARE" | "EPIQUE" | "MAUDIT";
  name: string;
  affix: string;
  description: string;
  resourceGains: Record<string, number>;
  unlockedFlag?: string;
}

export const LOOT_TABLE: LootReward[] = [
  {
    rarity: "COMMUN",
    name: "Condensateurs Supraconducteurs",
    affix: "de Série Standard",
    description: "Composants électriques réutilisables pour le réseau.",
    resourceGains: { energy_gw: 15, alloys_tonnes: 4 },
  },
  {
    rarity: "RARE",
    name: "Filtres Moléculaires Nanométriques",
    affix: "Haute Pureté",
    description: "Système de purification capable d'assainir des milliers de litres.",
    resourceGains: { water_l: 800, oxygen_l: 500 },
    unlockedFlag: "FILTRE_NANO_ACQUIS",
  },
  {
    rarity: "EPIQUE",
    name: "Barre de Deutérium Cryo-Stabilisée",
    affix: "Grade Militaire",
    description: "Combustible ultra-dense alimentant les réacteurs pendant des mois.",
    resourceGains: { deuterium_kg: 25, energy_gw: 45 },
    unlockedFlag: "COMBUSTIBLE_GRADE_MILITAIRE",
  },
  {
    rarity: "MAUDIT",
    name: "Processeur Quantique Alien Corrompu",
    affix: "Proscrit par le Sénat",
    description: "Décuple la puissance de calcul mais instille des pensées chaotiques.",
    resourceGains: { energy_gw: 30, credits_cr: 500 },
    unlockedFlag: "ARTEFACT_PROSCRIT_INTEGRE",
  },
];

/** Table 6 : Tables de Pannes Critiques, Blessures & Complications (Fumbles) */
export interface ComplicationResult {
  type: "PANNE_CRITIQUE" | "BLESSURE_GRAVE" | "CRISE_CIVIQUE";
  label: string;
  description: string;
  resourceLosses: Record<string, number>;
  statPenalty?: { stat: string; amount: number };
}

export const COMPLICATION_TABLE: ComplicationResult[] = [
  {
    type: "PANNE_CRITIQUE",
    label: "Surchauffe des Transformateurs",
    description: "Court-circuit en chaîne détruisant un transformateur de puissance.",
    resourceLosses: { energy_gw: -20, alloys_tonnes: -3 },
  },
  {
    type: "BLESSURE_GRAVE",
    label: "Traumatisme Neurologique du Leader",
    description: "Une décharge électrostatique affecte les implants synaptiques du Gouverneur.",
    resourceLosses: {},
    statPenalty: { stat: "intellect", amount: 1 },
  },
  {
    type: "CRISE_CIVIQUE",
    label: "Grève Générale et Émeute de Faction",
    description: "La population conteste publiquement l'échec de l'opération.",
    resourceLosses: { biomass_kg: -80, credits_cr: -200 },
  },
];

/** =========================================================================
 *  2. LA MATRICE DE TRANSITION D'ÉTAT & LIVRE-JEU (§ PARAGRAPHES)
 *  ========================================================================= */

export interface RoguelikeStateNode {
  nodeId: string;
  sectionNumber: number; // Numéro de paragraphe du Livre-Jeu (ex: 142)
  title: string;
  narrativeText: string;
  oracleOutcome?: BinaryOracleResult;
  lootReward?: LootReward;
  complication?: ComplicationResult;
  concordanceKeyword?: string;
  resourceDeltas: Record<string, number>;
  addPersistentFlags: string[];
}

/** Génère un Super-Événement complet basé sur la Matrice d'Oracles et de Livres-jeux */
export function generateRoguelikeOracleSuperEvent(
  masterSeed: number,
  sol: number,
  turn: number,
  genesis: GenesisLorePayload
): SuperEventItem {
  const inputSeed = (masterSeed + turn * 8191 + Math.floor(sol) * 97) >>> 0;
  const hash = xxHash32(inputSeed, masterSeed);
  const rng = mulberry32(hash);

  // 1. Tirage de l'Oracle d'Action & Thème
  const verbIndex = Math.floor(rng() * ORACLE_ACTION_VERBS.length);
  const nounIndex = Math.floor(rng() * ORACLE_THEME_NOUNS.length);
  const oracleVerb = ORACLE_ACTION_VERBS[verbIndex];
  const oracleNoun = ORACLE_THEME_NOUNS[nounIndex];

  // 2. Tirage de la Table d66
  const d66Die1 = Math.floor(rng() * 6) + 1;
  const d66Die2 = Math.floor(rng() * 6) + 1;
  const d66Code = d66Die1 * 10 + d66Die2;
  const encounter = ENCOUNTER_TABLE_D66[d66Code] || ENCOUNTER_TABLE_D66[11];

  // 3. Tirage du Biome/Secteur
  const biomeIndex = Math.floor(rng() * PROCEDURAL_BIOME_THEMES.length);
  const biome = PROCEDURAL_BIOME_THEMES[biomeIndex];

  // 4. Numéro de Section Livre-Jeu de base (ex: 100 à 450)
  const baseSectionNumber = 100 + (hash % 350);

  // Déterminer la gravité et tier
  let tier: EventTier = "SUPER";
  let isTimeBlocking = false;
  if (encounter.dangerLevel === "LETHAL" || turn % 5 === 0) {
    tier = turn % 10 === 0 ? "GIGA" : "MEGA";
    isTimeBlocking = true;
  }

  const categoryMap = {
    MINEUR: "ANOMALY" as const,
    MODERE: "FACTION_ENCOUNTER" as const,
    SEVER: "CREW_MUTINY" as const,
    LETHAL: "COSMIC_HAZARD" as const,
  };

  // 5. Construction des 4 Nœuds de redirection (State Transition Table)
  const choices: [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption] = [
    // Choix 1 : Stratégie Technique / Cartésienne (Jet de Logique / Ingénierie)
    {
      choiceId: `OPT_TECH_${hash.toString(16)}`,
      label: `[Section §${baseSectionNumber + 12}] Protocole Cybernétique : ${oracleVerb} le ${oracleNoun}`,
      flavorText: `Déployer les automates de maintenance et reconfigurer la matrice de flux. Jet d'Ingénierie requis.`,
      philosophicalAlignment: "CARTESIENNE",
      resolutionType: "SKILL_CHECK",
      skillCheck: {
        statUsed: "logic",
        difficultyClass: 12 + (turn % 4),
        onSuccess: {
          narrativeResult: `[§${baseSectionNumber + 12}] SUCCÈS CRITIQUE : La reconfiguration du ${oracleNoun} s'effectue sans bavure. Les systèmes de bord gagnent en efficacité et un module de surplus est extrait.`,
          resourceDeltas: { energy_gw: 25, alloys_tonnes: 6 },
          addPersistentFlags: [`CONCORDANCE_SEC_${baseSectionNumber + 12}`, "MODULE_TECH_OPTIMISE"],
        },
        onFailure: {
          narrativeResult: `[§${baseSectionNumber + 13}] ÉCHEC SYSTÈME : Une surtension frappe les condensateurs pendant l'opération sur le ${oracleNoun}. Perte d'énergie et avarie matérielle.`,
          resourceDeltas: { energy_gw: -20, alloys_tonnes: -4 },
          addPersistentFlags: [`ECHEC_SEC_${baseSectionNumber + 13}`],
        },
      },
    },

    // Choix 2 : Voie Diplomatique & Consensus Civique (Jet de Charisme / Négociation)
    {
      choiceId: `OPT_DIPLO_${hash.toString(16)}`,
      label: `[Section §${baseSectionNumber + 24}] Sommation Légale : Négocier avec le Corps concerné`,
      flavorText: `Ouvrir les canaux sénatoriaux pour apaiser les tensions ou intégrer la découverte aux décrets civiques.`,
      philosophicalAlignment: "EXISTENTIALISTE",
      resolutionType: "SKILL_CHECK",
      skillCheck: {
        statUsed: "charisma",
        difficultyClass: 11 + (turn % 5),
        onSuccess: {
          narrativeResult: `[§${baseSectionNumber + 24}] SUCCÈS DIPLOMATIQUE : Le Sénat valide la résolution par acclamation. Les factions saluent la sagesse du Primat-Archonte.`,
          resourceDeltas: { biomass_kg: 80, credits_cr: 150 },
          addPersistentFlags: [`CONCORDANCE_SEC_${baseSectionNumber + 24}`, "COHESION_SENAT_RENFORCEE"],
        },
        onFailure: {
          narrativeResult: `[§${baseSectionNumber + 25}] IMPASSE POLITIQUE : Les délégués rejettent la proposition et organisent un débrayage dans les secteurs de fret.`,
          resourceDeltas: { credits_cr: -100, biomass_kg: -40 },
          addPersistentFlags: [`ECHEC_SEC_${baseSectionNumber + 25}`, "TENSION_POLITIQUE_AUGMENTEE"],
        },
      },
    },

    // Choix 3 : Intervention d'Urgence Autonome N.I.A. (Direct / Déterministe à coût garanti)
    {
      choiceId: `OPT_NIA_AUTO_${hash.toString(16)}`,
      label: `[Section §${baseSectionNumber + 36}] Directive d'Urgence N.I.A. : Isolement du secteur`,
      flavorText: `Verrouiller hermétiquement la zone et purger les compartiments sans jet de compétence. Coût immédiat garanti.`,
      philosophicalAlignment: "STRUCTURALISTE",
      resolutionType: "DETERMINISTIC",
      directOutcome: {
        narrativeResult: `[§${baseSectionNumber + 36}] EXÉCUTION FORMELLE : La N.I.A. a scellé le secteur ${biome.zone}. L'anomalie est étouffée sous argon, au détriment de nos réserves de stockage.`,
        resourceDeltas: { energy_gw: -10, oxygen_l: -150, alloys_tonnes: 2 },
        addPersistentFlags: [`CONCORDANCE_SEC_${baseSectionNumber + 36}`, "SECTEUR_HERMETIQUE_ISOLE"],
      },
    },

    // Choix 4 : Extraction Audacieuse / Fouille des Épaves (Pillage de butin / Risque d100)
    {
      choiceId: `OPT_LOOT_RISK_${hash.toString(16)}`,
      label: `[Section §${baseSectionNumber + 48}] Réquisition Totale : Fouiller la zone en profondeur`,
      flavorText: `Envoyer une escouade de pionniers pour piller les ressources au risque de subir une panne critique.`,
      philosophicalAlignment: "CYBERNETIQUE",
      resolutionType: "SKILL_CHECK",
      skillCheck: {
        statUsed: "courage",
        difficultyClass: 14,
        onSuccess: {
          narrativeResult: `[§${baseSectionNumber + 48}] BUTIN ÉPIQUE RÉCUPÉRÉ : L'équipe découvre un conteneur intact renfermant des composés précieux et des composants supraconducteurs.`,
          resourceDeltas: { deuterium_kg: 15, alloys_tonnes: 12, credits_cr: 250 },
          addPersistentFlags: [`CONCORDANCE_SEC_${baseSectionNumber + 48}`, "TRESOR_ANCIEN_EXPLOITE"],
        },
        onFailure: {
          narrativeResult: `[§${baseSectionNumber + 49}] DÉFAILLANCE CRITIQUE : L'équipe a déclenché une alarme de dépressurisation. Une partie de la cargaison et des équipements est pulvérisée dans le vide.`,
          resourceDeltas: { alloys_tonnes: -8, water_l: -300 },
          addPersistentFlags: [`ECHEC_SEC_${baseSectionNumber + 49}`, "AVARIE_PIONNIERS_SUBIE"],
        },
      },
    },
  ];

  const title = `§${baseSectionNumber} — ${encounter.title}`;
  const narrativeSummary = `Tirage d'Oracle [${oracleVerb} / ${oracleNoun}] · Rencontre d66 [n°${d66Code}] : Les capteurs du secteur ${biome.zone} signalent une rupture d'équilibre.`;
  const loreDescription = `${encounter.summary} L'architecture de la zone (${biome.arch}) est compromise par un danger latent : ${biome.hazard}. Au centre du foyer trône une anomalie manifeste : ${biome.anomaly}.`;

  const tierToSeverity: Record<string, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
    STANDARD: 2,
    SUPER: 3,
    MEGA: 5,
    GIGA: 6,
    OMEGA: 7,
  };
  const severity_tier = tierToSeverity[tier] || 3;

  return {
    id: `ROGUELIKE-EVT-${turn}-${hash.toString(16)}`,
    type: "SUPER_EVENT",
    eventId: `REV-${turn}-${hash.toString(16)}`,
    timestamp: formatDualTimestamp(sol, 0, turn),
    title,
    category: categoryMap[encounter.dangerLevel],
    tier,
    severity_tier,
    isTimeBlocking,
    canBeDeferred: !isTimeBlocking && severity_tier < 5,
    narrativeSummary,
    loreDescription,
    environmentalContext: `Biome : ${biome.zone} | Péril : ${biome.hazard} | Dangerosité : ${encounter.dangerLevel} | Tier Sécurité : ${severity_tier}/7`,
    choices,
    status: "PENDING",
  };
}
