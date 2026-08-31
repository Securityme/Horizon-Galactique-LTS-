import { z } from "zod";
import {
  ConcentricZone,
  Era,
  PhilosophicalAlignment,
  ZLevel,
} from "./genesis";

// Sévérité des événements
export type SeverityLevel = "INFO" | "WARNING" | "CRITICAL" | "FATAL";

// 7 Niveaux / Paliers d'Événements
export type EventTier =
  | "MICRO"      // Niveau 1 : Télémétrie opérationnelle continue
  | "MINEUR"     // Niveau 2 : Maintenance ou micro-incident
  | "STANDARD"   // Niveau 3 : Rapport régulier de faction ou opportunité
  | "SUPER"      // Niveau 4 : Super-Événement narratif (4 choix, jet de compétence)
  | "MEGA"       // Niveau 5 : Crise majeure systémique (pause automatique suggérée)
  | "GIGA"       // Niveau 6 : Giga-Événement critique d'Arche (BLOCAGE STRICT DU TEMPS, choix obligatoire)
  | "OMEGA";     // Niveau 7 : Événement d'Ascension finale ou Extinction cosmique (BLOCAGE TOTAL DU TEMPS)

export type EventCategory =
  | "LEADER"
  | "GOUVERNANCE"
  | "DEVELOPPEMENT"
  | "DIPLOMATIE"
  | "GUERRE"
  | "EXPLORATION"
  | "RECHERCHE"
  | "CRISIS";

export interface ResourceCost {
  energy_gw?: number;
  biomass_kg?: number;
  oxygen_l?: number;
  water_l?: number;
  alloys_tonnes?: number;
  deuterium_kg?: number;
  leader_fatigue?: number;
  leader_stress?: number;
  stability_delta?: number;
  credits_cr?: number;
}

export interface OutcomeImpacts {
  stability_delta?: number;
  faction_approval?: Record<string, number>;
  resource_gain?: ResourceCost;
  resource_loss?: ResourceCost;
  unlocks?: string[];
  hidden_effects?: string[];
  era_progression?: boolean;
}

export interface RoguelikeChoice {
  choice_id: string;
  label: string;
  philosophical_alignment: PhilosophicalAlignment;
  cost: ResourceCost;
  outcomes: OutcomeImpacts;
  hidden_effects?: string[];
}

export interface RoguelikeEvent {
  event_id: string;
  timestamp_tick: number;
  timestamp_sol: number;
  era_context: Era;
  internal_palier: number;
  category: EventCategory;
  severity: SeverityLevel;
  tier?: EventTier;
  isTimeBlocking?: boolean;
  narrative: {
    sender: string;
    message: string;
    audio_log_url?: string | null;
  };
  filters: {
    tags: string[];
    impacted_subsystems: string[];
  };
  roguelike_choices: RoguelikeChoice[];
  resolved?: boolean;
  chosen_option_id?: string;
  metadata?: {
    related_quest?: string;
    time_limit_ticks?: number;
    repeatable?: boolean;
  };
}

// Bâtiments et Territoire
export type BuildingCategory = "HAB" | "AGR" | "ENE" | "IND" | "LOG" | "SEC" | "RES" | "GOV";
export type BuildingState = "NOMINAL" | "DEGRADE" | "AVARIE" | "BRECHE_HERMETIQUE";

export interface GridCoordinate {
  x: number;
  y: number;
  z: ZLevel;
  sector_id: string;
}

export interface BuildingBlueprint {
  blueprint_id: string;
  name: string;
  category: BuildingCategory;
  unlocked_era: number;
  min_leader_level: number;
  min_governance_level: number;
  allowed_z_levels: ZLevel[];
  allowed_zones: ConcentricZone[];
  grid_footprint: { width: number; height: number };
  base_inputs: Record<string, number>;
  base_outputs: Record<string, number>;
  construction_cost: Record<string, number>;
  maintenance_cost_alloys: number;
  description: string;
}

