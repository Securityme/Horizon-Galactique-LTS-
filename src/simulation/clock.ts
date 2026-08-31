/**
 * HORIZON GALACTIQUE : L'ARCHE DES ÉTOILES
 * Horloge Canonique Déterministe
 * 1 Tick = 1 s · 24 Ticks = 1 Sol · 360 Sols = 1 Cycle Orbital
 */

export interface ClockState {
  tick: number; // Compteur global de ticks
  sol: number; // 1 Sol = 24 Ticks (1-based)
  tickInSol: number; // 0 à 23
  cycle: number; // 1 Cycle = 360 Sols
  solInCycle: number; // 1 à 360
  tour: number; // 1 Tour = n Sols (Événements de Tour & Narration)
  palier: number; // Palier d'ère actuel (1 à 4)
  speedMultiplier: number; // 0 (pause), 1, 2, 5, 20
  isPaused: boolean;
}

export function createInitialClock(): ClockState {
  return {
    tick: 0,
    sol: 1,
    tickInSol: 0,
    cycle: 1,
    solInCycle: 1,
    tour: 1,
    palier: 1,
    speedMultiplier: 1,
    isPaused: false,
  };
}

export function advanceClockByTicks(clock: ClockState, deltaTicks: number = 1): ClockState {
  if (clock.isPaused || deltaTicks <= 0) return clock;

  const newTick = clock.tick + deltaTicks;
  const newSol = Math.floor(newTick / 24) + 1;
  const newTickInSol = newTick % 24;
  const newCycle = Math.floor((newSol - 1) / 360) + 1;
  const newSolInCycle = ((newSol - 1) % 360) + 1;
  const newTour = Math.floor((newSol - 1) / 4) + 1;
  const newPalier = Math.min(4, Math.floor((newSol - 1) / 30) + 1);

  return {
    ...clock,
    tick: newTick,
    sol: newSol,
    tickInSol: newTickInSol,
    cycle: newCycle,
    solInCycle: newSolInCycle,
    tour: newTour,
    palier: newPalier,
  };
}
