import { useState, useEffect, useCallback } from "react";
import { HeaderTierState, FooterTierState } from "../types/genesis";
import { THEMES, ThemeId, ThemeDefinition } from "../theme/themes";
import { ScreenMode } from "../ui/navigation/AppScreenRouter";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { proceduralRadio } from "../audio/radio";

export function useAppNavigation() {
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

  // Modals visibility states
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isNiaModalOpen, setIsNiaModalOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isPlayerProfileModalOpen, setIsPlayerProfileModalOpen] = useState(false);

  // Firebase Auth sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    if (!auth.currentUser) {
      setScreenMode("FIREBASE_AUTH");
    } else {
      setScreenMode("MAIN_MENU");
    }
  }, []);

  // Modal Handlers
  const openLeaderModal = useCallback(() => setIsLeaderModalOpen(true), []);
  const closeLeaderModal = useCallback(() => setIsLeaderModalOpen(false), []);

  const openConfigModal = useCallback(() => setIsConfigModalOpen(true), []);
  const closeConfigModal = useCallback(() => setIsConfigModalOpen(false), []);

  const openLoadGameModal = useCallback(() => setIsLoadGameModalOpen(true), []);
  const closeLoadGameModal = useCallback(() => setIsLoadGameModalOpen(false), []);

  const openNotificationModal = useCallback(() => setIsNotificationModalOpen(true), []);
  const closeNotificationModal = useCallback(() => setIsNotificationModalOpen(false), []);

  const openNiaModal = useCallback(() => setIsNiaModalOpen(true), []);
  const closeNiaModal = useCallback(() => setIsNiaModalOpen(false), []);

  const openWeatherModal = useCallback(() => setIsWeatherModalOpen(true), []);
  const closeWeatherModal = useCallback(() => setIsWeatherModalOpen(false), []);

  const openCalendarModal = useCallback(() => setIsCalendarModalOpen(true), []);
  const closeCalendarModal = useCallback(() => setIsCalendarModalOpen(false), []);

  const openCloudModal = useCallback(() => setIsCloudModalOpen(true), []);
  const closeCloudModal = useCallback(() => setIsCloudModalOpen(false), []);

  const openPlayerProfileModal = useCallback(() => setIsPlayerProfileModalOpen(true), []);
  const closePlayerProfileModal = useCallback(() => setIsPlayerProfileModalOpen(false), []);

  // Tab & Screen Navigation
  const navigateToMainMenu = useCallback(() => setScreenMode("MAIN_MENU"), []);
  const navigateToTitleScreen = useCallback(() => setScreenMode("TITLE_SCREEN"), []);
  const navigateToSetupWizard = useCallback(() => setScreenMode("SETUP_WIZARD"), []);
  const navigateToInGame = useCallback(() => setScreenMode("IN_GAME"), []);

  // Horizontal Swipe Navigation (Footer tabs: COLONIE <-> JOURNAL <-> SPATIAL)
  const handleSwipeNextFooterTab = useCallback(() => {
    proceduralRadio.playUIChime("CLICK");
    setActiveFooterTab((prev) => {
      if (prev === "COLONIE") return "JOURNAL";
      if (prev === "JOURNAL") return "SPATIAL";
      return "COLONIE";
    });
  }, []);

  const handleSwipePrevFooterTab = useCallback(() => {
    proceduralRadio.playUIChime("CLICK");
    setActiveFooterTab((prev) => {
      if (prev === "SPATIAL") return "JOURNAL";
      if (prev === "JOURNAL") return "COLONIE";
      return "SPATIAL";
    });
  }, []);

  // Vertical Swipe Navigation (Unfold / Fold Docks)
  const handleSwipeUpExpand = useCallback(() => {
    proceduralRadio.playUIChime("CLICK");
    setFooterState((prev) => {
      if (prev === "F1_FOLDED") return "F2_UNFOLDED_METRICS";
      if (prev === "F2_UNFOLDED_METRICS") return "F3_FULL_EXPANDED";
      return prev;
    });
  }, []);

  const handleSwipeDownFold = useCallback(() => {
    proceduralRadio.playUIChime("CLICK");
    if (footerState !== "F1_FOLDED") {
      setFooterState((prev) => {
        if (prev === "F3_FULL_EXPANDED") return "F2_UNFOLDED_METRICS";
        return "F1_FOLDED";
      });
    } else if (headerState !== "H1_FOLDED") {
      setHeaderState("H1_FOLDED");
    }
  }, [footerState, headerState]);

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
    isNiaModalOpen,
    isWeatherModalOpen,
    isCalendarModalOpen,
    isCloudModalOpen,
    isPlayerProfileModalOpen,
    // Setters
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
    setIsNiaModalOpen,
    setIsWeatherModalOpen,
    setIsCalendarModalOpen,
    setIsCloudModalOpen,
    setIsPlayerProfileModalOpen,
    // Methods
    handleBootComplete,
    openLeaderModal,
    closeLeaderModal,
    openConfigModal,
    closeConfigModal,
    openLoadGameModal,
    closeLoadGameModal,
    openNotificationModal,
    closeNotificationModal,
    openNiaModal,
    closeNiaModal,
    openWeatherModal,
    closeWeatherModal,
    openCalendarModal,
    closeCalendarModal,
    openCloudModal,
    closeCloudModal,
    openPlayerProfileModal,
    closePlayerProfileModal,
    navigateToMainMenu,
    navigateToTitleScreen,
    navigateToSetupWizard,
    navigateToInGame,
    // Swipe helpers
    handleSwipeNextFooterTab,
    handleSwipePrevFooterTab,
    handleSwipeUpExpand,
    handleSwipeDownFold,
  };
}
