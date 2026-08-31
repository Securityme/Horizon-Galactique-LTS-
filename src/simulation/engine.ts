import { GenesisLorePayload } from "../types/genesis";
import {
  BuildingBlueprint,
  CelestialBody,
  Decree,
  InstalledBuilding,
  RivalArchon,
  RoguelikeEvent,
  SectorState,
  BuildQueueItem,
  ProductionTelemetry,
  EventTier,
} from "../types/simulation";
import {
  JournalItem,
  MicroLogItem,
  SuperEventItem,
  ChoiceOption,
  EventResolutionItem,
} from "../types/journal";
import { ClockState, createInitialClock, advanceClockByTicks } from "./clock";
import {
  BUILDING_BLUEPRINTS,
  ERAS_CONFIG,
  INITIAL_CELESTIAL_BODIES,
  INITIAL_DECREES,
  INITIAL_SECTORS,
  PLANET_PRESETS,
  STAR_SYSTEM_PRESETS,
} from "./constants";
import { getDeterministicFallbackEvent } from "./fallback";
import { mulberry32, pcg32, xxHash32 } from "./prng";
import {
  createMicroLog,
  formatDualTimestamp,
  generateDeterministicSuperEvent,
  resolveSuperEventChoice,
} from "./journalEngine";
import { BuildingManagementEngine } from "./BuildingManagementEngine";

export interface ResourcesState {
  biomass_kg: number;
  oxygen_l: number;
  water_l: number;
  energy_gw: number;
  alloys_tonnes: number;
  deuterium_kg: number;
  credits_cr: number;
  population_total: number;
  population_active: number;
  population_in_stasis: number;
}

export interface ClimateState {
  surface_temp_c: number;
  atmosphere_p_atm: number;
  radiance_w_m2: number;
  silica_storm_active: boolean;
  ion_storm_active: boolean;
  weather_description: string;
  season?: "PRINTANIER" | "ESTIVAL" | "AUTOMNAL" | "HIVERNAL";
  season_progress_pct?: number;
  silica_dust_density_g_m3?: number;
  radiation_level_sv_h?: number;
  geothermal_flux_mw?: number;
  production_multiplier?: number;
  population_happiness_impact?: number;
}

export interface GameState {
  genesis: GenesisLorePayload;
  clock: ClockState;
  resources: ResourcesState;
  climate: ClimateState;
  sectors: SectorState[];
  buildings: InstalledBuilding[];
  buildQueue: BuildQueueItem[]; // Player-initiated construction queue
  productionQueue: BuildQueueItem[]; // Autonomous Engine (N.I.A.) production queue
  productionTelemetry: ProductionTelemetry;
  niaMode: "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF";
  activeBlockingEventId: string | null;
  factions: Array<{
    id: string;
    name: string;
    doctrine: string;
    approval_rating: number;
    radicalization_level: number;
    population_pct: number;
    demands: string[];
    color: string;
  }>;
  decrees: Decree[];
  rivalArchons: RivalArchon[];
  celestialBodies: CelestialBody[];
  events: RoguelikeEvent[];
  journalItems: JournalItem[];
  persistentFlags: string[];
  playerStats: Record<string, number>;
  activeAlerts: Array<{ id: string; message: string; severity: "INFO" | "WARNING" | "CRITICAL" | "FATAL"; tick: number }>;
  isGameOver: boolean;
  gameOverReason: string | null;
  currentEraIndex: number; // 1 to 12
  currentSubEraIndex: number; // 1 to 12
  subEraProgressTicks: number;
  subEraTargetTicks: number;
  historyDeltas: Array<{
    sol: number;
    population: number;
    energy: number;
    biomass: number;
    o2: number;
    stability: number;
  }>;
}

