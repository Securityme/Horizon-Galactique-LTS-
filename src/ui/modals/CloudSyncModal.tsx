import React, { useState, useEffect } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  saveGameToCloud,
  listUserCloudSaves,
  loadGameFromCloud,
  CloudSaveMetadata,
} from "../../services/cloudSaveService";
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Save,
  Download,
  ShieldCheck,
  UserCheck,
  X,
  AlertTriangle,
  HardDrive,
  Database,
  CheckCircle2,
} from "lucide-react";

interface CloudSyncModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
  onLoadState?: (loadedState: GameState) => void;
}

export function CloudSyncModal({
  gameState,
  theme,
  onClose,
  onLoadState,
}: CloudSyncModalProps) {
  const isLight = theme.isLight ?? false;
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [cloudSaves, setCloudSaves] = useState<CloudSaveMetadata[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSaves, setIsLoadingSaves] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchSaves();
      }
    });
    return () => unsub();
  }, []);

  const fetchSaves = async () => {
    setIsLoadingSaves(true);
    try {
      const list = await listUserCloudSaves();
      setCloudSaves(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSaves(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      setStatusMessage("Connexion requise pour sauvegarder dans le Cloud.");
      return;
    }

    setIsSaving(true);
    try {
      proceduralRadio.playUIChime("CONFIRM");
      const saved = await saveGameToCloud(gameState);
      if (saved) {
        setStatusMessage(`Sauvegarde Cloud réussie ! Sol ${gameState.clock.sol}`);
        fetchSaves();
      }
    } catch (err: any) {
      setStatusMessage(`Erreur de sauvegarde Cloud : ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSave = async (saveId: string) => {
    try {
      proceduralRadio.playUIChime("CONFIRM");
      const loaded = await loadGameFromCloud(saveId);
      if (loaded && onLoadState) {
        onLoadState(loaded);
        setStatusMessage("Partie chargée depuis le Cloud !");
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      setStatusMessage(`Erreur de chargement : ${err?.message || err}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className={`border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl font-mono animate-in zoom-in-95 duration-200 ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/10"
            : "bg-slate-950 border-emerald-500/40 text-slate-100"
        }`}
      >
        {/* Header Modal */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/80 border-white/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold shadow-md ${
                isLight
                  ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                  : "border-emerald-500/50 bg-emerald-950/50 text-emerald-300 shadow-emerald-500/20"
              }`}
            >
              <Cloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div
                className={`text-base font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}
              >
                Synchronisation Cloud Firestore
              </div>
              <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Sauvegarde persistante inter-appareils & télémétrie distante
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onClose();
            }}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
              isLight
                ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs scroll-smooth-touch">
          {statusMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 flex items-center justify-between">
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage(null)} className="text-emerald-400 font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Account Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              user
                ? isLight
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                : isLight
                ? "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-amber-950/30 border-amber-500/40 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 shrink-0" />
              <div>
                <div className="font-bold text-sm">
                  {user ? `Compte Cloud : ${user.displayName || user.email || user.uid}` : "Mode Invité (Hors-Ligne)"}
                </div>
                <div className="text-[10px] opacity-80">
                  {user ? "Authentifié via Firebase. Vos sauvegardes sont chiffrées." : "Connectez-vous pour activer la synchronisation Cloud automatique."}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className={`px-3 py-2 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isSaving
                  ? "bg-slate-800 text-slate-500 border-slate-700"
                  : isLight
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-400"
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Sauvegarde..." : "Sauvegarder Sol Actuel"}</span>
            </button>
          </div>

          {/* Cloud Saves List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 flex items-center gap-2">
                <Database className="w-4 h-4" /> MES SAUVEGARDES DANS LE CLOUD ({cloudSaves.length})
              </span>
              <button
                onClick={fetchSaves}
                disabled={isLoadingSaves}
                className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingSaves ? "animate-spin" : ""}`} /> Actualiser
              </button>
            </div>

            {cloudSaves.length === 0 ? (
              <div className="p-4 text-center text-slate-400 italic bg-black/40 rounded-xl border border-white/5">
                Aucune sauvegarde Cloud enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cloudSaves.map((save) => (
                  <div
                    key={save.id}
                    className="p-3 bg-slate-900/70 border border-white/10 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        {save.gameName} <span className="text-sky-400 text-[10px]">SOL {save.sol}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pop : {save.population} · Énergie : {save.energy} GW · Mise à jour : {new Date(save.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoadSave(save.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Charger
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
