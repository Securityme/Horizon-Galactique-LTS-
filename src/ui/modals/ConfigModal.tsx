import React from "react";
import { GameState } from "../../simulation/engine";
import { ThemeDefinition, ThemeId } from "../../theme/themes";
import { ControlCenter } from "../../experience/screens/config/ControlCenter.view";

interface ConfigModalProps {
  gameState: GameState | null;
  currentTheme: ThemeDefinition;
  onThemeChange: (themeId: ThemeId) => void;
  onSpeedChange: (multiplier: number, isPaused: boolean) => void;
  onClose: () => void;
  onResetGame: () => void;
  onLoadState: (state: GameState) => void;
  onReturnToMainMenu?: () => void;
}

export function ConfigModal(props: ConfigModalProps) {
  return <ControlCenter {...props} />;
}
