import React, { useState } from "react";
import { GenesisLorePayload, HeaderTierState, FooterTierState } from "../../types/genesis";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition, ThemeId } from "../../theme/themes";
import { Bootloader } from "../boot/Bootloader";
import { FirebaseAuthView } from "../menu/FirebaseAuthView";
import { MainMenu } from "../menu/MainMenu";
import { SetupWizard } from "../setup/SetupWizard";
import { TitleScreen } from "../menu/TitleScreen";
import { TopBar } from "../shell/TopBar";
import { BottomDock } from "../shell/BottomDock";
import { SimCityView } from "../tabs/simcity/SimCityView";
import { JournalView } from "../tabs/journal/JournalView";
import { ArcheView } from "../tabs/arche/ArcheView";
import { Spatial4XView } from "../tabs/spatial/Spatial4XView";
import { ZLevel } from "../../types/genesis";
import { ResourceBreakdownModal, ResourceKey } from "../components/ResourceBreakdownModal";
import { useSwipeGesture } from "../../hooks/useSwipeGesture";
import { TacticalSideDrawer } from "../drawers/TacticalSideDrawer";
import { LogisticsSideDrawer } from "../drawers/LogisticsSideDrawer";
import { ChevronRight, ChevronLeft, Gauge, Activity } from "lucide-react";

export type ScreenMode = "FIREBASE_AUTH" | "MAIN_MENU" | "SETUP_WIZARD" | "TITLE_SCREEN" | "IN_GAME";

interface AppScreenRouterProps {
  screenMode: ScreenMode;
  isBooting: boolean;
  currentTheme: ThemeDefinition;
  gameState: GameState | null;
  headerState: HeaderTierState;
  footerState: FooterTierState;
  activeHeaderTab: "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS";
  activeFooterTab: "COLONIE" | "JOURNAL" | "SPATIAL";
  setHeaderState: (state: HeaderTierState) => void;
  setFooterState: (state: FooterTierState) => void;
  setActiveHeaderTab: (tab: "GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS") => void;
  setActiveFooterTab: (tab: "COLONIE" | "JOURNAL" | "SPATIAL") => void;
  onBootComplete: () => void;
  onAuthenticated: () => void;
  onContinueGame: () => void;
  onNewGame: () => void;
  onLoadGame: () => void;
  onOpenOptions: () => void;
  onLaunchGame: (genesis: GenesisLorePayload) => void;
  onBackToMainMenu: () => void;
  onPlayInGame: () => void;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  onOpenLeaderModal: () => void;
  onOpenConfigModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenNiaModal?: () => void;
  onOpenCloudModal?: () => void;
  onOpenWeatherModal?: () => void;
  onOpenCalendarModal?: () => void;
  onOpenPlayerProfileModal?: () => void;
  onSetNiaMode?: (mode: "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF") => void;
  onToggleDecree: (decreeId: string) => void;
  onAllocateSectorEnergy: (sectorId: string, delta: number) => void;
  onPlaceBuilding: (blueprintId: string, x: number, y: number, z: ZLevel, sectorId: string) => void;
  onRepairBuilding: (buildingId: string) => void;
  onResolveEvent: (eventId: string, choiceId: string) => void;
  onResolveSuperEventChoice?: (eventId: string, choiceId: string) => void;
  onLaunchProbe: (bodyId: string) => void;
  onMineAsteroid: (bodyId: string) => void;
  onDiplomaticAction: (rivalId: string, actionType: "PACT" | "TRADE" | "SANCTION") => void;
}

