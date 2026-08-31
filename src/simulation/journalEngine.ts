import {
  DualTimestamp,
  JournalItem,
  MicroLogItem,
  SuperEventItem,
  ChoiceOption,
  EventResolutionItem,
} from "../types/journal";
import { GenesisLorePayload } from "../types/genesis";
import { pcg32, xxHash32 } from "./prng";
import { generateRoguelikeOracleSuperEvent } from "./roguelikeOracleEngine";

/** Formate un double horodatage standardisé (Sol et Tour) */
export function formatDualTimestamp(sol: number, tickInSol: number = 0, turn: number = 1): DualTimestamp {
  const continuousSol = Number((sol + tickInSol / 24).toFixed(2));
  const stardateLabel = `SOL ${continuousSol.toFixed(2).padStart(6, "0")} - TOUR ${turn.toString().padStart(2, "0")}`;
  return {
    sol: continuousSol,
    turn,
    stardateLabel,
  };
}

/** Résout un choix de Super-Événement avec simulation de dés (D20 + Stat vs DC) */
export function resolveSuperEventChoice(
  superEvent: SuperEventItem,
  choice: ChoiceOption,
  currentSol: number,
  currentTurn: number,
  playerStats: Record<string, number>,
  forcedDiceRoll?: number
): { resolutionLog: EventResolutionItem; stateUpdates: { deltas: Record<string, number>; addFlags: string[]; removeFlags: string[] } } {
  let isSuccess = true;
  let diceRollResult: EventResolutionItem["diceRollResult"] = undefined;
  let outcome = choice.directOutcome;

  // 1. Traitement des jets de dés si le choix est un SKILL_CHECK
  if (choice.resolutionType === "SKILL_CHECK" && choice.skillCheck) {
    const statKey = choice.skillCheck.statUsed;
    const statValue = playerStats[statKey] || 0;
    
    // PRNG déterministe ou jet passé
    const rolledValue = forcedDiceRoll !== undefined 
      ? forcedDiceRoll 
      : Math.floor(Math.random() * 20) + 1; // 1 à 20
      
    const totalScore = rolledValue + statValue;
    isSuccess = totalScore >= choice.skillCheck.difficultyClass;
    outcome = isSuccess ? choice.skillCheck.onSuccess : choice.skillCheck.onFailure;

    diceRollResult = {
      statUsed: statKey,
      rolledValue,
      statValue,
      totalScore,
      difficultyClass: choice.skillCheck.difficultyClass,
      isSuccess,
    };
  }

  const continuousSol = Number(currentSol.toFixed(2));
  const timestamp = formatDualTimestamp(continuousSol, 0, currentTurn);

  // 2. Construction du log de résolution
  const resolutionLog: EventResolutionItem = {
    id: `RES-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: "EVENT_RESOLUTION",
    parentEventId: superEvent.eventId,
    selectedChoiceLabel: choice.label,
    timestamp,
    diceRollResult,
    narrativeOutcome: outcome?.narrativeResult || "Protocole exécuté conformément aux directives du gouverneur.",
    appliedDeltas: outcome?.resourceDeltas || {},
    unlockedFlags: outcome?.addPersistentFlags || [],
  };

  // 3. Clôture de l'événement dans le journal
  superEvent.status = "RESOLVED";
  superEvent.selectedChoiceId = choice.choiceId;

  return {
    resolutionLog,
    stateUpdates: {
      deltas: outcome?.resourceDeltas || {},
      addFlags: outcome?.addPersistentFlags || [],
      removeFlags: outcome?.removePersistentFlags || [],
    },
  };
}

/** Crée une entrée Micro-Log déterministe */
export function createMicroLog(
  category: MicroLogItem["category"],
  code: string,
  message: string,
  importance: 1 | 2 | 3 | 4 | 5,
  sol: number,
  tickInSol: number,
  turn: number,
  deltas?: Record<string, number>
): MicroLogItem {
  return {
    id: `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: "MICRO_LOG",
    timestamp: formatDualTimestamp(sol, tickInSol, turn),
    category,
    code,
    message,
    importance,
    deltas,
  };
}

