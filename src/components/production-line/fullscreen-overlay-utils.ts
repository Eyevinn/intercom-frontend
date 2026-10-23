import { useCallback, useEffect, useRef, useState } from "react";

export const useOverlayReveal = (active: boolean) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const reveal = useCallback(() => {
    setShowOverlay(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowOverlay(false), 3000);
  }, []);

  const handleMouseMove = useCallback(() => {
    if (active) reveal();
  }, [active, reveal]);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  useEffect(() => {
    if (!active) setShowOverlay(false);
  }, [active]);

  return { showOverlay, reveal, handleMouseMove };
};

export const isRemoteVideoTile = (
  el: Element | null | undefined,
  gridEl: HTMLElement | null
): el is HTMLElement => {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (!el.querySelector("[data-video-tile-label]")) return false;
  if (gridEl && !gridEl.contains(el)) return false;
  return true;
};
