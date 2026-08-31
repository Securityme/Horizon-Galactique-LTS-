import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GenesisLorePayload, GenesisLorePayloadSchema, RegimeType, PhilosophicalAlignment } from "../../types/genesis";
import {
  LEADER_ARCHETYPES,
  PEOPLE_PRESETS,
  PLANET_PRESETS,
  SHIP_PRESETS,
  STAR_SYSTEM_PRESETS,
  TERRITORY_PRESETS,
  GAMEPLAY_BONUS_PRESETS,
  GAMEPLAY_MALUS_PRESETS,
} from "../../simulation/constants";
import { MASTER_SEED_DEFAULT, pcg32 } from "../../simulation/prng";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";
import { Sparkles, Shield, Rocket, Globe, Cpu, ArrowRight, ArrowLeft, Dices, CheckCircle2 } from "lucide-react";

interface SetupWizardProps {
  theme: ThemeDefinition;
  onLaunchGame: (genesis: GenesisLorePayload) => void;
  onBackToMainMenu?: () => void;
}

export function SetupWizard({ theme, onLaunchGame, onBackToMainMenu }: SetupWizardProps) {
  const [currentPillar, setCurrentPillar] = useState<1 | 2 | 3 | 4>(1);
  const [slideDirection, setSlideDirection] = useState<"NEXT" | "PREV">("NEXT");

  // Touch gesture tracking for horizontal swipe
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Pilier 1 state
  const [regimeType, setRegimeType] = useState<RegimeType>("UNION_SOLAIRE");
  const [leaderArchetype, setLeaderArchetype] = useState<keyof typeof LEADER_ARCHETYPES>("DIPLOMATE_HUMANISTE");
  const [shipModel, setShipModel] = useState<keyof typeof SHIP_PRESETS>("ASTRA_NOVA_PRIME");

  // Pilier 2 state
  const [starSystem, setStarSystem] = useState<keyof typeof STAR_SYSTEM_PRESETS>("ORION_SIGMA");
  const [targetPlanet, setTargetPlanet] = useState<keyof typeof PLANET_PRESETS>("KAELIS_CRUST");

  // Pilier 3 state
  const [specialistCorps, setSpecialistCorps] = useState<"ENGINEERS" | "XENOBIOLOGISTS" | "LOGISTICS" | "MEDIATORS">("ENGINEERS");
  const [territoryLayout, setTerritoryLayout] = useState<keyof typeof TERRITORY_PRESETS>("MAILLAGE_ALPHA");
  const [peopleArchetype, setPeopleArchetype] = useState<keyof typeof PEOPLE_PRESETS>("ASTRALIENS_SAPIENS");
  const [cargoType, setCargoType] = useState<"SURVIVAL" | "INFRASTRUCTURE" | "RESEARCH">("INFRASTRUCTURE");
  const [selectedBonus, setSelectedBonus] = useState<string[]>(["SOLAR_BOOST"]);
  const [selectedMalus, setSelectedMalus] = useState<string[]>(["VOLATILE_REACTORS"]);

  // Pilier 4 state
  const [masterSeed, setMasterSeed] = useState<number>(MASTER_SEED_DEFAULT);
  const [rivalArchonsCount, setRivalArchonsCount] = useState<number>(3);
  const [rivalAggression, setRivalAggression] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [difficultyMode, setDifficultyMode] = useState<"REALISM_FLEX_SOL_1_TO_10" | "ROGUE_LIKE_STRICT">("REALISM_FLEX_SOL_1_TO_10");
  const [customNotes, setCustomNotes] = useState<string>("");

  const isLight = theme.isLight ?? true;

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detect horizontal swipe if deltaX > deltaY threshold (to prevent triggering on vertical scroll)
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && currentPillar < 4) {
        // Swipe left -> Next pillar
        setSlideDirection("NEXT");
        setCurrentPillar((prev) => (prev + 1) as any);
        proceduralRadio.playUIChime("CLICK");
      } else if (deltaX > 0 && currentPillar > 1) {
        // Swipe right -> Prev pillar
        setSlideDirection("PREV");
        setCurrentPillar((prev) => (prev - 1) as any);
        proceduralRadio.playUIChime("CLICK");
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const goToPillar = (num: 1 | 2 | 3 | 4) => {
    setSlideDirection(num > currentPillar ? "NEXT" : "PREV");
    setCurrentPillar(num);
    proceduralRadio.playUIChime("CLICK");
  };

  // Dérivation automatique du sigle N.I.A. (§ 15.1 du cahier des charges)
  const getNiaAcronym = (): string => {
    if (leaderArchetype === "TECHNOCRATE_CYBERNETIQUE" && shipModel === "ASTRA_NOVA_PRIME") return "KAIROS-SYNAPSE";
    if (leaderArchetype === "COMMANDANT_MARTIAL" && shipModel === "CHRONOS_HEAVY") return "LOGOS-9";
    if (leaderArchetype === "DIPLOMATE_HUMANISTE" && shipModel === "PROMETHEE_BIO") return "A.R.C.H.E.-OS";
    if (leaderArchetype === "TECHNOCRATE_CYBERNETIQUE" && shipModel === "CHRONOS_HEAVY") return "COGNI-NEXUS";
    if (leaderArchetype === "COMMANDANT_MARTIAL" && shipModel === "ASTRA_NOVA_PRIME") return "PRISMA-CORE";
    if (leaderArchetype === "DIPLOMATE_HUMANISTE" && shipModel === "ASTRA_NOVA_PRIME") return "SYNAPSE-HOLON";
    return "N.I.A.-KAIROS";
  };

  const getNiaFullName = (): string => {
    const acronym = getNiaAcronym();
    return `${acronym} // Autonomous Quantum Neural Habitat Engine`;
  };

  const handleRandomize = () => {
    proceduralRadio.playUIChime("CLICK");
    const newSeed = Math.floor(Math.random() * 4294967290);
    setMasterSeed(newSeed);
    const rng = pcg32(newSeed);

    const regimes: RegimeType[] = ["UNION_SOLAIRE", "SOLARCHIE", "FEDERATION_SOLAIRE"];
    setRegimeType(regimes[Math.floor(rng() * regimes.length)]);

    const leaderKeys = Object.keys(LEADER_ARCHETYPES) as Array<keyof typeof LEADER_ARCHETYPES>;
    setLeaderArchetype(leaderKeys[Math.floor(rng() * leaderKeys.length)]);

    const shipKeys = Object.keys(SHIP_PRESETS) as Array<keyof typeof SHIP_PRESETS>;
    setShipModel(shipKeys[Math.floor(rng() * shipKeys.length)]);

    const starKeys = Object.keys(STAR_SYSTEM_PRESETS) as Array<keyof typeof STAR_SYSTEM_PRESETS>;
    setStarSystem(starKeys[Math.floor(rng() * starKeys.length)]);

    const planetKeys = Object.keys(PLANET_PRESETS) as Array<keyof typeof PLANET_PRESETS>;
    setTargetPlanet(planetKeys[Math.floor(rng() * planetKeys.length)]);

    const territoryKeys = Object.keys(TERRITORY_PRESETS) as Array<keyof typeof TERRITORY_PRESETS>;
    setTerritoryLayout(territoryKeys[Math.floor(rng() * territoryKeys.length)]);

    const peopleKeys = Object.keys(PEOPLE_PRESETS) as Array<keyof typeof PEOPLE_PRESETS>;
    setPeopleArchetype(peopleKeys[Math.floor(rng() * peopleKeys.length)]);
  };

  const handleCompileAndLaunch = () => {
    proceduralRadio.playUIChime("CONFIRM");

    const uuidPrefix =
      regimeType === "UNION_SOLAIRE"
        ? "UNION"
        : regimeType === "SOLARCHIE"
        ? "SOLARCHIE"
        : regimeType === "FEDERATION_SOLAIRE"
        ? "FEDERATION"
        : "CUSTOM";

    const alignmentMap: Record<string, PhilosophicalAlignment> = {
      TECHNOCRATE_CYBERNETIQUE: "CARTESIEN_AUTORITAIRE",
      COMMANDANT_MARTIAL: "STRUCTURALISTE_COLLECTIF",
      DIPLOMATE_HUMANISTE: "EXISTENTIALISTE_DEMOCRATE",
      XENOBIOLOGISTE_GENETICIEN: "CYBERNETIQUE_BALANCE",
      SCIENTIFIQUE_QUANTIQUE: "CARTESIEN_AUTORITAIRE",
    };

    const initialCargo = {
      SURVIVAL: { biomass_kg: 8000, oxygen_l: 35000, water_l: 40000, energy_gw: 100, alloys_tonnes: 40, deuterium_kg: 80 },
      INFRASTRUCTURE: { biomass_kg: 5000, oxygen_l: 25000, water_l: 30000, energy_gw: 140, alloys_tonnes: 80, deuterium_kg: 120 },
      RESEARCH: { biomass_kg: 4000, oxygen_l: 20000, water_l: 25000, energy_gw: 160, alloys_tonnes: 50, deuterium_kg: 200 },
    }[cargoType];

    const payload: GenesisLorePayload = {
      game_id: `${uuidPrefix}-${masterSeed.toString(16).padStart(8, "0")}-GAME-001`,
      master_seed: masterSeed,
      created_at_tick: 0,
      document_version: "35.0.0",
      pillar_1_governance: {
        regime_type: regimeType,
        uuid_prefix: uuidPrefix,
        ship_model: shipModel,
        governance_level: 1,
        senate_stability: 80,
        leader_profile: {
          name: "Gouverneur Suprême",
          title: "Gouverneur d'Expédition",
          overall_health_pct: 95,
          happiness_pct: 85,
          socialization_pct: 80,
          fatigue_pct: 10,
          stress_level: 15,
          biological_age_sols: 1200,
          chronological_age_sols: 8500,
          philosophical_alignment: alignmentMap[leaderArchetype],
          anatomy: {
            brain_sync_pct: 98,
            heart_condition_pct: 94,
            lungs_silica_exposure_pct: 0,
            liver_toxicity_pct: 2,
            kidney_efficiency_pct: 95,
            optics_acuity_pct: 100,
            skeleton_wear_pct: 5,
            cybernetic_implants_count: (leaderArchetype === "TECHNOCRATE_CYBERNETIQUE" || leaderArchetype === "SCIENTIFIQUE_QUANTIQUE") ? 4 : 2,
            active_injuries: [],
          },
          special: {
            strength: leaderArchetype === "COMMANDANT_MARTIAL" ? 85 : 55,
            perception: leaderArchetype === "SCIENTIFIQUE_QUANTIQUE" ? 85 : 75,
            endurance: (leaderArchetype === "COMMANDANT_MARTIAL" || leaderArchetype === "XENOBIOLOGISTE_GENETICIEN") ? 85 : 60,
            charisma: (leaderArchetype === "DIPLOMATE_HUMANISTE" || leaderArchetype === "XENOBIOLOGISTE_GENETICIEN") ? 90 : 60,
            intelligence: (leaderArchetype === "TECHNOCRATE_CYBERNETIQUE" || leaderArchetype === "SCIENTIFIQUE_QUANTIQUE") ? 95 : 70,
            agility: 65,
            luck: 60,
          },
          prestige: {
            glory_score: 100,
            diplomatic_reputation: 70,
            civic_inspiration_pct: 85,
            popularity_pct: 80,
            personal_credits_cr: 500,
          },
          mandate: {
            archetype: leaderArchetype,
            leader_level: 1,
            charisma: (leaderArchetype === "DIPLOMATE_HUMANISTE" || leaderArchetype === "XENOBIOLOGISTE_GENETICIEN") ? 90 : 60,
            intelligence: (leaderArchetype === "TECHNOCRATE_CYBERNETIQUE" || leaderArchetype === "SCIENTIFIQUE_QUANTIQUE") ? 95 : 70,
            wisdom: 80,
            active_perks: ["DECRET_PRIMAL", "INSPIRATION_PIONNIERS"],
            unlocked_tree_nodes: ["GOV_NODE_01"],
            skills: { R_AND_D: 80, DIPLOMATIE: 75, INDUSTRIE: 70 },
          },
        },
        factions: [
          {
            id: "FAC-1",
            name: "Rationalistes",
            doctrine: "Logique & Efficacité",
            approval_rating: 70,
            radicalization_level: 10,
            population_pct: 35,
            demands: ["Efficacité maximale des réacteurs", "Priorité aux calculs N.I.A."],
            color: "#00d4ff",
          },
          {
            id: "FAC-2",
            name: "Biophiliques",
            doctrine: "Symbiose Végétale",
            approval_rating: 75,
            radicalization_level: 5,
            population_pct: 30,
            demands: ["Extension des serres agro-cogénératives", "Bien-être des colons"],
            color: "#10b981",
          },
          {
            id: "FAC-3",
            name: "Ingénieurs du Vide",
            doctrine: "Expansion Industrielle",
            approval_rating: 65,
            radicalization_level: 15,
            population_pct: 35,
            demands: ["Exploitation minière intensive en Zone B", "Blindage des dômes"],
            color: "#f59e0b",
          },
        ],
      },
      pillar_2_environment: {
        star_system: starSystem,
        target_planet: targetPlanet,
        gravity_g: PLANET_PRESETS[targetPlanet].gravity_g,
        atmosphere_p_atm: PLANET_PRESETS[targetPlanet].p_atm,
        climate_hazards: ["TEMPETES_SILICE", "ORAGES_IONIQUES"],
        habitability_score: 65,
        orbital_parameters: {
          semi_major_axis: 1.2,
          eccentricity: 0.05,
          orbital_period_sols: 360,
        },
      },
      pillar_3_specialization: {
        specialist_corps: specialistCorps,
        territory_layout: territoryLayout,
        people_archetype: peopleArchetype,
        ai_acronym: getNiaAcronym(),
        ai_full_name: getNiaFullName(),
        cargo_type: cargoType,
        initial_resources: initialCargo,
      },
      pillar_4_lore_refinement: {
        ai_rival_archons_count: rivalArchonsCount,
        rival_aggression: rivalAggression,
        difficulty_mode: difficultyMode,
        custom_narrative_notes: customNotes || undefined,
        starting_era: "ARRIVEE_ARCHE",
        nia_mode: "AUTO",
      },
      ui_display_config: {
        header_state: "H1_FOLDED",
        footer_state: "F1_FOLDED",
        radio_active: true,
        theme: theme.id,
        reduced_motion: false,
      },
    };

    const validated = GenesisLorePayloadSchema.parse(payload);
    onLaunchGame(validated);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`min-h-screen min-h-[100dvh] flex flex-col p-4 md:p-8 select-none transition-colors duration-300 overflow-y-auto overflow-x-auto scroll-smooth-touch ${theme.bgClass} ${theme.ambientGlow || ""}`}
    >
      {/* Header Wizard */}
      <div className={`max-w-5xl mx-auto w-full mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4 shrink-0 ${
        isLight ? "border-slate-300" : "border-slate-800"
      }`}>
        <div>
          <div className={`text-xl font-bold tracking-wider uppercase flex items-center gap-2 ${
            isLight ? "text-slate-900" : "text-sky-400"
          }`}>
            <Sparkles className={`w-5 h-5 ${isLight ? "text-slate-800" : "text-sky-400"}`} />
            Configuration d'une nouvelle partie
          </div>
          <div className={`text-xs font-mono mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            Matricule de la Ligne Temporelle : <span className={`font-bold ${isLight ? "text-slate-900" : "text-sky-300"}`}>0x{masterSeed.toString(16).toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToMainMenu && (
            <button
              onClick={() => {
                proceduralRadio.playUIChime("CLICK");
                onBackToMainMenu();
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                isLight
                  ? "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              ← Menu Principal
            </button>
          )}

          <button
            onClick={handleRandomize}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
              isLight
                ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                : "bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
            }`}
          >
            <Dices className="w-4 h-4" /> Aléatoire
          </button>
        </div>
      </div>

      {/* 4 Pillars Progress Steps */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 font-mono text-xs shrink-0">
        {[
          { num: 1, title: "1. GOUVERNANCE", icon: Shield },
          { num: 2, title: "2. ENVIRONNEMENT", icon: Globe },
          { num: 3, title: "3. CORPS & CARGO", icon: Rocket },
          { num: 4, title: "4. VALIDATION DU DÉPART", icon: Cpu },
        ].map((step) => {
          const Icon = step.icon;
          const isActive = currentPillar === step.num;
          const isPassed = currentPillar > step.num;
          return (
            <button
              key={step.num}
              onClick={() => goToPillar(step.num as any)}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-center transition-all cursor-pointer min-h-[48px] ${
                isActive
                  ? isLight
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/30"
                    : "bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                  : isPassed
                  ? isLight
                    ? "bg-slate-200/80 border-slate-300 text-slate-800"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                  : isLight
                  ? "bg-white/60 border-slate-200 text-slate-400"
                  : "bg-slate-950/60 border-slate-800/60 text-slate-500"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate font-bold">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Touch Gesture Guidance Banner */}
      <div className={`max-w-5xl mx-auto w-full mb-3 text-[10px] font-mono text-center flex items-center justify-center gap-2 ${
        isLight ? "text-slate-500" : "text-slate-400"
      }`}>
        <span>👉 Glissez latéralement (Swipe) ou touchez les boutons pour naviguer entre les Piliers</span>
      </div>

      {/* Main Pillars Content with Swipe Gesture & Motion Slide */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`max-w-5xl mx-auto w-full flex-1 flex flex-col justify-between border rounded-2xl p-5 sm:p-7 shadow-xl overflow-hidden backdrop-blur-xl ${
          isLight
            ? "bg-white/90 border-slate-300/90 shadow-slate-200/80"
            : "bg-slate-900/80 border-slate-800 shadow-slate-950/80"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPillar}
            initial={{ x: slideDirection === "NEXT" ? 40 : -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDirection === "NEXT" ? -40 : 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="flex-1 overflow-y-auto pr-1 overscroll-contain"
          >
            {/* PILIER 1 */}
            {currentPillar === 1 && (
              <div className="space-y-6">
                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    1.1 Régime Administratif & Modèle Supranational
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        id: "UNION_SOLAIRE",
                        name: "Union Solaire (Canon)",
                        desc: "Directives supranationales, compromis bicaméraux, subsidiarité des dômes et marché unique.",
                        bonus: "Équilibre Factions +20%",
                      },
                      {
                        id: "SOLARCHIE",
                        name: "Solarchie Énergétique",
                        desc: "Autocratie de l'énergie, centralisation du réseau supraconducteur et décrets impératifs du Primat.",
                        bonus: "Rendement Industriel +30%",
                      },
                      {
                        id: "FEDERATION_SOLAIRE",
                        name: "Fédération Solaire",
                        desc: "Modèle fédéral, autonomie accrue des dômes, sénat des gouverneurs et taxes péréquatrices.",
                        bonus: "Résilience Avaries +25%",
                      },
                    ].map((r) => {
                      const selected = regimeType === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setRegimeType(r.id as any);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30 shadow-[0_0_15px_rgba(0,212,255,0.2)] font-bold"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{r.name}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`text-xs leading-relaxed mb-3 ${selected ? (isLight ? "text-slate-200" : "text-slate-300") : "text-slate-600 dark:text-slate-400"}`}>
                              {r.desc}
                            </div>
                          </div>
                          <div className={`text-[11px] font-mono px-2.5 py-1 rounded-lg inline-block w-fit font-semibold ${
                            selected
                              ? isLight ? "bg-white/20 text-white" : "bg-sky-950 border border-sky-500/30 text-sky-300"
                              : isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300"
                          }`}>
                            {r.bonus}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    1.2 Archétype du Gouverneur d'Expédition (Matrice Holistique Leader)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(LEADER_ARCHETYPES).map((l) => {
                      const selected = leaderArchetype === l.id;
                      return (
                        <div
                          key={l.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setLeaderArchetype(l.id as any);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30 shadow-[0_0_15px_rgba(0,212,255,0.2)] font-bold"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{l.name}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`text-xs leading-relaxed mb-3 ${selected ? (isLight ? "text-slate-200" : "text-slate-300") : "text-slate-600 dark:text-slate-400"}`}>
                              {l.description}
                            </div>
                          </div>
                          <div className={`text-[11px] font-mono px-2.5 py-1 rounded-lg inline-block w-fit font-semibold ${
                            selected
                              ? isLight ? "bg-white/20 text-white" : "bg-sky-950 border border-sky-500/30 text-sky-300"
                              : isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300"
                          }`}>
                            {l.badge}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    1.3 Vaisseau-Monde / Arche Spatiale
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(SHIP_PRESETS).map((s) => {
                      const selected = shipModel === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setShipModel(s.id as any);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30 shadow-[0_0_15px_rgba(0,212,255,0.2)] font-bold"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{s.name}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`text-xs leading-relaxed mb-3 ${selected ? (isLight ? "text-slate-200" : "text-slate-300") : "text-slate-600 dark:text-slate-400"}`}>
                              {s.description}
                            </div>
                          </div>
                          <div className={`text-[11px] font-mono px-2.5 py-1 rounded-lg inline-block w-fit font-semibold ${
                            selected
                              ? isLight ? "bg-white/20 text-white" : "bg-sky-950 border border-sky-500/30 text-sky-300"
                              : isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300"
                          }`}>
                            {s.badge}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Visuel Immédiat sur les Choix de Gouvernance */}
                <div className={`p-4 rounded-xl border font-mono space-y-3 ${
                  isLight
                    ? "bg-slate-100/90 border-slate-300 text-slate-900"
                    : "bg-gradient-to-r from-sky-950/50 via-slate-950 to-slate-900 border-sky-500/30 text-slate-100"
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-sky-600 dark:text-sky-300">
                      <Shield className="w-4 h-4 text-sky-500" />
                      SYNTHÈSE DE GOUVERNANCE & IMPACT IMMÉDIAT
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                      FEEDBACK VALIDE TICK 0
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">STABILITÉ SÉNAT</div>
                      <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {regimeType === "UNION_SOLAIRE" ? "85%" : regimeType === "SOLARCHIE" ? "70%" : "90%"}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {regimeType === "UNION_SOLAIRE" ? "Bicaméral équilibré" : regimeType === "SOLARCHIE" ? "Primat impératif" : "Autonomie fédérale"}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">TITRE DU LEADER</div>
                      <div className="text-xs font-extrabold text-sky-600 dark:text-sky-300 truncate">
                        Gouverneur d'Expédition
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">
                        {LEADER_ARCHETYPES[leaderArchetype]?.name || "Leader Colonial"}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">BONUS SPÉCIFIQUE</div>
                      <div className="text-xs font-extrabold text-amber-600 dark:text-amber-300 truncate">
                        {regimeType === "UNION_SOLAIRE" ? "+20% Factions" : regimeType === "SOLARCHIE" ? "+30% Industrie" : "+25% Résilience"}
                      </div>
                      <div className="text-[9px] text-slate-500">Actif dès le Sol 1</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-0.5">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">MATRICE N.I.A.</div>
                      <div className="text-sm font-extrabold text-purple-600 dark:text-purple-300 truncate">
                        {getNiaAcronym()}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">Souveraineté IA</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PILIER 2 */}
            {currentPillar === 2 && (
              <div className="space-y-6">
                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    2.1 Système Solaire Hôte & Radiance Stellaire
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(STAR_SYSTEM_PRESETS).map((st) => {
                      const selected = starSystem === st.id;
                      return (
                        <div
                          key={st.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setStarSystem(st.id as any);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{st.name}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`text-xs leading-relaxed mb-3 ${selected ? (isLight ? "text-slate-200" : "text-slate-300") : "text-slate-600 dark:text-slate-400"}`}>
                              {st.description}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                              selected ? (isLight ? "bg-white/20 text-white" : "bg-sky-950 text-sky-300") : (isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300")
                            }`}>
                              {st.badge}
                            </span>
                            <span className="text-[11px] font-mono bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">
                              {st.riskBadge}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    2.2 Planète Cible & Atmosphère
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(PLANET_PRESETS).map((p) => {
                      const selected = targetPlanet === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setTargetPlanet(p.id as any);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{p.name}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`text-xs leading-relaxed mb-3 ${selected ? (isLight ? "text-slate-200" : "text-slate-300") : "text-slate-600 dark:text-slate-400"}`}>
                              {p.description}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                              selected ? (isLight ? "bg-white/20 text-white" : "bg-sky-950 text-sky-300") : (isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300")
                            }`}>
                              g={p.gravity_g} · P_atm={p.p_atm} atm
                            </span>
                            <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                              {p.badge}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PILIER 3 */}
            {currentPillar === 3 && (
              <div className="space-y-6">
                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    3.1 Corps de Spécialistes Embarqués
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "ENGINEERS", name: "Ingénieurs du Vide", bonus: "Réparation & Blindage +25%" },
                      { id: "XENOBIOLOGISTS", name: "Xénobiologistes", bonus: "Biomasse & Climat +25%" },
                      { id: "LOGISTICS", name: "Logisticiens", bonus: "Capacité Fret & Maglev +30%" },
                      { id: "MEDIATORS", name: "Médiateurs Civils", bonus: "Cohésion & Stabilité +20%" },
                    ].map((c) => {
                      const selected = specialistCorps === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setSpecialistCorps(c.id as any);
                          }}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm mb-1">{c.name}</div>
                          </div>
                          <div className={`text-[11px] font-mono mt-2 font-semibold ${
                            selected ? (isLight ? "text-slate-200" : "text-sky-300") : (isLight ? "text-slate-600" : "text-slate-400")
                          }`}>
                            {c.bonus}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    3.2 Territoire & Maillage Initial
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(TERRITORY_PRESETS).map((t) => {
                      const selected = territoryLayout === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setTerritoryLayout(t.id as any);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{t.name}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`text-xs leading-relaxed mb-3 ${selected ? (isLight ? "text-slate-200" : "text-slate-300") : "text-slate-600 dark:text-slate-400"}`}>
                              {t.description}
                            </div>
                          </div>
                          <div className={`text-[11px] font-mono px-2.5 py-1 rounded-lg inline-block w-fit font-semibold ${
                            selected
                              ? isLight ? "bg-white/20 text-white" : "bg-sky-950 text-sky-300"
                              : isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300"
                          }`}>
                            {t.badge}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    3.3 Peuple Colonisateur & Profil Biologique
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(PEOPLE_PRESETS).map((pe) => {
                      const selected = peopleArchetype === pe.id;
                      return (
                        <div
                          key={pe.id}
                          onClick={() => {
                            proceduralRadio.playUIChime("CLICK");
                            setPeopleArchetype(pe.id as any);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] flex flex-col justify-between ${
                            selected
                              ? isLight
                                ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md"
                                : "bg-sky-500/20 border-sky-400 text-white ring-2 ring-sky-400/30"
                              : isLight
                              ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800"
                              : "bg-slate-950/50 hover:bg-slate-950/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{pe.name}</span>
                              {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className={`text-xs leading-relaxed mb-3 ${selected ? (isLight ? "text-slate-200" : "text-slate-300") : "text-slate-600 dark:text-slate-400"}`}>
                              {pe.description}
                            </div>
                          </div>
                          <div className={`text-[11px] font-mono px-2.5 py-1 rounded-lg inline-block w-fit font-semibold ${
                            selected
                              ? isLight ? "bg-white/20 text-white" : "bg-sky-950 text-sky-300"
                              : isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300"
                          }`}>
                            {pe.badge}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3.4 Modificateurs & Handicaps Manuels */}
                <div>
                  <div className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
                    isLight ? "text-slate-800" : "text-sky-400"
                  }`}>
                    3.4 Modificateurs Manuels : Bonus (+Avantages) & Malus (-Handicaps)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bonus Column */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                        ✦ AVANTAGES & BONUS SÉLECTIONNÉS ({selectedBonus.length}/3)
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {Object.values(GAMEPLAY_BONUS_PRESETS).map((b) => {
                          const isSel = selectedBonus.includes(b.id);
                          return (
                            <div
                              key={b.id}
                              onClick={() => {
                                proceduralRadio.playUIChime("CLICK");
                                if (isSel) {
                                  setSelectedBonus(selectedBonus.filter((x) => x !== b.id));
                                } else if (selectedBonus.length < 3) {
                                  setSelectedBonus([...selectedBonus, b.id]);
                                }
                              }}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                isSel
                                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-200 font-bold shadow-sm"
                                  : isLight
                                  ? "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{b.name}</span>
                                {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                              </div>
                              <div className="text-[10px] mt-0.5 opacity-80 font-normal">{b.description}</div>
                              <div className="text-[9px] font-mono text-emerald-500 font-semibold mt-1">{b.badge}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Malus Column */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">
                        ⚠ HANDICAPS & MALUS SÉLECTIONNÉS ({selectedMalus.length}/3)
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {Object.values(GAMEPLAY_MALUS_PRESETS).map((m) => {
                          const isSel = selectedMalus.includes(m.id);
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                proceduralRadio.playUIChime("CLICK");
                                if (isSel) {
                                  setSelectedMalus(selectedMalus.filter((x) => x !== m.id));
                                } else if (selectedMalus.length < 3) {
                                  setSelectedMalus([...selectedMalus, m.id]);
                                }
                              }}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                isSel
                                  ? "bg-rose-950/40 border-rose-500 text-rose-200 font-bold shadow-sm"
                                  : isLight
                                  ? "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{m.name}</span>
                                {isSel && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                              </div>
                              <div className="text-[10px] mt-0.5 opacity-80 font-normal">{m.description}</div>
                              <div className="text-[9px] font-mono text-rose-400 font-semibold mt-1">{m.badge}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PILIER 4 */}
            {currentPillar === 4 && (
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  isLight
                    ? "bg-slate-100 border-slate-300 text-slate-900"
                    : "bg-sky-950/30 border-sky-500/30 text-sky-100"
                }`}>
                  <div>
                    <div className="text-xs font-mono text-slate-500">IA de bord dérivée déterministement :</div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-sky-300">{getNiaAcronym()}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{getNiaFullName()}</div>
                  </div>
                  <Cpu className="w-8 h-8 text-slate-800 dark:text-cyan-400 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-mono font-bold uppercase block mb-1.5 ${
                      isLight ? "text-slate-800" : "text-slate-300"
                    }`}>
                      Nombre de Gouverneurs IA Rivaux : {rivalArchonsCount}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={7}
                      value={rivalArchonsCount}
                      onChange={(e) => setRivalArchonsCount(parseInt(e.target.value))}
                      className="w-full accent-slate-900 dark:accent-cyan-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-mono font-bold uppercase block mb-1.5 ${
                      isLight ? "text-slate-800" : "text-slate-300"
                    }`}>
                      Agressivité des Rivaux
                    </label>
                    <select
                      value={rivalAggression}
                      onChange={(e) => setRivalAggression(e.target.value as any)}
                      className={`w-full border rounded-xl p-2.5 text-xs font-mono font-medium cursor-pointer min-h-[44px] ${
                        isLight
                          ? "bg-white border-slate-300 text-slate-900"
                          : "bg-slate-950 border-slate-800 text-slate-200"
                      }`}
                    >
                      <option value="LOW">Faible (Diplomatie & Commerce prioritaires)</option>
                      <option value="MEDIUM">Moyenne (Compétition équilibrée)</option>
                      <option value="HIGH">Élevée (Hostilités et sanctions fréquentes)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-mono font-bold uppercase block mb-1.5 ${
                    isLight ? "text-slate-800" : "text-slate-300"
                  }`}>
                    Garde-Fou & Mode de Difficulté
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setDifficultyMode("REALISM_FLEX_SOL_1_TO_10")}
                      className={`p-3.5 rounded-xl border cursor-pointer ${
                        difficultyMode === "REALISM_FLEX_SOL_1_TO_10"
                          ? isLight
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-sky-500/20 border-sky-400 text-white"
                          : isLight
                          ? "bg-slate-50 border-slate-300 text-slate-800"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">Realism-Flex (Sols 1 à 10)</div>
                      <div className="text-[11px] leading-relaxed opacity-80">3 Sols de grâce avant décès en rupture de stock. Pannes plafonnées.</div>
                    </div>

                    <div
                      onClick={() => setDifficultyMode("ROGUE_LIKE_STRICT")}
                      className={`p-3.5 rounded-xl border cursor-pointer ${
                        difficultyMode === "ROGUE_LIKE_STRICT"
                          ? "bg-rose-600 text-white border-rose-600 shadow-md"
                          : isLight
                          ? "bg-slate-50 border-slate-300 text-slate-800"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">Rogue-like Strict (Hardcore)</div>
                      <div className="text-[11px] leading-relaxed opacity-80">Pénalités immédiates dès la première seconde de rupture. Zéro pitié.</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-mono font-bold uppercase block mb-1.5 ${
                    isLight ? "text-slate-800" : "text-slate-300"
                  }`}>
                    Notes & Directives Particulières du Leader (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Priorité absolue à la recherche xénobiologique et maintien de l'harmonie civique..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className={`w-full border rounded-xl p-3 text-xs font-mono outline-none min-h-[44px] ${
                      isLight
                        ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-800"
                        : "bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-sky-400"
                    }`}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className={`flex items-center justify-between pt-5 border-t mt-5 ${
          isLight ? "border-slate-200" : "border-slate-800"
        }`}>
          {currentPillar > 1 ? (
            <button
              onClick={() => {
                setSlideDirection("PREV");
                setCurrentPillar((prev) => (prev - 1) as any);
                proceduralRadio.playUIChime("CLICK");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer min-h-[44px] ${
                isLight
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Pilier Précédent
            </button>
          ) : (
            <div />
          )}

          {currentPillar < 4 ? (
            <button
              onClick={() => {
                setSlideDirection("NEXT");
                setCurrentPillar((prev) => (prev + 1) as any);
                proceduralRadio.playUIChime("CLICK");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer min-h-[44px] shadow-md ${
                isLight
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-sky-600 hover:bg-sky-500 text-white"
              }`}
            >
              Pilier Suivant <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompileAndLaunch}
              className={`px-6 py-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer min-h-[48px] shadow-lg ${
                isLight
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black"
              }`}
            >
              <Rocket className="w-4 h-4" /> Verrouiller Genesis & Lancer l'Arche (Sol 1)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
