import React, { useEffect, useState, useRef } from "react";
import { executeBootTaskSequence, BootResult } from "./bootTasks.pure";
import { CinematicCanvas } from "./CinematicCanvas.view";
import { ThemeDefinition } from "../../theme/themes";
import { proceduralRadio } from "../../audio/radio";

interface BootloaderViewProps {
  theme: ThemeDefinition;
  onComplete: (bootResult?: BootResult) => void;
}

export function BootloaderView({ theme, onComplete }: BootloaderViewProps) {
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [isTasksDone, setIsTasksDone] = useState<boolean>(false);
  const [showTitleOverlay, setShowTitleOverlay] = useState<boolean>(false);
  const [fadeAlpha, setFadeAlpha] = useState<number>(1);
  const [isSkipped, setIsSkipped] = useState<boolean>(false);
  const bootResultRef = useRef<BootResult | null>(null);

  const startTimeRef = useRef<number>(performance.now());
  const canSkipRef = useRef<boolean>(false);

  // Détection de prefers-reduced-motion
  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // Démarrage de la radio dès le bootloader
    try {
      proceduralRadio.start();
    } catch (e) {
      console.warn("Radio auto-start on boot:", e);
    }

    // Activer l'interruption après 400ms
    const skipTimer = setTimeout(() => {
      canSkipRef.current = true;
    }, 400);

    // Démarrage des tâches réelles T1 à T7
    executeBootTaskSequence((taskIdx, total) => {
      setCompletedTasks(taskIdx);
      if (taskIdx === total) {
        setIsTasksDone(true);
      }
    }).then((res) => {
      bootResultRef.current = res;
    });

    return () => clearTimeout(skipTimer);
  }, []);

  // Animation cinématique fluide (durée cible ~3,5s, min 1,2s)
  useEffect(() => {
    let animId: number;
    const targetDuration = isReducedMotion ? 600 : 3500;

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      let rawProgress = elapsed / targetDuration;

      // Si l'utilisateur a skip après 400ms, accélérer fortement
      if (isSkipped) {
        rawProgress = Math.min(1, rawProgress + 0.05);
      }

      // Si l'animation dépasse 80% mais que les tâches ne sont pas terminées,
      // maintenir au Plan C (0.8) jusqu'à ce que les tâches finissent
      if (rawProgress >= 0.82 && !isTasksDone) {
        rawProgress = 0.82;
      }

      const clamped = Math.min(1, rawProgress);
      setAnimProgress(clamped);

      // Quand on atteint 95%, déclencher le fondu du titre diégétique
      if (clamped >= 0.92 && !showTitleOverlay) {
        setShowTitleOverlay(true);
      }

      // Terminé : déclencher la transition de sortie
      if (clamped >= 1 && isTasksDone) {
        setTimeout(() => {
          setFadeAlpha(0);
          setTimeout(() => {
            onComplete(bootResultRef.current || undefined);
          }, 350);
        }, 600);
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isTasksDone, isSkipped, showTitleOverlay, isReducedMotion, onComplete]);

  // Gestion de l'interruption utilisateur (clic, tap, ESC, Espace)
  const handleUserInteract = () => {
    try {
      proceduralRadio.start();
    } catch (e) {
      // Audio context resume
    }
    if (!canSkipRef.current) return;
    setIsSkipped(true);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        handleUserInteract();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      onClick={handleUserInteract}
      style={{ opacity: fadeAlpha }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden cursor-pointer transition-opacity duration-300 ${theme.bgClass}`}
    >
      {/* Rendu procédural de la cinématique (4 plans) */}
      <CinematicCanvas
        progress={animProgress}
        completedTasks={completedTasks}
        isReducedMotion={isReducedMotion}
      />

      {/* Révélation du Titre en fin de séquence (Plan D) */}
      {showTitleOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] transition-all duration-700 animate-in fade-in zoom-in-95">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-[0.25em] text-white uppercase text-center drop-shadow-[0_0_25px_rgba(0,212,255,0.8)] font-sans">
            HORIZON GALACTIQUE
          </h1>
          <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-3" />
          <p className="text-sm sm:text-lg text-cyan-300 font-light tracking-[0.3em] uppercase text-center">
            L'Arche des Étoiles
          </p>
        </div>
      )}
    </div>
  );
}
