import { RoguelikeEvent, SeverityLevel, EventCategory } from "../types/simulation";
import { GenesisLorePayload } from "../types/genesis";
import { xxHash32, pcg32 } from "./prng";

export interface EventTemplate {
  category: EventCategory;
  severity: SeverityLevel;
  tags: string[];
  impactedSubsystems: string[];
  sender: string;
  message: string;
  choices: Array<{
    choice_id: string;
    label: string;
    philosophical_alignment:
      | "CARTESIEN_AUTORITAIRE"
      | "EXISTENTIALISTE_DEMOCRATE"
      | "CYBERNETIQUE_BALANCE"
      | "STRUCTURALISTE_COLLECTIF";
    cost: {
      energy_gw?: number;
      biomass_kg?: number;
      oxygen_l?: number;
      water_l?: number;
      alloys_tonnes?: number;
      deuterium_kg?: number;
      leader_fatigue?: number;
      stability_delta?: number;
    };
    outcomes: {
      stability_delta?: number;
      faction_approval?: Record<string, number>;
      resource_gain?: Record<string, number>;
      resource_loss?: Record<string, number>;
      unlocks?: string[];
      hidden_effects?: string[];
    };
  }>;
}

export const FALLBACK_EVENT_CATALOG: EventTemplate[] = [
  // 1. Énergie & Surtension
  {
    category: "CRISIS",
    severity: "CRITICAL",
    tags: ["energie", "reacteur", "securite"],
    impactedSubsystems: ["ARCHE_GOVERNANCE", "RESOURCE_FLOW"],
    sender: "LOGOS-9 // SUPERVISION RÉACTEURS",
    message:
      "Surtension thermique sur la boucle de confinement du Réacteur Alpha. Une accumulation de tritium menace de faire sauter les sas magnétiques dans le secteur 01.",
    choices: [
      {
        choice_id: "OPT_PURGE",
        label: "Purger d'urgence le deutérium dans le vide spatial",
        philosophical_alignment: "CARTESIEN_AUTORITAIRE",
        cost: { deuterium_kg: 25, leader_fatigue: 10 },
        outcomes: {
          stability_delta: 5,
          faction_approval: { "Ingénieurs du Vide": 15, Rationalistes: 5 },
          hidden_effects: ["Boucle réacteur sécurisée"],
        },
      },
      {
        choice_id: "OPT_VENT",
        label: "Dériver la chaleur vers les serres agro-cogénératives",
        philosophical_alignment: "CYBERNETIQUE_BALANCE",
        cost: { leader_fatigue: 5 },
        outcomes: {
          stability_delta: -5,
          resource_loss: { biomass_kg: 300 },
          faction_approval: { Biophiliques: -15, "Ingénieurs du Vide": 10 },
          hidden_effects: ["Échauffement partiel des cultures"],
        },
      },
      {
        choice_id: "OPT_OVERRIDE",
        label: "Activer les supraconducteurs de secours en surcharge",
        philosophical_alignment: "STRUCTURALISTE_COLLECTIF",
        cost: { alloys_tonnes: 8, leader_fatigue: 15 },
        outcomes: {
          stability_delta: 10,
          resource_gain: { energy_gw: 30 },
          faction_approval: { Rationalistes: 15, Biophiliques: 5 },
        },
      },
    ],
  },
  // 2. Tempête de Silice
  {
    category: "DEVELOPPEMENT",
    severity: "WARNING",
    tags: ["climat", "silice", "dômes"],
    impactedSubsystems: ["COLONY_URBAN", "CLIMATE"],
    sender: "KAIROS-SYNAPSE // RADAR MÉTÉO",
    message:
      "Un super-cyclone de poussières de silice s'approche à 240 km/h. Les panneaux photovoltaïques et les filtres d'épurateurs de surface sont directement exposés.",
    choices: [
      {
        choice_id: "OPT_SHIELD",
        label: "Rétracter les capteurs et passer sur batteries d'appoint",
        philosophical_alignment: "CYBERNETIQUE_BALANCE",
        cost: { energy_gw: 30, leader_fatigue: 5 },
        outcomes: {
          stability_delta: 5,
          faction_approval: { Rationalistes: 10, "Ingénieurs du Vide": 10 },
        },
      },
      {
        choice_id: "OPT_MAINTAIN",
        label: "Maintenir l'activité et envoyer les robots de décolmatage",
        philosophical_alignment: "CARTESIEN_AUTORITAIRE",
        cost: { alloys_tonnes: 5, leader_fatigue: 12 },
        outcomes: {
          stability_delta: -5,
          resource_gain: { energy_gw: 40 },
          faction_approval: { "Ingénieurs du Vide": -10, Rationalistes: 10 },
        },
      },
    ],
  },
  // 3. Débat au Sénat sur les Rations
  {
    category: "GOUVERNANCE",
    severity: "INFO",
    tags: ["senat", "rations", "factions"],
    impactedSubsystems: ["ARCHE_GOVERNANCE"],
    sender: "CHANCELIER SÉNATORIAL // PARLEMENT",
    message:
      "L'Assemblée des Astraliens dépose une motion pour augmenter la ration calorique quotidienne des ouvriers de la Zone B au détriment des réserves stratégiques.",
    choices: [
      {
        choice_id: "OPT_VOTE_YES",
        label: "Approuver la motion d'abondance vivrière",
        philosophical_alignment: "EXISTENTIALISTE_DEMOCRATE",
        cost: { biomass_kg: 800 },
        outcomes: {
          stability_delta: 15,
          faction_approval: { Biophiliques: 25, "Ingénieurs du Vide": 15, Rationalistes: -20 },
        },
      },
      {
        choice_id: "OPT_VOTE_NO",
        label: "Imposer le strict ratio cartésien de subsistance",
        philosophical_alignment: "CARTESIEN_AUTORITAIRE",
        cost: { leader_fatigue: 10 },
        outcomes: {
          stability_delta: -10,
          faction_approval: { Rationalistes: 25, Biophiliques: -25, "Ingénieurs du Vide": -10 },
          resource_gain: { biomass_kg: 400 },
        },
      },
    ],
  },
  // 4. Infection Xénobiologique
  {
    category: "CRISIS",
    severity: "CRITICAL",
    tags: ["sante", "biologie", "isolement"],
    impactedSubsystems: ["COLONY_URBAN", "LEADER_HEALTH"],
    sender: "DIRECTEUR MÉDICAL // SECTEUR 12",
    message:
      "Des spores microscopiques d'un extrêmophile planétaire ont traversé les sas de décontamination du secteur 09. Quinze colons présentent des toux cyanhydriques.",
    choices: [
      {
        choice_id: "OPT_QUARANTINE",
        label: "Mettre le quartier en quarantaine hermétique totale",
        philosophical_alignment: "CARTESIEN_AUTORITAIRE",
        cost: { energy_gw: 20, leader_fatigue: 15 },
        outcomes: {
          stability_delta: -15,
          faction_approval: { Biophiliques: -20, Rationalistes: 20 },
          hidden_effects: ["Épidémie contenue avec pertes minimes"],
        },
      },
      {
        choice_id: "OPT_SYNTHESIS",
        label: "Formuler un antiviral expérimental à base de biomasse",
        philosophical_alignment: "EXISTENTIALISTE_DEMOCRATE",
        cost: { biomass_kg: 500, water_l: 1000, leader_fatigue: 10 },
        outcomes: {
          stability_delta: 10,
          faction_approval: { Biophiliques: 25, "Ingénieurs du Vide": 5 },
          unlocks: ["IMMUNITE_SPORES_NIVEAU_1"],
        },
      },
    ],
  },
  // 5. Découverte de Ruines Précurseurs
  {
    category: "EXPLORATION",
    severity: "INFO",
    tags: ["4x", "ruines", "archeologie"],
    impactedSubsystems: ["EXPLORATION_4X", "ARCHE_GOVERNANCE"],
    sender: "SONDE EXPLO-04 // ORBITE BASSE",
    message:
      "Les spectromètres de la sonde ont repéré des monolithes géométriques polygonaux enfouis sous le régolithe. Les signatures mathématiques émettent sur la fréquence phi.",
    choices: [
      {
        choice_id: "OPT_EXCAVATE",
        label: "Envoyer une expédition de forage d'élite",
        philosophical_alignment: "STRUCTURALISTE_COLLECTIF",
        cost: { alloys_tonnes: 12, energy_gw: 25, leader_fatigue: 8 },
        outcomes: {
          stability_delta: 10,
          faction_approval: { Rationalistes: 20, "Ingénieurs du Vide": 15 },
          unlocks: ["ARTEFACT_PRECURSEUR_ALPHA"],
        },
      },
      {
        choice_id: "OPT_SEAL",
        label: "Sanctuariser la zone et observer à distance",
        philosophical_alignment: "EXISTENTIALISTE_DEMOCRATE",
        cost: { leader_fatigue: 2 },
        outcomes: {
          stability_delta: 0,
          faction_approval: { Biophiliques: 15, Rationalistes: -10 },
        },
      },
    ],
  },
  // 6. Signal Diplomatique d'un Archonte Rival
  {
    category: "DIPLOMATIE",
    severity: "INFO",
    tags: ["4x", "diplomatie", "commerce"],
    impactedSubsystems: ["DIPLOMACY", "RESOURCE_FLOW"],
    sender: "CANAL HYPER-FRÉQUENCE // ARCHONTE VALERIUS",
    message:
      "L'Archonte Valerius propose un traité commercial d'échange : 30 tonnes d'alliages de titane contre 100 kg de deutérium cryogénique hautement raffiné.",
    choices: [
      {
        choice_id: "OPT_ACCEPT_TRADE",
        label: "Signer le pacte de libre-échange interstellaire",
        philosophical_alignment: "STRUCTURALISTE_COLLECTIF",
        cost: { deuterium_kg: 100 },
        outcomes: {
          resource_gain: { alloys_tonnes: 30 },
          stability_delta: 5,
          faction_approval: { "Ingénieurs du Vide": 20, Rationalistes: 10 },
        },
      },
      {
        choice_id: "OPT_REFUSE_TRADE",
        label: "Décliner et préserver l'autarcie stratégique de l'Arche",
        philosophical_alignment: "CARTESIEN_AUTORITAIRE",
        cost: {},
        outcomes: {
          stability_delta: 0,
          faction_approval: { Rationalistes: 5, "Ingénieurs du Vide": -10 },
        },
      },
    ],
  },
  // 7. Mutinerie Ouvrière dans les Fonderies
  {
    category: "CRISIS",
    severity: "CRITICAL",
    tags: ["mutinerie", "greve", "fonderie"],
    impactedSubsystems: ["ARCHE_GOVERNANCE", "COLONY_URBAN"],
    sender: "SÉCURITÉ INTÉRIEURE // SECTEUR 13",
    message:
      "Les techniciens du secteur 13 ont cessé le travail. Ils protestent contre les cadences de fabrication et occupent les commandes des laminoirs à chaud.",
    choices: [
      {
        choice_id: "OPT_FORCE",
        label: "Déployer la milice d'ordre et rétablir la chaîne",
        philosophical_alignment: "CARTESIEN_AUTORITAIRE",
        cost: { leader_fatigue: 15 },
        outcomes: {
          stability_delta: -15,
          faction_approval: { "Ingénieurs du Vide": -25, Rationalistes: 15 },
          hidden_effects: ["Ressentiment durable des ouvriers"],
        },
      },
      {
        choice_id: "OPT_CONCESSION",
        label: "Accorder des primes de repos et réduire les horaires",
        philosophical_alignment: "EXISTENTIALISTE_DEMOCRATE",
        cost: { energy_gw: 15, leader_fatigue: 5 },
        outcomes: {
          stability_delta: 15,
          faction_approval: { "Ingénieurs du Vide": 30, Biophiliques: 10, Rationalistes: -15 },
        },
      },
    ],
  },
  // 8. Panne du Réseau Cryogénique
  {
    category: "DEVELOPPEMENT",
    severity: "WARNING",
    tags: ["cryogenie", "colons", "energie"],
    impactedSubsystems: ["ARCHE_GOVERNANCE", "COLONY_URBAN"],
    sender: "CHEF CRYOTECHNICIEN // SECTEUR 11",
    message:
      "Une baisse de tension affecte la baie de cryostase C-04. Trois cents colons risquent un réveil prématuré non contrôlé sous 48 heures.",
    choices: [
      {
        choice_id: "OPT_AWAKEN",
        label: "Procéder au réveil contrôlé et intégrer les colons",
        philosophical_alignment: "EXISTENTIALISTE_DEMOCRATE",
        cost: { biomass_kg: 400, oxygen_l: 1000, water_l: 1200 },
        outcomes: {
          stability_delta: 10,
          resource_gain: { population_active: 300 },
          faction_approval: { Biophiliques: 20, "Ingénieurs du Vide": 15 },
        },
      },
      {
        choice_id: "OPT_DIVERT_POWER",
        label: "Allouer 40 GW en priorité absolue pour stabiliser la stase",
        philosophical_alignment: "CARTESIEN_AUTORITAIRE",
        cost: { energy_gw: 40, leader_fatigue: 8 },
        outcomes: {
          stability_delta: 5,
          faction_approval: { Rationalistes: 10 },
        },
      },
    ],
  },
];

