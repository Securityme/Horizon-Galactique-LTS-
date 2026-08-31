import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { GameState } from "../simulation/engine";
import { xxHash32 } from "../simulation/prng";

export interface CloudSaveMetadata {
  id: string;
  userId: string;
  gameName: string;
  seed: number;
  sol: number;
  tick: number;
  era: string;
  population: number;
  energy: number;
  stability: number;
  leaderName: string;
  gameStateJson: string;
  updatedAt: string;
  createdAt: string;
}

export interface UserProfileData {
  userId: string;
  displayName: string;
  email?: string;
  totalSolsPlayed: number;
  victoriesCount: number;
  lastPlayedAt: string;
  createdAt: string;
}

export interface PublicArchiveEntry {
  archiveId: string;
  authorId: string;
  leaderTitle: string;
  colonyName: string;
  maxSols: number;
  epitaphText: string;
  gloryScore: number;
  createdAt: string;
}

/**
 * Synchronise ou met à jour le profil de l'Archonte dans Firestore
 */
export async function syncUserProfile(
  displayName: string,
  solsIncrement: number = 0,
  victoryIncrement: number = 0
): Promise<UserProfileData | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userRef = doc(db, "users", currentUser.uid);
  const path = `users/${currentUser.uid}`;

  try {
    const existingSnap = await getDoc(userRef);
    const nowIso = new Date().toISOString();

    if (existingSnap.exists()) {
      const currentData = existingSnap.data() as UserProfileData;
      const updated: UserProfileData = {
        userId: currentUser.uid,
        displayName: displayName || currentData.displayName || "Primat-Archonte",
        email: currentUser.email || undefined,
        totalSolsPlayed: (currentData.totalSolsPlayed || 0) + solsIncrement,
        victoriesCount: (currentData.victoriesCount || 0) + victoryIncrement,
        lastPlayedAt: nowIso,
        createdAt: currentData.createdAt || nowIso,
      };
      await setDoc(userRef, updated);
      return updated;
    } else {
      const initial: UserProfileData = {
        userId: currentUser.uid,
        displayName: displayName || currentUser.displayName || "Primat-Archonte",
        email: currentUser.email || undefined,
        totalSolsPlayed: solsIncrement,
        victoriesCount: victoryIncrement,
        lastPlayedAt: nowIso,
        createdAt: nowIso,
      };
      await setDoc(userRef, initial);
      return initial;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Sauvegarde l'état complet du simulateur dans le Cloud Firestore
 */
export async function saveGameToCloud(
  state: GameState,
  saveIdParam?: string
): Promise<CloudSaveMetadata | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Authentification requise pour la sauvegarde Cloud");
  }

  const prefix = state.genesis.pillar_1_governance.uuid_prefix || "ARCHE";
  const digest = xxHash32(state.genesis.master_seed + state.clock.tick)
    .toString(16)
    .padStart(8, "0");
  const saveId =
    saveIdParam || `${prefix}-${digest}-SAVE-${state.clock.sol}`;

  const path = `users/${currentUser.uid}/saves/${saveId}`;
  const saveRef = doc(db, "users", currentUser.uid, "saves", saveId);

  const nowIso = new Date().toISOString();
  const serializedState = JSON.stringify(state);

  const savePayload: CloudSaveMetadata = {
    id: saveId,
    userId: currentUser.uid,
    gameName: `${state.genesis.pillar_2_environment.target_planet} (${state.genesis.pillar_1_governance.regime_type})`,
    seed: state.genesis.master_seed,
    sol: state.clock.sol,
    tick: state.clock.tick,
    era: state.genesis.pillar_4_lore_refinement.starting_era || "ARRIVEE_ARCHE",
    population: state.resources.population_active,
    energy: Math.round(state.resources.energy_gw),
    stability: Math.round(state.genesis.pillar_1_governance.senate_stability),
    leaderName:
      state.genesis.pillar_1_governance.leader_profile.mandate.archetype ||
      "Primat-Archonte",
    gameStateJson: serializedState,
    updatedAt: nowIso,
    createdAt: nowIso,
  };

  try {
    // Vérifier si existant pour conserver createdAt
    const existing = await getDoc(saveRef);
    if (existing.exists()) {
      savePayload.createdAt = existing.data().createdAt || nowIso;
    }

    await setDoc(saveRef, savePayload);
    await syncUserProfile(state.genesis.pillar_1_governance.leader_profile.mandate.archetype, 1, 0);
    return savePayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Liste les sauvegardes Cloud privées de l'utilisateur
 */
export async function listUserCloudSaves(): Promise<CloudSaveMetadata[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = `users/${currentUser.uid}/saves`;
  try {
    const savesColl = collection(db, "users", currentUser.uid, "saves");
    const snap = await getDocs(savesColl);
    const list: CloudSaveMetadata[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as CloudSaveMetadata);
    });
    return list.sort((a, b) => (b.sol !== a.sol ? b.sol - a.sol : b.updatedAt.localeCompare(a.updatedAt)));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Charge une sauvegarde depuis le Cloud Firestore
 */
export async function loadGameFromCloud(saveId: string): Promise<GameState | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const path = `users/${currentUser.uid}/saves/${saveId}`;
  const saveRef = doc(db, "users", currentUser.uid, "saves", saveId);

  try {
    const snap = await getDoc(saveRef);
    if (!snap.exists()) return null;
    const data = snap.data() as CloudSaveMetadata;
    return JSON.parse(data.gameStateJson) as GameState;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Supprime une sauvegarde Cloud
 */
export async function deleteGameFromCloud(saveId: string): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  const path = `users/${currentUser.uid}/saves/${saveId}`;
  const saveRef = doc(db, "users", currentUser.uid, "saves", saveId);

  try {
    await deleteDoc(saveRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Publie une chronique ou un haut-fait dans les Annales Publiques
 */
export async function publishPublicArchive(
  leaderTitle: string,
  colonyName: string,
  maxSols: number,
  epitaphText: string,
  gloryScore: number
): Promise<PublicArchiveEntry | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentification requise pour publier");

  const hash = xxHash32(Date.now()).toString(16).padStart(8, "0");
  const archiveId = `ARCHIVE-${hash}-${maxSols}`;
  const path = `public_archives/${archiveId}`;
  const docRef = doc(db, "public_archives", archiveId);

  const entry: PublicArchiveEntry = {
    archiveId,
    authorId: currentUser.uid,
    leaderTitle,
    colonyName,
    maxSols,
    epitaphText,
    gloryScore,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, entry);
    return entry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Récupère les dernières annales publiques
 */
export async function listPublicArchives(limitCount: number = 20): Promise<PublicArchiveEntry[]> {
  const path = "public_archives";
  try {
    const archColl = collection(db, "public_archives");
    const q = query(archColl, orderBy("createdAt", "desc"), limit(limitCount));
    const snap = await getDocs(q);
    const list: PublicArchiveEntry[] = [];
    snap.forEach((d) => list.push(d.data() as PublicArchiveEntry));
    return list;
  } catch (error) {
    // Si orderBy nécessite un index ou échoue, fallback sur getDocs simple
    try {
      const snap = await getDocs(collection(db, "public_archives"));
      const list: PublicArchiveEntry[] = [];
      snap.forEach((d) => list.push(d.data() as PublicArchiveEntry));
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limitCount);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }
}
