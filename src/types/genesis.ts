import { z } from "zod";

// === ENUMS ===

export const RegimeTypeEnum = z.enum([
  "UNION_SOLAIRE",
  "SOLARCHIE",
  "FEDERATION_SOLAIRE",
  "CUSTOM",
]);
export type RegimeType = z.infer<typeof RegimeTypeEnum>;

export const SpecialistCorpsEnum = z.enum([
  "ENGINEERS",
  "XENOBIOLOGISTS",
  "LOGISTICS",
  "MEDIATORS",
]);
export type SpecialistCorps = z.infer<typeof SpecialistCorpsEnum>;

export const PhilosophicalAlignmentEnum = z.enum([
  "CARTESIEN_AUTORITAIRE",
  "EXISTENTIALISTE_DEMOCRATE",
  "CYBERNETIQUE_BALANCE",
  "STRUCTURALISTE_COLLECTIF",
]);
export type PhilosophicalAlignment = z.infer<typeof PhilosophicalAlignmentEnum>;

export const EraEnum = z.enum([
  "ERE_1_PIONNIER",
  "ERE_2_VILLAGE",
  "ERE_3_COLONIE",
  "ERE_4_METROPOLE",
  "ERE_5_TERRAFORMATION",
  "ERE_6_INDUSTRIELLE",
  "ERE_7_ORBITALE",
  "ERE_8_RESEAU_PLANETAIRE",
  "ERE_9_QUANTIQUE",
  "ERE_10_STELLAIRE",
  "ERE_11_ASCENSION",
  "ERE_12_SINGULARITE",
  // Legacy aliases
  "ARRIVEE_ARCHE",
  "BASE_COLONISATION",
  "VILLE",
  "MEGALOPOLE",
  "DEPARTEMENT",
  "REGION",
  "ETAT_PLANETAIRE",
  "FEDERATION_CONTINENTALE",
  "FEDERATION_PLANETAIRE",
]);
export type Era = z.infer<typeof EraEnum>;

export const HeaderTierStateEnum = z.enum([
  "H1_FOLDED",
  "H2_UNFOLDED_NAV",
  "H3_FULL_EXPANDED",
]);
export type HeaderTierState = z.infer<typeof HeaderTierStateEnum>;

export const FooterTierStateEnum = z.enum([
  "F1_FOLDED",
  "F2_UNFOLDED_METRICS",
  "F3_FULL_EXPANDED",
]);
export type FooterTierState = z.infer<typeof FooterTierStateEnum>;

export const ConcentricZoneEnum = z.enum([
  "ZONE_1_DOME_CORE",
  "ZONE_2_TERRAFORMED_PERIPHERY",
  "ZONE_3_HOSTILE_EXTERIOR",
  "ZONE_4_DEEP_SPACE_ORBIT",
]);
export type ConcentricZone = z.infer<typeof ConcentricZoneEnum>;

export const ZLevelEnum = z.enum([
  "Z_PLUS_2_ORBIT",
  "Z_PLUS_1_SURFACE",
  "Z_ZERO_DOME",
  "Z_MINUS_1_SUB",
  "Z_MINUS_2_DEEP",
]);
export type ZLevel = z.infer<typeof ZLevelEnum>;

/** Registre anatomique — style RimWorld */
export const LeaderAnatomySchema = z.object({
  brain_sync_pct: z.number().min(0).max(100),
  heart_condition_pct: z.number().min(0).max(100),
  lungs_silica_exposure_pct: z.number().min(0).max(100),
  liver_toxicity_pct: z.number().min(0).max(100),
  kidney_efficiency_pct: z.number().min(0).max(100),
  optics_acuity_pct: z.number().min(0).max(100),
  skeleton_wear_pct: z.number().min(0).max(100),
  cybernetic_implants_count: z.number().int().min(0).max(10),
  active_injuries: z.array(z.string()),
});
export type LeaderAnatomy = z.infer<typeof LeaderAnatomySchema>;

/** S.P.E.C.I.A.L. Attributes */
export const SpecialSchema = z.object({
  strength: z.number().min(0).max(100),
  perception: z.number().min(0).max(100),
  endurance: z.number().min(0).max(100),
  charisma: z.number().min(0).max(100),
  intelligence: z.number().min(0).max(100),
  agility: z.number().min(0).max(100),
  luck: z.number().min(0).max(100),
});
export type Special = z.infer<typeof SpecialSchema>;

/** Prestige régalien — axe social */
export const LeaderPrestigeSchema = z.object({
  glory_score: z.number().min(0),
  diplomatic_reputation: z.number().min(0).max(100),
  civic_inspiration_pct: z.number().min(0).max(100),
  popularity_pct: z.number().min(0).max(100).optional().default(80),
  personal_credits_cr: z.number().min(0).optional().default(500),
});
export type LeaderPrestige = z.infer<typeof LeaderPrestigeSchema>;

