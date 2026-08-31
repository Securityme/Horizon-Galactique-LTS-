import { z } from "zod";
import { EventTier } from "./simulation";

// 1. Structure de temps à double échelle (Sols & Tours)
export interface DualTimestamp {
  sol: number;           // Temps continu (ex: 42.3)
  turn: number;          // Temps macro (ex: 15)
  stardateLabel: string; // Ex: "SOL 042.30 - TOUR 15"
}

export function formatDualTimestamp(sol: number, tickInSol: number = 0, turn: number = 1): DualTimestamp {
  const continuousSol = Number((sol + tickInSol / 24).toFixed(2));
  const stardateLabel = `SOL ${continuousSol.toFixed(2).padStart(6, "0")} - TOUR ${turn.toString().padStart(2, "0")}`;
  return {
    sol: continuousSol,
    turn,
    stardateLabel,
  };
}

// 2. Types d'éléments du Journal
export type JournalItemType = "MICRO_LOG" | "SUPER_EVENT" | "EVENT_RESOLUTION";

// 3. Interface de base pour tout élément du Journal
export interface BaseJournalItem {
  id: string;
  type: JournalItemType;
  timestamp: DualTimestamp;
}

// 4. Micro-log déterministe (Moteur de jeu)
export interface MicroLogItem extends BaseJournalItem {
  type: "MICRO_LOG";
  category: "SYSTEM" | "CREW" | "COMBAT" | "RESOURCE" | "ENVIRONMENT";
  code: string;
  message: string;
  importance: 1 | 2 | 3 | 4 | 5;
  deltas?: Record<string, number>;
}

// Données d'impact / conséquence d'un choix
export interface OutcomeData {
  narrativeResult: string;
  resourceDeltas?: Record<string, number>;
  addPersistentFlags?: string[];
  removePersistentFlags?: string[];
}

// Définition d'un test de compétence
export interface SkillCheckData {
  statUsed: string;
  difficultyClass: number;
  onSuccess: OutcomeData;
  onFailure: OutcomeData;
}

// Option de choix dans un Super-Événement
export interface ChoiceOption {
  choiceId: string;
  label: string;
  flavorText: string;
  philosophicalAlignment?: string;
  resolutionType: "DETERMINISTIC" | "SKILL_CHECK";
  requirements?: {
    stats?: Record<string, number>;
    roles?: string[];
    flags?: string[];
  };
  skillCheck?: SkillCheckData;
  directOutcome?: OutcomeData;
}

// 5. Super-Événement LLM (Gemini / Fallback local)
export interface SuperEventItem extends BaseJournalItem {
  type: "SUPER_EVENT";
  eventId: string;
  title: string;
  category: "ANOMALY" | "FACTION_ENCOUNTER" | "CREW_MUTINY" | "DERELICT_STATION" | "COSMIC_HAZARD";
  tier?: EventTier;
  severity_tier: 1 | 2 | 3 | 4 | 5 | 6 | 7; // Tier de sévérité de 1 (Mineur) à 7 (Cataclysme Giga)
  isTimeBlocking?: boolean;
  canBeDeferred?: boolean; // Si faux (Tier 5-7), pause forcée et obligation de choisir immédiatement
  narrativeSummary: string; // Résumé LLM de la tranche de Sols écoulée
  loreDescription: string;  // Mise en situation du dilemme
  environmentalContext: string;
  choices: [ChoiceOption, ChoiceOption, ChoiceOption, ChoiceOption]; // 4 choix stricts
  status: "PENDING" | "RESOLVED";
  selectedChoiceId?: string;
}

// 6. Log de Résolution (Post-choix avec jet de dés)
export interface EventResolutionItem extends BaseJournalItem {
  type: "EVENT_RESOLUTION";
  parentEventId: string;
  selectedChoiceLabel: string;
  diceRollResult?: {
    statUsed: string;
    rolledValue: number;
    statValue: number;
    totalScore: number;
    difficultyClass: number;
    isSuccess: boolean;
  };
  narrativeOutcome: string;
  appliedDeltas: Record<string, number>;
  unlockedFlags: string[];
}

// 7. Type Union complet pour le fil du Journal
export type JournalItem = MicroLogItem | SuperEventItem | EventResolutionItem;

// 8. Schéma Zod pour validation des contrats
export const DualTimestampSchema = z.object({
  sol: z.number(),
  turn: z.number(),
  stardateLabel: z.string(),
});
