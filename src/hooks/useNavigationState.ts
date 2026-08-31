import { useState, useEffect } from "react";
import { HeaderTierState, FooterTierState } from "../types/genesis";
import { THEMES, ThemeId, ThemeDefinition } from "../theme/themes";
import { ScreenMode } from "../ui/navigation/AppScreenRouter";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export function useNavigationState() {
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [screenMode, setScreenMode] = useState<ScreenMode>("MAIN_MENU");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);

  // Active theme
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>("LIGHT_MODE");
  const currentTheme: ThemeDefinition = THEMES[currentThemeId] || THEMES.LIGHT_MODE;

  // Header & Footer States
  const [headerState, setHeaderState] = useState<HeaderTierState>("H1_FOLDED");
  const [footerState, setFooterState] = useState<FooterTierState>("F1_FOLDED");
  const [activeHeaderTab, setActiveHeaderTab] = useState<"GOUVERNANCE" | "INFRASTRUCTURES_ARCHE" | "DECRETS">("GOUVERNANCE");
  const [activeFooterTab, setActiveFooterTab] = useState<"COLONIE" | "JOURNAL" | "SPATIAL">("COLONIE");

  // Modals state
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleBootComplete = () => {
    setIsBooting(false);
    if (!auth.currentUser) {
      setScreenMode("FIREBASE_AUTH");
    } else {
      setScreenMode("MAIN_MENU");
    }
  };

  return {
    isBooting,
    screenMode,
    firebaseUser,
    currentThemeId,
    currentTheme,
    headerState,
    footerState,
    activeHeaderTab,
    activeFooterTab,
    isLeaderModalOpen,
    isConfigModalOpen,
    isLoadGameModalOpen,
    isNotificationModalOpen,
    setScreenMode,
    setCurrentThemeId,
    setHeaderState,
    setFooterState,
    setActiveHeaderTab,
    setActiveFooterTab,
    setIsLeaderModalOpen,
    setIsConfigModalOpen,
    setIsLoadGameModalOpen,
    setIsNotificationModalOpen,
    handleBootComplete,
  };
}
