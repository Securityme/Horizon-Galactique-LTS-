import { useState, useEffect } from "react";
import {
  GameState,
  createInitialGameState,
  stepSimulation,
  resolveEventChoice,
  resolveSuperEventInState,
} from "../simulation/engine";
import { GenesisLorePayload, ZLevel } from "../types/genesis";
import { loadGameStateFromStorage, saveGameStateToStorage, clearGameStorage } from "../persistence/storage";
import { proceduralRadio } from "../audio/radio";
import { BUILDING_BLUEPRINTS } from "../simulation/constants";
import { ThemeId } from "../theme/themes";

export function useGameStateController(onThemeLoaded?: (themeId: ThemeId) => void) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Charger la sauvegarde existante au démarrage
  useEffect(() => {
    const saved = loadGameStateFromStorage();
    if (saved && saved.genesis) {
      setGameState(saved);
      if (saved.genesis.ui_display_config?.theme) {
        onThemeLoaded?.((saved.genesis.ui_display_config.theme as ThemeId) || "LIGHT_MODE");
      }
    }
  }, []);

  // Boucle de jeu déterministe
  useEffect(() => {
    if (!gameState || gameState.isGameOver || gameState.clock.isPaused) return;

    const intervalMs = Math.max(100, Math.floor(1000 / gameState.clock.speedMultiplier));
    const timer = setInterval(() => {
      setGameState((prevState) => {
        if (!prevState || prevState.isGameOver || prevState.clock.isPaused) return prevState;
        const nextState = stepSimulation(prevState, 1);
        saveGameStateToStorage(nextState);
        return nextState;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [gameState?.clock.isPaused, gameState?.clock.speedMultiplier, gameState?.isGameOver]);

  // Audio DSP update on climate change
  useEffect(() => {
    if (gameState) {
      proceduralRadio.applyWeatherDSP(
        gameState.climate.silica_storm_active,
        gameState.climate.ion_storm_active
      );
    }
  }, [gameState?.climate.silica_storm_active, gameState?.climate.ion_storm_active]);

  const handleLaunchGame = (genesis: GenesisLorePayload) => {
    const initial = createInitialGameState(genesis);
    setGameState(initial);
    saveGameStateToStorage(initial);
    if (genesis.ui_display_config?.theme) {
      onThemeLoaded?.((genesis.ui_display_config.theme as ThemeId) || "LIGHT_MODE");
    }
  };

  const handlePlaceBuilding = (
    blueprintId: string,
    x: number,
    y: number,
    z: ZLevel,
    sectorId: string
  ) => {
    if (!gameState) return;
    const bp = BUILDING_BLUEPRINTS[blueprintId];
    if (!bp) return;

    const newBuilding = {
      building_instance_id: `${gameState.genesis.pillar_1_governance.uuid_prefix}-BLD-${Date.now().toString(36)}`,
      blueprint_id: blueprintId,
      name: bp.name,
      category: bp.category,
      position: { x, y, z, sector_id: sectorId },
      status: "NOMINAL" as const,
      integrity_pct: 100,
      power_consumption_mw: bp.base_inputs.energy_gw || 5,
      personnel_assigned: 20,
      inputs_met_pct: 100,
      age_sols: 0,
    };

    setGameState({
      ...gameState,
      resources: {
        ...gameState.resources,
        alloys_tonnes: Math.max(0, gameState.resources.alloys_tonnes - (bp.construction_cost.alloys_tonnes || 0)),
        energy_gw: Math.max(0, gameState.resources.energy_gw - (bp.construction_cost.energy_gw || 0)),
      },
      buildings: [...gameState.buildings, newBuilding],
    });
  };

  const handleRepairBuilding = (buildingId: string) => {
    if (!gameState) return;
    if (gameState.resources.alloys_tonnes < 2) {
      proceduralRadio.playUIChime("ERROR");
      setGameState({
        ...gameState,
        activeAlerts: [
          {
            id: `ERR-REPAIR-${Date.now()}`,
            message: "Alliages insuffisants pour la réparation (2t requis).",
            severity: "CRITICAL",
            tick: gameState.clock.tick,
          },
          ...gameState.activeAlerts,
        ],
      });
      return;
    }

    proceduralRadio.playUIChime("CONFIRM");
    setGameState({
      ...gameState,
      resources: {
        ...gameState.resources,
        alloys_tonnes: gameState.resources.alloys_tonnes - 2,
      },
      buildings: gameState.buildings.map((b) =>
        b.building_instance_id === buildingId
          ? { ...b, integrity_pct: 100, status: "NOMINAL" }
          : b
      ),
    });
  };

  const handleResolveEvent = (eventId: string, choiceId: string) => {
    if (!gameState) return;
    if (eventId.startsWith("SE-") || eventId.startsWith("SEV-")) {
      const resolvedState = resolveSuperEventInState(gameState, eventId, choiceId);
      setGameState(resolvedState);
      saveGameStateToStorage(resolvedState);
    } else {
      const resolvedState = resolveEventChoice(gameState, eventId, choiceId);
      setGameState(resolvedState);
      saveGameStateToStorage(resolvedState);
    }
  };

  const handleResolveSuperEventChoice = (superEventId: string, choiceId: string, forcedDiceRoll?: number) => {
    if (!gameState) return;
    const resolvedState = resolveSuperEventInState(gameState, superEventId, choiceId, forcedDiceRoll);
    setGameState(resolvedState);
    saveGameStateToStorage(resolvedState);
  };

  const handleToggleDecree = (decreeId: string) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      decrees: gameState.decrees.map((d) =>
        d.id === decreeId ? { ...d, active: !d.active } : d
      ),
    });
  };

  const handleAllocateSectorEnergy = (sectorId: string, delta: number) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      resources: {
        ...gameState.resources,
        energy_gw: Math.max(0, gameState.resources.energy_gw - delta / 10),
      },
      sectors: gameState.sectors.map((s) =>
        s.id === sectorId
          ? { ...s, maintenanceStatusPct: Math.min(100, Math.max(0, s.maintenanceStatusPct + (delta > 0 ? 5 : -5))) }
          : s
      ),
    });
  };

  const handleLaunchProbe = (bodyId: string) => {
    if (!gameState) return;
    if (gameState.resources.energy_gw < 20) {
      proceduralRadio.playUIChime("ERROR");
      setGameState({
        ...gameState,
        activeAlerts: [
          {
            id: `ERR-PROBE-${Date.now()}`,
            message: "Énergie insuffisante pour lancer une sonde (20 GW requis).",
            severity: "CRITICAL",
            tick: gameState.clock.tick,
          },
          ...gameState.activeAlerts,
        ],
      });
      return;
    }

    proceduralRadio.playUIChime("CONFIRM");
    setGameState({
      ...gameState,
      resources: {
        ...gameState.resources,
        energy_gw: gameState.resources.energy_gw - 20,
      },
      celestialBodies: gameState.celestialBodies.map((b) =>
        b.id === bodyId ? { ...b, scanned: true } : b
      ),
      activeAlerts: [
        {
          id: `PROBE-${Date.now()}`,
          message: `Sonde d'exploration déployée vers ${bodyId}. Données spectroscopiques reçues.`,
          severity: "INFO",
          tick: gameState.clock.tick,
        },
        ...gameState.activeAlerts,
      ],
    });
  };

  const handleMineAsteroid = (bodyId: string) => {
    if (!gameState) return;
    proceduralRadio.playUIChime("CONFIRM");
    setGameState({
      ...gameState,
      resources: {
        ...gameState.resources,
        alloys_tonnes: gameState.resources.alloys_tonnes + 15,
        deuterium_kg: gameState.resources.deuterium_kg + 25,
      },
      activeAlerts: [
        {
          id: `MINING-${Date.now()}`,
          message: `Extraction laser réussie sur ${bodyId} : +15t alliages, +25kg deutérium.`,
          severity: "INFO",
          tick: gameState.clock.tick,
        },
        ...gameState.activeAlerts,
      ],
    });
  };

  const handleDiplomaticAction = (rivalId: string, actionType: "PACT" | "TRADE" | "SANCTION") => {
    if (!gameState) return;
    proceduralRadio.playUIChime("CONFIRM");
    const statusMap = {
      PACT: "ALLIED" as const,
      TRADE: "TRADE_PARTNER" as const,
      SANCTION: "HOSTILE" as const,
    };
    setGameState({
      ...gameState,
      rivalArchons: gameState.rivalArchons.map((r) =>
        r.id === rivalId ? { ...r, pactStatus: statusMap[actionType] } : r
      ),
      activeAlerts: [
        {
          id: `DIPLO-${Date.now()}`,
          message: `Action diplomatique [${actionType}] conclue avec ${rivalId}.`,
          severity: "INFO",
          tick: gameState.clock.tick,
        },
        ...gameState.activeAlerts,
      ],
    });
  };

  const handleSetNiaMode = (mode: "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF") => {
    if (!gameState) return;
    proceduralRadio.playUIChime("CONFIRM");
    setGameState({
      ...gameState,
      niaMode: mode,
      activeAlerts: [
        {
          id: `NIA-MODE-${Date.now()}`,
          message: `Mode opérationnel N.I.A. basculé sur : [${mode}]`,
          severity: "INFO",
          tick: gameState.clock.tick,
        },
        ...gameState.activeAlerts,
      ],
    });
  };

  const handleSpeedChange = (multiplier: number, isPaused: boolean) => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      clock: {
        ...gameState.clock,
        speedMultiplier: multiplier,
        isPaused,
      },
    });
  };

  const handleResetGame = () => {
    clearGameStorage();
    setGameState(null);
  };

  return {
    gameState,
    setGameState,
    handleLaunchGame,
    handlePlaceBuilding,
    handleRepairBuilding,
    handleResolveEvent,
    handleResolveSuperEventChoice,
    handleToggleDecree,
    handleAllocateSectorEnergy,
    handleLaunchProbe,
    handleMineAsteroid,
    handleDiplomaticAction,
    handleSetNiaMode,
    handleSpeedChange,
    handleResetGame,
  };
}
