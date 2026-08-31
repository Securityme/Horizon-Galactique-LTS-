import React, { useEffect, useState } from "react";
import { ThemeDefinition } from "../../theme/themes";
import { GameState } from "../../simulation/engine";
import { loadGameStateFromStorage } from "../../persistence/storage";
import { listUserCloudSaves, loadGameFromCloud, CloudSaveMetadata } from "../../services/cloudSaveService";
import { proceduralRadio } from "../../audio/radio";
import { FolderOpen, Cloud, HardDrive, Play, Trash2, X, RefreshCw, Activity } from "lucide-react";

interface LoadGameModalProps {
  theme: ThemeDefinition;
  onClose: () => void;
  onSelectGame: (state: GameState) => void;
}

export function LoadGameModal({ theme, onClose, onSelectGame }: LoadGameModalProps) {
  const [localGame, setLocalGame] = useState<GameState | null>(null);
  const [cloudSaves, setCloudSaves] = useState<CloudSaveMetadata[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [activeTab, setActiveTab] = useState<"LOCAL" | "CLOUD">("LOCAL");

  useEffect(() => {
    // Local save
    const local = loadGameStateFromStorage();
    setLocalGame(local);

    // Cloud saves
    fetchCloudSaves();
  }, []);

  const fetchCloudSaves = async () => {
    setLoadingCloud(true);
    try {
      const saves = await listUserCloudSaves();
      setCloudSaves(saves);
    } catch (e) {
      console.error("Cloud saves error:", e);
    } finally {
      setLoadingCloud(false);
    }
  };

  const handleSelectLocal = () => {
    if (!localGame) return;
    proceduralRadio.playUIChime("CONFIRM");
    onSelectGame(localGame);
  };

  const handleSelectCloud = async (saveId: string) => {
    proceduralRadio.playUIChime("CLICK");
    setLoadingCloud(true);
    try {
      const state = await loadGameFromCloud(saveId);
      if (state) {
        proceduralRadio.playUIChime("CONFIRM");
        onSelectGame(state);
      }
    } catch (e) {
      console.error("Error loading cloud save:", e);
    } finally {
      setLoadingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl max-h-[85vh] rounded-2xl border p-6 flex flex-col justify-between font-sans ${
        theme.isLight
          ? "bg-white border-slate-300 text-slate-900 shadow-xl"
          : "bg-slate-950 border-slate-800 text-slate-100 shadow-2xl"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 font-mono font-bold text-sm uppercase">
            <FolderOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>REGISTRE DE CHARGEMENT DE PARTIE</span>
          </div>
          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 my-4 font-mono text-xs">
          <button
            onClick={() => setActiveTab("LOCAL")}
            className={`px-4 py-2 font-bold uppercase flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
              activeTab === "LOCAL"
                ? "border-sky-600 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Mémoire Locale</span>
          </button>

          <button
            onClick={() => setActiveTab("CLOUD")}
            className={`px-4 py-2 font-bold uppercase flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
              activeTab === "CLOUD"
                ? "border-sky-600 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Nuage Firestore ({cloudSaves.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {activeTab === "LOCAL" && (
            localGame ? (
              <div
                onClick={handleSelectLocal}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                  theme.isLight
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-300"
                    : "bg-slate-900/80 hover:bg-slate-800 border-slate-800"
                }`}
              >
                <div className="space-y-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold">
                      SAUVEGARDE ACTIVE
                    </span>
                    <span className="font-bold text-sm font-sans">
                      {localGame.genesis.pillar_2_environment.target_planet}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Sol {localGame.clock.sol} · Pop : {localGame.resources.population_active} · Énergie : {Math.round(localGame.resources.energy_gw)} GW
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Leader : {localGame.genesis.pillar_1_governance.leader_profile.full_name || "Primat-Archonte"}
                  </div>
                </div>

                <button className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-2 cursor-pointer">
                  <Play className="w-4 h-4 fill-current" /> CHARGER
                </button>
              </div>
            ) : (
              <div className="p-8 text-center font-mono text-xs text-slate-500">
                Aucune sauvegarde locale disponible en mémoire.
              </div>
            )
          )}

          {activeTab === "CLOUD" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2">
                <span>Parties synchronisées dans votre coffre Cloud</span>
                <button
                  onClick={fetchCloudSaves}
                  className="flex items-center gap-1 text-sky-600 hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCloud ? "animate-spin" : ""}`} /> Actualiser
                </button>
              </div>

              {cloudSaves.length > 0 ? (
                cloudSaves.map((save) => (
                  <div
                    key={save.id}
                    onClick={() => handleSelectCloud(save.id)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                      theme.isLight
                        ? "bg-slate-50 hover:bg-slate-100 border-slate-300"
                        : "bg-slate-900/80 hover:bg-slate-800 border-slate-800"
                    }`}
                  >
                    <div className="space-y-1 font-mono">
                      <div className="font-bold text-sm font-sans">{save.gameName}</div>
                      <div className="text-xs text-slate-500">
                        Sol {save.sol} · Pop : {save.population} · Énergie : {save.energy} GW · Stabilité : {save.stability}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Modifié le : {new Date(save.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    <button className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-2 cursor-pointer">
                      <Play className="w-4 h-4 fill-current" /> CHARGER
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center font-mono text-xs text-slate-500">
                  {loadingCloud ? "Chargement des données Cloud..." : "Aucune sauvegarde Cloud trouvée."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold uppercase rounded-lg cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