/** Crée l'état initial complet d'une nouvelle partie à partir du Genesis Payload */
export function createInitialGameState(genesis: GenesisLorePayload): GameState {
  const initRes = genesis.pillar_3_specialization.initial_resources;
  const planetConfig = PLANET_PRESETS[genesis.pillar_2_environment.target_planet] || PLANET_PRESETS.KAELIS_CRUST;
  const systemConfig = STAR_SYSTEM_PRESETS[genesis.pillar_2_environment.star_system] || STAR_SYSTEM_PRESETS.ORION_SIGMA;

  // Création des rivaux IA
  const rivals: RivalArchon[] = [];
  const rivalNames = ["Gouverneur Valerius", "Gouverneure Séléné", "Gouverneur Vane", "Gouverneur Kael", "Gouverneure Lyra"];
  const archetypes: Array<"TECHNOCRATE" | "MILITARISTE" | "DIPLOMATE" | "EXPANSIONNISTE"> = [
    "TECHNOCRATE",
    "MILITARISTE",
    "DIPLOMATE",
    "EXPANSIONNISTE",
  ];

  for (let i = 0; i < genesis.pillar_4_lore_refinement.ai_rival_archons_count; i++) {
    const rRng = pcg32(genesis.master_seed + i * 997);
    rivals.push({
      id: `RIVAL-${i + 1}`,
      name: rivalNames[i % rivalNames.length],
      avatarSeed: `rival-${i}`,
      archetype: archetypes[i % archetypes.length],
      colonyName: `Colonie ${i === 0 ? "Obsidienne" : i === 1 ? "Aurore" : "Vanguard"}`,
      population: Math.floor(1200 + rRng() * 1500),
      militaryPower: Math.floor(40 + rRng() * 50),
      techLevel: 1,
      wealthCR: Math.floor(500 + rRng() * 1000),
      reputationWithPlayer: 0,
      pactStatus: "NEUTRAL",
      lastAction: "Déploiement initial des dômes",
      systemLocation: "Orbite Géostationnaire",
    });
  }

  // Bâtiments de départ
  const initBuildings: InstalledBuilding[] = [
    {
      building_instance_id: `${genesis.pillar_1_governance.uuid_prefix}-BLD-01`,
      blueprint_id: "SOLAR_ARRAY",
      name: "Réseau de Collecteurs Solaires",
      category: "ENE",
      position: { x: 2, y: 2, z: "Z_ZERO_DOME", sector_id: "SEC-01" },
      status: "NOMINAL",
      integrity_pct: 100,
      power_consumption_mw: 0,
      personnel_assigned: 4,
      inputs_met_pct: 100,
      age_sols: 0,
    },
    {
      building_instance_id: `${genesis.pillar_1_governance.uuid_prefix}-BLD-02`,
      blueprint_id: "HYDROPONIC_DOME",
      name: "Dôme Hydroponique Central",
      category: "AGR",
      position: { x: 3, y: 2, z: "Z_ZERO_DOME", sector_id: "SEC-05" },
      status: "NOMINAL",
      integrity_pct: 100,
      power_consumption_mw: 20,
      personnel_assigned: 12,
      inputs_met_pct: 100,
      age_sols: 0,
    },
    {
      building_instance_id: `${genesis.pillar_1_governance.uuid_prefix}-BLD-03`,
      blueprint_id: "HABITATION_POD",
      name: "Capsules d'Habitation Modulaires",
      category: "HAB",
      position: { x: 4, y: 2, z: "Z_ZERO_DOME", sector_id: "SEC-09" },
      status: "NOMINAL",
      integrity_pct: 100,
      power_consumption_mw: 15,
      personnel_assigned: 0,
      inputs_met_pct: 100,
      age_sols: 0,
    },
    {
      building_instance_id: `${genesis.pillar_1_governance.uuid_prefix}-BLD-04`,
      blueprint_id: "ATMOSPHERIC_SCRUBBER",
      name: "Épurateur Atmosphérique",
      category: "ENE",
      position: { x: 2, y: 3, z: "Z_ZERO_DOME", sector_id: "SEC-02" },
      status: "NOMINAL",
      integrity_pct: 100,
      power_consumption_mw: 25,
      personnel_assigned: 6,
      inputs_met_pct: 100,
      age_sols: 0,
    },
  ];

  // Statistiques dérivées du Leader / Spécialisation
  const playerStats: Record<string, number> = {
    HACKING: 12,
    INGENIERIE: 14,
    DIPLOMATIE: 11,
    COMMANDEMENT: 13,
    SCIENCE: 12,
    SURVIE: 10,
  };

  // Ajustement des stats selon le profil du leader
  const archetype = genesis.pillar_1_governance.leader_profile.mandate.archetype;
  if (archetype === "TECHNOCRATE_CYBERNETIQUE") {
    playerStats.INGENIERIE += 3;
    playerStats.SCIENCE += 2;
    playerStats.HACKING += 2;
  } else if (archetype === "COMMANDANT_MARTIAL") {
    playerStats.COMMANDEMENT += 4;
    playerStats.SURVIE += 2;
  } else if (archetype === "DIPLOMATE_HUMANISTE") {
    playerStats.DIPLOMATIE += 4;
    playerStats.COMMANDEMENT += 1;
  }

  // Micro-logs initiaux du Journal
  const initialMicroLogs: MicroLogItem[] = [
    createMicroLog("SYSTEM", "SYS-BOOT-01", "Amorçage nominal du noyau réacteur & bus de survie de l'Arche.", 2, 1, 0, 1),
    createMicroLog("RESOURCE", "RES-INIT-01", `Calibrage des réserves vitales : O2 (${initRes.oxygen_l} L), Eau (${initRes.water_l} L), Deutérium (${initRes.deuterium_kg} kg).`, 2, 1, 1, 1),
    createMicroLog("CREW", "CRW-INIT-01", `Décongélation du contingent d'amorce : 850 colons affectés aux dômes primaires.`, 1, 1, 2, 1),
    createMicroLog("ENVIRONMENT", "ENV-INIT-01", `Accrochage orbital réussi autour de ${planetConfig.name}. Pression: ${planetConfig.p_atm} atm, Temp: ${planetConfig.base_temp_c}°C.`, 3, 1, 3, 1),
  ];

  // Premier Super-Événement déterministe (Tour 1)
  const initialSuperEvent = generateDeterministicSuperEvent(
    genesis.master_seed,
    1,
    1.0,
    initialMicroLogs,
    [],
    genesis
  );

  const initialJournal: JournalItem[] = [
    ...initialMicroLogs,
    initialSuperEvent,
  ];

  const activePop = 850;
  const stasisPop = 50000;

  const initialTelemetry: ProductionTelemetry = {
    energy_produced_gw: 120,
    energy_consumed_gw: 60,
    net_energy_gw: 60,
    o2_produced_l: 950,
    o2_consumed_l: 850 * 0.8,
    net_o2_l: 270,
    water_produced_l: 1400,
    water_consumed_l: 850 * 1.5,
    net_water_l: 125,
    biomass_produced_kg: 420,
    biomass_consumed_kg: 850 * 0.4,
    net_biomass_kg: 80,
    alloys_produced_t: 12,
    deuterium_produced_kg: 5,
    grid_power_satisfaction_pct: 100,
    active_jobs_capacity: 1200,
    active_housing_capacity: 1000,
  };

  return {
    genesis,
    clock: createInitialClock(),
    resources: {
      biomass_kg: initRes.biomass_kg,
      oxygen_l: initRes.oxygen_l,
      water_l: initRes.water_l,
      energy_gw: initRes.energy_gw,
      alloys_tonnes: initRes.alloys_tonnes,
      deuterium_kg: initRes.deuterium_kg,
      credits_cr: 1000,
      population_total: activePop + stasisPop,
      population_active: activePop,
      population_in_stasis: stasisPop,
    },
    climate: {
      surface_temp_c: planetConfig.base_temp_c,
      atmosphere_p_atm: planetConfig.p_atm,
      radiance_w_m2: 1361,
      silica_storm_active: false,
      ion_storm_active: false,
      weather_description: "Atmosphère stable. Télémétrie orbitale nominale.",
    },
    sectors: INITIAL_SECTORS.map((s) => ({ ...s })),
    buildings: initBuildings,
    buildQueue: [],
    productionQueue: [],
    productionTelemetry: initialTelemetry,
    niaMode: genesis.pillar_4_lore_refinement.nia_mode || "AUTO",
    activeBlockingEventId: null,
    factions: genesis.pillar_1_governance.factions.map((f) => ({
      id: f.id,
      name: f.name,
      doctrine: f.doctrine,
      approval_rating: f.approval_rating,
      radicalization_level: f.radicalization_level,
      population_pct: f.population_pct,
      demands: f.demands,
      color: f.color,
    })),
    decrees: INITIAL_DECREES.map((d) => ({ ...d })),
    rivalArchons: rivals,
    celestialBodies: INITIAL_CELESTIAL_BODIES.map((c) => ({ ...c })),
    events: [getDeterministicFallbackEvent(genesis.master_seed, 1, genesis)],
    journalItems: initialJournal,
    persistentFlags: ["EXPEDITION_INAUGURATED"],
    playerStats,
    activeAlerts: [],
    isGameOver: false,
    gameOverReason: null,
    currentEraIndex: 1,
    currentSubEraIndex: 1,
    subEraProgressTicks: 0,
    subEraTargetTicks: 60,
    historyDeltas: [
      {
        sol: 1,
        population: activePop,
        energy: initRes.energy_gw,
        biomass: initRes.biomass_kg,
        o2: initRes.oxygen_l,
        stability: genesis.pillar_1_governance.senate_stability,
      },
    ],
  };
}

