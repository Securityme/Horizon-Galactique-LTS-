import { GameState } from "../simulation/engine";
import { TimelineSnapshot } from "../types/simulation";
import { xxHash32 } from "../simulation/prng";

const STORAGE_KEY = "horizon_galactique_arche_save_v35";
const TIMELINES_KEY = "horizon_galactique_timelines_v35";

export function saveGameStateToStorage(state: GameState): boolean {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
    return false;
  }
}

export function loadGameStateFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
    return null;
  }
}

export function clearGameStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear storage:", e);
  }
}

export function getSavedTimelines(): TimelineSnapshot[] {
  try {
    const raw = localStorage.getItem(TIMELINES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TimelineSnapshot[];
  } catch (e) {
    return [];
  }
}

export function createTimelineSnapshot(state: GameState, label: string): TimelineSnapshot {
  const hash = xxHash32(state.genesis.master_seed + state.clock.tick);
  const digest_sha = hash.toString(16).padStart(8, "0");
  const timelineId = `${state.genesis.pillar_1_governance.uuid_prefix}-${digest_sha}-TL-${state.clock.sol}`;

  const snapshot: TimelineSnapshot = {
    timeline_id: timelineId,
    parent_timeline_id: null,
    label: label || `Bifurcation Sol ${state.clock.sol}`,
    master_seed: state.genesis.master_seed,
    branch_tick: state.clock.tick,
    branch_sol: state.clock.sol,
    created_at_iso: new Date().toISOString(),
    modded: false,
    digest_sha,
    game_state_summary: {
      sol: state.clock.sol,
      era: state.genesis.pillar_4_lore_refinement.starting_era,
      population: state.resources.population_active,
      stability: state.genesis.pillar_1_governance.senate_stability,
      leaderHealth: state.genesis.pillar_1_governance.leader_profile.overall_health_pct,
    },
  };

  try {
    const existing = getSavedTimelines();
    const updated = [snapshot, ...existing.filter((t) => t.timeline_id !== timelineId)].slice(0, 10);
    localStorage.setItem(TIMELINES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save timeline snapshot:", e);
  }

  return snapshot;
}
