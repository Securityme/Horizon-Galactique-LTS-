import React, { useRef, useCallback, useEffect } from "react";

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export interface SwipeOptions {
  /** Base CSS pixel distance required to trigger a swipe (default: 35) */
  minThreshold?: number;
  /** Maximum duration in ms for a valid swipe gesture (default: 700) */
  maxDuration?: number;
  /** Enable velocity (flick) detection for quick swipes (default: true) */
  velocitySensitivity?: boolean;
  /** Dominant axis ratio threshold to prevent diagonal misfires (default: 1.25) */
  axisRatio?: number;
  /** Allow vertical swipes (up/down) - set to false for header/footer (default: true) */
  allowVertical?: boolean;
  /** Allow horizontal swipes (left/right) - set to false if only vertical is needed (default: true) */
  allowHorizontal?: boolean;
}

export function useSwipeGesture(
  handlers: SwipeHandlers,
  options: number | SwipeOptions = 35
) {
  const config = typeof options === "number" ? { minThreshold: options } : options;
  const {
    minThreshold = 35,
    maxDuration = 700,
    velocitySensitivity = true,
    axisRatio = 1.25,
    allowVertical = true,
    allowHorizontal = true,
  } = config;

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    isInteractive: boolean;
  } | null>(null);

  // Keep latest handlers in a ref to prevent stale closures
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  /** Helper to compute dynamic threshold based on visual viewport zoom and display scale */
  const getDynamicThreshold = useCallback(() => {
    if (typeof window === "undefined") return minThreshold;

    const zoomScale = window.visualViewport?.scale || 1;
    const isMobile = window.innerWidth < 768;

    // Scale threshold down when zoomed in (higher scale = smaller touch distance on screen)
    // Mobile layouts get slightly more sensitive threshold for easy single-thumb navigation
    const baseVal = isMobile ? minThreshold * 0.9 : minThreshold;
    const computed = baseVal / Math.max(0.5, zoomScale);

    // Floor at 15px to prevent hyper-sensitive micro-jitter
    return Math.max(15, Math.round(computed));
  }, [minThreshold]);

  const handleStart = useCallback((clientX: number, clientY: number, target: EventTarget | null) => {
    // Check if user is touching an interactive element (buttons, inputs, sliders, canvas maps)
    let isInteractive = false;
    if (target instanceof HTMLElement) {
      const tagName = target.tagName.toLowerCase();
      const isInput = ["input", "textarea", "select", "button", "canvas"].includes(tagName);
      const isScrollableOrInteractive = target.closest("button, a, [role='button'], input, select, textarea, .no-swipe");
      if (isInput || isScrollableOrInteractive) {
        isInteractive = true;
      }
    }

    touchStartRef.current = {
      x: clientX,
      y: clientY,
      time: Date.now(),
      isInteractive,
    };
  }, []);

  const handleEnd = useCallback(
    (clientX: number, clientY: number) => {
      if (!touchStartRef.current) return;
      const { x: startX, y: startY, time: startTime, isInteractive } = touchStartRef.current;
      touchStartRef.current = null;

      // Ignore swipes starting on interactive controls to let clicks and slider drags work naturally
      if (isInteractive) return;

      const duration = Date.now() - startTime;
      if (duration > maxDuration) return;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      const dynamicThreshold = getDynamicThreshold();

      // Flick velocity detection (px/ms)
      const distance = Math.hypot(deltaX, deltaY);
      const velocity = duration > 0 ? distance / duration : 0;
      const isFlick = velocitySensitivity && velocity > 0.35 && duration < 350;

      // Effective threshold drops by 40% if user did a quick flick gesture
      const effectiveThreshold = isFlick ? dynamicThreshold * 0.6 : dynamicThreshold;

      // Check dominant axis with strict ratio to avoid diagonal misfires while scrolling
      if (allowHorizontal && absX > absY * axisRatio && absX >= effectiveThreshold) {
        // Horizontal swipe
        if (deltaX < 0) {
          handlersRef.current.onSwipeLeft?.();
        } else {
          handlersRef.current.onSwipeRight?.();
        }
      } else if (allowVertical && absY > absX * axisRatio && absY >= effectiveThreshold) {
        // Vertical swipe
        if (deltaY < 0) {
          handlersRef.current.onSwipeUp?.();
        } else {
          handlersRef.current.onSwipeDown?.();
        }
      }
    },
    [getDynamicThreshold, maxDuration, velocitySensitivity, axisRatio]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    },
    [handleStart]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (e.changedTouches.length > 0) {
        handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    },
    [handleEnd]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}