/** Sélectionne déterministement un événement de repli si le LLM n'est pas disponible */
export function getDeterministicFallbackEvent(
  seed: number,
  sol: number,
  genesis: GenesisLorePayload
): RoguelikeEvent {
  const index = Math.abs(xxHash32(seed + sol * 7919, seed)) % FALLBACK_EVENT_CATALOG.length;
  const template = FALLBACK_EVENT_CATALOG[index];
  const rng = pcg32(seed + sol * 1337);

  const eventId = `EVT-${genesis.pillar_1_governance.uuid_prefix}-S${sol}-${template.category.substring(0, 3)}-${Math.floor(rng() * 900 + 100)}`;

  return {
    event_id: eventId,
    timestamp_tick: sol * 24,
    timestamp_sol: sol,
    era_context: genesis.pillar_4_lore_refinement.starting_era,
    internal_palier: 1,
    category: template.category,
    severity: template.severity,
    narrative: {
      sender: template.sender.replace("KAIROS-SYNAPSE", genesis.pillar_3_specialization.ai_acronym),
      message: template.message,
      audio_log_url: null,
    },
    filters: {
      tags: template.tags,
      impacted_subsystems: template.impactedSubsystems,
    },
    roguelike_choices: template.choices.map((c) => ({
      choice_id: c.choice_id,
      label: c.label,
      philosophical_alignment: c.philosophical_alignment,
      cost: c.cost,
      outcomes: c.outcomes,
      hidden_effects: c.outcomes.hidden_effects,
    })),
    resolved: false,
  };
}