/** Modèles de Super, Mega, Giga et Omega Événements locaux (100% déterministes) */
const SUPER_EVENT_TEMPLATES = [
  {
    title: "L'Épave du Relais de Transmissions Hyperion",
    category: "DERELICT_STATION" as const,
    tier: "SUPER" as const,
    isTimeBlocking: false,
    canBeDeferred: true,
    loreDescription:
      "Les capteurs à longue portée ont accroché une balise d'urgence émettant sur une fréquence d'avant-traversée. Une station orbitale relais dérive dans la haute atmosphère, sa coque lourdement corrodée par les vents silicatés. Ses banques de données contiennent peut-être des cartes de navigation ou des condensateurs intacts.",
    environmentalContext: "Haute atmosphère - Champ de débris basse altitude",
    generateChoices: (sol: number): [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption] => [
      {
        choiceId: "OPT_1",
        label: "Piratage à distance des banques mnésiques",
        flavorText: "Déployer un sous-programme d'intrusion via le réseau de sondes.",
        philosophicalAlignment: "Cartésien",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { HACKING: 10 } },
        skillCheck: {
          statUsed: "HACKING",
          difficultyClass: 12,
          onSuccess: {
            narrativeResult: "Les protocoles de sécurité de l'épave cèdent sans résistance. Vous téléchargez 400 To de cartographie stellaire et des codes de déverrouillage de réacteurs.",
            resourceDeltas: { credits_cr: 120, energy_gw: 15 },
            addPersistentFlags: ["HYPERION_DATA_DOWNLOADED"],
          },
          onFailure: {
            narrativeResult: "Un piège logique dans la mémoire centrale surcharge les récepteurs de votre sonde avant l'interruption du signal.",
            resourceDeltas: { energy_gw: -10 },
          },
        },
      },
      {
        choiceId: "OPT_2",
        label: "Mission EVA : Extraction du condensateur supraconducteur",
        flavorText: "Envoyer une équipe d'ingénieurs découper le noyau énergétique.",
        philosophicalAlignment: "Cybernétique",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { INGENIERIE: 14 } },
        skillCheck: {
          statUsed: "INGENIERIE",
          difficultyClass: 13,
          onSuccess: {
            narrativeResult: "L'équipe extrait le condensateur supraconducteur intact. Le réseau de distribution de l'Arche bénéficie d'une capacité tampon accrue.",
            resourceDeltas: { energy_gw: 45, alloys_tonnes: 12 },
            addPersistentFlags: ["RELAY_CONDENSER_INSTALLED"],
          },
          onFailure: {
            narrativeResult: "Une décharge résiduelle endommage la combinaison de l'ingénieur en chef. Le module est récupéré mais partiellement fondu.",
            resourceDeltas: { alloys_tonnes: 4, leader_fatigue: 10 },
          },
        },
      },
      {
        choiceId: "OPT_3",
        label: "Balayage spectroscopique passif et marquage",
        flavorText: "Enregistrer la trajectoire de l'épave sans engager de ressources actives.",
        philosophicalAlignment: "Structuraliste",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "La télémétrie de l'épave est archivée. Les capteurs enregistrent les données gravitationnelles utiles au secteur spatial.",
          resourceDeltas: { credits_cr: 35 },
          addPersistentFlags: ["ORBITAL_WRECK_TRACKED"],
        },
      },
      {
        choiceId: "OPT_4",
        label: "Ignorer et maintenir le cap prioritaire",
        flavorText: "Considérer l'épave comme un risque de déviation inutile.",
        philosophicalAlignment: "Pragmatique",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "L'épave poursuit sa chute orbitale et se consume dans la thermosphère sans incident.",
          resourceDeltas: {},
        },
      },
    ],
  },
  {
    title: "Sédition au Secteur Agro-Biologique S06",
    category: "CREW_MUTINY" as const,
    tier: "MEGA" as const,
    isTimeBlocking: false,
    canBeDeferred: true,
    loreDescription:
      "Des tensions aiguës éclatent dans les serres hydroponiques du Dôme 06. Les cultivateurs de la faction Biophilique refusent d'expédier les rations vers les quartiers industriels, dénonçant un épuisement des substrats vivants et un favoritisme de l'état-major.",
    environmentalContext: "Secteur Hydroponique S05-S08 - Pression sociale vive",
    generateChoices: (sol: number): [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption] => [
      {
        choiceId: "OPT_1",
        label: "Médiation diplomatique et réallocation équitable",
        flavorText: "Négocier un compromis sur les cycles de récolte avec les délégués des serres.",
        philosophicalAlignment: "Existentialiste",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { DIPLOMATIE: 12 } },
        skillCheck: {
          statUsed: "DIPLOMATIE",
          difficultyClass: 12,
          onSuccess: {
            narrativeResult: "Un consensus est signé sous l'égide du Sénat. Le moral des colons remonte et la chaîne de distribution est rétablie sans heurts.",
            resourceDeltas: { stability_delta: 8, biomass_kg: 50 },
            addPersistentFlags: ["BIOPHILIC_PACT_SIGNED"],
          },
          onFailure: {
            narrativeResult: "Les pourparlers s'enlisent. Les ouvriers concèdent un quota minimal mais la méfiance envers l'administration reste vive.",
            resourceDeltas: { stability_delta: -4 },
          },
        },
      },
      {
        choiceId: "OPT_2",
        label: "Décret d'Urgence : Réquisition martiale des stocks",
        flavorText: "Déployer la sécurité intérieure pour sécuriser les silos nutritifs.",
        philosophicalAlignment: "Cartésien",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { COMMANDEMENT: 13 } },
        skillCheck: {
          statUsed: "COMMANDEMENT",
          difficultyClass: 14,
          onSuccess: {
            narrativeResult: "L'ordre est rétabli en quelques heures. Les rations sont distribuées selon la grille cartésienne officielle.",
            resourceDeltas: { biomass_kg: 180, stability_delta: -3 },
            addPersistentFlags: ["AGRO_MARTIAL_DECREE"],
          },
          onFailure: {
            narrativeResult: "Des heurts éclatent dans les sas du dôme, provoquant la contamination d'un bac de micro-algues.",
            resourceDeltas: { biomass_kg: -80, stability_delta: -12 },
          },
        },
      },
      {
        choiceId: "OPT_3",
        label: "Injecter des fertilisants chimiques de secours",
        flavorText: "Puiser dans les réserves de minéraux pour doper artificiellement la production.",
        philosophicalAlignment: "Cybernétique",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "Les stimulants chimiques calment la pénurie immédiate, bien que la qualité nutritionnelle soit altérée.",
          resourceDeltas: { biomass_kg: 90, alloys_tonnes: -5 },
        },
      },
      {
        choiceId: "OPT_4",
        label: "Mettre le secteur sous quarantaine biologique",
        flavorText: "Isoler le dôme jusqu'à ce que les tensions s'estompent d'elles-mêmes.",
        philosophicalAlignment: "Structuraliste",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "Le dôme est isolé hermétiquement. La production tourne au ralenti mais le mécontentement ne se propage pas aux autres secteurs.",
          resourceDeltas: { biomass_kg: -40, stability_delta: -5 },
        },
      },
    ],
  },
  {
    title: "Avarie Critique du Confinement Magnétique Tokamak S02",
    category: "COSMIC_HAZARD" as const,
    tier: "GIGA" as const,
    isTimeBlocking: true,
    canBeDeferred: false,
    loreDescription:
      "ALERTE ROUGE : La bobine supraconductrice n°4 du réacteur principal de propulsion subit un effondrement thermique imminent. Le plasma de fusion à 150 millions de degrés menace de vaporiser les cloisons du Secteur S02 et d'entraîner une réaction en chaîne dévastatrice pour l'Arche entière. L'horloge de bord est suspendue.",
    environmentalContext: "Secteur Propulsion S01-S04 - Fusion thermonucléaire instable",
    generateChoices: (sol: number): [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption] => [
      {
        choiceId: "OPT_1",
        label: "Ventilation d'urgence du plasma dans l'espace interstellaire",
        flavorText: "Ouvrir les sas magnétiques de purge pour expulser la masse en fusion.",
        philosophicalAlignment: "Pragmatique",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { INGENIERIE: 14 } },
        skillCheck: {
          statUsed: "INGENIERIE",
          difficultyClass: 13,
          onSuccess: {
            narrativeResult: "Le plasma est éjecté avec succès sous la forme d'une gerbe incandescente. La coque est sauvée, bien qu'une part notable de combustible soit perdue.",
            resourceDeltas: { energy_gw: -40, deuterium_kg: -30, stability_delta: 5 },
            addPersistentFlags: ["PLASMA_PURGE_SUCCESS"],
          },
          onFailure: {
            narrativeResult: "La tuyère d'éjection se grippe sous la chaleur extrême. Le souffle résiduel brûle 20 tonnes d'alliages du blindage.",
            resourceDeltas: { energy_gw: -60, alloys_tonnes: -20, stability_delta: -10 },
          },
        },
      },
      {
        choiceId: "OPT_2",
        label: "Stabilisation par surfréquence quantique de N.I.A.",
        flavorText: "Allouer 100% de la puissance de calcul pour compenser les instabilités magnétiques en millisecondes.",
        philosophicalAlignment: "Cybernétique",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { SCIENCE: 15 } },
        skillCheck: {
          statUsed: "SCIENCE",
          difficultyClass: 14,
          onSuccess: {
            narrativeResult: "L'algorithme de confinement quantique réussit le verrouillage parfait ! Le réacteur réintègre sa plage nominale et génère une impulsion de surplus.",
            resourceDeltas: { energy_gw: 120, stability_delta: 12 },
            addPersistentFlags: ["QUANTUM_FUSION_LOCK"],
          },
          onFailure: {
            narrativeResult: "Le processeur de l'IA surchauffe. Le plasma est contenu in extremis mais les réseaux de calcul subissent des dégâts.",
            resourceDeltas: { energy_gw: -30, alloys_tonnes: -15, stability_delta: -5 },
          },
        },
      },
      {
        choiceId: "OPT_3",
        label: "Sacrifice d'un sous-secteur et isolation étanche",
        flavorText: "Condamner les sas de sécurité du compartiment auxiliaire.",
        philosophicalAlignment: "Cartésien",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "Le compartiment secondaire est scellé et sacrifié. L'onde de choc est absorbée par les cloisons de sécurité blindées.",
          resourceDeltas: { alloys_tonnes: -25, energy_gw: -20, stability_delta: -8 },
        },
      },
      {
        choiceId: "OPT_4",
        label: "Cryo-injection massive d'azote liquide de secours",
        flavorText: "Inonder les cryostats avec les réserves liquides du dôme.",
        philosophicalAlignment: "Structuraliste",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "Le refroidissement cryogénique immédiat stoppe l'effondrement au prix d'un puisement sévère dans les stocks hydriques.",
          resourceDeltas: { water_l: -1500, energy_gw: -15 },
        },
      },
    ],
  },
  {
    title: "Anomalie Gravitationnelle & Porte Dimensionnelle OMEGA",
    category: "ANOMALY" as const,
    tier: "OMEGA" as const,
    isTimeBlocking: true,
    canBeDeferred: false,
    loreDescription:
      "RUPTURE DU CONTINUUM : Un nexus d'énergie tachyoniqe pure transperce la réalité à la proue de l'Arche. Les chronomètres se désynchronisent, les esprits des colons résonnent avec des fréquences transdimensionnelles. Ce vortex offre le choix suprême de la destinée de notre civilisation.",
    environmentalContext: "Espace profond - Singularité d'Ascension OMEGA",
    generateChoices: (sol: number): [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption] => [
      {
        choiceId: "OPT_1",
        label: "Franchir le Nexus vers la Transcendance Stellaire",
        flavorText: "Orienter l'Arche dans le corridor d'Ascension collective.",
        philosophicalAlignment: "Cybernétique",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { SCIENCE: 16 } },
        skillCheck: {
          statUsed: "SCIENCE",
          difficultyClass: 15,
          onSuccess: {
            narrativeResult: "L'Arche s'harmonise avec le chant des étoiles ! La colonie accède à l'immortalité énergétique et à la conscience trans-spatiale.",
            resourceDeltas: { energy_gw: 500, credits_cr: 1000, stability_delta: 30 },
            addPersistentFlags: ["OMEGA_TRANSCENDENCE_ACHIEVED"],
          },
          onFailure: {
            narrativeResult: "L'énergie traverse la coque sans rupture, laissant des traces de matière exotique dans tous les dômes.",
            resourceDeltas: { energy_gw: 150, deuterium_kg: 80 },
          },
        },
      },
      {
        choiceId: "OPT_2",
        label: "Ancrage gravitationnel et capture du noyau tachyoniqe",
        flavorText: "Déployer les harpons magnétiques pour extraire la source infinie d'énergie.",
        philosophicalAlignment: "Cartésien",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { INGENIERIE: 16 } },
        skillCheck: {
          statUsed: "INGENIERIE",
          difficultyClass: 15,
          onSuccess: {
            narrativeResult: "Le noyau de la singularité est capturé et stabilisé au cœur du Dôme Z-2 ! Les besoins énergétiques de l'Arche sont résolus pour des générations.",
            resourceDeltas: { energy_gw: 300, deuterium_kg: 150, alloys_tonnes: 100 },
            addPersistentFlags: ["TACHYONIC_CORE_CONTAINED"],
          },
          onFailure: {
            narrativeResult: "La capture échoue au dernier instant, mais les condensateurs ont pu accumuler une charge monumentale.",
            resourceDeltas: { energy_gw: 100, alloys_tonnes: -10 },
          },
        },
      },
      {
        choiceId: "OPT_3",
        label: "Sceller la brèche spatio-temporelle avec une torpille à antimatière",
        flavorText: "Refermer le portail pour préserver la ligne temporelle d'origine.",
        philosophicalAlignment: "Structuraliste",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "L'explosion annihile la singularité. La réalité se stabilise, confirmant la suprématie de l'ordre matériel.",
          resourceDeltas: { deuterium_kg: -40, stability_delta: 15 },
        },
      },
      {
        choiceId: "OPT_4",
        label: "Dériver prudemment et observer l'évolution de la singularité",
        flavorText: "Rester en retrait et enregistrer le phénomène sur nos capteurs passifs.",
        philosophicalAlignment: "Existentialiste",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "Le vortex se dissipe lentement dans le vide, laissant un sillage de poussières de deutérium étincelantes.",
          resourceDeltas: { deuterium_kg: 30, credits_cr: 80 },
        },
      },
    ],
  },
  {
    title: "Signal Crypté d'une Faction Archonte Rivale",
    category: "FACTION_ENCOUNTER" as const,
    tier: "STANDARD" as const,
    isTimeBlocking: false,
    canBeDeferred: true,
    loreDescription:
      "Un croiseur automatique arborant les insignes d'un Gouverneur rival pénètre votre périmètre de souveraineté. L'émissaire synthétique propose un protocole de troc de technologies exclusives contre du minerai et des alliages rares.",
    environmentalContext: "Secteur Frontière S13 - Vecteur d'approche diplomatique",
    generateChoices: (sol: number): [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption] => [
      {
        choiceId: "OPT_1",
        label: "Négocier un traité de libre-échange asymétrique",
        flavorText: "User de tactique diplomatique pour obtenir un surplus de crédits et de deutérium.",
        philosophicalAlignment: "Existentialiste",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { DIPLOMATIE: 13 } },
        skillCheck: {
          statUsed: "DIPLOMATIE",
          difficultyClass: 13,
          onSuccess: {
            narrativeResult: "L'accord est ratifié à des conditions hautement avantageuses pour votre colonie. Les convois commerciaux s'organisent.",
            resourceDeltas: { credits_cr: 200, deuterium_kg: 25, alloys_tonnes: -10 },
            addPersistentFlags: ["ARCHON_TRADE_ACCORD"],
          },
          onFailure: {
            narrativeResult: "Les négociateurs rivaux perçoivent vos réticences et imposent une surtaxe sur le fret.",
            resourceDeltas: { credits_cr: 50, alloys_tonnes: -15 },
          },
        },
      },
      {
        choiceId: "OPT_2",
        label: "Piratage furtif de la balise de navigation rivale",
        flavorText: "Injecter un cheval de Troie dans la navette de l'émissaire pendant l'arrimage.",
        philosophicalAlignment: "Cartésien",
        resolutionType: "SKILL_CHECK",
        requirements: { stats: { HACKING: 13 } },
        skillCheck: {
          statUsed: "HACKING",
          difficultyClass: 14,
          onSuccess: {
            narrativeResult: "Infiltration indétectée ! Vous obtenez les plans tactiques complets des avant-postes rivaux et siphonnez 80 crédits de leur registre.",
            resourceDeltas: { credits_cr: 80, stability_delta: 6 },
            addPersistentFlags: ["RIVAL_BASE_BLUEPRINTS"],
          },
          onFailure: {
            narrativeResult: "L'antivirus de l'Arche adverse détecte le paquet. La navette rompt l'amarrage en urgence et diffuse un avertissement hostile.",
            resourceDeltas: { stability_delta: -8 },
          },
        },
      },
      {
        choiceId: "OPT_3",
        label: "Échange standard de ressources au taux de marché",
        flavorText: "Fournir 15 tonnes d'alliages contre 60kg de biomasse et 100 crédits.",
        philosophicalAlignment: "Structuraliste",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "La transaction commerciale de base est conclue dans les règles du droit spatial.",
          resourceDeltas: { alloys_tonnes: -15, biomass_kg: 60, credits_cr: 100 },
        },
      },
      {
        choiceId: "OPT_4",
        label: "Refuser tout contact et verrouiller les tourelles de défense",
        flavorText: "Signifier fermement que l'espace aérien de l'Arche est sous contrôle strict.",
        philosophicalAlignment: "Pragmatique",
        resolutionType: "DETERMINISTIC",
        directOutcome: {
          narrativeResult: "Le vaisseau rival vire de bord. Votre fermeté rassure les partisans de la sécurité militaire.",
          resourceDeltas: { stability_delta: 4 },
        },
      },
    ],
  },
];

