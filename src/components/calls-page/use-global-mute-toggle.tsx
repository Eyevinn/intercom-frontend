import { useCallback, useRef, useState } from "react";

export function useGlobalMuteToggle({
  setIsMasterInputMuted,
  sendCallsStateUpdate,
}: {
  setIsMasterInputMuted: React.Dispatch<React.SetStateAction<boolean>>;
  sendCallsStateUpdate: () => void;
}) {
  const [isSettingGlobalMute, setIsSettingGlobalMute] = useState(false);
  const muteToggleTimeoutRef = useRef<number | null>(null);

  const handleToggleGlobalMute = useCallback(() => {
    if (muteToggleTimeoutRef.current !== null) return;

    setIsMasterInputMuted((prev) => {
      const newMuteState = !prev;

      setTimeout(() => {
        sendCallsStateUpdate();
      }, 0);

      return newMuteState;
    });

    setIsSettingGlobalMute(true);

    muteToggleTimeoutRef.current = window.setTimeout(() => {
      muteToggleTimeoutRef.current = null;
    }, 300);

    window.setTimeout(() => {
      setIsSettingGlobalMute(false);
    }, 1000);
  }, [sendCallsStateUpdate, setIsMasterInputMuted]);

  return { handleToggleGlobalMute, isSettingGlobalMute };
}
