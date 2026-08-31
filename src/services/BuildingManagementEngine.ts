import { GameState } from "../simulation/engine";
import { InstalledBuilding, BuildQueueItem } from "../types/simulation";
import { ZLevel } from "../types/genesis";
import { BUILDING_BLUEPRINTS } from "../simulation/constants";
import { createMicroLog } from "../simulation/journalEngine";
import { MicroLogItem } from "../types/journal";

export interface NiaEngineReport {
  actionTaken: boolean;
  actionType?: "NEW_BUILDING" | "UPGRADE_BUILDING" | "REPAIR_BUILDING" | "NONE";
  buildingName?: string;
  reason?: string;
  logs: MicroLogItem[];
}

/**
 * Service autonome N.I.A. pour l'analyse des surplus de ressources,
 * la planification automatique des constructions/upgrades et le maintien des paliers de progression.
 */
export class BuildingManagementEngine {
  /**
   * Analyse les ressources du gameState et planifie automatiquement des tâches de construction ou d'upgrade
   * dans la `productionQueue` (séparée des ordres du joueur).
   */
  public static processNiaAutoBuild(gameState: GameState): {
    updatedBuildQueue: BuildQueueItem[];
    updatedProductionQueue: BuildQueueItem[];
    updatedBuildings: InstalledBuilding[];
    updatedResources: GameState["resources"];
    logs: MicroLogItem[];
  } {
    const logs: MicroLogItem[] = [];
    let updatedResources = { ...gameState.resources };
    let updatedBuildings = [...gameState.buildings];
    let updatedProductionQueue = [...(gameState.productionQueue || [])];
    const updatedBuildQueue = [...(gameState.buildQueue || [])];

    const niaMode = gameState.genesis.pillar_4_lore_refinement.nia_mode || gameState.niaMode || "AUTO";

    if (niaMode === "OFF") {
      return {
        updatedBuildQueue,
        updatedProductionQueue,
        updatedBuildings,
        updatedResources,
        logs,
      };
    }

    // 1. Réparation prioritaire des bâtiments endommagés
    const damagedBuilding = updatedBuildings.find(
      (b) => b.integrity_pct < 60 && b.status !== "NOMINAL"
    );
    if (damagedBuilding && updatedResources.alloys_tonnes >= 4) {
      updatedResources.alloys_tonnes -= 3;
      damagedBuilding.integrity_pct = Math.min(100, damagedBuilding.integrity_pct + 45);
      if (damagedBuilding.integrity_pct >= 80) {
        damagedBuilding.status = "NOMINAL";
      }
      logs.push(
        createMicroLog(
          "SYSTEM",
          "NIA-AUTO-REPAIR",
          `[N.I.A. Engine] Consolidation d'urgence exécutée sur ${damagedBuilding.name} (+45% intégrité, -3t alliages).`,
          2,
          gameState.clock.sol,
          gameState.clock.tickInSol,
          gameState.clock.tour
        )
      );
    }

    // Si la file d'attente N.I.A. a déjà 3 éléments en cours, ne pas surcharger
    if (updatedProductionQueue.length >= 3) {
      return {
        updatedBuildQueue,
        updatedProductionQueue,
        updatedBuildings,
        updatedResources,
        logs,
      };
    }

    // 2. Détermination des besoins prioritaires selon les déficits / besoins de progression
    let targetBlueprintId: string | null = null;
    let targetZLevel: ZLevel = "Z_ZERO_DOME";
    let actionReason = "";

    const activePop = updatedResources.population_active || 850;
    const energy = updatedResources.energy_gw || 0;
    const oxygen = updatedResources.oxygen_l || 0;
    const water = updatedResources.water_l || 0;
    const biomass = updatedResources.biomass_kg || 0;
    const alloys = updatedResources.alloys_tonnes || 0;
    const credits = updatedResources.credits_cr || 0;

    // Détection de carence prioritaire
    if (energy < 25) {
      targetBlueprintId = "SOLAR_ARRAY";
      targetZLevel = "Z_PLUS_1_SURFACE";
      actionReason = "Déficit énergétique critique (<25 GW)";
    } else if (oxygen < 400) {
      targetBlueprintId = "ATMOSPHERIC_SCRUBBER";
      targetZLevel = "Z_ZERO_DOME";
      actionReason = "Réserves d'oxygène sous le seuil de sécurité";
    } else if (water < 500) {
      targetBlueprintId = "WATER_RECLAMATION_FACILITY";
      targetZLevel = "Z_MINUS_1_SUB";
      actionReason = "Niveau des citernes d'eau potable faible";
    } else if (biomass < 300) {
      targetBlueprintId = "HYDROPONIC_DOME";
      targetZLevel = "Z_ZERO_DOME";
      actionReason = "Production agricole insuffisante pour la population";
    } else if (alloys > 35 && energy > 20) {
      // Surplus : Construction d'expansion ou d'Orbite Z+2 / Surface Z+1
      const eraIndex = gameState.currentEraIndex || 1;
      if (eraIndex >= 3 && alloys > 80) {
        targetBlueprintId = "SPATIAL_RELAY_HUB";
        targetZLevel = "Z_PLUS_2_ORBIT";
        actionReason = "Surplus majeur d'alliages -> Expansion de l'Arche Stellaire (Z+2)";
      } else if (eraIndex >= 2 && alloys > 50) {
        targetBlueprintId = "RECYCLING_PLANT";
        targetZLevel = "Z_MINUS_1_SUB";
        actionReason = "Surplus d'alliages -> Recyclage et raffinerie sous-terraine";
      } else {
        targetBlueprintId = "HABITATION_POD";
        targetZLevel = "Z_ZERO_DOME";
        actionReason = "Surplus de ressources -> Extension du dôme résidentiel";
      }
    }

    // 3. Essayer d'upgrader un bâtiment existant si aucun nouveau bâtiment n'est urgent
    if (!targetBlueprintId && alloys >= 25 && credits >= 100) {
      const upgradable = updatedBuildings.find(
        (b) => b.integrity_pct >= 90 && b.status === "NOMINAL"
      );
      if (upgradable) {
        updatedResources.alloys_tonnes -= 15;
        updatedResources.credits_cr -= 50;
        upgradable.integrity_pct = 100;
        upgradable.power_consumption_mw += 5;
        upgradable.personnel_assigned += 4;
        upgradable.name = `${upgradable.name} [Niv. N.I.A.]`;

        logs.push(
          createMicroLog(
            "SYSTEM",
            "NIA-AUTO-UPGRADE",
            `[N.I.A. Engine] Sur-cadencement et montée en niveau autonome de ${upgradable.name} (-15t alliages, -50 CR).`,
            2,
            gameState.clock.sol,
            gameState.clock.tickInSol,
            gameState.clock.tour
          )
        );

        return {
          updatedBuildQueue,
          updatedProductionQueue,
          updatedBuildings,
          updatedResources,
          logs,
        };
      }
    }

    // 4. Si une cible de construction autonome est trouvée, positionner et enfiler dans la productionQueue
    if (targetBlueprintId && BUILDING_BLUEPRINTS[targetBlueprintId]) {
      const bp = BUILDING_BLUEPRINTS[targetBlueprintId];
      const alloyCost = bp.construction_cost.alloys_tonnes || 10;
      const energyCost = bp.construction_cost.energy_gw || 5;

      if (updatedResources.alloys_tonnes >= alloyCost) {
        // Recherche d'une case libre
        const occupied = new Set([
          ...updatedBuildings
            .filter((b) => b.position.z === targetZLevel)
            .map((b) => `${b.position.x},${b.position.y}`),
          ...updatedProductionQueue
            .filter((q) => q.position.z === targetZLevel)
            .map((q) => `${q.position.x},${q.position.y}`),
        ]);

        let foundX = -1;
        let foundY = -1;

        for (let gy = 1; gy <= 6; gy++) {
          for (let gx = 1; gx <= 14; gx++) {
            if (!occupied.has(`${gx},${gy}`)) {
              foundX = gx;
              foundY = gy;
              break;
            }
          }
          if (foundX !== -1) break;
        }

        if (foundX !== -1) {
          updatedResources.alloys_tonnes -= alloyCost;
          if (updatedResources.energy_gw >= energyCost) {
            updatedResources.energy_gw -= energyCost;
          }

          const newQueueItem: BuildQueueItem = {
            id: `PQ-NIA-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
            blueprint_id: targetBlueprintId,
            name: `${bp.name} (N.I.A. Auto)`,
            category: bp.category,
            position: {
              x: foundX,
              y: foundY,
              z: targetZLevel,
              sector_id: targetZLevel === "Z_PLUS_2_ORBIT" ? "SEC-16" : targetZLevel === "Z_PLUS_1_SURFACE" ? "SEC-12" : "SEC-01",
            },
            total_duration_ticks: 12,
            progress_ticks: 0,
            cost_alloys: alloyCost,
            cost_energy: energyCost,
            auto_built_by_nia: true,
            priority: 2,
          };

          updatedProductionQueue.push(newQueueItem);

          logs.push(
            createMicroLog(
              "SYSTEM",
              "NIA-AUTO-ENQUEUE",
              `[N.I.A. Engine] Nouveau chantier autonome engagé : ${bp.name} au niveau ${targetZLevel} (${foundX},${foundY}) [Raison: ${actionReason}].`,
              2,
              gameState.clock.sol,
              gameState.clock.tickInSol,
              gameState.clock.tour
            )
          );
        }
      }
    }

    return {
      updatedBuildQueue,
      updatedProductionQueue,
      updatedBuildings,
      updatedResources,
      logs,
    };
  }
}