export interface InstalledBuilding {
  building_instance_id: string;
  blueprint_id: string;
  name: string;
  category: BuildingCategory;
  position: GridCoordinate;
  status: BuildingState;
  integrity_pct: number;
  power_consumption_mw: number;
  personnel_assigned: number;
  inputs_met_pct: number;
  age_sols: number;
}

// File de construction & Production
export interface BuildQueueItem {
  id: string;
  blueprint_id: string;
  name: string;
  category: BuildingCategory;
  position: GridCoordinate;
  total_duration_ticks: number;
  progress_ticks: number;
  cost_alloys: number;
  cost_energy: number;
  auto_built_by_nia: boolean;
  priority: number;
}

// Télémétrie des algorithmes de production inter-moteurs
export interface ProductionTelemetry {
  energy_produced_gw: number;
  energy_consumed_gw: number;
  net_energy_gw: number;
  o2_produced_l: number;
  o2_consumed_l: number;
  net_o2_l: number;
  water_produced_l: number;
  water_consumed_l: number;
  net_water_l: number;
  biomass_produced_kg: number;
  biomass_consumed_kg: number;
  net_biomass_kg: number;
  alloys_produced_t: number;
  deuterium_produced_kg: number;
  grid_power_satisfaction_pct: number;
  active_jobs_capacity: number;
  active_housing_capacity: number;
}

// Les 16 Secteurs de l'Arche
export interface SectorState {
  id: string;
  code: string; // "SEC-01" to "SEC-16"
  name: string;
  categoryGroup: "PROPULSION" | "SUPPORT_VIE" | "RESIDENTIEL" | "FABRICATION_DEFENSE";
  techLevel: number;
  personnelAssigned: number;
  integrityPct: number;
  maintenanceStatusPct: number;
  temperatureC: number;
  radiationLevel: number;
  isOnline: boolean;
  connectedSectors: string[];
  resourcesStored: Record<string, number>;
  storageCapacity: number;
  description: string;
}

// Décrets législatifs
export interface Decree {
  id: string;
  title: string;
  category: "ECONOMIE" | "SECURITE" | "BIEN_ETRE" | "RECHERCHE" | "EXPANSION";
  description: string;
  philosophical_alignment: PhilosophicalAlignment;
  active: boolean;
  solEnacted?: number;
  costPerSol: ResourceCost;
  effectsSummary: string;
  factionSupport: Record<string, number>;
}

// Archontes IA Rivaux
export interface RivalArchon {
  id: string;
  name: string;
  avatarSeed: string;
  archetype: "TECHNOCRATE" | "MILITARISTE" | "DIPLOMATE" | "EXPANSIONNISTE";
  colonyName: string;
  population: number;
  militaryPower: number;
  techLevel: number;
  wealthCR: number;
  reputationWithPlayer: number; // -100 to 100
  pactStatus: "HOSTILE" | "COLD_WAR" | "NEUTRAL" | "TRADE_PACT" | "ALLIANCE";
  lastAction: string;
  systemLocation: string;
}

// Carte 4X Strate Stellaire
export interface CelestialBody {
  id: string;
  name: string;
  type: "STAR" | "PLANET" | "MOON" | "ASTEROID_BELT" | "ANOMALY" | "RUIN";
  orbitRadius: number; // UA
  habitabilityScore: number; // 0-100%
  scanned: boolean;
  minedOutPct: number;
  resources: Record<string, number>;
  outpostInstalled?: boolean;
  hazards: string[];
  description: string;
}

// Snapshot de Ligne Temporelle (Persistance / Multivers)
export interface TimelineSnapshot {
  timeline_id: string;
  parent_timeline_id: string | null;
  label: string;
  master_seed: number;
  branch_tick: number;
  branch_sol: number;
  created_at_iso: string;
  modded: boolean;
  digest_sha: string;
  game_state_summary: {
    sol: number;
    era: Era;
    population: number;
    stability: number;
    leaderHealth: number;
  };
}