/** Simulation step : exécute un pas de temps déterministe (deltaTicks) */
export function stepSimulation(state: GameState, deltaTicks: number = 1): GameState {
  if (state.isGameOver || deltaTicks <= 0) return state;

  // VERIFICATION DU BLOCAGE DU TEMPS ET DU FIL EVENT LOG (GIGA / MEGA / OMEGA / SUPER EVENTS)
  const hasBlockingSuperEvent = state.journalItems.some(
    (item) =>
      item.type === "SUPER_EVENT" &&
      (item as SuperEventItem).status === "PENDING" &&
      ((item as SuperEventItem).isTimeBlocking ||
        (item as SuperEventItem).tier === "GIGA" ||
        (item as SuperEventItem).tier === "MEGA" ||
        (item as SuperEventItem).tier === "OMEGA" ||
        (item as SuperEventItem).tier === "SUPER")
  );
  const hasBlockingRoguelikeEvent = state.events.some(
    (e) =>
      !e.resolved &&
      (e.isTimeBlocking || e.tier === "GIGA" || e.tier === "MEGA" || e.tier === "OMEGA" || e.tier === "SUPER")
  );

  if (hasBlockingSuperEvent || hasBlockingRoguelikeEvent) {
    // Le temps et la télémétrie sont strictement gelés, l'utilisateur doit résoudre le dilemme
    return {
      ...state,
      clock: {
        ...state.clock,
        isPaused: true,
      },
      activeBlockingEventId: state.activeBlockingEventId || (hasBlockingSuperEvent ? "SUPER_EVENT" : "EVENT"),
    };
  }

  let currentClock = state.clock;
  let resources = { ...state.resources };
  let climate = { ...state.climate };
  let sectors = [...state.sectors];
  let buildings = [...state.buildings];
  let buildQueue = [...(state.buildQueue || [])];
  let productionQueue = [...(state.productionQueue || [])];
  let leader = { ...state.genesis.pillar_1_governance.leader_profile };
  let senateStability = state.genesis.pillar_1_governance.senate_stability;
  let factions = [...state.factions];
  let activeAlerts = [...state.activeAlerts];
  let events = [...state.events];
  let journalItems = [...(state.journalItems || [])];
  let persistentFlags = [...(state.persistentFlags || [])];
  let playerStats = { ...(state.playerStats || {}) };
  let historyDeltas = [...state.historyDeltas];
  let rivalArchons = [...state.rivalArchons];
  let currentEraIndex = state.currentEraIndex || 1;
  let currentSubEraIndex = state.currentSubEraIndex || 1;
  let subEraProgressTicks = (state.subEraProgressTicks || 0) + deltaTicks;
  let subEraTargetTicks = state.subEraTargetTicks || 60;
  const niaMode = state.niaMode || "AUTO";

  // Check sub-era progression
  if (subEraProgressTicks >= subEraTargetTicks) {
    subEraProgressTicks = 0;
    currentSubEraIndex += 1;
    if (currentSubEraIndex > 12) {
      currentSubEraIndex = 1;
      if (currentEraIndex < 12) {
        currentEraIndex += 1;
      }
    }
    journalItems.push(
      createMicroLog(
        "SYSTEM",
        "ERA-ADVANCE",
        `Progression Coloniale : Passage au Palier Ère ${currentEraIndex}.${currentSubEraIndex}`,
        2,
        currentClock.sol,
        currentClock.tickInSol,
        currentClock.tour
      )
    );
  }

  const rng = mulberry32(state.genesis.master_seed + state.clock.tick);

  for (let t = 0; t < deltaTicks; t++) {
    const nextClock = advanceClockByTicks(currentClock, 1);
    const tickInSol = nextClock.tickInSol;
    const isNewSol = nextClock.sol !== currentClock.sol;

    // === 1. THERMODYNAMIQUE & CLIMAT & SAISONS ===
    const orbitalPhase = (nextClock.solInCycle / 360) * Math.PI * 2;
    const orbitalDistMod = 1 + 0.1 * Math.sin(orbitalPhase);
    climate.radiance_w_m2 = Math.round(1360 * (1 / (orbitalDistMod * orbitalDistMod)));

    // Calcul de la saison et des modificateurs physiques
    const solInYear = nextClock.solInCycle % 360;
    let seasonName: "PRINTANIER" | "ESTIVAL" | "AUTOMNAL" | "HIVERNAL" = "PRINTANIER";
    let seasonProg = Math.round(((solInYear % 90) / 90) * 100);
    let tempBase = -25;
    let seasonProdMult = 1.0;
    let seasonMoraleImpact = 0;

    if (solInYear < 90) {
      seasonName = "PRINTANIER";
      tempBase = -10 + Math.sin((solInYear / 90) * Math.PI) * 15;
      seasonProdMult = 1.05;
      seasonMoraleImpact = 5;
    } else if (solInYear < 180) {
      seasonName = "ESTIVAL";
      tempBase = 15 + Math.sin(((solInYear - 90) / 90) * Math.PI) * 20;
      seasonProdMult = 1.25;
      seasonMoraleImpact = 10;
    } else if (solInYear < 270) {
      seasonName = "AUTOMNAL";
      tempBase = 0 - Math.sin(((solInYear - 180) / 90) * Math.PI) * 20;
      seasonProdMult = 0.90;
      seasonMoraleImpact = -4;
    } else {
      seasonName = "HIVERNAL";
      tempBase = -45 - Math.sin(((solInYear - 270) / 90) * Math.PI) * 25;
      seasonProdMult = 0.75;
      seasonMoraleImpact = -12;
    }

    climate.surface_temp_c = Math.round(tempBase);
    climate.season = seasonName;
    climate.season_progress_pct = seasonProg;

    if (tickInSol === 0) {
      // Évaluation météo quotidienne
      climate.silica_storm_active = rng() < 0.14;
      climate.ion_storm_active = rng() < 0.09;

      if (climate.silica_storm_active) {
        climate.weather_description = `Saison ${seasonName} — ALERTE : Tempête de silice violente. Rendement éolien et solaire réduit de 40%.`;
        journalItems.push(
          createMicroLog("ENVIRONMENT", "ENV-WTR-01", `Tempête de silice planétaire (${seasonName}). Rendement solaire réduit.`, 3, nextClock.sol, tickInSol, nextClock.tour, { energy_gw: -5 })
        );
        if (!activeAlerts.some((a) => a.id === `STORM-${nextClock.sol}`)) {
          activeAlerts.unshift({
            id: `STORM-${nextClock.sol}`,
            message: `Tempête de silice planétaire (${seasonName}).`,
            severity: "WARNING",
            tick: nextClock.tick,
          });
        }
      } else if (climate.ion_storm_active) {
        climate.weather_description = `Saison ${seasonName} — Orage ionique en haute atmosphère. Micro-interférences télémétriques N.I.A.`;
        journalItems.push(
          createMicroLog("ENVIRONMENT", "ENV-WTR-02", `Orage ionique haute altitude (${seasonName}). Télémétrie perturbée.`, 2, nextClock.sol, tickInSol, nextClock.tour)
        );
      } else {
        climate.weather_description = `Saison ${seasonName} — Conditions climatiques nominales (${climate.surface_temp_c}°C).`;
      }
    }

    let netProdMultiplier = seasonProdMult;
    let netHappinessImpact = seasonMoraleImpact;
    if (climate.silica_storm_active) {
      netProdMultiplier *= 0.65;
      netHappinessImpact -= 15;
    }
    if (climate.ion_storm_active) {
      netProdMultiplier *= 0.90;
      netHappinessImpact -= 5;
    }

    climate.silica_dust_density_g_m3 = climate.silica_storm_active ? 5.2 : 0.3;
    climate.radiation_level_sv_h = climate.ion_storm_active ? 2.8 : 0.12;
    climate.geothermal_flux_mw = 1850;
    climate.production_multiplier = Number(netProdMultiplier.toFixed(2));
    climate.population_happiness_impact = netHappinessImpact;

    // === 2. AVANCEMENT DE LA FILE JOUEUR (BUILD QUEUE) ===
    if (buildQueue.length > 0) {
      const activeQueueItem = buildQueue[0];
      activeQueueItem.progress_ticks += 1;

      if (activeQueueItem.progress_ticks >= activeQueueItem.total_duration_ticks) {
        // Construction achevée
        const completedItem = buildQueue.shift()!;
        const bp = BUILDING_BLUEPRINTS[completedItem.blueprint_id];
        const newInstalledBuilding: InstalledBuilding = {
          building_instance_id: `${state.genesis.pillar_1_governance.uuid_prefix}-BLD-${nextClock.tick.toString(36)}`,
          blueprint_id: completedItem.blueprint_id,
          name: completedItem.name,
          category: completedItem.category,
          position: completedItem.position,
          status: "NOMINAL",
          integrity_pct: 100,
          power_consumption_mw: bp?.base_inputs.energy_gw || 5,
          personnel_assigned: 15,
          inputs_met_pct: 100,
          age_sols: 0,
        };
        buildings.push(newInstalledBuilding);

        journalItems.push(
          createMicroLog(
            "SYSTEM",
            "SYS-BLD-COMP",
            `Chantier Joueur finalisé : ${completedItem.name} déployé en (${completedItem.position.x}, ${completedItem.position.y}) [${completedItem.position.sector_id}].`,
            2,
            nextClock.sol,
            tickInSol,
            nextClock.tour
          )
        );

        activeAlerts.unshift({
          id: `BLD-DONE-${nextClock.tick}`,
          message: `Construction terminée : ${completedItem.name}`,
          severity: "INFO",
          tick: nextClock.tick,
        });
      }
    }

    // === 2B. AVANCEMENT DE LA FILE ENGINE AUTONOME (PRODUCTION QUEUE) ===
    if (productionQueue.length > 0) {
      const activeProdItem = productionQueue[0];
      activeProdItem.progress_ticks += 1;

      if (activeProdItem.progress_ticks >= activeProdItem.total_duration_ticks) {
        const completedProdItem = productionQueue.shift()!;
        const bp = BUILDING_BLUEPRINTS[completedProdItem.blueprint_id];
        const newInstalledBuilding: InstalledBuilding = {
          building_instance_id: `${state.genesis.pillar_1_governance.uuid_prefix}-AUTONIA-${nextClock.tick.toString(36)}`,
          blueprint_id: completedProdItem.blueprint_id,
          name: completedProdItem.name,
          category: completedProdItem.category,
          position: completedProdItem.position,
          status: "NOMINAL",
          integrity_pct: 100,
          power_consumption_mw: bp?.base_inputs.energy_gw || 5,
          personnel_assigned: 12,
          inputs_met_pct: 100,
          age_sols: 0,
        };
        buildings.push(newInstalledBuilding);

        journalItems.push(
          createMicroLog(
            "SYSTEM",
            "NIA-AUTOBUILD-COMP",
            `N.I.A. Engine Chantier finalisé : ${completedProdItem.name} déployé en (${completedProdItem.position.x}, ${completedProdItem.position.y}) [File Engine Autonome].`,
            2,
            nextClock.sol,
            tickInSol,
            nextClock.tour
          )
        );

        activeAlerts.unshift({
          id: `PROD-DONE-${nextClock.tick}`,
          message: `N.I.A. Auto-Chantier terminé : ${completedProdItem.name}`,
          severity: "INFO",
          tick: nextClock.tick,
        });
      }
    }

    // === 3. MOTEUR DE GESTION AUTONOME (MONITORING SURPLUS & ENQUEUE IN PRODUCTION QUEUE) ===
    if (isNewSol && (niaMode === "AUTO" || niaMode === "REGULE")) {
      const niaResult = BuildingManagementEngine.processNiaAutoBuild({
        ...state,
        clock: nextClock,
        resources,
        buildings,
        buildQueue,
        productionQueue,
        journalItems,
      });

      resources = niaResult.updatedResources;
      buildings = niaResult.updatedBuildings;
      productionQueue = niaResult.updatedProductionQueue;
      if (niaResult.logs.length > 0) {
        journalItems.push(...niaResult.logs);
      }
    }

    // === 4. PRODUCTION ICOM & ALGORITHMES DE FLUX VITALISANTS ===
    const activePop = resources.population_active;
    const o2ConsumedPerTick = (activePop * 0.8) / 24;
    const waterConsumedPerTick = (activePop * 1.5) / 24;
    const biomassConsumedPerTick = (activePop * 0.4) / 24;

    resources.oxygen_l = Math.max(0, resources.oxygen_l - o2ConsumedPerTick);
    resources.water_l = Math.max(0, resources.water_l - waterConsumedPerTick);
    resources.biomass_kg = Math.max(0, resources.biomass_kg - biomassConsumedPerTick);

    let energyProduced = 0;
    let energyConsumed = 0;
    let o2Produced = 0;
    let waterProduced = 0;
    let biomassProduced = 0;
    let alloysProduced = 0;
    let deuteriumProduced = 0;

    buildings.forEach((bld) => {
      const blueprint = BUILDING_BLUEPRINTS[bld.blueprint_id];
      if (!blueprint) return;

      const climateProdMult = climate.production_multiplier || 1.0;
      const efficiency = (bld.integrity_pct / 100) * climateProdMult;
      const bldEnergyNeed = (bld.power_consumption_mw / 24);
      energyConsumed += bldEnergyNeed;

      if (blueprint.base_outputs.oxygen_l) {
        const out = (blueprint.base_outputs.oxygen_l * efficiency) / 24;
        resources.oxygen_l += out;
        o2Produced += out * 24;
      }
      if (blueprint.base_outputs.water_l) {
        const out = (blueprint.base_outputs.water_l * efficiency) / 24;
        resources.water_l += out;
        waterProduced += out * 24;
      }
      if (blueprint.base_outputs.biomass_kg) {
        const out = (blueprint.base_outputs.biomass_kg * efficiency) / 24;
        resources.biomass_kg += out;
        biomassProduced += out * 24;
      }
      if (blueprint.base_outputs.energy_gw) {
        const out = (blueprint.base_outputs.energy_gw * efficiency) / 24;
        energyProduced += out;
      }
      if (blueprint.base_outputs.alloys_tonnes) {
        const out = (blueprint.base_outputs.alloys_tonnes * efficiency) / 24;
        resources.alloys_tonnes += out;
        alloysProduced += out * 24;
      }
      if (blueprint.base_outputs.deuterium_kg) {
        const out = (blueprint.base_outputs.deuterium_kg * efficiency) / 24;
        resources.deuterium_kg += out;
        deuteriumProduced += out * 24;
      }

      // Usure continue par Sol
      if (tickInSol === 0) {
        bld.age_sols += 1;
        const wearRate = climate.silica_storm_active ? 0.8 : 0.2;
        bld.integrity_pct = Math.max(0, bld.integrity_pct - wearRate);

        if (bld.integrity_pct > 75) bld.status = "NOMINAL";
        else if (bld.integrity_pct > 40) bld.status = "DEGRADE";
        else if (bld.integrity_pct > 10) bld.status = "AVARIE";
        else bld.status = "BRECHE_HERMETIQUE";
      }
    });

    // Bilan énergétique net
    const netEnergyPerTick = energyProduced - energyConsumed + 1.0 / 24; // Base ship minimal generator
    resources.energy_gw = Math.max(0, Math.min(2500, resources.energy_gw + netEnergyPerTick));

    // Calcul de la télémétrie inter-moteurs
    const telemetry: ProductionTelemetry = {
      energy_produced_gw: Number((energyProduced * 24 + 1.0).toFixed(1)),
      energy_consumed_gw: Number((energyConsumed * 24).toFixed(1)),
      net_energy_gw: Number(((energyProduced - energyConsumed) * 24 + 1.0).toFixed(1)),
      o2_produced_l: Math.round(o2Produced),
      o2_consumed_l: Math.round(activePop * 0.8),
      net_o2_l: Math.round(o2Produced - activePop * 0.8),
      water_produced_l: Math.round(waterProduced),
      water_consumed_l: Math.round(activePop * 1.5),
      net_water_l: Math.round(waterProduced - activePop * 1.5),
      biomass_produced_kg: Math.round(biomassProduced),
      biomass_consumed_kg: Math.round(activePop * 0.4),
      net_biomass_kg: Math.round(biomassProduced - activePop * 0.4),
      alloys_produced_t: Number(alloysProduced.toFixed(1)),
      deuterium_produced_kg: Number(deuteriumProduced.toFixed(1)),
      grid_power_satisfaction_pct: energyConsumed > 0 ? Math.min(100, Math.round(((energyProduced * 24 + 1.0) / (energyConsumed * 24)) * 100)) : 100,
      active_jobs_capacity: 1200 + buildings.length * 50,
      active_housing_capacity: 1000 + buildings.filter((b) => b.category === "HAB").length * 250,
    };

    // === 5. SANTE DU LEADER & COHESION CIVIQUE ===
    if (isNewSol) {
      leader.biological_age_sols += 1;
      leader.chronological_age_sols += 1;

      // Micro-log de bilan périodique des ressources
      if (nextClock.sol % 2 === 0) {
        journalItems.push(
          createMicroLog(
            "RESOURCE",
            "RES-BAL-01",
            `Bilan Sol ${nextClock.sol} : O2 ${Math.round(resources.oxygen_l)}L · Eau ${Math.round(resources.water_l)}L · Énergie ${Math.round(resources.energy_gw)}GW · Stabilité ${Math.round(senateStability)}%.`,
            1,
            nextClock.sol,
            0,
            nextClock.tour
          )
        );
      }

      // Dégradation si pénurie de ressources
      if (resources.oxygen_l <= 0 || resources.water_l <= 0) {
        leader.overall_health_pct = Math.max(0, leader.overall_health_pct - 5);
        leader.happiness_pct = Math.max(0, leader.happiness_pct - 10);
        senateStability = Math.max(0, senateStability - 8);

        journalItems.push(
          createMicroLog("RESOURCE", "RES-ALERT-CRIT", "PÉNURIE VITALISANTE CRITIQUE : Les fluides vitaux sont épuisés dans les dômes !", 5, nextClock.sol, 0, nextClock.tour)
        );

        activeAlerts.unshift({
          id: `CRISIS-${nextClock.sol}`,
          message: "PÉNURIE VITALISANTE CRITIQUE : Les dômes manquent de fluides vitaux !",
          severity: "FATAL",
          tick: nextClock.tick,
        });
      } else {
        // Récupération naturelle lente
        leader.overall_health_pct = Math.min(100, leader.overall_health_pct + 0.5);
      }

      // Simulation des Archontes IA
      rivalArchons = rivalArchons.map((archon, idx) => {
        const arRng = pcg32(state.genesis.master_seed + nextClock.sol * 101 + idx);
        const growth = Math.floor(archon.population * (0.01 + arRng() * 0.02));
        return {
          ...archon,
          population: archon.population + growth,
          wealthCR: archon.wealthCR + Math.floor(arRng() * 30),
          militaryPower: Math.min(100, archon.militaryPower + (arRng() > 0.6 ? 1 : 0)),
        };
      });

      // Super-Événement périodique (tous les 4 Sols)
      const hasPendingSuperEvent = journalItems.some(
        (item) => item.type === "SUPER_EVENT" && (item as SuperEventItem).status === "PENDING"
      );
      if (nextClock.sol % 4 === 0 && !hasPendingSuperEvent) {
        const recentMicroLogs = journalItems
          .filter((i): i is MicroLogItem => i.type === "MICRO_LOG")
          .slice(-6);

        const newSuperEvent = generateDeterministicSuperEvent(
          state.genesis.master_seed,
          nextClock.tour,
          nextClock.sol,
          recentMicroLogs,
          persistentFlags,
          state.genesis
        );
        journalItems.push(newSuperEvent);

        const isTimeBlocking = newSuperEvent.isTimeBlocking || newSuperEvent.tier === "GIGA" || newSuperEvent.tier === "OMEGA";
        if (isTimeBlocking) {
          nextClock.isPaused = true;
        }

        activeAlerts.unshift({
          id: `EVT-SUPER-${newSuperEvent.eventId}`,
          message: `⚡ [${newSuperEvent.tier || "SUPER"}] ${newSuperEvent.title}${isTimeBlocking ? " (TEMPS BLOQUÉ)" : ""}`,
          severity: isTimeBlocking ? "CRITICAL" : "WARNING",
          tick: nextClock.tick,
        });
      }

      // Événement périodique ou d'alerte (fallback)
      const shouldTriggerEvent = nextClock.sol % 4 === 0 && events.filter((e) => !e.resolved).length < 2;
      if (shouldTriggerEvent) {
        const fallbackEvent = getDeterministicFallbackEvent(state.genesis.master_seed, nextClock.sol, state.genesis);
        events.unshift(fallbackEvent);
        activeAlerts.unshift({
          id: `EVT-ALERT-${fallbackEvent.event_id}`,
          message: `${fallbackEvent.severity}: ${fallbackEvent.narrative.message.substring(0, 60)}...`,
          severity: fallbackEvent.severity,
          tick: nextClock.tick,
        });
      }

      // Historique
      historyDeltas.push({
        sol: nextClock.sol,
        population: resources.population_active,
        energy: Math.round(resources.energy_gw),
        biomass: Math.round(resources.biomass_kg),
        o2: Math.round(resources.oxygen_l),
        stability: Math.round(senateStability),
      });
      if (historyDeltas.length > 50) historyDeltas.shift();
    }

    // Conditions de Game Over
    if (resources.population_active <= 0) {
      return {
        ...state,
        clock: nextClock,
        isGameOver: true,
        gameOverReason: "Extinction démographique totale de la colonie.",
      };
    }
    if (leader.overall_health_pct <= 0 && senateStability <= 0) {
      return {
        ...state,
        clock: nextClock,
        isGameOver: true,
        gameOverReason: "Faillite du commandement et incapacité biologique du Gouverneur d'Expédition.",
      };
    }

    currentClock = nextClock;
  }

  // Calcul final de télémétrie si non calculée
  const lastActivePop = resources.population_active;
  const finalTelemetry: ProductionTelemetry = state.productionTelemetry || {
    energy_produced_gw: 120,
    energy_consumed_gw: 60,
    net_energy_gw: 60,
    o2_produced_l: 950,
    o2_consumed_l: lastActivePop * 0.8,
    net_o2_l: 270,
    water_produced_l: 1400,
    water_consumed_l: lastActivePop * 1.5,
    net_water_l: 125,
    biomass_produced_kg: 420,
    biomass_consumed_kg: lastActivePop * 0.4,
    net_biomass_kg: 80,
    alloys_produced_t: 12,
    deuterium_produced_kg: 5,
    grid_power_satisfaction_pct: 100,
    active_jobs_capacity: 1200,
    active_housing_capacity: 1000,
  };

  return {
    ...state,
    clock: currentClock,
    resources,
    climate,
    sectors,
    buildings,
    buildQueue,
    productionQueue,
    productionTelemetry: finalTelemetry,
    activeBlockingEventId: null,
    rivalArchons,
    events,
    journalItems: journalItems.slice(-150),
    persistentFlags,
    playerStats,
    activeAlerts: activeAlerts.slice(0, 15),
    historyDeltas,
    currentEraIndex,
    currentSubEraIndex,
    subEraProgressTicks,
    subEraTargetTicks,
    genesis: {
      ...state.genesis,
      pillar_1_governance: {
        ...state.genesis.pillar_1_governance,
        leader_profile: leader,
        senate_stability: senateStability,
        factions,
      },
    },
  };
}

