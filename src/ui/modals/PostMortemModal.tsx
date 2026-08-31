import React from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import { AlertOctagon, RefreshCw, Skull, GitBranch } from "lucide-react";

interface PostMortemModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onRestart: () => void;
}

export function PostMortemModal({ gameState, theme, onRestart }: PostMortemModalProps) {
  const isLight = theme.isLight ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg select-none">
      <div className={`border rounded-2xl max-w-xl w-full p-6 text-center font-mono space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scroll-smooth-touch ${
        isLight ? "bg-white border-red-300 text-slate-900" : "bg-slate-950 border-red-600/50 text-slate-100 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
      }`}>
        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto ${
          isLight ? "bg-red-100 border-red-500 text-red-600" : "bg-red-950/60 border-red-500 text-red-500 animate-bounce"
        }`}>
          <Skull className="w-8 h-8" />
        </div>

        <div>
          <div className="text-xl font-bold text-red-500 uppercase tracking-wider">
            FIN DE PARTIE // BILAN DE LA COLONISATION
          </div>
          <div className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Graine de génération : 0x{gameState.genesis.master_seed.toString(16).toUpperCase()}
          </div>
        </div>

        <div className={`p-4 rounded-xl text-xs text-left space-y-1 border ${
          isLight ? "bg-red-50 border-red-200 text-red-900" : "bg-red-950/20 border-red-500/30 text-red-200"
        }`}>
          <div className="font-bold text-red-500 mb-1">Rapport Diagnostique Final :</div>
          <div>{gameState.gameOverReason || "Extinction métabolique des colons et arrêt des dômes."}</div>
        </div>

        {/* Statistiques Finales */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-white/5"}`}>
            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>SOLS SURVÉCUS</div>
            <div className={`text-base font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{gameState.clock.sol} Sols</div>
          </div>
          <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-white/5"}`}>
            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>COLONS SURVIVANTS</div>
            <div className="text-base font-bold text-red-500">{gameState.resources.population_active}</div>
          </div>
          <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-white/5"}`}>
            <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-500"}`}>GLOIRE FINALE</div>
            <div className="text-base font-bold text-amber-500">
              {gameState.genesis.pillar_1_governance.leader_profile.prestige.glory_score} pts
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            proceduralRadio.playUIChime("CONFIRM");
            onRestart();
          }}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Configurer une nouvelle partie
        </button>
      </div>
    </div>
  );
}
