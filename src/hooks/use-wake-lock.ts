import { useEffect } from "react";
import logger from "../utils/logger";

// Keeps the screen awake while `enabled` is true, so mobile devices don't
// sleep and drop active calls. The browser releases the lock whenever the
// page is hidden, so it is re-acquired when the page becomes visible again.
export const useWakeLock = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return undefined;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const requestWakeLock = async () => {
      if (document.visibilityState !== "visible") return;
      if (sentinel && !sentinel.released) return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
      } catch (e) {
        logger.red(`Failed to acquire screen wake lock: ${e}`);
      }
    };

    const handleVisibilityChange = () => {
      requestWakeLock();
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [enabled]);
};
