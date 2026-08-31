import React, { useState } from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import {
  Activity,
  Heart,
  Brain,
  Eye,
  Shield,
  Award,
  Zap,
  Sparkles,
  User,
  Clock,
  X,
} from "lucide-react";

interface LeaderModalProps {
  gameState: GameState;
  theme: ThemeDefinition;
  onClose: () => void;
}

export function LeaderModal({ gameState, theme, onClose }: LeaderModalProps) {
  const leader = gameState.genesis.pillar_1_governance.leader_profile;
  const [activeTab, setActiveTab] = useState<"ANATOMIE" | "BIOGRAPHIE" | "SPECIAL">("ANATOMIE");
  const isLight = theme.isLight ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div className={`border rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl font-mono animate-in zoom-in-95 duration-200 ${
        isLight ? "bg-slate-50 border-slate-300 text-slate-900 shadow-slate-900/10" : "bg-slate-950 border-cyan-500/40 text-slate-100"
      }`}>
        {/* Header Modal */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-white/10"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold shadow-md ${
              isLight ? "border-slate-300 bg-slate-100 text-slate-800" : "border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-cyan-400/20"
            }`}>
              <User className={`w-5 h-5 ${isLight ? "text-slate-800" : "text-cyan-400"}`} />
            </div>
            <div>
              <div className={`text-base font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                {leader.title} <span className={`text-xs font-normal ${isLight ? "text-sky-700 font-semibold" : "text-cyan-400"}`}>({leader.philosophical_alignment})</span>
              </div>
              <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Âge biologique : {leader.biological_age_sols} Sols · Âge chronologique : {leader.chronological_age_sols} Sols
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              proceduralRadio.playUIChime("CLICK");
              onClose();
            }}
            className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
              isLight ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200" : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className={`flex overflow-x-auto border-b shrink-0 text-xs scroll-horizontal-touch ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/10"
        }`}>
          {[
            { id: "ANATOMIE", label: "Santé & Anatomie", icon: Activity },
            { id: "SPECIAL", label: "Attributs & Compétences", icon: Zap },
            { id: "BIOGRAPHIE", label: "Biographie & Parcours", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  proceduralRadio.playUIChime("CLICK");
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 min-w-[140px] py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? isLight
                      ? "border-slate-900 text-slate-900 font-bold bg-white"
                      : "border-cyan-400 text-cyan-300 font-bold bg-cyan-500/10"
                    : isLight
                    ? "border-transparent text-slate-600 hover:text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className={`p-5 flex-1 overflow-y-auto overflow-x-auto space-y-4 text-xs scroll-smooth-touch ${
          isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
        }`}>
          {/* ========================================================= */}
          {/* TAB 1 : MATRICE ANATOMIQUE & BIEN-ÊTRE                    */}
          {/* ========================================================= */}
          {activeTab === "ANATOMIE" && (
            <div className="space-y-4">
              {/* Gauges globales de santé et bien-être */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900/70 border border-white/5 rounded-xl">
                  <div className="text-slate-400 text-[10px]">SANTÉ / INTÉGRITÉ</div>
                  <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
                    <Activity className="w-4 h-4" /> {Math.round(leader.overall_health_pct)}%
                  </div>
                </div>
                <div className="p-3 bg-slate-900/70 border border-white/5 rounded-xl">
                  <div className="text-slate-400 text-[10px]">MORAL & BONHEUR</div>
                  <div className="text-base font-bold text-cyan-300 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-cyan-400" /> {Math.round(leader.happiness_pct)}%
                  </div>
                </div>
                <div className="p-3 bg-slate-900/70 border border-white/5 rounded-xl">
                  <div className="text-slate-400 text-[10px]">SOCIABILISATION</div>
                  <div className="text-base font-bold text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> {Math.round(leader.socialization_pct ?? 78)}%
                  </div>
                </div>
                <div className="p-3 bg-slate-900/70 border border-white/5 rounded-xl">
                  <div className="text-slate-400 text-[10px]">FATIGUE & STRESS</div>
                  <div className="text-base font-bold text-amber-400 flex items-center gap-1">
                    <Brain className="w-4 h-4" /> {Math.round(leader.fatigue_pct)}% ({Math.round(leader.stress_level)}/100)
                  </div>
                </div>
              </div>

              {/* Organes & Implants */}
              <div className="space-y-2">
                <div className="text-cyan-400 font-bold">BILAN DES ORGANES ET IMPLANTS BIOMÉCANIQUES :</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: "Cerveau & Synchronisation N.I.A.", val: leader.anatomy.brain_sync_pct, ok: true },
                    { name: "Cœur & Vaisseaux Coronaires", val: leader.anatomy.heart_condition_pct, ok: true },
                    { name: "Poumons & Résidus de Silice", val: `${leader.anatomy.lungs_silica_exposure_pct}% dépôt`, ok: leader.anatomy.lungs_silica_exposure_pct < 20 },
                    { name: "Foie & Toxicité Sanguine", val: `${leader.anatomy.liver_toxicity_pct}% tox`, ok: leader.anatomy.liver_toxicity_pct < 15 },
                    { name: "Capteurs Optiques Cybernétiques", val: leader.anatomy.optics_acuity_pct, ok: true },
                    { name: "Squelette & Usure Gravitationnelle", val: `${leader.anatomy.skeleton_wear_pct}% usure`, ok: true },
                  ].map((org, i) => (
                    <div key={i} className="p-2.5 bg-slate-900/50 border border-white/5 rounded-lg flex items-center justify-between">
                      <span className="text-slate-300">{org.name}</span>
                      <span className={org.ok ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {typeof org.val === "number" ? `${org.val}%` : org.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-300 text-[11px]">
                ✦ Implants cybernétiques actifs : {leader.anatomy.cybernetic_implants_count} modules couplés à la matrice neuronale.
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2 : ATTRIBUTS S.P.E.C.I.A.L. & STATISTIQUES PRESTIGE   */}
          {/* ========================================================= */}
          {activeTab === "SPECIAL" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { k: "Force (S)", v: leader.special.strength },
                  { k: "Perception (P)", v: leader.special.perception },
                  { k: "Endurance (E)", v: leader.special.endurance },
                  { k: "Charisme (C)", v: leader.special.charisma },
                  { k: "Intelligence (I)", v: leader.special.intelligence },
                  { k: "Agilité (A)", v: leader.special.agility },
                  { k: "Chance (L)", v: leader.special.luck },
                ].map((spec, i) => (
                  <div key={i} className="p-3 bg-slate-900/70 border border-white/5 rounded-xl text-center">
                    <div className="text-[10px] text-slate-400 mb-1">{spec.k}</div>
                    <div className="text-lg font-bold text-cyan-300">{spec.v}/100</div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-2">
                <div className="text-cyan-400 font-bold">MÉTRIQUES DE GLOIRE, POPULARITÉ & CRÉDITS</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 bg-slate-900/50 border border-white/5 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Score de Gloire :</span>
                    <span className="text-amber-400 font-bold">{leader.prestige.glory_score} pts</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/50 border border-white/5 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Réputation Diplomatique :</span>
                    <span className="text-emerald-400 font-bold">{leader.prestige.diplomatic_reputation}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/50 border border-white/5 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Popularité Civique :</span>
                    <span className="text-sky-300 font-bold">{leader.prestige.popularity_pct ?? 82}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/50 border border-white/5 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400">Crédits Personnels :</span>
                    <span className="text-purple-400 font-bold">{leader.prestige.personal_credits_cr ?? 1250} CR</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3 : CHRONOLOGIE DE VIE BITLIFE                        */}
          {/* ========================================================= */}
          {activeTab === "BIOGRAPHIE" && (
            <div className="space-y-3">
              <div className="text-cyan-400 font-bold">REGISTRE DES ÉVÉNEMENTS MARQUANTS :</div>
              <div className="space-y-2">
                {[
                  { sol: 1, text: "Prise de fonction lors du grand atterrissage de l'Arche sur Kaelis." },
                  { sol: 350, text: "Ratification du premier traité de répartition énergétique des dômes." },
                  { sol: 800, text: "Installation de l'interface neuronale directe avec l'IA de bord." },
                  { sol: 1200, text: "Début de la séquence d'expansion de la colonie (Sol actuel)." },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/60 border border-white/5 rounded-lg flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold text-[10px] shrink-0">
                      SOL {item.sol}
                    </span>
                    <span className="text-slate-300 font-sans text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