/** Résout un choix de Super-Événement dans le GameState (avec jet D20 + Stat vs DC) */
export function resolveSuperEventInState(
  state: GameState,
  superEventId: string,
  choiceId: string,
  forcedDiceRoll?: number
): GameState {
  const superEvent = state.journalItems.find(
    (item): item is SuperEventItem => item.type === "SUPER_EVENT" && (item as SuperEventItem).eventId === superEventId
  );
  if (!superEvent || superEvent.status === "RESOLVED") return state;

  const choice = superEvent.choices.find((c) => c.choiceId === choiceId);
  if (!choice) return state;

  const clonedSuperEvent: SuperEventItem = {
    ...superEvent,
    choices: [...superEvent.choices] as [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption],
  };

  const { resolutionLog, stateUpdates } = resolveSuperEventChoice(
    clonedSuperEvent,
    choice,
    state.clock.sol,
    state.clock.tour,
    state.playerStats,
    forcedDiceRoll
  );

  let resources = { ...state.resources };
  let senateStability = state.genesis.pillar_1_governance.senate_stability;
  let leader = { ...state.genesis.pillar_1_governance.leader_profile };
  let persistentFlags = [...(state.persistentFlags || [])];

  // Application des deltas de ressources
  if (stateUpdates.deltas.energy_gw) resources.energy_gw = Math.max(0, resources.energy_gw + stateUpdates.deltas.energy_gw);
  if (stateUpdates.deltas.biomass_kg) resources.biomass_kg = Math.max(0, resources.biomass_kg + stateUpdates.deltas.biomass_kg);
  if (stateUpdates.deltas.oxygen_l) resources.oxygen_l = Math.max(0, resources.oxygen_l + stateUpdates.deltas.oxygen_l);
  if (stateUpdates.deltas.alloys_tonnes) resources.alloys_tonnes = Math.max(0, resources.alloys_tonnes + stateUpdates.deltas.alloys_tonnes);
  if (stateUpdates.deltas.deuterium_kg) resources.deuterium_kg = Math.max(0, resources.deuterium_kg + stateUpdates.deltas.deuterium_kg);
  if (stateUpdates.deltas.credits_cr) resources.credits_cr = Math.max(0, resources.credits_cr + stateUpdates.deltas.credits_cr);
  if (stateUpdates.deltas.stability_delta) senateStability = Math.max(0, Math.min(100, senateStability + stateUpdates.deltas.stability_delta));
  if (stateUpdates.deltas.leader_fatigue) leader.fatigue_pct = Math.min(100, leader.fatigue_pct + stateUpdates.deltas.leader_fatigue);

  // Application des drapeaux
  stateUpdates.addFlags.forEach((flag) => {
    if (!persistentFlags.includes(flag)) persistentFlags.push(flag);
  });
  if (stateUpdates.removeFlags.length > 0) {
    persistentFlags = persistentFlags.filter((f) => !stateUpdates.removeFlags.includes(f));
  }

  // Remplacement de l'événement et ajout du log de résolution
  const updatedJournalItems = state.journalItems.map((item) =>
    item.type === "SUPER_EVENT" && (item as SuperEventItem).eventId === superEventId ? clonedSuperEvent : item
  );
  updatedJournalItems.push(resolutionLog);

  // Débloquer le temps si c'était l'événement bloquant
  const remainingBlocking = updatedJournalItems.some(
    (item) => item.type === "SUPER_EVENT" && (item as SuperEventItem).status === "PENDING" && ((item as SuperEventItem).isTimeBlocking || (item as SuperEventItem).tier === "GIGA" || (item as SuperEventItem).tier === "OMEGA")
  );

  return {
    ...state,
    clock: {
      ...state.clock,
      isPaused: remainingBlocking ? true : false,
    },
    activeBlockingEventId: remainingBlocking ? state.activeBlockingEventId : null,
    resources,
    persistentFlags,
    journalItems: updatedJournalItems.slice(-150),
    genesis: {
      ...state.genesis,
      pillar_1_governance: {
        ...state.genesis.pillar_1_governance,
        senate_stability: senateStability,
        leader_profile: leader,
      },
    },
  };
}

