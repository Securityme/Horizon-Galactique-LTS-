import React, { useState, useEffect } from "react";
import { GameState } from "../../../simulation/engine";
import { TimelineSnapshot } from "../../../types/simulation";
import {
  getSavedTimelines,
  createTimelineSnapshot,
  saveGameStateToStorage,
  loadGameStateFromStorage,
  clearGameStorage,
} from "../../../persistence/storage";
import { auth } from "../../../lib/firebase";

interface RegistrySectionProps {
  gameState: GameState | null;
  onLoadState: (state: GameState) => void;
  onResetGame: () => void;
}

export function RegistrySection({
  gameState,
  onLoadState,
  onResetGame,
}: RegistrySectionProps) {
  const [timelines, setTimelines] = useState<TimelineSnapshot[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [storageSizeKb, setStorageSizeKb] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  const refreshTimelines = () => {
    const list = getSavedTimelines();
    setTimelines(list);

    // Calcul de la taille de stockage
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("horizon_galactique")) {
        bytes += (localStorage.getItem(k) || "").length * 2;
      }
    }
    setStorageSizeKb(Math.round(bytes / 1024));
  };

  useEffect(() => {
    refreshTimelines();
  }, []);

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleCreateSnapshot = () => {
    if (!gameState) return;
    const snap = createTimelineSnapshot(gameState, newLabel || `Sol ${gameState.clock.sol}`);
    setNewLabel("");
    refreshTimelines();
    showStatus(`Ligne Temporelle enregistrée : ${snap.label}`);
  };

  const handleExportJSON = () => {
    if (!gameState) return;
    const jsonStr = JSON.stringify(gameState, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arche_snapshot_sol_${gameState.clock.sol}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus("Archive JSON exportée avec succès.");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as GameState;
        if (parsed.clock && parsed.resources && parsed.genesis) {
          saveGameStateToStorage(parsed);
          onLoadState(parsed);
          refreshTimelines();
          showStatus("Registre importé et chargé avec succès.");
        } else {
          showStatus("Erreur : Fichier JSON invalide pour Horizon Galactique.");
        }
      } catch (err) {
        showStatus("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = timelines.filter((t) => t.timeline_id !== id);
    localStorage.setItem("horizon_galactique_timelines_v35", JSON.stringify(updated));
    setTimelines(updated);
    setConfirmDeleteId(null);
    showStatus("Instantané supprimé.");
  };

  const handleFullReset = () => {
    clearGameStorage();
    onResetGame();
  };

  return (
    <div className="space-y-6 text-xs font-mono">
      {/* Statut Notification */}
      {statusMsg && (
        <div className="p-3 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-semibold animate-in fade-in">
          ✓ {statusMsg}
        </div>
      )}

      {/* 1. État du Registre & Cloud Sync */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400">
            1. État de la Synchronisation & Volume Local
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">
              Espace Registre : <strong className="text-slate-200">{storageSizeKb} Ko</strong>
            </span>
          </div>
        </div>

        <div className="p-3 rounded bg-slate-950/70 border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="font-bold text-slate-200 text-xs">
                Firestore Cloud Database Connecté
              </div>
              <div className="text-[10px] text-slate-400">
                {currentUser
                  ? `Authentifié sous : ${currentUser.email || currentUser.displayName || "Archonte"}`
                  : "Session locale anonyme"}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (gameState) {
                saveGameStateToStorage(gameState);
                showStatus("Sauvegarde manuelle immédiate effectuée.");
              }
            }}
            className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] uppercase transition-all shadow"
          >
            Sauvegarder
          </button>
        </div>
      </div>

      {/* 2. Création de Ligne Temporelle (Bifurcation) */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-3">
          2. Enregistrer une Nouvelle Ligne Temporelle
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Libellé (ex: Avant la tempête Sol ${gameState?.clock.sol || 1})`}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-white/[0.1] rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-400 outline-none"
          />
          <button
            onClick={handleCreateSnapshot}
            disabled={!gameState}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase transition-all shrink-0 disabled:opacity-50"
          >
            Créer Branche
          </button>
        </div>
      </div>

      {/* 3. Liste des Lignes Temporelles Existantes */}
      <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50">
        <h3 className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-3">
          3. Registre des Lignes Temporelles ({timelines.length})
        </h3>

        {timelines.length === 0 ? (
          <div className="p-4 rounded bg-slate-950/50 text-center text-slate-500 text-xs">
            Aucun instantané enregistré dans le registre de bord.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {timelines.map((t) => (
              <div
                key={t.timeline_id}
                className="p-3 rounded bg-slate-950/80 border border-white/[0.08] flex items-center justify-between gap-3 hover:border-white/[0.2] transition-all"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-200 text-xs truncate">{t.label}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-400 font-semibold">Sol {t.branch_sol}</span>
                    <span>·</span>
                    <span>Pop: {t.game_state_summary.population}</span>
                    <span>·</span>
                    <span>{new Date(t.created_at_iso).toLocaleString("fr-FR")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {confirmDeleteId === t.timeline_id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteSnapshot(t.timeline_id)}
                        className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px]"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(t.timeline_id)}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-rose-950/80 text-rose-400 text-[10px] border border-rose-900/40"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Import / Export JSON & Réinitialisation Totale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Import / Export */}
        <div className="p-4 rounded-lg border border-white/[0.1] bg-slate-900/50 flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-200 mb-1">Transfert de Données (JSON)</div>
            <p className="text-[10px] text-slate-400 mb-3">
              Exportez votre colonie sous forme de fichier local ou restaurez une archive.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              disabled={!gameState}
              className="flex-1 py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/[0.1] disabled:opacity-50"
            >
              Exporter JSON
            </button>
            <label className="flex-1 py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/[0.1] text-center cursor-pointer">
              Importer JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Réinitialisation */}
        <div className="p-4 rounded-lg border border-rose-900/40 bg-rose-950/20 flex flex-col justify-between">
          <div>
            <div className="font-bold text-rose-300 mb-1">Purge Totale du Vaisseau</div>
            <p className="text-[10px] text-rose-400/80 mb-3">
              Supprime la sauvegarde active et retourne à l'initialisation Genesis.
            </p>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                onClick={handleFullReset}
                className="flex-1 py-2 px-3 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase"
              >
                Confirmer Purge
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 px-3 rounded bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="py-2 px-3 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-xs uppercase border border-rose-600/40"
            >
              Purger la partie active
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
