import React from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition, ThemeId } from "../../theme/themes";
import { LeaderModal } from "../modals/LeaderModal";
import { ConfigModal } from "../modals/ConfigModal";
import { LoadGameModal } from "../modals/LoadGameModal";
import { NotificationModal } from "../modals/NotificationModal";
import { PostMortemModal } from "../modals/PostMortemModal";
import { NiaMatrixModal } from "../modals/NiaMatrixModal";
import { ClimateWeatherModal } from "../modals/ClimateWeatherModal";
import { StellarCalendarModal } from "../modals/StellarCalendarModal";
import { CloudSyncModal } from "../modals/CloudSyncModal";
import { PlayerProfileModal } from "../modals/PlayerProfileModal";

interface ModalOverlayManagerProps {
  isLeaderModalOpen: boolean;
  isConfigModalOpen: boolean;
  isLoadGameModalOpen: boolean;
  isNotificationModalOpen: boolean;
  isNiaModalOpen?: boolean;
  isWeatherModalOpen?: boolean;
  isCalendarModalOpen?: boolean;
  isCloudModalOpen?: boolean;
  isPlayerProfileModalOpen?: boolean;
  gameState: GameState | null;
  currentTheme: ThemeDefinition;
  onCloseLeaderModal: () => void;
  onCloseConfigModal: () => void;
  onCloseLoadGameModal: () => void;
  onCloseNotificationModal: () => void;
  onCloseNiaModal?: () => void;
  onCloseWeatherModal?: () => void;
  onCloseCalendarModal?: () => void;
  onCloseCloudModal?: () => void;
  onClosePlayerProfileModal?: () => void;
  onSetNiaMode?: (mode: "AUTO" | "REGULE" | "SEMI_MANUEL" | "OFF") => void;
  onThemeChange: (themeId: ThemeId) => void;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  onResetGame: () => void;
  onLoadState: (state: GameState) => void;
  onReturnToMainMenu?: () => void;
}

export function ModalOverlayManager({
  isLeaderModalOpen,
  isConfigModalOpen,
  isLoadGameModalOpen,
  isNotificationModalOpen,
  isNiaModalOpen,
  isWeatherModalOpen,
  isCalendarModalOpen,
  isCloudModalOpen,
  isPlayerProfileModalOpen,
  gameState,
  currentTheme,
  onCloseLeaderModal,
  onCloseConfigModal,
  onCloseLoadGameModal,
  onCloseNotificationModal,
  onCloseNiaModal,
  onCloseWeatherModal,
  onCloseCalendarModal,
  onCloseCloudModal,
  onClosePlayerProfileModal,
  onSetNiaMode,
  onThemeChange,
  onSpeedChange,
  onResetGame,
  onLoadState,
  onReturnToMainMenu,
}: ModalOverlayManagerProps) {
  return (
    <>
      {isLeaderModalOpen && gameState && (
        <LeaderModal
          gameState={gameState}
          theme={currentTheme}
          onClose={onCloseLeaderModal}
        />
      )}

      {isLoadGameModalOpen && (
        <LoadGameModal
          theme={currentTheme}
          onClose={onCloseLoadGameModal}
          onSelectGame={(st) => {
            onLoadState(st);
            onCloseLoadGameModal();
          }}
        />
      )}

      {isConfigModalOpen && (
        <ConfigModal
          gameState={gameState}
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          onSpeedChange={onSpeedChange}
          onClose={onCloseConfigModal}
          onResetGame={onResetGame}
          onLoadState={onLoadState}
          onReturnToMainMenu={onReturnToMainMenu}
        />
      )}

      {isNotificationModalOpen && gameState && (
        <NotificationModal
          gameState={gameState}
          theme={currentTheme}
          onClose={onCloseNotificationModal}
        />
      )}

      {isNiaModalOpen && gameState && onCloseNiaModal && onSetNiaMode && (
        <NiaMatrixModal
          gameState={gameState}
          theme={currentTheme}
          onClose={onCloseNiaModal}
          onSetNiaMode={onSetNiaMode}
        />
      )}

      {isWeatherModalOpen && gameState && onCloseWeatherModal && (
        <ClimateWeatherModal
          gameState={gameState}
          theme={currentTheme}
          onClose={onCloseWeatherModal}
        />
      )}

      {isCalendarModalOpen && gameState && onCloseCalendarModal && (
        <StellarCalendarModal
          gameState={gameState}
          theme={currentTheme}
          onClose={onCloseCalendarModal}
        />
      )}

      {isCloudModalOpen && gameState && onCloseCloudModal && (
        <CloudSyncModal
          gameState={gameState}
          theme={currentTheme}
          onClose={onCloseCloudModal}
        />
      )}

      {isPlayerProfileModalOpen && gameState && onClosePlayerProfileModal && (
        <PlayerProfileModal
          gameState={gameState}
          theme={currentTheme}
          onClose={onClosePlayerProfileModal}
        />
      )}

      {gameState?.isGameOver && (
        <PostMortemModal
          gameState={gameState}
          theme={currentTheme}
          onRestart={onResetGame}
        />
      )}
    </>
  );
}
