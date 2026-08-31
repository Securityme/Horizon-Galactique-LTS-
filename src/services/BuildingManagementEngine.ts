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
 * S'appuie sur le plan de masse par niveau Z, par catégorie et type de bâtiment par ère.
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

    // 1. Réparation prioritaire des bâtiments endommagés par la N.I.A.
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
          `[N.I.A. Plan de Masse] Réparation structurelle automatisée effectuée sur ${damagedBuilding.name} (+45% intégrité, -3t d'alliages).`,
          2,
          gameState.clock.sol,
          gameState.clock.tickInSol,
          gameState.clock.tour
        )
      );
    }

    // Limite de chantiers simultanés gérés par la N.I.A.
    const niaActiveChantiers = updatedProductionQueue.filter(q => q.auto_built_by_nia).length;
    if (niaActiveChantiers >= 3) {
      return {
        updatedBuildQueue,
        updatedProductionQueue,
        updatedBuildings,
        updatedResources,
        logs,
      };
    }

    // 2. Identification de l'ère active
    const activeEra = gameState.currentEraIndex || 1;

    // Récupération de tous les plans de construction débloqués pour l'ère actuelle ou précédente
    const availableBlueprints = Object.values(BUILDING_BLUEPRINTS).filter(
      (bp) => bp.unlocked_era && bp.unlocked_era <= activeEra
    );

    if (availableBlueprints.length === 0) {
      return {
        updatedBuildQueue,
        updatedProductionQueue,
        updatedBuildings,
        updatedResources,
        logs,
      };
    }

    // 3. Détermination des priorités diégétiques selon les ressources et besoins
    const energy = updatedResources.energy_gw || 0;
    const oxygen = updatedResources.oxygen_l || 0;
    const water = updatedResources.water_l || 0;
    const biomass = updatedResources.biomass_kg || 0;
    const alloys = updatedResources.alloys_tonnes || 0;
    const credits = updatedResources.credits_cr || 0;
    const population = updatedResources.population_active || updatedResources.population_total || 800;

    // Calcul de la capacité d'habitation actuelle
    const currentHousingCapacity = updatedBuildings.reduce((acc, b) => {
      const bp = BUILDING_BLUEPRINTS[b.blueprint_id];
      const outputs = bp?.base_outputs || {};
      return acc + (outputs.housing_capacity || 0);
    }, 0);

    let targetBlueprintId: string | null = null;
    let targetZLevel: ZLevel = "Z_ZERO_DOME";
    let actionReason = "";

    // Sélecteurs par catégorie privilégiée
    const getBestBlueprintOfCategory = (cat: string) => {
      const matches = availableBlueprints.filter(bp => bp.category === cat);
      if (matches.length === 0) return null;
      // Choisir le bâtiment le plus moderne (plus haut unlocked_era)
      return matches.sort((a, b) => (b.unlocked_era || 0) - (a.unlocked_era || 0))[0];
    };

    // Algorithme d'analyse des besoins de la N.I.A (Plan de Masse intelligent)
    if (energy < 50) {
      // Priorité 1 : Énergie
      const bestEnergyBP = getBestBlueprintOfCategory("ENE");
      if (bestEnergyBP) {
        targetBlueprintId = bestEnergyBP.blueprint_id;
        targetZLevel = bestEnergyBP.allowed_z_levels?.[0] as ZLevel || "Z_ZERO_DOME";
        actionReason = `Carence énergétique critique détectée (${energy} GW restants).`;
      }
    } else if (oxygen < 450) {
      // Priorité 2 : Survie / Épurateur d'Air d'Urgence
      if (BUILDING_BLUEPRINTS["EPURATEUR_URGENCE"]) {
        targetBlueprintId = "EPURATEUR_URGENCE";
        targetZLevel = "Z_ZERO_DOME";
        actionReason = `Niveau d'oxygène insuffisant dans le dôme respirable (${oxygen} L).`;
      }
    } else if (water < 450) {
      // Priorité 3 : Eau / Pompage ou Énergie de secours
      const iceStation = availableBlueprints.find(bp => bp.blueprint_id === "STATION_POMPAGE_GLACE");
      if (iceStation) {
        targetBlueprintId = "STATION_POMPAGE_GLACE";
        targetZLevel = "Z_MINUS_1_SUB";
        actionReason = `Citernes d'eau potable faibles (${water} L). Forage requis au niveau Z-1.`;
      }
    } else if (biomass < 350) {
      // Priorité 4 : Nourriture / Agriculture
      const bestAgriBP = getBestBlueprintOfCategory("AGR");
      if (bestAgriBP) {
        targetBlueprintId = bestAgriBP.blueprint_id;
        targetZLevel = bestAgriBP.allowed_z_levels?.includes("Z_MINUS_1_SUB") ? "Z_MINUS_1_SUB" : "Z_ZERO_DOME";
        actionReason = `Niveau de biomasse alimentaire en dessous du seuil optimal (${biomass} kg).`;
      }
    } else if (currentHousingCapacity < population + 100) {
      // Priorité 5 : Habitation / Dôme résidentiel
      const bestHabBP = getBestBlueprintOfCategory("HAB");
      if (bestHabBP) {
        targetBlueprintId = bestHabBP.blueprint_id;
        targetZLevel = bestHabBP.allowed_z_levels?.includes("Z_ZERO_DOME") ? "Z_ZERO_DOME" : "Z_PLUS_2_ORBIT";
        actionReason = `Extension résidentielle requise pour accueillir les colons (${currentHousingCapacity} places pour ${population} colons).`;
      }
    } else if (alloys > 40) {
      // Priorité 6 : Industrie, Science & Systèmes si surplus d'alliages
      const eraBlueprints = availableBlueprints.filter(bp => bp.unlocked_era === activeEra);
      const usefulBPs = eraBlueprints.filter(bp => bp.category === "IND" || bp.category === "SEC");
      
      if (usefulBPs.length > 0) {
        const bp = usefulBPs[Math.floor(Math.random() * usefulBPs.length)];
        targetBlueprintId = bp.blueprint_id;
        targetZLevel = bp.allowed_z_levels?.[0] as ZLevel || "Z_ZERO_DOME";
        actionReason = `Expansion d'opportunité en Ère ${activeEra} via valorisation du surplus d'alliages.`;
      } else {
        // Fallback sur le meilleur bâtiment d'industrie disponible
        const bestIndBP = getBestBlueprintOfCategory("IND");
        if (bestIndBP) {
          targetBlueprintId = bestIndBP.blueprint_id;
          targetZLevel = bestIndBP.allowed_z_levels?.[0] as ZLevel || "Z_ZERO_DOME";
          actionReason = `Industrialisation graduelle de l'Arche au niveau ${targetZLevel}.`;
        }
      }
    }

    // 4. Exécuter l'action d'auto-construction si un plan de masse est sélectionné
    if (targetBlueprintId && BUILDING_BLUEPRINTS[targetBlueprintId]) {
      const bp = BUILDING_BLUEPRINTS[targetBlueprintId];
      const alloyCost = bp.construction_cost.alloys_tonnes || 10;
      const energyCost = bp.construction_cost.energy_gw || 5;

      if (updatedResources.alloys_tonnes >= alloyCost) {
        // Recherche géométrique d'un emplacement libre dans le plan de masse pour le niveau Z visé
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

        // Balayage matriciel de la grille (6x14)
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
          // Soustraction des coûts de construction
          updatedResources.alloys_tonnes -= alloyCost;
          if (updatedResources.energy_gw >= energyCost) {
            updatedResources.energy_gw -= energyCost;
          }

          // Détermination du secteur approprié selon le niveau Z
          let sector_id = "SEC-01";
          if (targetZLevel === "Z_PLUS_2_ORBIT") sector_id = "SEC-16";
          else if (targetZLevel === "Z_PLUS_1_SURFACE") sector_id = "SEC-12";
          else if (targetZLevel === "Z_MINUS_1_SUB") sector_id = "SEC-04";
          else if (targetZLevel === "Z_MINUS_2_DEEP") sector_id = "SEC-08";

          const newQueueItem: BuildQueueItem = {
            id: `PQ-NIA-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
            blueprint_id: targetBlueprintId,
            name: bp.name,
            category: bp.category,
            position: {
              x: foundX,
              y: foundY,
              z: targetZLevel,
              sector_id,
            },
            total_duration_ticks: 10,
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
              `[N.I.A. Plan de Masse] Lancement autonome : ${bp.name} au niveau ${targetZLevel} (${foundX},${foundY}) [Ère active: ${activeEra}]. Raison : ${actionReason}`,
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
    }

    // 5. Upgrade de confort d'un bâtiment existant s'il n'y a pas de nouvelle construction requise
    if (alloys >= 35 && credits >= 120) {
      const upgradable = updatedBuildings.find(
        (b) => b.integrity_pct >= 95 && b.status === "NOMINAL" && !b.name.includes("[Niv. N.I.A.]")
      );
      if (upgradable) {
        updatedResources.alloys_tonnes -= 15;
        updatedResources.credits_cr -= 60;
        upgradable.integrity_pct = 100;
        upgradable.power_consumption_mw += 4;
        upgradable.personnel_assigned += 2;
        upgradable.name = `${upgradable.name} [Niv. N.I.A.]`;

        logs.push(
          createMicroLog(
            "SYSTEM",
            "NIA-AUTO-UPGRADE",
            `[N.I.A. Plan de Masse] Sur-cadencement cybernétique autonome : ${upgradable.name} monté en grade opérationnel (-15t alliages, -60 CR).`,
            2,
            gameState.clock.sol,
            gameState.clock.tickInSol,
            gameState.clock.tour
          )
        );
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
