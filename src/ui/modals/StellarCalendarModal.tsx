import React from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import {
  Calendar,
  Clock,
  Compass,
  Rocket,
  Sparkles,
  Zap,
  Globe,
  Sun,
  X,
  TrendingUp,
  Award,
} from "lucide-react";

interface StellarCalendarModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
}

export function StellarCalendarModal({ gameState, theme, onClose }: StellarCalendarModalProps) {
  const isLight = theme.isLight ?? false;
  const clock = gameState.clock;

  const solsToNextEra = Math.max(0, 500 - (clock.sol % 500));
  const eraProgress = Math.round(((clock.sol % 500) / 500) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div
        className={`border rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl font-mono animate-in zoom-in-95 duration-200 ${
          isLight
            ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/10"
            : "bg-slate-950 border-cyan-500/40 text-slate-100"
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
                  ? "border-sky-500 bg-sky-100 text-sky-900"
                  : "border-sky-500/50 bg-sky-950/50 text-sky-300 shadow-sky-500/20"
              }`}
            >
              <Calendar className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div
                className={`text-base font-bold flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}
              >
                Calendrier Stellaire & Époque Interstellaire
              </div>
              <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Chrono-matrice de navigation de l'Arche des Étoiles
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
          {/* Main Time Counter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-sky-950/40 border border-sky-500/40 rounded-xl space-y-1">
              <div className="text-sky-400 text-[10px] font-bold">SOLS ÉCOULÉS</div>
              <div className="text-3xl font-bold text-sky-300">SOL {clock.sol}</div>
              <div className="text-[10px] text-slate-400">Heure locale : {clock.tickInSol}:00 UTC</div>
            </div>

            <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-1">
              <div className="text-purple-400 text-[10px] font-bold">PALIER SPATIAL EN COURS</div>
              <div className="text-3xl font-bold text-purple-300">PALIER {clock.palier}</div>
              <div className="text-[10px] text-slate-400">Progression ère : {eraProgress}%</div>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1">
              <div className="text-amber-400 text-[10px] font-bold">PROCHAIN SAUT DE FRACTURE</div>
              <div className="text-3xl font-bold text-amber-300">{solsToNextEra} SOLS</div>
              <div className="text-[10px] text-slate-400">Alignement de la Porte Discontinuité</div>
            </div>
          </div>

          {/* Chrono Timeline */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isLight ? "bg-white border-slate-300" : "bg-slate-900/60 border-white/10"
            }`}
          >
            <div className="font-bold text-sky-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> CHRONOLOGIE DES ÉPOQUES GALACTIQUES
            </div>
            <div className="space-y-3">
              {[
                { era: 1, title: "L'Émergence & L'Atterrissage de l'Arche", status: clock.palier >= 1 ? "ACCOMPLI" : "EN ATTENTE" },
                { era: 2, title: "La Stabilisation & L'Expansion des Dômes", status: clock.palier >= 2 ? "ACCOMPLI" : "EN ATTENTE" },
                { era: 3, title: "La Biorecherche & La Maîtrise Quantique", status: clock.palier >= 3 ? "EN COURS" : "FUTUR" },
                { era: 4, title: "L'Arcologie & La Mégastructure Stellare", status: clock.palier >= 4 ? "FUTUR" : "FUTUR" },
                { era: 5, title: "La Porte de Discontinuité & L'Ascension", status: clock.palier >= 5 ? "FUTUR" : "FUTUR" },
              ].map((item) => (
                <div key={item.era} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-sky-900/80 border border-sky-400 text-sky-200 font-bold flex items-center justify-center text-xs">
                      È{item.era}
                    </span>
                    <span className="text-slate-200 font-bold">{item.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === "ACCOMPLI" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                    item.status === "EN COURS" ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse" :
                    "bg-slate-800 text-slate-400"
                  }`}>
                    {item.status}
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