/** Génère un Super-Événement déterministe avec synthèse diégétique des micro-logs récents ou tirage d'Oracle Roguelike */
export function generateDeterministicSuperEvent(
  masterSeed: number,
  turn: number,
  sol: number,
  recentMicroLogs: MicroLogItem[],
  existingFlags: string[] = [],
  genesis?: GenesisLorePayload
): SuperEventItem {
  // Une fois sur deux ou pour les tirages d'exploration, utiliser l'Oracle Roguelike Papier
  const useRoguelikeOracle = (turn + Math.floor(sol)) % 2 === 1 || turn >= 3;
  if (useRoguelikeOracle && genesis) {
    const roguelikeEvent = generateRoguelikeOracleSuperEvent(masterSeed, sol, turn, genesis);
    // Enrichir le résumé avec les micro-logs récents
    if (recentMicroLogs.length > 0) {
      const importantLogs = recentMicroLogs.slice(-3);
      const logSummaries = importantLogs.map((l) => `${l.category.toLowerCase()}: "${l.message}"`).join(" · ");
      roguelikeEvent.narrativeSummary = `${roguelikeEvent.narrativeSummary} | Journal de bord récent : ${logSummaries}`;
    }
    return roguelikeEvent;
  }

  const hash = xxHash32(masterSeed + turn * 7919 + Math.floor(sol) * 31);
  const templateIdx = hash % SUPER_EVENT_TEMPLATES.length;
  const template = SUPER_EVENT_TEMPLATES[templateIdx];

  // Synthèse diégétique basée sur les micro-logs récents
  let summary = `Bilan du Tour ${turn} : Les Sols ${(sol - 4).toFixed(1)} à ${sol.toFixed(1)} ont mis à l'épreuve les sous-systèmes de l'Arche.`;
  if (recentMicroLogs.length > 0) {
    const importantLogs = recentMicroLogs.slice(-4);
    const logSummaries = importantLogs.map((l) => `${l.category.toLowerCase()}: "${l.message}"`).join(" · ");
    summary = `Bilan chronologique : Les récents relevés (${logSummaries}) exigent une directive formelle du commandement.`;
  }

  const choices = template.generateChoices(sol);
  const timestamp = formatDualTimestamp(sol, 0, turn);
  const tierMap: Record<string, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
    STANDARD: 2,
    SUPER: 3,
    MEGA: 5,
    GIGA: 6,
    OMEGA: 7,
  };
  const severity_tier = tierMap[template.tier || "SUPER"] || 3;
  const isTimeBlocking = template.isTimeBlocking || severity_tier >= 5;

  return {
    id: `SE-${turn}-${hash.toString(16)}`,
    type: "SUPER_EVENT",
    eventId: `SEV-${turn}-${hash.toString(16)}`,
    title: template.title,
    category: template.category,
    tier: template.tier || "SUPER",
    severity_tier,
    isTimeBlocking,
    canBeDeferred: !isTimeBlocking && severity_tier < 5,
    narrativeSummary: summary,
    loreDescription: template.loreDescription,
    environmentalContext: template.environmentalContext,
    choices,
    status: "PENDING",
    timestamp,
  };
}