/** Compétences & mandat */
export const LeaderSkillsSchema = z.object({
  archetype: z.enum([
    "TECHNOCRATE_CYBERNETIQUE",
    "COMMANDANT_MARTIAL",
    "DIPLOMATE_HUMANISTE",
    "XENOBIOLOGISTE_GENETICIEN",
    "SCIENTIFIQUE_QUANTIQUE",
  ]),
  leader_level: z.number().int().min(1).max(5),
  charisma: z.number().min(0).max(100),
  intelligence: z.number().min(0).max(100),
  wisdom: z.number().min(0).max(100),
  active_perks: z.array(z.string()),
  unlocked_tree_nodes: z.array(z.string()),
  skills: z.record(z.string(), z.number().min(0).max(100)),
});
export type LeaderSkills = z.infer<typeof LeaderSkillsSchema>;

/** Vecteurs de vie — style BitLife */
export const LeaderProfileSchema = z.object({
  name: z.string().default("Gouverneur Suprême"),
  title: z.string().default("Gouverneur d'Expédition"),
  overall_health_pct: z.number().min(0).max(100),
  happiness_pct: z.number().min(0).max(100),
  socialization_pct: z.number().min(0).max(100).optional().default(78),
  fatigue_pct: z.number().min(0).max(100),
  stress_level: z.number().min(0).max(100),
  biological_age_sols: z.number().min(0),
  chronological_age_sols: z.number().min(0),
  anatomy: LeaderAnatomySchema,
  special: SpecialSchema,
  prestige: LeaderPrestigeSchema,
  mandate: LeaderSkillsSchema,
  philosophical_alignment: PhilosophicalAlignmentEnum,
});
export type LeaderProfile = z.infer<typeof LeaderProfileSchema>;

export const FactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  doctrine: z.string(),
  approval_rating: z.number().min(0).max(100),
  radicalization_level: z.number().min(0).max(100),
  population_pct: z.number().min(0).max(100),
  demands: z.array(z.string()),
  color: z.string(),
});
export type Faction = z.infer<typeof FactionSchema>;

export const GenesisLorePayloadSchema = z.object({
  game_id: z.string(),
  master_seed: z.number().int().min(0).max(4294967295),
  created_at_tick: z.literal(0),
  document_version: z.literal("35.0.0"),

  pillar_1_governance: z.object({
    regime_type: RegimeTypeEnum,
    uuid_prefix: z.string().min(3).max(12),
    ship_model: z.enum(["ASTRA_NOVA_PRIME", "CHRONOS_HEAVY", "PROMETHEE_BIO"]),
    leader_profile: LeaderProfileSchema,
    factions: z.array(FactionSchema).min(1).max(3),
    governance_level: z.number().int().min(1).max(5),
    senate_stability: z.number().min(0).max(100),
  }),

  pillar_2_environment: z.object({
    star_system: z.string(),
    target_planet: z.string(),
    gravity_g: z.number().min(0.1).max(10),
    atmosphere_p_atm: z.number().min(0).max(100),
    climate_hazards: z.array(z.string()).min(1).max(6),
    habitability_score: z.number().min(0).max(100),
    orbital_parameters: z.object({
      semi_major_axis: z.number().min(0),
      eccentricity: z.number().min(0).max(1),
      orbital_period_sols: z.number().min(1),
    }),
  }),

  pillar_3_specialization: z.object({
    specialist_corps: SpecialistCorpsEnum,
    territory_layout: z.enum([
      "MAILLAGE_ALPHA",
      "QUADRILLAGE_FORTIFIE",
      "EXPANSION_LINEAIRE",
    ]),
    people_archetype: z.enum([
      "ASTRALIENS_SAPIENS",
      "CYBER_AUGMENTED",
      "XENO_ADAPTED",
    ]),
    ai_acronym: z.string().min(3).max(20),
    ai_full_name: z.string().min(5).max(120),
    cargo_type: z.enum(["SURVIVAL", "INFRASTRUCTURE", "RESEARCH"]),
    initial_resources: z.object({
      biomass_kg: z.number().min(0),
      oxygen_l: z.number().min(0),
      water_l: z.number().min(0),
      energy_gw: z.number().min(0),
      alloys_tonnes: z.number().min(0),
      deuterium_kg: z.number().min(0),
    }),
  }),

  pillar_4_lore_refinement: z.object({
    ai_rival_archons_count: z.number().int().min(1).max(7),
    rival_aggression: z.enum(["LOW", "MEDIUM", "HIGH"]),
    difficulty_mode: z.enum(["REALISM_FLEX_SOL_1_TO_10", "ROGUE_LIKE_STRICT"]),
    custom_narrative_notes: z.string().max(1200).optional(),
    starting_era: EraEnum.default("ARRIVEE_ARCHE"),
    nia_mode: z.enum(["AUTO", "REGULE", "SEMI_MANUEL", "OFF"]).default("AUTO"),
  }),

  ui_display_config: z.object({
    header_state: HeaderTierStateEnum.default("H1_FOLDED"),
    footer_state: FooterTierStateEnum.default("F1_FOLDED"),
    radio_active: z.boolean().default(true),
    theme: z
      .enum([
        "LIGHT_MODE",
        "MODE_CLAIR_STELLAIRE",
        "SOLAR_ALBATRE",
        "CYAN_OBSIDIENNE",
        "ALERTE_ROUGE",
        "CARTESIEN_HC",
        "AMBER_CRT",
        "GLASSMORPHIC",
      ])
      .default("LIGHT_MODE"),
    reduced_motion: z.boolean().default(false),
  }),
});
export type GenesisLorePayload = z.infer<typeof GenesisLorePayloadSchema>;
