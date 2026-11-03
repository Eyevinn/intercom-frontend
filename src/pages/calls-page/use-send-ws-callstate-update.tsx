import { useEffect } from "react";

export const useSendWSCallStateUpdate = ({
  isSettingGlobalMute,
  isEmpty,
  sendCallsStateUpdate,
}: {
  isSettingGlobalMute: boolean;
  isEmpty: boolean;
  sendCallsStateUpdate: (force: boolean) => void;
}) => {
  useEffect(() => {
    if (isSettingGlobalMute && !isEmpty) {
      const timeout = setTimeout(() => {
        sendCallsStateUpdate(true);
      }, 100);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isSettingGlobalMute, isEmpty, sendCallsStateUpdate]);
};