export function AppScreenRouter({
  screenMode,
  isBooting,
  currentTheme,
  gameState,
  headerState,
  footerState,
  activeHeaderTab,
  activeFooterTab,
  setHeaderState,
  setFooterState,
  setActiveHeaderTab,
  setActiveFooterTab,
  onBootComplete,
  onAuthenticated,
  onContinueGame,
  onNewGame,
  onLoadGame,
  onOpenOptions,
  onLaunchGame,
  onBackToMainMenu,
  onPlayInGame,
  onSpeedChange,
  onOpenLeaderModal,
  onOpenConfigModal,
  onOpenNotificationModal,
  onOpenNiaModal,
  onOpenCloudModal,
  onOpenWeatherModal,
  onOpenCalendarModal,
  onOpenPlayerProfileModal,
  onSetNiaMode,
  onToggleDecree,
  onAllocateSectorEnergy,
  onPlaceBuilding,
  onRepairBuilding,
  onResolveEvent,
  onResolveSuperEventChoice,
  onLaunchProbe,
  onMineAsteroid,
  onDiplomaticAction,
}: AppScreenRouterProps) {
  // 1. Écran de Bootloader
  if (isBooting) {
    return <Bootloader theme={currentTheme} onComplete={onBootComplete} />;
  }

  // 2. Connexion Firebase
  if (screenMode === "FIREBASE_AUTH") {
    return (
      <FirebaseAuthView
        theme={currentTheme}
        onAuthenticated={onAuthenticated}
      />
    );
  }

  // 3. Menu Principal
  if (screenMode === "MAIN_MENU") {
    return (
      <MainMenu
        theme={currentTheme}
        savedGame={gameState}
        onContinueGame={onContinueGame}
        onNewGame={onNewGame}
        onLoadGame={onLoadGame}
        onOpenOptions={onOpenOptions}
      />
    );
  }

  // 4. Setup Wizard Genesis
  if (screenMode === "SETUP_WIZARD") {
    return (
      <SetupWizard
        theme={currentTheme}
        onLaunchGame={onLaunchGame}
        onBackToMainMenu={onBackToMainMenu}
      />
    );
  }

  // 5. Écran Titre Pré-Jeu
  if (screenMode === "TITLE_SCREEN") {
    if (!gameState) return null;
    return (
      <TitleScreen
        theme={currentTheme}
        gameState={gameState}
        onPlay={onPlayInGame}
        onOpenOptions={onOpenOptions}
        onBackToMainMenu={onBackToMainMenu}
      />
    );
  }

  // 6. En Jeu (Main Simulation)
  const [selectedResourceKey, setSelectedResourceKey] = useState<ResourceKey | null>(null);
  const [isTacticalDrawerOpen, setIsTacticalDrawerOpen] = useState(false);
  const [isLogisticsDrawerOpen, setIsLogisticsDrawerOpen] = useState(false);

  // Swipe Handler for MAIN Content (Horizontal ONLY - Vertical scrolling remains natural)
  const mainSwipeProps = useSwipeGesture(
    {
      onSwipeLeft: () => {
        if (activeFooterTab === "COLONIE") setActiveFooterTab("JOURNAL");
        else if (activeFooterTab === "JOURNAL") setActiveFooterTab("SPATIAL");
      },
      onSwipeRight: () => {
        if (activeFooterTab === "SPATIAL") setActiveFooterTab("JOURNAL");
        else if (activeFooterTab === "JOURNAL") setActiveFooterTab("COLONIE");
      },
    },
    { allowVertical: false, allowHorizontal: true }
  );

  // Swipe Handler for HEADER Zone (Horizontal subtabs + Vertical fold/unfold IF started on header)
  const headerSwipeProps = useSwipeGesture(
    {
      onSwipeLeft: () => {
        if (activeHeaderTab === "GOUVERNANCE") setActiveHeaderTab("INFRASTRUCTURES_ARCHE");
        else if (activeHeaderTab === "INFRASTRUCTURES_ARCHE") setActiveHeaderTab("DECRETS");
      },
      onSwipeRight: () => {
        if (activeHeaderTab === "DECRETS") setActiveHeaderTab("INFRASTRUCTURES_ARCHE");
        else if (activeHeaderTab === "INFRASTRUCTURES_ARCHE") setActiveHeaderTab("GOUVERNANCE");
      },
      onSwipeUp: () => setHeaderState("H1_FOLDED"),
      onSwipeDown: () => setHeaderState("H2_UNFOLDED_NAV"),
    },
    { allowVertical: true, allowHorizontal: true }
  );

  // Swipe Handler for FOOTER Zone (Horizontal subtabs + Vertical fold/unfold IF started on footer)
  const footerSwipeProps = useSwipeGesture(
    {
      onSwipeLeft: () => {
        if (activeFooterTab === "COLONIE") setActiveFooterTab("JOURNAL");
        else if (activeFooterTab === "JOURNAL") setActiveFooterTab("SPATIAL");
      },
      onSwipeRight: () => {
        if (activeFooterTab === "SPATIAL") setActiveFooterTab("JOURNAL");
        else if (activeFooterTab === "JOURNAL") setActiveFooterTab("COLONIE");
      },
      onSwipeUp: () => setFooterState("F2_UNFOLDED_METRICS"),
      onSwipeDown: () => setFooterState("F1_FOLDED"),
    },
    { allowVertical: true, allowHorizontal: true }
  );

  if (!gameState) return null;

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col select-none overflow-y-auto overscroll-y-contain webkit-overflow-scrolling-touch touch-pan-y ${currentTheme.bgClass} ${currentTheme.ambientGlow || ""} ${currentTheme.id === "AMBER_CRT" ? "crt-scanlines" : ""}`}>
      {/* Top Header H1-H3 with targeted Header Swipe */}
      <div {...headerSwipeProps}>
        <TopBar
          gameState={gameState}
          theme={currentTheme}
          headerState={headerState}
          activeHeaderTab={activeHeaderTab}
          onHeaderStateChange={setHeaderState}
          onHeaderTabChange={setActiveHeaderTab}
          onSpeedChange={onSpeedChange}
          onSetNiaMode={onSetNiaMode}
          onOpenLeaderModal={onOpenLeaderModal}
          onOpenConfigModal={onOpenConfigModal}
          onOpenNotificationModal={onOpenNotificationModal}
          onOpenNiaModal={onOpenNiaModal}
          onOpenCloudModal={onOpenCloudModal}
          onOpenWeatherModal={onOpenWeatherModal}
          onOpenCalendarModal={onOpenCalendarModal}
          onOpenPlayerProfileModal={onOpenPlayerProfileModal}
          onOpenTacticalDrawer={() => setIsTacticalDrawerOpen(true)}
          onOpenLogisticsDrawer={() => setIsLogisticsDrawerOpen(true)}
          onSelectResource={(rk) => setSelectedResourceKey(rk)}
        />
      </div>

      {/* Main Viewport Container with targeted Main Swipe */}
      <main
        {...mainSwipeProps}
        className={`flex-1 overflow-y-auto min-h-0 overscroll-y-contain webkit-overflow-scrolling-touch touch-pan-y transition-all duration-300 relative ${
          headerState === "H1_FOLDED" ? "pt-[134px]" : headerState === "H2_UNFOLDED_NAV" ? "pt-[180px]" : "pt-[134px]"
        } ${footerState === "F1_FOLDED" ? "pb-16" : footerState === "F2_UNFOLDED_METRICS" ? "pb-28" : "pb-28"}`}
      >
        {headerState !== "H1_FOLDED" ? (
          <ArcheView
            gameState={gameState}
            theme={currentTheme}
            activeTab={activeHeaderTab}
            onToggleDecree={onToggleDecree}
            onAllocateSectorEnergy={onAllocateSectorEnergy}
            onEnactSenateLaw={() => {}}
          />
        ) : (
          <>
            {activeFooterTab === "COLONIE" && (
              <SimCityView
                gameState={gameState}
                theme={currentTheme}
                onPlaceBuilding={onPlaceBuilding}
                onRepairBuilding={onRepairBuilding}
                onSetNiaMode={onSetNiaMode}
              />
            )}
            {activeFooterTab === "JOURNAL" && (
              <JournalView
                gameState={gameState}
                theme={currentTheme}
                onResolveEvent={onResolveEvent}
                onResolveSuperEventChoice={onResolveSuperEventChoice}
              />
            )}
            {activeFooterTab === "SPATIAL" && (
              <Spatial4XView
                gameState={gameState}
                theme={currentTheme}
                onLaunchProbe={onLaunchProbe}
                onMineAsteroid={onMineAsteroid}
                onDiplomaticAction={onDiplomaticAction}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Side Drawer Pull-Tabs */}
      <button
        onClick={() => setIsTacticalDrawerOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 py-3 px-1.5 bg-sky-950/80 border border-l-0 border-sky-400/50 rounded-r-xl text-sky-300 font-mono text-[10px] font-bold shadow-lg flex flex-col items-center gap-1 cursor-pointer hover:bg-sky-900 transition-all hover:pr-2.5"
        title="Poste Tactique L1 (Directives & Crises)"
      >
        <Gauge className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        <span className="[writing-mode:vertical-lr] tracking-widest uppercase">TACTIQUE</span>
        <ChevronRight className="w-3 h-3 text-sky-400 mt-1" />
      </button>

      <button
        onClick={() => setIsLogisticsDrawerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 py-3 px-1.5 bg-emerald-950/80 border border-r-0 border-emerald-400/50 rounded-l-xl text-emerald-300 font-mono text-[10px] font-bold shadow-lg flex flex-col items-center gap-1 cursor-pointer hover:bg-emerald-900 transition-all hover:pl-2.5"
        title="Poste Logistique R1 (Secteurs & Chantiers)"
      >
        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="[writing-mode:vertical-lr] tracking-widest uppercase">LOGISTIQUE</span>
        <ChevronLeft className="w-3 h-3 text-emerald-400 mt-1" />
      </button>

      {/* Bottom Footer F1-F3 with targeted Footer Swipe */}
      <div {...footerSwipeProps}>
        <BottomDock
          gameState={gameState}
          theme={currentTheme}
          footerState={footerState}
          activeFooterTab={activeFooterTab}
          onFooterStateChange={setFooterState}
          onFooterTabChange={(tab) => {
            setHeaderState("H1_FOLDED");
            setActiveFooterTab(tab);
          }}
          onSpeedChange={onSpeedChange}
        />
      </div>

      {/* Tiroir Tactique Gauche */}
      <TacticalSideDrawer
        isOpen={isTacticalDrawerOpen}
        gameState={gameState}
        theme={currentTheme}
        onClose={() => setIsTacticalDrawerOpen(false)}
        onToggleDecree={onToggleDecree}
        onResolveEvent={onResolveEvent}
        onOpenNiaModal={onOpenNiaModal}
      />

      {/* Tiroir Logistique Droit */}
      <LogisticsSideDrawer
        isOpen={isLogisticsDrawerOpen}
        gameState={gameState}
        theme={currentTheme}
        onClose={() => setIsLogisticsDrawerOpen(false)}
        onAllocateSectorEnergy={onAllocateSectorEnergy}
        onOpenNiaModal={onOpenNiaModal}
      />

      {/* Resource Breakdown Detail Modal */}
      <ResourceBreakdownModal
        resourceKey={selectedResourceKey}
        gameState={gameState}
        theme={currentTheme}
        onClose={() => setSelectedResourceKey(null)}
      />
    </div>
  );
}
