import React from "react";
import { useAppNavigation } from "./hooks/useAppNavigation";
import { useGameStateController } from "./hooks/useGameStateController";
import { useSwipeGesture } from "./hooks/useSwipeGesture";
import { AppScreenRouter } from "./ui/navigation/AppScreenRouter";
import { ModalOverlayManager } from "./ui/navigation/ModalOverlayManager";

export function App() {
  const nav = useAppNavigation();
  const game = useGameStateController((themeId) => nav.setCurrentThemeId(themeId));

  // Touch Swipe Gesture handler for mobile & touchscreens (Horizon Galactique V20 UI)
  const swipeProps = useSwipeGesture({
    onSwipeLeft: nav.handleSwipeNextFooterTab,
    onSwipeRight: nav.handleSwipePrevFooterTab,
    onSwipeUp: nav.handleSwipeUpExpand,
    onSwipeDown: nav.handleSwipeDownFold,
  });

  const handleLaunchGame = (genesis: any) => {
    game.handleLaunchGame(genesis);
    nav.navigateToTitleScreen();
  };

  const handleResetGame = () => {
    game.handleResetGame();
    nav.navigateToMainMenu();
  };

  return (
    <div {...swipeProps} className="w-full h-full min-h-screen overflow-x-hidden touch-pan-y">
      <AppScreenRouter
        screenMode={nav.screenMode}
        isBooting={nav.isBooting}
        currentTheme={nav.currentTheme}
        gameState={game.gameState}
        headerState={nav.headerState}
        footerState={nav.footerState}
        activeHeaderTab={nav.activeHeaderTab}
        activeFooterTab={nav.activeFooterTab}
        setHeaderState={nav.setHeaderState}
        setFooterState={nav.setFooterState}
        setActiveHeaderTab={nav.setActiveHeaderTab}
        setActiveFooterTab={nav.setActiveFooterTab}
        onBootComplete={nav.handleBootComplete}
        onAuthenticated={nav.navigateToMainMenu}
        onContinueGame={nav.navigateToTitleScreen}
        onNewGame={nav.navigateToSetupWizard}
        onLoadGame={nav.openLoadGameModal}
        onOpenOptions={nav.openConfigModal}
        onLaunchGame={handleLaunchGame}
        onBackToMainMenu={nav.navigateToMainMenu}
        onPlayInGame={nav.navigateToInGame}
        onSpeedChange={game.handleSpeedChange}
        onOpenLeaderModal={nav.openLeaderModal}
        onOpenConfigModal={nav.openConfigModal}
        onOpenNotificationModal={nav.openNotificationModal}
        onOpenNiaModal={nav.openNiaModal}
        onOpenCloudModal={nav.openCloudModal}
        onOpenWeatherModal={nav.openWeatherModal}
        onOpenCalendarModal={nav.openCalendarModal}
        onOpenPlayerProfileModal={nav.openPlayerProfileModal}
        onSetNiaMode={game.handleSetNiaMode}
        onToggleDecree={game.handleToggleDecree}
        onAllocateSectorEnergy={game.handleAllocateSectorEnergy}
        onPlaceBuilding={game.handlePlaceBuilding}
        onRepairBuilding={game.handleRepairBuilding}
        onResolveEvent={game.handleResolveEvent}
        onResolveSuperEventChoice={game.handleResolveSuperEventChoice}
        onLaunchProbe={game.handleLaunchProbe}
        onMineAsteroid={game.handleMineAsteroid}
        onDiplomaticAction={game.handleDiplomaticAction}
      />

      <ModalOverlayManager
        isLeaderModalOpen={nav.isLeaderModalOpen}
        isConfigModalOpen={nav.isConfigModalOpen}
        isLoadGameModalOpen={nav.isLoadGameModalOpen}
        isNotificationModalOpen={nav.isNotificationModalOpen}
        isNiaModalOpen={nav.isNiaModalOpen}
        isWeatherModalOpen={nav.isWeatherModalOpen}
        isCalendarModalOpen={nav.isCalendarModalOpen}
        isCloudModalOpen={nav.isCloudModalOpen}
        isPlayerProfileModalOpen={nav.isPlayerProfileModalOpen}
        gameState={game.gameState}
        currentTheme={nav.currentTheme}
        onCloseLeaderModal={nav.closeLeaderModal}
        onCloseConfigModal={nav.closeConfigModal}
        onCloseLoadGameModal={nav.closeLoadGameModal}
        onCloseNotificationModal={nav.closeNotificationModal}
        onCloseNiaModal={nav.closeNiaModal}
        onCloseWeatherModal={nav.closeWeatherModal}
        onCloseCalendarModal={nav.closeCalendarModal}
        onCloseCloudModal={nav.closeCloudModal}
        onClosePlayerProfileModal={nav.closePlayerProfileModal}
        onSetNiaMode={game.handleSetNiaMode}
        onThemeChange={nav.setCurrentThemeId}
        onSpeedChange={game.handleSpeedChange}
        onResetGame={handleResetGame}
        onLoadState={(st) => {
          game.setGameState(st);
          nav.navigateToTitleScreen();
        }}
        onReturnToMainMenu={nav.navigateToMainMenu}
      />
    </div>
  );
}

export default App;
