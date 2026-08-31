import React, { useState, useEffect } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import { auth } from "../../lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  Award,
  Trophy,
  UserCheck,
  Shield,
  Sparkles,
  Zap,
  Globe,
  Clock,
  X,
  Star,
  Layers,
  CheckCircle2,
  Cloud,
} from "lucide-react";

interface PlayerProfileModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
}

export function PlayerProfileModal({ gameState, theme, onClose }: PlayerProfileModalProps) {
  const isLight = theme.isLight ?? false;
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  const achievements = [
    { id: "FIRST_DOME", title: "Premier Dôme Érigé", desc: "Poser le premier dôme d'habitation sur l'exoplanète.", unlocked: gameState.buildings.length >= 1 },
    { id: "SOL_100", title: "Cent Sols de Solitude", desc: "Survivre plus de 100 Sols sous la protection de l'Arche.", unlocked: gameState.clock.sol >= 100 },
    { id: "SILICA_MASTERY", title: "Maître de la Silice", desc: "Relever le défi d'une tempête de silice sans perte de dôme.", unlocked: !gameState.climate.silica_storm_active },
    { id: "ENERGY_SURPLUS", title: "Abondance Photovoltaïque", desc: "Atteindre un surplus énergétique de 100 GW.", unlocked: gameState.resources.energy_gw >= 100 },
    { id: "INTERSTELLAR_GATE", title: "Porte des Étoiles", desc: "Débloquer l'ère 5 et initier la séquence de discontinuité.", unlocked: gameState.clock.palier >= 4 },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className={`border rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl font-mono animate-in zoom-in-95 duration-200 ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/10"
            : "bg-slate-950 border-purple-500/40 text-slate-100"
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
                  ? "border-purple-500 bg-purple-100 text-purple-900"
                  : "border-purple-500/50 bg-purple-950/50 text-purple-300 shadow-purple-500/20"
              }`}
            >
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div
                className={`text-base font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}
              >
                Profil Joueur & Registre Méta
              </div>
              <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Compte global, succès interstellaire et statistiques de carrière
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
          {/* Player Identity Card */}
          <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-900/60 border border-purple-400/60 flex items-center justify-center text-purple-200 font-bold text-lg">
                {currentUser?.displayName?.[0] || "J"}
              </div>
              <div>
                <div className="text-base font-bold text-purple-300 flex items-center gap-2">
                  {currentUser?.displayName || currentUser?.email || "Joueur Anonyme"}{" "}
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-purple-300 font-normal">
                    Niveau Méta 14
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ID Firestore : {currentUser?.uid ? `${currentUser.uid.slice(0, 12)}...` : "Non connecté"}
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-amber-400 font-bold text-sm flex items-center justify-end gap-1">
                <Star className="w-4 h-4 fill-amber-400" /> {unlockedCount * 250} Pts de Gloire
              </div>
              <div className="text-[10px] text-slate-400">{unlockedCount} / {achievements.length} Succès</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl">
              <div className="text-[10px] text-slate-400">SOLS TOTAUX SURVÉCUS</div>
              <div className="text-xl font-bold text-sky-400">{gameState.clock.sol} Sols</div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl">
              <div className="text-[10px] text-slate-400">DÔMES CONSTRUITS</div>
              <div className="text-xl font-bold text-emerald-400">{gameState.buildings.length} dômes</div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl">
              <div className="text-[10px] text-slate-400">RÉSEAU ÉNERGÉTIQUE</div>
              <div className="text-xl font-bold text-amber-400">{Math.round(gameState.resources.energy_gw)} GW</div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase">PALIER D'ÈRE ACTUEL</div>
              <div className="text-xl font-bold text-purple-400">Palier {gameState.clock.palier}</div>
            </div>
          </div>

          {/* Achievements List */}
          <div className="space-y-2">
            <div className="font-bold text-purple-400 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> HAUTS-FAITS ET SUCCÈS DÉBLOQUÉS
            </div>
            <div className="space-y-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    ach.unlocked
                      ? "bg-purple-950/20 border-purple-500/40 text-purple-200"
                      : "bg-slate-950/40 border-white/5 text-slate-500 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${ach.unlocked ? "text-purple-400" : "text-slate-600"}`} />
                    <div>
                      <div className="font-bold text-slate-200">{ach.title}</div>
                      <div className="text-[10px] text-slate-400">{ach.desc}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                    ach.unlocked ? "bg-purple-500/30 text-purple-200 border border-purple-400/50" : "bg-slate-800 text-slate-400"
                  }`}>
                    {ach.unlocked ? "+250 PTS" : "VERROUILLÉ"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
