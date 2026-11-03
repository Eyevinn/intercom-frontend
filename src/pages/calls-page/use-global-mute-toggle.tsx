import { useCallback, useRef } from "react";

export function useGlobalMuteToggle({
  setIsMasterInputMuted,
  setIsSettingGlobalMute,
}: {
  setIsMasterInputMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSettingGlobalMute: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const muteToggleTimeoutRef = useRef<number | null>(null);

  const handleToggleGlobalMute = useCallback(() => {
    if (muteToggleTimeoutRef.current !== null) return;

    setIsSettingGlobalMute(true);

    setIsMasterInputMuted((prev) => {
      const newMuteState = !prev;

      return newMuteState;
    });

    muteToggleTimeoutRef.current = window.setTimeout(() => {
      muteToggleTimeoutRef.current = null;
    }, 300);

    window.setTimeout(() => {
      setIsSettingGlobalMute(false);
    }, 1000);
  }, [setIsMasterInputMuted, setIsSettingGlobalMute]);

  return { handleToggleGlobalMute };
}