/** Résout un choix d'événement roguelike et applique ses conséquences mathématiques */
export function resolveEventChoice(
  state: GameState,
  eventId: string,
  choiceId: string
): GameState {
  const event = state.events.find((e) => e.event_id === eventId);
  if (!event || event.resolved) return state;

  const choice = event.roguelike_choices.find((c) => c.choice_id === choiceId);
  if (!choice) return state;

  let resources = { ...state.resources };
  let senateStability = state.genesis.pillar_1_governance.senate_stability;
  let leader = { ...state.genesis.pillar_1_governance.leader_profile };
  let factions = [...state.genesis.pillar_1_governance.factions];

  // 1. Déduction des coûts
  if (choice.cost.energy_gw) resources.energy_gw = Math.max(0, resources.energy_gw - choice.cost.energy_gw);
  if (choice.cost.biomass_kg) resources.biomass_kg = Math.max(0, resources.biomass_kg - choice.cost.biomass_kg);
  if (choice.cost.oxygen_l) resources.oxygen_l = Math.max(0, resources.oxygen_l - choice.cost.oxygen_l);
  if (choice.cost.water_l) resources.water_l = Math.max(0, resources.water_l - choice.cost.water_l);
  if (choice.cost.alloys_tonnes) resources.alloys_tonnes = Math.max(0, resources.alloys_tonnes - choice.cost.alloys_tonnes);
  if (choice.cost.deuterium_kg) resources.deuterium_kg = Math.max(0, resources.deuterium_kg - choice.cost.deuterium_kg);
  if (choice.cost.leader_fatigue) leader.fatigue_pct = Math.min(100, leader.fatigue_pct + choice.cost.leader_fatigue);

  // 2. Application des gains / pertes
  if (choice.outcomes.stability_delta) {
    senateStability = Math.max(0, Math.min(100, senateStability + choice.outcomes.stability_delta));
  }
  if (choice.outcomes.resource_gain) {
    const g = choice.outcomes.resource_gain;
    if (g.energy_gw) resources.energy_gw += g.energy_gw;
    if (g.biomass_kg) resources.biomass_kg += g.biomass_kg;
    if (g.oxygen_l) resources.oxygen_l += g.oxygen_l;
    if (g.alloys_tonnes) resources.alloys_tonnes += g.alloys_tonnes;
    if (g.deuterium_kg) resources.deuterium_kg += g.deuterium_kg;
  }
  if (choice.outcomes.resource_loss) {
    const l = choice.outcomes.resource_loss;
    if (l.energy_gw) resources.energy_gw = Math.max(0, resources.energy_gw - l.energy_gw);
    if (l.biomass_kg) resources.biomass_kg = Math.max(0, resources.biomass_kg - l.biomass_kg);
  }
  if (choice.outcomes.faction_approval) {
    factions = factions.map((f) => {
      const delta = choice.outcomes.faction_approval?.[f.name] || 0;
      return {
        ...f,
        approval_rating: Math.max(0, Math.min(100, f.approval_rating + delta)),
      };
    });
  }

  // Marquer résolu
  const updatedEvents = state.events.map((e) =>
    e.event_id === eventId ? { ...e, resolved: true, chosen_option_id: choiceId } : e
  );

  return {
    ...state,
    resources,
    events: updatedEvents,
    genesis: {
      ...state.genesis,
      pillar_1_governance: {
        ...state.genesis.pillar_1_governance,
        senate_stability: senateStability,
        leader_profile: leader,
        factions,
      },
    },
  };
}
