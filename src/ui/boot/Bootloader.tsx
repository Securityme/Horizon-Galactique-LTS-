import React from "react";
import { ThemeDefinition } from "../../theme/themes";
import { BootloaderView } from "../../platform/boot/Bootloader.view";

interface BootloaderProps {
  theme: ThemeDefinition;
  onComplete: () => void;
}

export function Bootloader({ theme, onComplete }: BootloaderProps) {
  return <BootloaderView theme={theme} onComplete={() => onComplete()} />;
}
